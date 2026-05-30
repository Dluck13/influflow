-- SponsorFlow Database Schema
-- Run this SQL in the Supabase SQL Editor for the Phase 2 data model.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, NEW.id::TEXT || '@auth.local'))
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User profiles linked to Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled')),
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'tier_1', 'tier_2')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sponsorship deals owned by a single creator.
CREATE TABLE IF NOT EXISTS public.brand_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  deal_value NUMERIC(12, 2) NOT NULL CHECK (deal_value >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_terms_days INTEGER NOT NULL DEFAULT 30 CHECK (payment_terms_days > 0),
  status TEXT NOT NULL DEFAULT 'negotiating'
    CHECK (status IN ('negotiating', 'accepted', 'active', 'completed', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Content deliverables attached to a deal.
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.brand_deals(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('TikTok', 'Instagram', 'YouTube', 'Other')),
  content_type TEXT NOT NULL
    CHECK (content_type IN ('Video', 'Story', 'Carousel', 'Dedicated Video', 'Short/Reel')),
  title TEXT,
  due_date DATE NOT NULL,
  caption_requirements TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Invoices generated from deals.
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.brand_deals(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'failed', 'overdue', 'void')),
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS brand_deals_user_id_idx ON public.brand_deals(user_id);
CREATE INDEX IF NOT EXISTS deliverables_deal_id_idx ON public.deliverables(deal_id);
CREATE INDEX IF NOT EXISTS deliverables_due_date_idx ON public.deliverables(due_date);
CREATE INDEX IF NOT EXISTS invoices_deal_id_idx ON public.invoices(deal_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (id, email)
SELECT id, COALESCE(email, id::TEXT || '@auth.local')
FROM auth.users
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();

DROP TRIGGER IF EXISTS set_brand_deals_updated_at ON public.brand_deals;
CREATE TRIGGER set_brand_deals_updated_at
  BEFORE UPDATE ON public.brand_deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_deliverables_updated_at ON public.deliverables;
CREATE TRIGGER set_deliverables_updated_at
  BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own brand deals" ON public.brand_deals;
CREATE POLICY "Users can view their own brand deals"
  ON public.brand_deals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create brand deals" ON public.brand_deals;
CREATE POLICY "Users can create brand deals"
  ON public.brand_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own brand deals" ON public.brand_deals;
CREATE POLICY "Users can update their own brand deals"
  ON public.brand_deals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own brand deals" ON public.brand_deals;
CREATE POLICY "Users can delete their own brand deals"
  ON public.brand_deals FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view deliverables for their deals" ON public.deliverables;
CREATE POLICY "Users can view deliverables for their deals"
  ON public.deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = deliverables.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create deliverables for their deals" ON public.deliverables;
CREATE POLICY "Users can create deliverables for their deals"
  ON public.deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update deliverables for their deals" ON public.deliverables;
CREATE POLICY "Users can update deliverables for their deals"
  ON public.deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = deliverables.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = deliverables.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete deliverables for their deals" ON public.deliverables;
CREATE POLICY "Users can delete deliverables for their deals"
  ON public.deliverables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = deliverables.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view invoices for their deals" ON public.invoices;
CREATE POLICY "Users can view invoices for their deals"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = invoices.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create invoices for their deals" ON public.invoices;
CREATE POLICY "Users can create invoices for their deals"
  ON public.invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update invoices for their deals" ON public.invoices;
CREATE POLICY "Users can update invoices for their deals"
  ON public.invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = invoices.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_deals
      WHERE brand_deals.id = invoices.deal_id
        AND brand_deals.user_id = auth.uid()
    )
  );

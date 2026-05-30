-- SponsorFlow Database Schema
-- Run these SQL commands in the Supabase SQL Editor to set up the database

-- Create profiles table (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_auth FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create brand_deals table
CREATE TABLE brand_deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  deal_value NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_terms_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'negotiating',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliverables table
CREATE TABLE deliverables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES brand_deals(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  caption_requirements TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES brand_deals(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Users can only view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can only update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS Policies for brand_deals
CREATE POLICY "Users can only view their own brand deals"
  ON brand_deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create brand deals"
  ON brand_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand deals"
  ON brand_deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand deals"
  ON brand_deals FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for deliverables (cascaded through brand_deals)
CREATE POLICY "Users can view deliverables for their deals"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = deliverables.deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deliverables for their deals"
  ON deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update deliverables for their deals"
  ON deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = deliverables.deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete deliverables for their deals"
  ON deliverables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = deliverables.deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

-- Create RLS Policies for invoices (cascaded through brand_deals)
CREATE POLICY "Users can view invoices for their deals"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = invoices.deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices for their deals"
  ON invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices for their deals"
  ON invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brand_deals
      WHERE brand_deals.id = invoices.deal_id
      AND brand_deals.user_id = auth.uid()
    )
  );

# SponsorFlow Phase 2 - Database Migration Guide

## Overview
This guide explains how to set up the SponsorFlow database schema using the Supabase SQL Editor. The migration creates four main tables and implements Row Level Security (RLS) policies to ensure data privacy.

---

## Location of SQL File
The database migration SQL script is located at:
```
sponsorflow/lib/database.sql
```

---

## How to Run the Migration

### Step 1: Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your SponsorFlow project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Copy the SQL Script
1. Open `sponsorflow/lib/database.sql` from your project
2. Copy the entire file content

### Step 3: Execute the SQL
1. In the Supabase SQL Editor, click **New Query**
2. Paste the entire SQL script into the editor
3. Click **Run** (or press `Ctrl+Enter`)
4. Wait for confirmation that all commands executed successfully

### Step 4: Verify the Tables
After execution, verify all tables were created:
1. In Supabase, go to the **Table Editor**
2. Confirm you see the following tables:
   - `profiles`
   - `brand_deals`
   - `deliverables`
   - `invoices`

---

## What Gets Created

### Tables Created

#### 1. **profiles** (User Profiles)
Links to Supabase Auth users. Stores user account information:
- `id` (UUID) - Primary key, linked to auth.users
- `email` (TEXT) - User email address
- `stripe_customer_id` (TEXT) - Stripe payment integration
- `subscription_status` (TEXT) - Subscription state (inactive/active)
- `subscription_tier` (TEXT) - Plan tier (free/starter/pro/enterprise)
- `created_at`, `updated_at` - Timestamps

#### 2. **brand_deals** (Sponsorship Deals)
Stores sponsorship deals created by users:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to profiles
- `brand_name` (TEXT) - Name of the sponsoring brand
- `deal_value` (NUMERIC) - Deal amount
- `currency` (TEXT) - Currency code (default: USD)
- `payment_terms_days` (INTEGER) - Payment terms (default: 30 days)
- `status` (TEXT) - Deal status (negotiating/accepted/completed/cancelled)
- `created_at`, `updated_at` - Timestamps

#### 3. **deliverables** (Deal Deliverables)
Tracks content deliverables for each deal:
- `id` (UUID) - Primary key
- `deal_id` (UUID) - Foreign key to brand_deals
- `platform` (TEXT) - Social platform (Instagram/TikTok/YouTube/Twitter/etc.)
- `content_type` (TEXT) - Content format (Post/Reel/Story/Video/etc.)
- `title` (TEXT) - Deliverable title
- `due_date` (TIMESTAMP) - Delivery deadline
- `caption_requirements` (TEXT) - Content guidelines/captions
- `is_completed` (BOOLEAN) - Completion status
- `created_at`, `updated_at` - Timestamps

#### 4. **invoices** (Payment Invoices)
Manages invoicing and payment tracking:
- `id` (UUID) - Primary key
- `deal_id` (UUID) - Foreign key to brand_deals
- `stripe_invoice_id` (TEXT) - Stripe invoice reference
- `amount` (NUMERIC) - Invoice amount
- `status` (TEXT) - Invoice status (draft/sent/paid/failed/overdue)
- `sent_at` (TIMESTAMP) - When invoice was sent
- `paid_at` (TIMESTAMP) - When payment was received
- `created_at`, `updated_at` - Timestamps

---

## Row Level Security (RLS) Policies

All tables have RLS enabled to ensure users can only access their own data.

### Security Model Overview
- **Users can only view their own data** - Each operation (SELECT, INSERT, UPDATE, DELETE) checks that `auth.uid()` matches the user_id
- **Cascading permissions** - Deliverables and invoices are accessible only through their parent deal (brand_deals)
- **Automatic enforcement** - RLS is enforced at the database level, not in application code

### Policies by Table

#### profiles
- ✅ SELECT: Users can view their own profile
- ✅ UPDATE: Users can update their own profile
- ❌ DELETE: No policy (users inherit from auth system)

#### brand_deals
- ✅ SELECT: Users can view their own deals
- ✅ INSERT: Users can create new deals
- ✅ UPDATE: Users can update their own deals
- ✅ DELETE: Users can delete their own deals

#### deliverables
- ✅ SELECT: Users can view deliverables for their deals
- ✅ INSERT: Users can create deliverables for their deals
- ✅ UPDATE: Users can update deliverables for their deals
- ✅ DELETE: Users can delete deliverables for their deals

#### invoices
- ✅ SELECT: Users can view invoices for their deals
- ✅ INSERT: Users can create invoices for their deals
- ✅ UPDATE: Users can update invoices for their deals
- ⚠️ DELETE: Users can delete invoices for their deals (may want to restrict)

---

## Troubleshooting

### ❌ "uuid_generate_v4() function not found"
**Solution:** The pgcrypto extension is required. Add this before running the migration:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### ❌ "Foreign key constraint violation"
**Solution:** Ensure tables are created in order:
1. profiles (depends on auth.users)
2. brand_deals (depends on profiles)
3. deliverables (depends on brand_deals)
4. invoices (depends on brand_deals)

The SQL file has them in the correct order.

### ❌ "RLS policy creation failed"
**Solution:** Verify Row Level Security is enabled before creating policies:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### ❌ "Tables created but no data appears in app"
**Solution:** Check that:
1. RLS policies are correctly set up
2. User is authenticated in Supabase
3. User's `auth.uid()` matches the `user_id` or `id` in the database

---

## Next Steps

After successful migration:

1. **Test the connection** - Verify the app can connect to the database via Supabase client
2. **Run seed data** (optional) - Add test data for development
3. **Test RLS policies** - Confirm users can only access their own data
4. **Deploy to production** - Run the same migration on your production Supabase project

---

## Files Referenced
- SQL Migration: `sponsorflow/lib/database.sql`
- Supabase Client: `sponsorflow/lib/supabase.ts`
- TypeScript Schemas: `sponsorflow/lib/schemas.ts`

---

## Support
If you encounter issues:
1. Check the Supabase error message carefully
2. Verify all tables exist in the Table Editor
3. Check RLS policies in the Authentication → Policies section
4. Review application logs for connection errors

# SponsorFlow - Setup Instructions

## Phase 2 In Progress

The foundation, authentication system, protected dashboard route, rate calculator, and database migration are ready to review.

### 1. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 2. Supabase Configuration

1. **Create a Supabase Project** at https://supabase.com
2. **Get your credentials:**
   - Go to Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `Anon Key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Set up OAuth (Google)**
   - Go to Authentication → Providers
   - Enable Google OAuth
   - Add redirect URL: `http://localhost:3000/auth/callback`

4. **Run Database Schema**
   - Go to SQL Editor
   - Copy and paste the entire contents of `lib/database.sql`
   - Execute all queries

### 3. OpenAI API Key

1. Get your API key from https://platform.openai.com/api-keys
2. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to `/login`.

### 5. Test Authentication

- **Sign Up**: Create a new account with email/password
- **Sign In**: Log in with your credentials
- **Google OAuth**: Click "Sign In with Google"
- You should see the dashboard after login ✓

---

## Project Structure

```
sponsorflow/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login/signup UI
│   │   └── callback/page.tsx        # OAuth callback handler
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Dashboard navigation
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── calculator/page.tsx      # Rate calculator (Phase 2)
│   │   └── contracts/page.tsx       # Contract upload (Phase 3)
│   ├── actions/
│   │   └── parse-contract.ts        # AI extraction (Phase 3)
│   ├── api/stripe/
│   │   ├── checkout/route.ts        # Subscription checkout (Phase 4)
│   │   └── webhook/route.ts         # Stripe webhook handler (Phase 4)
│   └── layout.tsx                   # Global providers
├── lib/
│   ├── supabase.ts                  # Supabase client
│   ├── schemas.ts                   # Zod validation schemas
│   └── database.sql                 # Schema migration
├── proxy.ts                         # Auth protection
└── public/                          # Static assets
```

---

## Current Phase (Phase 2)

The core Phase 2 surfaces are now implemented. Use the checkpoints below for commit-sized review.

### Phase 2 Todos:
- [x] Secure dashboard route protected by Next.js proxy
- [x] Rate Calculator UI with metric ranges
- [x] CPM formula logic using $20-$40 market tiers
- [x] Core database migration for profiles, brand_deals, deliverables, and invoices
- [x] Dashboard stats overview wired to Supabase tables
- [ ] Apply the latest `lib/database.sql` in Supabase and smoke test authenticated reads

### Commit Checkpoints

1. `phase2: implement cpm tier rate calculator`
   - `lib/calculator.ts`
   - `app/(dashboard)/calculator/page.tsx`

2. `phase2: harden supabase deal schema`
   - `lib/database.sql`
   - `DATABASE_MIGRATION.md`

3. `chore: align phase docs and lint target`
   - `SETUP.md`
   - `package.json`

---

## Troubleshooting

### "Cannot find module '@supabase/...'"
```bash
npm install
```

### "NEXT_PUBLIC_SUPABASE_URL is not set"
Make sure `.env.local` exists and has the correct variables.

### Auth redirects to `/login` after signup
Check that email confirmation is enabled in Supabase Authentication settings.

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth with Email + Google OAuth
- **AI**: OpenAI GPT-4o for contract extraction
- **Payments**: Stripe (configured in Phase 4)

---

**Last Updated**: 2026-05-29
**Phase Status**: Phase 1 Complete | Phase 2 Implementation Ready for Supabase Smoke Test

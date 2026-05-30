# SponsorFlow Global Project Context

## 1. Core Tech Stack
* **Framework:** Next.js 15 (App Router, React 19)
* **Language:** TypeScript (Strict mode)
* **Styling:** Tailwind CSS v4, Shadcn UI components
* **Database & Auth:** Supabase (PostgreSQL with Row Level Security enabled)
* **File Storage:** Supabase Storage (S3-compatible bucket)
* **Payments & Invoicing:** Stripe SDK (Hosted Checkout and Invoicing API)
* **AI Engine:** OpenAI SDK (Model: `gpt-4o` via Structured Outputs API)

## 2. Directory Architecture Reference
Always write code targeting this exact structure. Do not create unapproved folders:
```text
sponsorflow/
├── app/
│ ├── (auth)/login/page.tsx
│ ├── (dashboard)/
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ ├── calculator/page.tsx
│ │ └── contracts/page.tsx
│ ├── actions/
│ │ └── parse-contract.ts
│ ├── api/stripe/
│ │ ├── checkout/route.ts
│ │ └── webhook/route.ts
│ └── layout.tsx
├── components/
│ ├── ui/ (shadcn auto-generated)
│ └── calendar-view.tsx
├── lib/
│ ├── supabase.ts
│ └── schemas.ts
└── context.md, plan.md, agents.md
```
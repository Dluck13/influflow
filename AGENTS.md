# SponsorFlow AI Architecture & Autonomous Systems

SponsorFlow operates with zero human employees by deploying specialized, isolated AI agents to handle complex data operations and automated customer support.

## 1. The Legal & Contract Extraction Agent

* **Technology Stack:** OpenAI GPT-4o (`gpt-4o`) + `zod` for Structured Outputs.
* **Trigger Event:** A content creator uploads a brand agreement PDF.
* **Role:** Acts as a specialized legal data entry clerk. Extracts unstructured text into clean JSON format.

### Strict Schema Definition (Zod / JSON)
To guarantee your code never crashes due to unexpected AI responses, the engine must enforce this exact structured schema response:

```typescript
import { z } from "zod"

export const ContractSchema = z.object({
brandName: z.string().describe("The legal or trading name of the company hiring the creator"),
dealValue: z.number().describe("The total gross payout amount in USD"),
currency: z.string().default("USD"),
paymentTermsDays: z.number().describe("Number of days after posting until payment is due. Default to 30 if unstated."),
deliverables: z.array(
z.object({
platform: z.enum(["TikTok", "Instagram", "YouTube", "Other"]),
contentType: z.enum(["Video", "Story", "Carousel", "Dedicated Video", "Short/Reel"]),
dueDate: z.string().describe("ISO 8601 date format (YYYY-MM-DD) for when the draft or live post is due"),
captionRequirements: z.string().optional().describe("Required hashtags, tags, or tracking links")
})
)
});
```

### System Prompt Directive
```text
You are a highly accurate legal-tech extraction parser. Your sole job is to review influencer marketing agreements and extract key metrics. Do not assume or extrapolate data. If a specific due date year is missing, assume the current year (2026). Return data matching the requested JSON schema exactly.
```

---

## 2. The Customer Success AI Agent

* **Technology Stack:** Mendable.ai or Intercom AI Agent + Vector Embeddings.
* **Trigger Event:** User opens the floating support chat bubble on the frontend dashboard.
* **Role:** Handles technical support, bug reporting, and account management queries without human triage.

### System Prompt Directive
```text
You are the dedicated Support Engineer for SponsorFlow. You assist creators with billing questions, account access, and technical bugs regarding contract parsing or Stripe invoicing.
- Answer user queries using ONLY the uploaded application documentation.
- Never make up features that do not exist.
- If a user requests a refund or reports a severe payment error, log a high-priority webhook payload to the system administrator and tell the user a fix is being processed automatically.
```


# SponsorFlow Master Development Plan (6-Week Roadmap)

This execution plan focuses entirely on shipping a highly functional Minimum Viable Product (MVP) built exclusively by a solo developer utilizing managed serverless services.

## Phase 1: Foundation & Authentication (Week 1)
* [ ] Initialize the project repository: `npx create-next-app@latest sponsorflow --typescript --tailwind --eslint`.
* [ ] Configure UI components: Run `npx shadcn-ui@latest init` and install essential modules (`button`, `dialog`, `calendar`, `form`, `input`, `table`).
* [ ] Set up the Supabase project backend and link local environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
* [ ] Build user onboarding flows: Implement Supabase Magic Link and Google OAuth authentication inside `/login`.
* [ ] Apply base Row Level Security (RLS) policies to ensure complete multi-tenant user isolation.

## Phase 2: Core Dashboards & Rate Engine (Week 2)
* [ ] Build the secure client route `/dashboard` protected by Next.js middleware.
* [ ] Implement the **Rate Calculator UI Component**: Create simple input ranges for historical views, engagement rates, and category selection.
* [ ] Code the client-side estimation logic mapping input metrics to regional market CPM guidelines ($20-$40 tiers).
* [ ] Set up the core database structure: Run migration scripts creating tables for `profiles`, `brand_deals`, `deliverables`, and `invoices`.

## Phase 3: AI Contract Processing Pipeline (Week 3)
* [ ] Set up an AWS S3 or Supabase Storage bucket specifically for processing temporary PDF contract files.
* [ ] Write a Next.js Server Action (`/app/actions/parse-contract.ts`) that extracts raw strings from documents via `pdf-parse`.
* [ ] Integrate the OpenAI SDK using `openai.beta.chat.completions.parse` containing the strict Zod `ContractSchema` outlined in `agents.md`.
* [ ] Build a pipeline to instantly auto-populate rows inside `brand_deals` and `deliverables` upon receiving successful JSON data from the model.
* [ ] Create a frontend layout with an interactive calendar view mapping out active deadlines.

## Phase 4: Managed Stripe Ledger & Webhooks (Week 4)
* [ ] Install Stripe SDK components and structure a pricing table pointing to the Tier 1 ($19/mo) and Tier 2 ($49/mo) plans.
* [ ] Build the server action `/api/stripe/checkout` to generate hosted secure user payment pages.
* [ ] Connect Stripe Invoicing API commands to generate external, outbound invoices for brand contacts directly from the deal view dashboard.
* [ ] Deploy a local Stripe Webhook listening daemon (`stripe listen --forward-to localhost:3000/api/stripe/webhook`) to build and handle incoming events (`invoice.paid`, `customer.subscription.deleted`).

## Phase 5: Error Triage & System Automation (Week 5)
* [ ] Integrate Sentry error tracing into Next.js edge functions to capture client/server-side code crashes instantly.
* [ ] Connect a pre-trained Mendable.ai or alternative AI support framework chatbot widget directly onto user dashboard templates.
* [ ] Conduct 3 end-to-end user tests: Register an account, upload a test PDF, generate a mock brand invoice, and complete a simulated Stripe billing sequence.

## Phase 6: Production Deployment & Polish (Week 6)
* [ ] Deploy the live codebase to Vercel production hosting servers.
* [ ] Map custom secure domain credentials and hook environmental production variables.
* [ ] Run ultimate internal database stress validation checks ensuring RLS functions perfectly blocking cross-tenant profile visibility.
* [ ] Declare development feature-complete and mark the system ready for early beta testers.



sponsorflow/
├── app/
│ ├── (auth)/ # Group for authentication routes
│ │ ├── login/page.tsx # Login / Signup interface
│ ├── (dashboard)/ # Secure dashboard routes
│ │ ├── layout.tsx # Main dashboard navigation & sidebar
│ │ ├── page.tsx # Main dashboard overview
│ │ ├── calculator/page.tsx # Creator Rate Calculator view
│ │ └── contracts/page.tsx # PDF Drag & Drop / Contract table view
│ ├── actions/ # Next.js Server Actions (Backend)
│ │ └── parse-contract.ts # OpenAI document parsing pipeline
│ ├── api/
│ │ └── stripe/
│ │ ├── checkout/route.ts # Subscription session generator
│ │ └── webhook/route.ts # Webhook processor
│ └── layout.tsx # Global providers (Supabase/Auth context)
├── components/ # Shared UI elements
│ ├── ui/ # Shadcn auto-generated primitives
│ └── calendar-view.tsx # Timeline dashboard component
└── lib/
├── supabase.ts # Supabase Client configuration
└── schemas.ts # Global Zod validation definitions
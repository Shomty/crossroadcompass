# Crossroads Compass — Agent Micro-Task System
# Version: 1.0 | March 2026
# Purpose: Prevent context overload. One task at a time. No exceptions.

---

## HOW TO USE THIS FILE

You are a coding agent with a limited context window. This file breaks
the entire Crossroads Compass build into atomic tasks — each one small
enough to complete in a single session without losing context.

**Rules you must follow:**
1. Read only the current task block. Do not read ahead.
2. Complete the task fully before moving to the next one.
3. At the end of every task, write a one-line status comment at the
   top of every file you created or modified: `// STATUS: done | Task X.Y`
4. If you hit a DECISION NEEDED, stop. Write it as a comment and
   surface it. Do not proceed past it.
5. If a task feels too large, break it into sub-tasks and note them.
6. Never refactor code from a previous task unless the current task
   explicitly requires it.

**Reference files (read only when a task tells you to):**
- `crossroads-compass.instructions.md` — full product + tech spec
- `TASKS.md` — this file

---

## PHASE 0 — PROJECT SCAFFOLD

### Task 0.1 — Init Next.js project
**Do:**
- Run `npx create-next-app@latest` with: TypeScript, Tailwind, App Router, ESLint
- Set `strict: true` in `tsconfig.json`
- Delete boilerplate: `page.tsx` content, `globals.css` content (keep file)
- Create empty folders: `app/(marketing)`, `app/(auth)`, `app/(dashboard)`, `app/(admin)`, `app/api`
- Create empty folders: `components/ui`, `components/chart`, `components/insights`, `components/onboarding`
- Create empty folders: `lib/astro`, `lib/humandesign`, `lib/content`, `lib/email`, `lib/stripe`, `lib/gdpr`, `lib/kv`
- Create `types/index.ts` with a single comment: `// Shared types — populated in Task 1.1`

**Do NOT do:** install any package other than what create-next-app installs.

**Done when:** `npm run dev` starts without errors.

---

### Task 0.2 — Install and validate dependencies
**Do (one group at a time, verify each installs cleanly):**
```
Group A — DB + Auth:
  npm install prisma @prisma/client next-auth@beta

Group B — Validation + API:
  npm install zod

Group C — Payments:
  npm install stripe @stripe/stripe-js

Group D — Email:
  npm install resend @react-email/components

Group E — KV store:
  npm install @upstash/redis

Group F — Human Design library:
  npm install github:nikolamilenkovic/openhumandesign-library
```
- Run `npx prisma init` after Group A
- Add all env var keys (empty values) to `.env.local` and `.env.example`
- Add `.env.local` to `.gitignore`

**Do NOT do:** configure any of these packages. That is done in later tasks.

**Done when:** all packages install, `npm run dev` still starts.

---

### Task 0.3 — Environment validation
**Do:**
- Create `/lib/env.ts` using Zod to parse and export all required env vars
- Required vars:
  ```
  VEDIC_API_URL, VEDIC_API_KEY, EPHE_PATH,
  DATABASE_URL,
  NEXTAUTH_SECRET, NEXTAUTH_URL,
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY,
  UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
  ```
- `EPHE_PATH` defaults to `'./ephe'`
- App must throw a descriptive startup error (not a runtime crash) if any required var is missing
- Export `env` object — all other files import from here, never from `process.env` directly

**Done when:** removing a required var from `.env.local` causes a clear error on startup.

---

## PHASE 1 — DATABASE SCHEMA

### Task 1.1 — Core types
**Do:**
- Populate `types/index.ts` with TypeScript types (not Prisma models) for:
  - `SubscriptionTier: 'FREE' | 'CORE' | 'VIP'`
  - `SubscriptionStatus: 'active' | 'cancelled' | 'past_due'`
  - `InsightType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'HD_TIP'`
  - `ConsultationType: 'SINGLE_90' | 'VIP_QUARTERLY'`
  - `ConsultationStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'`
  - `HDType: 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector'`
  - `HDAuthority: 'Emotional' | 'Sacral' | 'Splenic' | 'Ego' | 'Self-Projected' | 'Mental' | 'Lunar'`
  - `BirthInfo` matching the openhumandesign-library's `BirthInfo` interface
  - `VedicChartData` (use `Record<string, unknown>` for now — mark with TODO when API schema is confirmed)
  - `HDChartData` matching the library's output fields

**Done when:** `types/index.ts` compiles with no errors.

---

### Task 1.2 — Prisma schema
**Do:**
- Write `prisma/schema.prisma` with these models exactly:

```
User
  id                String   @id @default(cuid())
  email             String   @unique
  createdAt         DateTime @default(now())
  subscriptionTier  SubscriptionTier @default(FREE)
  subscriptionStatus SubscriptionStatus @default(active)
  stripeCustomerId  String?  @unique
  birthProfile      BirthProfile?
  insights          Insight[]
  consultations     Consultation[]
  contentReviews    ContentReview[]

BirthProfile
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(...)
  birthDate        DateTime
  birthTime        String?  (stored as "HH:MM:SS", nullable = unknown time)
  birthLocation    String   (city, country)
  latitude         Float
  longitude        Float
  timezone         String   (IANA timezone string)
  profileVersion   Int      @default(1)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

Insight
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(...)
  type         InsightType
  content      String   @db.Text
  generatedAt  DateTime @default(now())
  deliveredAt  DateTime?
  openedAt     DateTime?
  accuracyRating Int?   (1-5)
  reviewId     ContentReview?

ContentReview
  id          String   @id @default(cuid())
  insightId   String   @unique
  insight     Insight  @relation(...)
  reviewedBy  String   (consultant identifier)
  reviewedAt  DateTime?
  approved    Boolean  @default(false)
  notes       String?  @db.Text
  createdAt   DateTime @default(now())

Consultation
  id                   String   @id @default(cuid())
  userId               String
  user                 User     @relation(...)
  type                 ConsultationType
  bookedAt             DateTime @default(now())
  sessionAt            DateTime?
  status               ConsultationStatus @default(pending)
  prepGuideDeliveredAt DateTime?
  createdAt            DateTime @default(now())
```

- Add Prisma enums for all string unions above
- Run `npx prisma generate`

**Do NOT do:** run migrations yet. That is Task 1.3.

**Done when:** `npx prisma generate` succeeds with no errors.

---

### Task 1.3 — First migration
**Do:**
- Run `npx prisma migrate dev --name init`
- Verify all tables exist in the DB

**Done when:** migration succeeds, `npx prisma studio` shows all tables.

---

## PHASE 2 — KV CACHE LAYER

### Task 2.1 — Redis client
**Do:**
- Create `/lib/kv/client.ts`
- Export a single `kv` instance using `@upstash/redis`
- Use `env.UPSTASH_REDIS_REST_URL` and `env.UPSTASH_REDIS_REST_TOKEN`
- No other file instantiates a Redis client

**Done when:** client exports without TypeScript errors.

---

### Task 2.2 — KV key schema
**Do:**
- Create `/lib/kv/keys.ts`
- Export typed key-builder functions only (no Redis calls):
  ```typescript
  export const kvKeys = {
    vedicChart: (userId: string) => `chart:vedic:${userId}`,
    hdChart:    (userId: string) => `chart:hd:${userId}`,
    dashas:     (userId: string) => `chart:dashas:${userId}`,
    transit:    (userId: string, date: string) => `transit:${userId}:${date}`,
    // date format: YYYY-MM-DD
  }
  ```
- Export a `KV_TTL` constants object:
  ```typescript
  export const KV_TTL = {
    TRANSIT_SECONDS: 86400,      // 24 hours — auto-expires
    NATAL_CHART: undefined,       // no TTL — permanent until invalidated
    DASHAS: undefined,            // no TTL — permanent until invalidated
  }
  ```

**Done when:** file compiles, all keys are typed with no `any`.

---

### Task 2.3 — KV helper functions
**Do:**
- Create `/lib/kv/helpers.ts`
- Implement typed get/set/delete wrappers:
  ```typescript
  async function kvGet<T>(key: string): Promise<T | null>
  async function kvSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  async function kvDelete(key: string): Promise<void>
  async function kvDeleteMany(keys: string[]): Promise<void>
  ```
- All functions must handle Redis errors gracefully — log server-side, never throw to caller unless explicitly re-throwing
- `kvGet` returns `null` on miss or error (caller decides what to do)

**Done when:** all four functions compile and are exported.

---

## PHASE 3 — CHART SERVICE

### Task 3.1 — Vedic API client
**Do:**
- Create `/lib/astro/vedicApiClient.ts`
- Implement `vedicFetch<T>(path: string, body: unknown): Promise<T>`
- Auth header: `X-Api-Key` from `env.VEDIC_API_KEY`
- Base URL from `env.VEDIC_API_URL`
- Custom error class: `VedicApiError(statusCode: number, message: string)`
- Log errors server-side only — never expose key or raw response body to client
- Add `// DECISION NEEDED: confirm all endpoint paths and request/response schemas with Milosh before calling any endpoint` at the top of the file

**Done when:** client compiles. Do NOT call any endpoint yet.

---

### Task 3.2 — HD calculator wrapper
**Do:**
- Create `/lib/astro/hdCalculator.ts`
- Import `HumanDesignCalculator` from `openhumandesign-library`
- Implement one exported function:
  ```typescript
  export function calculateHDChart(birthInfo: BirthInfo): HDChartData
  ```
- Use `env.EPHE_PATH` for the ephemeris path
- Wrap in try/catch — throw a typed `HDCalculationError` with a clear message if it fails
- Add `// LICENSE PENDING: Swiss Ephemeris commercial license required before launch` at top of file

**Done when:** function compiles. Do NOT call it with real data yet — ephemeris files may not be present.

---

### Task 3.3 — Chart cache invalidation
**Do:**
- Create `/lib/astro/chartService.ts` with only the invalidation function for now:
  ```typescript
  export async function invalidateChartCache(userId: string): Promise<void>
  ```
- This function must delete ALL KV keys for this user:
  `chart:vedic:{userId}`, `chart:hd:{userId}`, `chart:dashas:{userId}`
- Use `kvDeleteMany` from `/lib/kv/helpers.ts`
- Do NOT touch transit keys — those expire automatically

**Done when:** function compiles and deletes the correct keys.

---

### Task 3.4 — HD chart: get or calculate
**Do:**
- Add to `/lib/astro/chartService.ts`:
  ```typescript
  export async function getOrCreateHDChart(
    userId: string,
    birthProfile: BirthProfile
  ): Promise<HDChartData>
  ```
- Cache-check logic:
  1. Check KV for `chart:hd:{userId}`
  2. If hit: return parsed value
  3. If miss: call `calculateHDChart(birthInfo)`, store in KV with no TTL, return result
- `birthProfile` is passed in — this function does NOT query the DB itself

**Done when:** function compiles with correct cache-check logic.

---

### Task 3.5 — Vedic natal chart: get or fetch
**Do:**
- Add to `/lib/astro/chartService.ts`:
  ```typescript
  export async function getOrCreateVedicChart(
    userId: string,
    birthProfile: BirthProfile
  ): Promise<VedicChartData>
  ```
- Cache-check logic identical pattern to Task 3.4 but for Vedic
- Add `// DECISION NEEDED: replace placeholder vedicFetch call with confirmed endpoint + payload` where the API call will go
- For now: throw `new Error('Vedic API endpoint not yet confirmed — see DECISION NEEDED')` instead of calling the API

**Done when:** function compiles. Placeholder error is acceptable.

---

### Task 3.6 — Transit cache layer
**Do:**
- Create `/lib/astro/transitService.ts`
- Implement:
  ```typescript
  export async function getTodayTransits(
    userId: string,
    birthProfile: BirthProfile
  ): Promise<unknown>  // type tightened once API schema confirmed
  ```
- Cache key: `transit:{userId}:YYYY-MM-DD` (today's date in user's timezone)
- TTL: `KV_TTL.TRANSIT_SECONDS` (24 hours)
- If cache miss: add `// DECISION NEEDED: transit endpoint + payload` and throw placeholder error
- If cache hit: return parsed JSON

**Done when:** function compiles with cache-hit path working.

---

## PHASE 4 — AUTHENTICATION

### Task 4.1 — NextAuth config
**Do:**
- Create `/lib/auth/config.ts`
- Configure NextAuth with:
  - Email/password (Credentials provider) only — no social login
  - Prisma adapter
  - Session strategy: `jwt`
  - Callbacks: include `userId` and `subscriptionTier` in session token
- Create `/app/api/auth/[...nextauth]/route.ts`

**Done when:** auth route responds (even if login fails due to no users).

---

### Task 4.2 — Auth helper functions
**Do:**
- Create `/lib/auth/helpers.ts`
- Export:
  ```typescript
  export async function getRequiredSession(): Promise<Session>
  // throws redirect to /login if no session

  export async function getSessionUser(): Promise<SessionUser | null>
  // returns null if no session, never throws

  export function requireTier(
    session: Session,
    minTier: SubscriptionTier
  ): void
  // throws 403 error if user's tier is below minTier
  ```

**Done when:** all three functions compile with correct types.

---

## PHASE 5 — ONBOARDING

### Task 5.1 — Birth data Zod schema
**Do:**
- Create `/lib/validation/birthData.ts`
- Export `birthDataSchema` using Zod:
  - `birthDate`: valid date string, not in the future
  - `birthTime`: optional string matching `HH:MM` format
  - `birthLocation`: non-empty string (city, country)
  - `latitude`: number between -90 and 90
  - `longitude`: number between -180 and 180
  - `timezone`: valid IANA timezone string
- Export inferred type `BirthDataInput`

**Done when:** schema rejects invalid inputs and accepts valid ones.

---

### Task 5.2 — Chart generation API route
**Do:**
- Create `/app/api/onboarding/chart/route.ts`
- POST handler:
  1. Validate body with `birthDataSchema`
  2. Capture and store email if provided
  3. Create `User` + `BirthProfile` in DB (Prisma transaction)
  4. Trigger HD chart calculation (call `getOrCreateHDChart`)
  5. Return `{ userId, hdChart }` — Vedic chart deferred until endpoint confirmed
- This route does NOT require authentication (public onboarding)
- Must complete within 3 seconds — add a timeout guard and return 504 if exceeded

**Done when:** POST with valid birth data creates DB records and returns HD chart data.

---

### Task 5.3 — Onboarding form component
**Do:**
- Create `/components/onboarding/BirthDataForm.tsx`
- Fields: date picker, time input (with "I don't know my birth time" checkbox), location text input with timezone selector
- Client-side validation using Zod schema (import from Task 5.1)
- On submit: POST to `/api/onboarding/chart`
- Show loading state during submission
- On success: redirect to `/dashboard` or report preview
- If birth time is unknown: show a message explaining which features will be limited

**Do NOT:** build the report PDF yet. That is Phase 6.

**Done when:** form submits, creates a user, and redirects correctly.

---

## PHASE 6 — PDF REPORT

### Task 6.1 — Report data assembler
**Do:**
- Create `/lib/content/reportAssembler.ts`
- Export:
  ```typescript
  export async function assembleReportData(userId: string): Promise<ReportData>
  ```
- `ReportData` type (define in `types/index.ts`):
  - `user`: email
  - `hdChart`: HDChartData
  - `vedicChart`: VedicChartData | null (null if not yet available)
  - `birthProfile`: BirthProfile
  - `generatedAt`: Date
- Fetches from KV cache first via chartService, falls back gracefully if Vedic not yet available

**Done when:** function compiles and returns correct shape.

---

### Task 6.2 — PDF generation
**Do:**
- Research available PDF options in the project (check for existing packages)
- If none: install `@react-pdf/renderer`
- Create `/lib/content/reportPdf.tsx`
- Build a 5-7 page PDF layout with sections:
  1. Cover: name (from email), generated date
  2. Human Design overview: type, strategy, authority, profile, definition
  3. Defined vs undefined centers
  4. Key channels and gates
  5. Vedic overview (placeholder text if Vedic data not yet available)
  6. What to expect next (subscription CTA)
- Store generated PDF in Supabase Storage at `reports/{userId}/initial-report.pdf`
- Return the public URL

**Done when:** a PDF is generated and stored for a test user.

---

### Task 6.3 — Report delivery API route
**Do:**
- Create `/app/api/onboarding/report/route.ts`
- GET handler: returns signed download URL for the user's report from Supabase Storage
- POST handler: triggers report generation (calls Task 6.1 + 6.2), sends email with link
- Requires valid session OR a short-lived token passed during onboarding (decide which)

**Done when:** report can be generated and a download URL returned.

---

## PHASE 7 — EMAIL SYSTEM

### Task 7.1 — Email client
**Do:**
- Create `/lib/email/client.ts`
- Export a configured Resend client using `env.RESEND_API_KEY`
- Export a typed `sendEmail` wrapper:
  ```typescript
  export async function sendEmail(options: {
    to: string
    subject: string
    react: React.ReactElement
  }): Promise<void>
  ```
- Log failures server-side. Never throw to caller — email failure must not break user-facing flows.

**Done when:** client compiles.

---

### Task 7.2 — Welcome email template
**Do:**
- Create `/lib/email/templates/WelcomeEmail.tsx`
- React Email component
- Content: welcome message, link to download report, preview of what daily guidance looks like
- Props: `{ userEmail: string, reportUrl: string }`

**Done when:** template renders in React Email preview without errors.

---

### Task 7.3 — Daily insight email template
**Do:**
- Create `/lib/email/templates/DailyInsightEmail.tsx`
- React Email component
- Content: today's insight text, one-click accuracy rating (1-5 stars as links), link to dashboard
- Props: `{ insightContent: string, insightId: string, dashboardUrl: string }`
- Accuracy rating links must point to `/api/insights/rate?insightId=X&rating=Y` (GET for email compatibility)

**Done when:** template renders without errors with sample data.

---

### Task 7.4 — Welcome sequence trigger
**Do:**
- Create `/lib/email/sequences/welcomeSequence.ts`
- Export `triggerWelcomeSequence(userId: string, email: string, reportUrl: string): Promise<void>`
- Sends email 1 immediately (welcome + report link)
- Emails 2-7 are scheduled — add `// TODO(P1): implement email scheduling via queue` comment
- For MVP: send only email 1 immediately

**Done when:** welcome email sends on new user creation.

---

## PHASE 8 — DASHBOARD

### Task 8.1 — Dashboard layout
**Do:**
- Create `/app/(dashboard)/layout.tsx`
- Requires auth — redirect to `/login` if no session
- Sidebar or top nav with: Dashboard, My Chart, Consultations, Account
- Show subscription tier badge

**Done when:** layout renders for authenticated users, redirects unauthenticated.

---

### Task 8.2 — Daily insight display
**Do:**
- Create `/app/(dashboard)/page.tsx` (dashboard home)
- Fetch today's daily insight for the current user from the DB
  (type: DAILY, most recent, generatedAt today)
- If no insight exists yet: show a "Your insight is being prepared" placeholder
- Display: insight text, generated date, accuracy rating widget (1-5 stars)
- Accuracy rating posts to `/api/insights/rate`

**Done when:** page renders with real or placeholder insight.

---

### Task 8.3 — Weekly forecast display
**Do:**
- Add weekly forecast section to dashboard home (below daily insight)
- Fetch most recent WEEKLY insight for the user
- Display: forecast text, week dates it covers
- Gated: only CORE and VIP tiers see real content — FREE tier sees a blurred preview + upgrade CTA

**Done when:** tier gating works correctly for all three tiers.

---

### Task 8.4 — Current life phase indicator
**Do:**
- Create `/components/insights/LifePhaseIndicator.tsx`
- Displays: active dasha name, dasha period dates, one-sentence plain-language description
- Data source: KV `chart:dashas:{userId}` — if empty, show "Calculating your life phase..." placeholder
- Add to dashboard home above the insight cards

**Done when:** component renders with real or placeholder data.

---

## PHASE 9 — INSIGHT GENERATION

### Task 9.1 — Insight generation prompt builder
**Do:**
- Create `/lib/content/promptBuilder.ts`
- Export one function per insight type:
  ```typescript
  export function buildDailyInsightPrompt(chart: HDChartData, transits: unknown): string
  export function buildWeeklyForecastPrompt(chart: HDChartData, weekTransits: unknown): string
  export function buildMonthlyReportPrompt(chart: HDChartData, dashas: unknown): string
  export function buildHDTipPrompt(chart: HDChartData): string
  ```
- Every prompt must enforce the content rules from the instructions:
  - Banned phrases list injected into system prompt
  - Length requirements injected as instructions
  - HD type branching: prompt changes based on `chart.type`
- Add the banned phrases as a constant at the top of the file:
  ```typescript
  const BANNED_PHRASES = ['you will', 'this will cause', 'this means you will']
  ```

**Done when:** all four functions return non-empty prompt strings.

---

### Task 9.2 — Content review queue API
**Do:**
- Create `/app/api/admin/review/pending/route.ts` (GET)
  - Returns all Insights where ContentReview.approved = false
  - Admin only — check session for admin role
- Create `/app/api/admin/review/[insightId]/route.ts` (POST)
  - Body: `{ approved: boolean, notes?: string }`
  - Updates ContentReview record
  - If approved: sets insight.deliveredAt to now, triggers delivery

**Done when:** both routes return correct data and update DB correctly.

---

### Task 9.3 — Scheduled insight generation job
**Do:**
- Create `/app/api/cron/generate-insights/route.ts`
- Vercel Cron route (add to `vercel.json`: run daily at 04:00 UTC)
- For each CORE + VIP user:
  1. Fetch their chart data from KV
  2. Fetch today's transits (transitService)
  3. Build prompt (promptBuilder)
  4. Call Claude API (claude-sonnet-4-6) to generate insight
  5. Store as Insight record with ContentReview pending
  6. Do NOT deliver yet — delivery happens after review approval
- Add rate limiting: process max 50 users per cron run, paginate for larger user bases

**Done when:** cron route generates insights and stores them correctly for test users.

---

## PHASE 10 — SUBSCRIPTIONS

### Task 10.1 — Stripe products setup instructions
**Do:**
- Create `/docs/stripe-setup.md`
- Document the three products to create manually in Stripe dashboard:
  - Free tier: no product needed
  - Core: recurring price at $29/month
  - VIP: recurring price at $497/quarter
  - One-time: Single 90-min consultation at $150
- Document required webhook events to enable:
  `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_failed`
- Add price IDs as env vars: `STRIPE_PRICE_CORE`, `STRIPE_PRICE_VIP`, `STRIPE_PRICE_CONSULTATION`

**Done when:** doc is written. No code in this task.

---

### Task 10.2 — Stripe checkout route
**Do:**
- Create `/app/api/subscriptions/create/route.ts`
- POST handler:
  - Body: `{ tier: 'CORE' | 'VIP' }`
  - Requires auth
  - Creates or retrieves Stripe customer for the user
  - Creates checkout session with correct price ID
  - Returns `{ checkoutUrl }`
- Store `stripeCustomerId` on User record after first checkout creation

**Done when:** checkout session creates and returns a valid Stripe URL.

---

### Task 10.3 — Stripe webhook handler
**Do:**
- Create `/app/api/subscriptions/webhook/route.ts`
- Verify webhook signature using `env.STRIPE_WEBHOOK_SECRET`
- Handle these events:
  - `checkout.session.completed`: update user tier in DB
  - `customer.subscription.updated`: sync tier + status
  - `customer.subscription.deleted`: downgrade to FREE, set status cancelled
  - `invoice.payment_failed`: set status past_due, do NOT revoke access immediately
- All DB updates in try/catch — always return 200 to Stripe even on internal errors (prevents retries)

**Done when:** all four events update DB correctly in tests.

---

## PHASE 11 — GDPR

### Task 11.1 — Data export
**Do:**
- Create `/app/api/user/export/route.ts`
- GET handler, requires auth
- Returns JSON containing all user data:
  - User record
  - BirthProfile
  - All Insights
  - All Consultations
  - All ContentReviews
- Do NOT include Stripe payment data (not stored locally)
- Set response header: `Content-Disposition: attachment; filename="crossroads-compass-data.json"`

**Done when:** export returns complete JSON for a test user.

---

### Task 11.2 — Data deletion
**Do:**
- Create `/app/api/user/data/route.ts`
- DELETE handler, requires auth
- Prisma transaction:
  1. Delete ContentReviews for this user's insights
  2. Delete Insights
  3. Delete Consultations
  4. Delete BirthProfile
  5. Delete KV keys: vedic chart, HD chart, dashas, all transit keys for user
  6. Cancel Stripe subscription if active (Stripe API call)
  7. Delete User record
- Return 200 on success, 500 with logged error on failure
- Transit KV keys: use pattern `transit:{userId}:*` — note that Upstash scan may be needed for wildcard delete

**Done when:** deletion removes all records including KV data for a test user.

---

## PHASE 12 — CONSULTATION BOOKING

### Task 12.1 — Booking page
**Do:**
- Create `/app/(dashboard)/consultations/page.tsx`
- Display consultant profile (hardcoded for MVP — name, bio, photo path)
- Embed Calendly widget using `NEXT_PUBLIC_CALENDLY_URL` env var
- Show available packages: Single 90-min ($150), VIP Quarterly ($497)
- After Calendly booking event fires: POST to `/api/consultations/book`

**Done when:** page renders and Calendly widget loads.

---

### Task 12.2 — Booking record API
**Do:**
- Create `/app/api/consultations/book/route.ts`
- POST handler, requires auth
- Body: `{ type: ConsultationType, sessionAt?: string }`
- Creates Consultation record in DB
- Triggers pre-session prep guide email (stub for now — add TODO)
- Returns `{ consultationId }`

**Done when:** booking creates a DB record.

---

## PHASE 13 — LANDING PAGE

### Task 13.1 — Landing page structure
**Do:**
- Create `/app/(marketing)/page.tsx`
- Sections (content is placeholder text for now):
  1. Hero: headline, sub-headline, CTA button to onboarding
  2. Problem: "Why you feel stuck" — 3 bullet points
  3. Solution: three product layers explained simply
  4. Social proof placeholder (add real testimonials later)
  5. Pricing: three tiers with feature lists
  6. Final CTA
- No external analytics scripts until cookie consent is implemented

**Done when:** page renders all sections, CTA links to onboarding form.

---

### Task 13.2 — Cookie consent
**Do:**
- Install a lightweight cookie consent library or build a simple banner component
- Banner must appear before any analytics or tracking scripts load
- On accept: set consent cookie, load analytics (placeholder for now)
- On decline: set refusal cookie, do not load analytics
- Consent state persists across sessions

**Done when:** no scripts load before consent is given. Verified by checking Network tab.

---

## COMPLETION CHECKLIST

Before considering the build ready for staging:

- [ ] 0.1 Project scaffold
- [ ] 0.2 Dependencies installed
- [ ] 0.3 Env validation
- [ ] 1.1 Types
- [ ] 1.2 Prisma schema
- [ ] 1.3 Migration
- [ ] 2.1 Redis client
- [ ] 2.2 KV key schema
- [ ] 2.3 KV helpers
- [ ] 3.1 Vedic API client (with DECISION NEEDED placeholder)
- [ ] 3.2 HD calculator wrapper
- [ ] 3.3 Chart cache invalidation
- [ ] 3.4 HD chart get or calculate
- [ ] 3.5 Vedic chart get or fetch (with placeholder)
- [ ] 3.6 Transit cache layer
- [ ] 4.1 NextAuth config
- [ ] 4.2 Auth helpers
- [ ] 5.1 Birth data Zod schema
- [ ] 5.2 Chart generation route
- [ ] 5.3 Onboarding form
- [ ] 6.1 Report assembler
- [ ] 6.2 PDF generation
- [ ] 6.3 Report delivery route
- [ ] 7.1 Email client
- [ ] 7.2 Welcome email template
- [ ] 7.3 Daily insight email template
- [ ] 7.4 Welcome sequence trigger
- [ ] 8.1 Dashboard layout
- [ ] 8.2 Daily insight display
- [ ] 8.3 Weekly forecast display
- [ ] 8.4 Life phase indicator
- [ ] 9.1 Prompt builder
- [ ] 9.2 Review queue API
- [ ] 9.3 Scheduled generation cron
- [ ] 10.1 Stripe setup docs
- [ ] 10.2 Stripe checkout route
- [ ] 10.3 Stripe webhook handler
- [ ] 11.1 Data export
- [ ] 11.2 Data deletion
- [ ] 12.1 Booking page
- [ ] 12.2 Booking record API
- [ ] 13.1 Landing page
- [ ] 13.2 Cookie consent

---

## OPEN DECISIONS TRACKER

Copy this block into your task notes when you hit a DECISION NEEDED.

```
DECISION NEEDED
Task: [task number]
File: [file path]
Question: [what needs to be decided]
Blocking: [what cannot be built until this is answered]
Raised: [date]
Resolved: [date + answer, filled in by Milosh]
```

Current open decisions:
1. Vedic API endpoint paths and request/response schemas — blocks Tasks 3.5, 3.6, 9.3
2. Swiss Ephemeris commercial license — blocks production deployment
3. Ephemeris files on Vercel — blocks production deployment of HD calculations
4. Calendly URL — blocks Task 12.1
5. Consultant name, bio, photo — blocks Task 12.1 and 13.1

---

*Crossroads Compass TASKS.md v1.0 | March 2026 | Milosh*

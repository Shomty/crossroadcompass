# Crossroads Compass — Admin Panel Task File
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Created: 2026-03-30

---

## CONTEXT

This task file implements the full Admin Panel for Crossroads Compass.
The admin panel is co-located in the Next.js app under `/app/(admin)`.
It is protected behind a session check that requires `isAdmin: true` on the user record.

The panel has six major sections:

  1. Statistics          — platform KPIs and MRR overview
  2. Report Builder      — admin-crafted AI reports with Vedic/HD variable injection
  3. User Management     — full user CRUD, tier override, impersonation
  4. Payments            — Stripe transactions, refunds, manual charge, bank instructions
  5. Report Logs         — per-user report history, status, regeneration
  6. Audit Log           — immutable trail of all admin actions

### Astro engine integration

Every Vedic variable available for injection is derived from the
already-built special points engine (specialPoints.ts) and the chart
service (chartService.ts). The variable resolver must call:

  - getOrCreateVedicChart(userId, birthProfile)   — raw chart data
  - getOrCreateHDChart(userId, birthProfile)      — HD chart data
  - deriveSpecialPoints(vedicChart)               — AL, GL, BL, HL, CK
  - getOrCreateSpecialPoints(userId)              — cached path

No new calculation logic is introduced here. This task file only wires
the existing engine output into the variable injection pipeline.

### Prisma models to add

Add these models to prisma/schema.prisma before running migrations.
Run `npx prisma migrate dev --name admin-panel` after AP.1.

```prisma
model ReportProduct {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?  @db.Text
  geminiPrompt    String   @db.Text         // NEVER expose to client
  promptVersion   Int      @default(1)
  isActive        Boolean  @default(false)
  priceCents      Int      @default(0)      // 0 = free for subscribers
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  purchases       ReportPurchase[]
  generated       GeneratedReport[]
  promptHistory   PromptVersion[]
}

model PromptVersion {
  id         String        @id @default(cuid())
  reportId   String
  report     ReportProduct @relation(...)
  version    Int
  prompt     String        @db.Text
  savedBy    String        // admin email
  savedAt    DateTime      @default(now())
  testResult String?       @db.Text         // last test run output preview
}

model ReportPurchase {
  id         String        @id @default(cuid())
  userId     String
  user       User          @relation(...)
  reportId   String
  report     ReportProduct @relation(...)
  paidCents  Int
  purchasedAt DateTime     @default(now())
  stripePaymentIntentId String? @unique
}

model GeneratedReport {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(...)
  reportId    String
  report      ReportProduct @relation(...)
  status      ReportStatus  @default(PENDING)
  content     String?       @db.Text
  errorMsg    String?       @db.Text
  generatedAt DateTime      @default(now())
  regeneratedAt DateTime?
}

model AuditLog {
  id         String   @id @default(cuid())
  adminEmail String
  action     String
  targetType String   // 'user' | 'report' | 'payment' | 'prompt'
  targetId   String
  detail     String?  @db.Text
  ip         String?
  createdAt  DateTime @default(now())
}

enum ReportStatus {
  PENDING
  GENERATING
  DONE
  FAILED
}
```

Also add to the User model:
```prisma
  isAdmin       Boolean  @default(false)
  reportPurchases ReportPurchase[]
  generatedReports GeneratedReport[]
```

---

## TASK AP.1 — Admin guard middleware

**File:** `/middleware.ts` (update) and `/lib/auth/adminHelpers.ts` (new)

**Do:**
- Create `/lib/auth/adminHelpers.ts`
- Export:
  ```typescript
  export async function requireAdmin(): Promise<AdminSession>
  // Calls getRequiredSession(), throws 403 if session.user.isAdmin !== true
  // Returns the full session on success

  export async function writeAuditLog(opts: {
    adminEmail: string
    action: string
    targetType: 'user' | 'report' | 'payment' | 'prompt'
    targetId: string
    detail?: string
    ip?: string
  }): Promise<void>
  // Writes to AuditLog table. Never throws — log failures silently.
  ```
- Update `middleware.ts` to protect all `/admin/*` routes: redirect to `/login`
  if no session, redirect to `/` if session exists but `isAdmin` is false.

**Unit tests:**
```typescript
// __tests__/lib/auth/adminHelpers.test.ts
describe('requireAdmin', () => {
  it('throws 403 when user is not admin')
  it('returns session when user is admin')
  it('throws redirect when no session exists')
})
describe('writeAuditLog', () => {
  it('writes a record to AuditLog table')
  it('does not throw when DB write fails')
})
```

**Done when:** Non-admin session cannot access any `/admin` route.

---

## TASK AP.2 — Admin layout and navigation

**File:** `/app/(admin)/layout.tsx`

**Do:**
- Left sidebar navigation (fixed, 200px wide) with links:
  - Statistics
  - Report Builder
  - User Management
  - Payments
  - Report Logs
  - Prompt Editor (links to Report Builder editing view)
  - Audit Log
- Show logged-in admin email in footer of sidebar
- Active route highlighted using `usePathname()`
- All routes are prefixed `/admin/`
- The layout calls `requireAdmin()` server-side before rendering

**Done when:** Layout renders for admin sessions, rejects non-admin.

---

## TASK AP.3 — Statistics page

**File:** `/app/(admin)/statistics/page.tsx`
**API:** `/app/api/admin/statistics/route.ts`

**Do:**

### API route (GET, admin only)
Return:
```typescript
{
  mrr: number                    // sum of active subscriptions in dollars
  activeUsers: number            // users with subscriptionStatus = 'active'
  freeCount: number
  seekerCount: number
  navigatorCount: number
  churnRate30d: number           // (cancellations last 30d / active 30d ago) * 100
  conversionRate: number         // (free→paid conversions last 30d / new free users)
  sessionsBooked30d: number
  mrrTrend: { date: string; value: number }[]  // last 30 days, one entry per day
  insightOpenRate: number        // avg open rate across all delivered insights
  reportGeneratedCount: number   // total GeneratedReport rows with status DONE
}
```

### Page component
- Six metric cards in a 3x2 grid:
  MRR / Active Users / Conversion Rate /
  Seeker Count / Navigator Count / Churn Rate
- MRR trend sparkline below cards (use a simple SVG polyline, no external chart lib)
- Sessions booked counter
- Insight open rate
- Report generated count

**Unit tests:**
```typescript
// __tests__/api/admin/statistics.test.ts
describe('GET /api/admin/statistics', () => {
  it('returns 403 for non-admin')
  it('returns correct mrr from active subscriptions')
  it('returns correct tier counts')
  it('returns mrrTrend with 30 entries')
})
```

**Done when:** Page renders with real data from DB.

---

## TASK AP.4 — Prisma migration

**Do:**
- Run `npx prisma migrate dev --name admin-panel`
- Verify all new tables exist: ReportProduct, PromptVersion, ReportPurchase,
  GeneratedReport, AuditLog
- Seed one test ReportProduct manually via Prisma Studio

**Done when:** `npx prisma studio` shows all five new tables.

---

## TASK AP.5 — Variable resolver service

**File:** `/lib/content/reportVariableResolver.ts`

This is the core engine that maps `{{variable}}` tokens to real user data.
It calls the existing chart services and returns a flat string-string map.

**Do:**
```typescript
export async function resolveReportVariables(
  userId: string
): Promise<Record<string, string>>
```

Full variable list — these are ALL variables available to admin prompt templates.
The resolver must produce a value (or a clear fallback string like `"unknown"`)
for each one:

```
// VEDIC — natal chart
{{lagna}}                  SignNumber 1-12 as digit string, e.g. "4"
{{lagna_sign}}             Sign name, e.g. "Cancer"
{{lagna_lord}}             Planet name, e.g. "Moon"
{{sun_sign}}               Sign name
{{sun_house}}              House number 1-12
{{moon_sign}}              Sign name
{{moon_house}}             House number 1-12
{{moon_nakshatra}}         Nakshatra name (if available from Vedic chart)
{{mars_sign}}              Sign name
{{mars_house}}
{{mercury_sign}}
{{mercury_house}}
{{jupiter_sign}}
{{jupiter_house}}
{{venus_sign}}
{{venus_house}}
{{saturn_sign}}
{{saturn_house}}
{{rahu_sign}}
{{rahu_house}}
{{ketu_sign}}
{{ketu_house}}

// VEDIC — Dasha
{{mahadasha_lord}}         Planet name, e.g. "Saturn"
{{mahadasha_start_date}}   ISO date string
{{mahadasha_end_date}}     ISO date string
{{antardasha_lord}}        Planet name
{{antardasha_end_date}}    ISO date string

// VEDIC — Special Points (from specialPoints.ts)
{{arudha_lagna}}           Sign number
{{arudha_lagna_sign}}      Sign name
{{ghati_lagna}}            Sign number
{{ghati_lagna_sign}}       Sign name
{{bhava_lagna}}            Sign number
{{bhava_lagna_sign}}       Sign name
{{hora_lagna}}             Sign number
{{hora_lagna_sign}}        Sign name

// VEDIC — Charakarakas (from calculateCharakarakas)
{{atmakaraka}}             Planet name
{{amatyakaraka}}           Planet name
{{bhratrukaraka}}          Planet name
{{matrukaraka}}            Planet name
{{pitrukaraka}}            Planet name
{{putrakaraka}}            Planet name
{{gnatikaraka}}            Planet name
{{darakaraka}}             Planet name

// HUMAN DESIGN
{{hd_type}}                e.g. "Generator"
{{hd_strategy}}            e.g. "Wait to respond"
{{hd_authority}}           e.g. "Sacral"
{{hd_profile}}             e.g. "3/5"
{{hd_incarnation_cross}}   e.g. "Right Angle Cross of Explanation"
{{hd_definition}}          e.g. "Single" | "Split" | "Triple Split" | "Quadruple Split"

// USER
{{user_name}}              From email prefix if no name field, e.g. "anna"
{{birth_date}}             Formatted, e.g. "March 15, 1988"
{{birth_location}}         City + country string from BirthProfile
```

Implementation notes:
- Fetch BirthProfile from DB first. If absent, return `{}` (report cannot render).
- Call `getOrCreateVedicChart`, `getOrCreateHDChart`, `getOrCreateSpecialPoints`.
- Convert SignNumber to sign name using a local SIGN_NAMES array (same as specialPoints.ts order).
- All values are strings. Numbers must be converted to string before returning.
- NEVER include this output in any client-facing response — it is used server-side only.

**Unit tests:**
```typescript
// __tests__/lib/content/reportVariableResolver.test.ts
describe('resolveReportVariables', () => {
  it('returns all required variable keys')
  it('returns "unknown" fallback for missing optional fields')
  it('returns empty object when BirthProfile is absent')
  it('converts SignNumber to sign name correctly')
  it('maps Charakaraka results to correct planet names')
  it('does not throw when specialPoints returns null')
})
```

**Done when:** Function returns a fully-populated map for a user with chart data.

---

## TASK AP.6 — Report Builder: list and create

**Files:**
- `/app/(admin)/reports/page.tsx` — report list
- `/app/api/admin/reports/route.ts` — GET (list) + POST (create)

### GET /api/admin/reports
Returns all ReportProduct rows, ordered by updatedAt desc.
Fields: id, name, slug, isActive, promptVersion, priceCents, updatedAt,
        _count.generated (count of GeneratedReport rows)

### POST /api/admin/reports
Body: `{ name: string, slug: string, description?: string, priceCents?: number }`
Creates a new ReportProduct with an empty geminiPrompt and isActive = false.
Writes audit log entry: action = 'report.create'.

### Page
- Table with columns: Name / Slug / Status / Price / Generated Count / Actions
- Status badge: Active (green) / Draft (amber)
- Actions: Edit button (links to /admin/reports/[id])
- "New Report" button at top right

**Unit tests:**
```typescript
// __tests__/api/admin/reports.test.ts
describe('GET /api/admin/reports', () => {
  it('returns 403 for non-admin')
  it('returns list ordered by updatedAt desc')
  it('includes generated count per report')
})
describe('POST /api/admin/reports', () => {
  it('creates report with isActive = false')
  it('writes audit log entry')
  it('rejects duplicate slug')
})
```

**Done when:** Report list page renders. New report can be created.

---

## TASK AP.7 — Report Builder: prompt editor

**Files:**
- `/app/(admin)/reports/[id]/page.tsx` — editor page
- `/app/api/admin/reports/[id]/route.ts` — GET (single) + PATCH (update prompt)
- `/app/api/admin/reports/[id]/activate/route.ts` — POST (toggle isActive)
- `/app/api/admin/reports/[id]/history/route.ts` — GET (prompt versions)

### PATCH /api/admin/reports/[id]
Body: `{ geminiPrompt: string }`
- Saves a new PromptVersion record (version = current + 1)
- Updates ReportProduct.geminiPrompt and promptVersion
- Writes audit log: action = 'prompt.save'
- Returns updated report with new promptVersion

### GET /api/admin/reports/[id]/history
Returns all PromptVersion rows for this report, ordered by version desc.
Fields: id, version, savedBy, savedAt (not the prompt text — too large for list view).

### POST /api/admin/reports/[id]/activate
Toggles isActive. Writes audit log.

### Editor page layout
- Left 60%: textarea bound to `geminiPrompt` field (monospace font, full height)
- Right 40%: scrollable list of all available `{{variable}}` tokens, grouped by
  category (Vedic Chart / Special Points / Karakas / Human Design / User).
  Clicking a token copies `{{variable_name}}` to clipboard and appends at cursor.
- Below editor: version info + History button (opens drawer with version list + rollback)
- Save button: calls PATCH, saves version
- Activate/Deactivate toggle button

**IMPORTANT — prompt security:**
- `geminiPrompt` must NEVER be included in any API response that is accessible
  without `requireAdmin()`.
- The editor page must render the prompt only in the admin-authenticated context.
- Add a lint rule comment at the top of the route: `// SECURITY: geminiPrompt is admin IP. Never expose outside this route.`

**Unit tests:**
```typescript
// __tests__/api/admin/reports/[id].test.ts
describe('PATCH /api/admin/reports/[id]', () => {
  it('saves new PromptVersion with incremented version number')
  it('does not expose geminiPrompt in response body — only version number')
  it('writes audit log')
})
describe('GET /api/admin/reports/[id]/history', () => {
  it('returns versions without prompt text')
  it('orders by version desc')
})
describe('POST /api/admin/reports/[id]/activate', () => {
  it('toggles isActive from false to true')
  it('toggles isActive from true to false')
  it('writes audit log for both directions')
})
```

**Done when:** Admin can write a prompt, save it, view history, and toggle active status.

---

## TASK AP.8 — Report Builder: test run

**Files:**
- `/app/api/admin/reports/[id]/test/route.ts` — POST

### POST /api/admin/reports/[id]/test
Body: `{ userId?: string }` (optional override — see below)

Steps:
1. Call `requireAdmin()`
2. Fetch the ReportProduct by id
3. Variable resolution:
   - Default (no userId in body): use the fixed seed account `shomty@hotmail.com`.
     Look up this user by email, call `resolveReportVariables(seedUser.id)`.
     If the seed user does not exist in DB, fall back to `SAMPLE_VARIABLES` constant
     and add a warning field to the response: `{ seedUserMissing: true }`.
   - If `userId` is explicitly provided in the body: use that user's real chart data.
     This is an optional override for edge-case testing.
4. Interpolate all `{{variable}}` tokens in the geminiPrompt using the resolved map
5. Call Gemini API (or return a stub response if `GEMINI_API_KEY` is absent in env)
6. Save the first 500 chars of the output to `PromptVersion.testResult`
7. Return: `{ preview: string (first 500 chars), variablesResolved: number, variablesMissing: string[], seedUserMissing?: boolean }`

**SAMPLE_VARIABLES fallback** — defined as a constant at the top of this route file.
Covers all variables from AP.5 with plausible placeholder values.
Only used when `shomty@hotmail.com` does not exist in DB.

**Seed account note for Claude Code / Cursor:**
The seed account `shomty@hotmail.com` must exist in the DB with a complete
BirthProfile and cached Vedic + HD charts for test runs to return real variable values.
Add a seed script or a note in `/docs/admin-setup.md` instructing the developer
to create this account before using the test run feature.

**Security:**
- Resolved variable map is server-side only, never included in the response.
- Write audit log: action = 'report.test', detail = `userId or "seed:shomty@hotmail.com" or "sample"`

**Unit tests:**
```typescript
// __tests__/api/admin/reports/test.test.ts
describe('POST /api/admin/reports/[id]/test', () => {
  it('uses shomty@hotmail.com seed account by default')
  it('resolves real variables from seed account chart data')
  it('falls back to SAMPLE_VARIABLES when seed user is absent, sets seedUserMissing: true')
  it('uses explicitly provided userId when passed in body')
  it('returns variablesMissing list for unresolvable tokens')
  it('returns 404 for unknown report id')
  it('writes audit log with "seed:shomty@hotmail.com" detail when using default seed')
  it('writes audit log with userId detail when userId override is used')
  it('does not include resolved variable values in response')
})
```

**Done when:** Test run returns a preview and missing variable list.

---

## TASK AP.9 — Report generation API (user-facing)

**File:** `/app/api/reports/generate/route.ts`

This is the user-facing generation endpoint (not admin). It is called
when a user purchases or is granted access to a report.

```typescript
POST /api/reports/generate
Body: { reportProductId: string }
Auth: requires valid session
```

Steps:
1. Verify user is authenticated
2. Verify user has purchased reportProductId (check ReportPurchase) OR
   `env.ADMIN_EMAIL` matches session email (admin bypass)
3. Check if a DONE GeneratedReport already exists for this user + report
   (return cached if within 7 days)
4. Create a GeneratedReport row with status PENDING
5. Enqueue a background job (or run inline for MVP, with a 30s timeout):
   a. Set status = GENERATING
   b. Call `resolveReportVariables(userId)`
   c. Interpolate prompt
   d. Call Gemini API
   e. Set status = DONE, save content
   f. On any error: set status = FAILED, save errorMsg
6. Return `{ reportId, status }`

**Error isolation:** If Gemini call fails, status is FAILED — the row is
preserved for admin regeneration via AP.10. Never delete failed rows.

**Unit tests:**
```typescript
// __tests__/api/reports/generate.test.ts
describe('POST /api/reports/generate', () => {
  it('returns 401 when not authenticated')
  it('returns 403 when user has not purchased the report')
  it('allows admin email to bypass purchase check')
  it('returns cached report if DONE and within 7 days')
  it('creates GeneratedReport with PENDING status')
  it('saves content on successful Gemini response')
  it('saves errorMsg and sets FAILED on Gemini error')
  it('preserves failed row for admin regeneration')
})
```

**Done when:** Report generation creates a row, calls Gemini (or stub), and saves result.

---

## TASK AP.10 — Report Logs page

**Files:**
- `/app/(admin)/report-logs/page.tsx`
- `/app/api/admin/report-logs/route.ts` — GET
- `/app/api/admin/report-logs/[id]/regenerate/route.ts` — POST

### GET /api/admin/report-logs
Query params: `page`, `perPage` (default 50), `status` filter, `reportId` filter
Returns paginated GeneratedReport rows joined with user email and report name.
Fields: id, userId, userEmail, reportName, status, generatedAt,
        regeneratedAt, errorMsg (truncated to 200 chars)

### POST /api/admin/report-logs/[id]/regenerate
Forces re-generation of a specific GeneratedReport row regardless of status.
- Resets status to PENDING
- Calls the same generation pipeline as AP.9 (step 5)
- Writes audit log: action = 'report.regenerate'
- Returns `{ status: 'queued' }`

### Page layout
- Filter bar: status dropdown (ALL / DONE / FAILED / PENDING) + report name select
- Table: User Email / Report Name / Generated At / Status / Error / Actions
- Status badges: DONE (green), FAILED (red), PENDING (amber), GENERATING (blue)
- Actions per row: View (opens modal with full content) + Regenerate
- Regenerate button visible on ALL rows — not just FAILED
- Error column: truncated errorMsg, expand on hover/click

**Unit tests:**
```typescript
// __tests__/api/admin/report-logs.test.ts
describe('GET /api/admin/report-logs', () => {
  it('returns 403 for non-admin')
  it('returns paginated results')
  it('filters by status correctly')
  it('truncates errorMsg to 200 chars in list view')
})
describe('POST /api/admin/report-logs/[id]/regenerate', () => {
  it('resets status to PENDING')
  it('writes audit log')
  it('returns 404 for unknown id')
  it('works on rows with DONE status (forced regen)')
})
```

**Done when:** Admin can view all report logs and trigger regeneration on any row.

---

## TASK AP.11 — User Management page

**Files:**
- `/app/(admin)/users/page.tsx`
- `/app/(admin)/users/[id]/page.tsx` — user detail
- `/app/api/admin/users/route.ts` — GET (search + list)
- `/app/api/admin/users/[id]/route.ts` — GET (detail) + PATCH (update)
- `/app/api/admin/users/[id]/impersonate/route.ts` — POST

### GET /api/admin/users
Query: `search` (email prefix), `tier`, `page`, `perPage`
Returns: id, email, subscriptionTier, subscriptionStatus, createdAt,
         _count.insights, _count.consultations, _count.generatedReports

### GET /api/admin/users/[id]
Returns full user profile:
- User fields
- BirthProfile
- Recent insights (last 5)
- Consultations
- ReportPurchases
- GeneratedReports (last 10 with status)
- Note: never returns VedicChartData or HDChartData directly — only their KV presence as boolean

### PATCH /api/admin/users/[id]
Body: `{ subscriptionTier?: SubscriptionTier, subscriptionStatus?: SubscriptionStatus, isAdmin?: boolean }`
Writes audit log for each changed field.

### POST /api/admin/users/[id]/impersonate
Sets a server-side session cookie `adminImpersonating: userId`.
The impersonated session presents the user's identity to the dashboard
but retains a flag so the admin can return.
Writes audit log: action = 'user.impersonate'

Add to `/app/(dashboard)/layout.tsx`:
- If session contains `adminImpersonating`, show a persistent banner:
  "Viewing as [email] — Exit impersonation"
- Exit clears the impersonation cookie and returns admin to `/admin/users`

### User list page
- Search input (email prefix, debounced 300ms)
- Tier filter dropdown
- Table: Email / Tier / Status / Joined / Insights / Actions
- Actions per row: View / Login As
- "Login As" calls the impersonate endpoint

### User detail page
- Header: email, tier badge, status badge, joined date
- BirthProfile section: birth date, time, location, timezone
- Charts section: Vedic chart cached (yes/no), HD chart cached (yes/no)
- Recent insights list
- Consultations list
- Reports list with status badges
- Tier override inline (select + save)

**IMPERSONATION SECURITY RULE:**
Impersonation must be logged in AuditLog and must be time-limited.
After 30 minutes, the impersonation cookie expires automatically.
The impersonated user's password is never revealed or set.

**Unit tests:**
```typescript
// __tests__/api/admin/users.test.ts
describe('GET /api/admin/users', () => {
  it('returns 403 for non-admin')
  it('filters by email prefix')
  it('filters by tier')
  it('returns correct insight and consultation counts')
})
describe('PATCH /api/admin/users/[id]', () => {
  it('updates subscriptionTier')
  it('writes audit log for each field change')
  it('rejects isAdmin change without own isAdmin=true')
})
describe('POST /api/admin/users/[id]/impersonate', () => {
  it('sets impersonation cookie with 30min expiry')
  it('writes audit log')
  it('rejects impersonation of another admin')
})
```

**Done when:** Admin can search users, view profile, override tier, and impersonate.

---

## TASK AP.12 — Payments page [DEFERRED — stub only]

**STATUS: DEFERRED. Do not implement Stripe calls. Build the UI shell and stub all API routes.**

Stripe integration is parked for a later phase. This task delivers only:
1. The payments page UI shell with placeholder data
2. Stubbed API routes that return `501 Not Implemented` with a clear message
3. The bank instructions email (this is the only live functionality in this task
   — it does not require Stripe)

**Files:**
- `/app/(admin)/payments/page.tsx` — UI shell
- `/app/api/admin/payments/route.ts` — STUB
- `/app/api/admin/payments/[userId]/refund/route.ts` — STUB
- `/app/api/admin/payments/[userId]/charge/route.ts` — STUB
- `/app/api/admin/payments/[userId]/bank-instructions/route.ts` — LIVE (email only)

### Stub pattern for all deferred Stripe routes

```typescript
// Example: /app/api/admin/payments/route.ts
export async function GET() {
  await requireAdmin()
  // TODO(AP.12): Implement Stripe payment list — deferred
  return NextResponse.json(
    { error: 'Payments not yet implemented.', code: 'PAYMENTS_DEFERRED' },
    { status: 501 }
  )
}
```

Apply the same stub pattern to the refund and charge routes.

### POST /api/admin/payments/[userId]/bank-instructions (LIVE — implement now)

Body: `{ email: string }` (recipient email)
Sends an email via Resend with bank transfer details.
Bank details read from env vars: `BANK_ACCOUNT_NAME`, `BANK_IBAN`, `BANK_BIC`, `BANK_REFERENCE_PREFIX`
Reference: `${BANK_REFERENCE_PREFIX}-${userId.slice(0,8)}`
Writes audit log: action = 'payment.bank_instructions_sent'

### Payments page layout (UI shell only)

- Banner at top: "Payment management coming soon. Bank transfer instructions are available now."
- Stub table with hardcoded sample rows (no live data)
- Refund / Charge buttons visible but disabled with tooltip "Coming soon"
- "Send Bank Details" button per row — this one is fully wired to the live endpoint

### Env vars needed now (for bank instructions email)

Add to `.env.local`, `.env.example`, and `/lib/env.ts`:
```
BANK_ACCOUNT_NAME=
BANK_IBAN=
BANK_BIC=
BANK_REFERENCE_PREFIX=CC
```
Note: `BANK_REFERENCE_PREFIX` already added in AP.15 — do not duplicate.

**Unit tests:**
```typescript
// __tests__/api/admin/payments.test.ts
describe('GET /api/admin/payments (stub)', () => {
  it('returns 403 for non-admin')
  it('returns 501 with PAYMENTS_DEFERRED code')
})
describe('POST /api/admin/payments/[userId]/refund (stub)', () => {
  it('returns 403 for non-admin')
  it('returns 501 with PAYMENTS_DEFERRED code')
})
describe('POST /api/admin/payments/[userId]/bank-instructions', () => {
  it('sends email to provided address')
  it('includes correct IBAN and reference in email')
  it('writes audit log')
  it('returns 403 for non-admin')
})
```

**Done when:** Payments page renders with stub data. Bank instructions email sends successfully. All Stripe routes return 501.

---

## TASK AP.13 — Audit Log page

**Files:**
- `/app/(admin)/audit-log/page.tsx`
- `/app/api/admin/audit-log/route.ts` — GET

### GET /api/admin/audit-log
Query: `adminEmail`, `targetType`, `action`, `page` (default 50 per page)
Returns AuditLog rows ordered by createdAt desc.
Fields: id, adminEmail, action, targetType, targetId, detail, ip, createdAt

### Page
- Filter bar: admin email filter + target type dropdown + action search
- Table: Admin / Action / Target Type / Target ID / Detail / IP / Timestamp
- Read-only (no edit/delete — audit log is immutable)
- Export to CSV button (client-side, from current filtered results)

**Unit tests:**
```typescript
// __tests__/api/admin/audit-log.test.ts
describe('GET /api/admin/audit-log', () => {
  it('returns 403 for non-admin')
  it('filters by adminEmail')
  it('filters by targetType')
  it('orders by createdAt desc')
  it('returns paginated results')
})
```

**Done when:** Admin can view and filter the full audit trail.

---

## TASK AP.14 — Variable completeness test

**File:** `__tests__/lib/content/reportVariableResolver.integration.test.ts`

This is the key integration test that confirms the variable resolver
covers ALL variables produced by the astro engine.

```typescript
describe('variable completeness', () => {
  it('resolves all Vedic natal planet variables (9 planets x sign + house = 18 vars)')
  it('resolves mahadasha_lord and dasha dates')
  it('resolves all four special lagnas as sign number and sign name')
  it('resolves all eight charakarakas by name')
  it('resolves all six HD fields')
  it('resolves user birth profile fields')

  it('returns "unknown" for optional fields when chart is partially populated', () => {
    // Test that missing arcMinutes/arcSeconds in PlanetPosition does not
    // crash the Charakaraka resolver
  })

  it('snapshot test: variable map keys match the complete list in AP.5', () => {
    const result = await resolveReportVariables(TEST_USER_ID_WITH_CHART)
    const expected = ALL_VARIABLE_NAMES_FROM_AP5  // hardcoded constant
    expected.forEach(key => {
      expect(result).toHaveProperty(key)
    })
  })
})
```

**Done when:** All assertions pass for a seeded test user with a complete chart.

---

## TASK AP.15 — Env vars update

**Do:**
- Add to `.env.local` and `.env.example`:
  ```
  GEMINI_API_KEY=
  BANK_ACCOUNT_NAME=
  BANK_IBAN=
  BANK_BIC=
  BANK_REFERENCE_PREFIX=CC
  ADMIN_EMAIL=
  ```
- Add to `/lib/env.ts` Zod schema:
  ```typescript
  GEMINI_API_KEY: z.string().min(1),
  BANK_ACCOUNT_NAME: z.string().min(1),
  BANK_IBAN: z.string().min(1),
  BANK_BIC: z.string().min(1),
  BANK_REFERENCE_PREFIX: z.string().default('CC'),
  ADMIN_EMAIL: z.string().email(),
  ```

**Done when:** Startup throws a clear error if GEMINI_API_KEY or ADMIN_EMAIL is missing.

---

## COMPLETION CHECKLIST

- [ ] AP.1   Admin guard middleware + writeAuditLog helper
- [ ] AP.2   Admin layout and navigation
- [ ] AP.3   Statistics page + API
- [ ] AP.4   Prisma migration (5 new tables)
- [ ] AP.5   reportVariableResolver — all 50 variables
- [ ] AP.6   Report Builder list + create
- [ ] AP.7   Prompt editor — save, history, activate
- [ ] AP.8   Test run — variable resolution + Gemini preview
- [ ] AP.9   User-facing report generation API
- [ ] AP.10  Report Logs page — view + regenerate
- [ ] AP.11  User Management — search, detail, tier override, impersonate
- [ ] AP.12  Payments — UI shell + bank instructions email (Stripe deferred, all Stripe routes stub 501)
- [ ] AP.13  Audit Log page
- [ ] AP.14  Variable completeness integration test
- [ ] AP.15  Env vars update

---

## SECURITY CHECKLIST

Every route in this file must pass these checks before being marked done:

- [ ] `requireAdmin()` is called at the top of every handler
- [ ] `writeAuditLog()` is called for every mutation (PATCH, POST, DELETE)
- [ ] `geminiPrompt` is never returned in any response body
- [ ] `resolveReportVariables` output is never returned in any response body
- [ ] Impersonation cookie expires in 30 minutes
- [ ] Impersonation of another admin is blocked
- [ ] Stripe operations use `env.STRIPE_SECRET_KEY` not a client-side key (applies when Stripe is implemented — AP.12 is currently stubbed)
- [ ] Bank details are read from env vars, never hardcoded

---

## OPEN DECISIONS TRACKER

```
DECISION RESOLVED
Task: AP.12
File: /app/api/admin/payments/route.ts
Question: Live Stripe API vs local payment mirror table?
Resolved: 2026-03-30 — DEFERRED. Entire Stripe implementation parked.
  Only bank instructions email is live. All Stripe routes return 501.
  Full payments implementation is a later phase task.
```

```
DECISION RESOLVED
Task: AP.8
File: /app/api/admin/reports/[id]/test/route.ts
Question: Should test runs use real user chart data or sample-only?
Resolved: 2026-03-30 — Default test account is shomty@hotmail.com.
  Resolver uses that account's real chart data from KV/DB.
  Falls back to SAMPLE_VARIABLES constant if account is absent.
  Optional userId override in request body for edge-case testing.
```

---

*Crossroads Compass — Admin Panel Task File | AP.1-AP.15 | March 2026 | Milosh*

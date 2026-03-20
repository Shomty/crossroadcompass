# Crossroads Compass — Admin Panel
# Product Requirements + Agent Task Instructions
# Version: 1.0 | March 2026 | Milosh

---

## PRODUCT OWNER RATIONALE

The admin panel is the operational backbone of the platform. Without it,
running Crossroads Compass means SSH sessions, raw DB queries, and no visibility
into content quality. It must exist before real users are onboarded.

**Non-negotiables for Phase 1:**
- Content review queue (all insights must be human-approved before delivery)
- Prompt editor (you need to tune AI output without touching code)
- User management (subscription control, manual interventions)
- Insight quality metrics (know if content is working before scaling)

**Core principle:** Every admin action must be logged. This is your audit trail
and your operational memory as a solo operator.

---

## FUNCTIONAL REQUIREMENTS

### Module A: Content Review Queue (P0)

**A-01** Dashboard showing all Insights with `ContentReview.approved = false`,
sorted by `generatedAt` ascending (oldest first — don't let insights age).

**A-02** Each pending item displays:
- User email (anonymized: first 3 chars + *** + domain)
- Insight type (DAILY / WEEKLY / MONTHLY / HD_TIP)
- Generated timestamp
- HD type of the user (Generator, Projector, etc.)
- Full insight content in an editable textarea
- Approve / Reject / Edit+Approve action buttons

**A-03** Edit+Approve flow: consultant can modify the AI draft directly in the
textarea, then approve in one action. The saved content is the modified version.

**A-04** Reject flow: sends the insight back to a `REJECTED` state. Optionally
triggers regeneration (Phase 2 — stub for now with TODO comment).

**A-05** Batch approve: checkbox select + "Approve selected" for days with
high-quality AI output that needs minimal review.

**A-06** Filter by: insight type, date range, HD type. Sort by: date, user.

**A-07** Queue counter badge in the sidebar nav showing pending count.
Refreshes every 60 seconds.

---

### Module B: Prompt Editor (P0) — MOST CRITICAL

This is the feature that lets you tune the entire product without touching code.

**B-01** List view of all prompt templates, grouped by feature:
- Daily Insight (5 variants: Generator, Manifesting Generator, Projector,
  Manifestor, Reflector)
- Weekly Forecast (5 HD type variants)
- Monthly Report (1 base template — type branching happens inside)
- HD Tip (5 HD type variants)
- Onboarding Report — Purpose section
- Onboarding Report — Life Phase section
- Welcome Email sequence (7 emails)
- Pre-session consultation prep email
- Significant transit alert email

**B-02** Each prompt template has:
- `promptKey`: unique string identifier (e.g. `daily.generator`, `weekly.projector`)
- `systemPrompt`: the system instructions (editable rich textarea)
- `userPromptTemplate`: the user turn template with `{{variables}}` (editable)
- `bannedPhrases`: comma-separated list (editable inline)
- `maxTokens`: integer (editable)
- `temperature`: float 0.0–1.0 (slider)
- `version`: auto-incremented integer
- `updatedAt` + `updatedBy`
- `isActive`: boolean toggle

**B-03** Edit view: full-page editor for a single prompt. Side-by-side layout:
- Left: editable system prompt + user template + settings
- Right: live preview panel showing rendered template with sample variable values

**B-04** Variable preview: hardcoded sample data for each prompt type so you
can see how the template renders before saving.
Example for `daily.generator`:
```
{{hdType}} = "Generator"
{{strategy}} = "To Respond"
{{authority}} = "Sacral"
{{currentDasha}} = "Saturn Mahadasha"
{{moonSign}} = "Scorpio"
{{todayDate}} = "2026-03-17"
```

**B-05** Version history: every save creates a new version. View history
panel showing all versions with diff highlighting. One-click rollback to
any previous version.

**B-06** Test prompt: "Run test" button sends the current prompt (unsaved)
to Claude API with sample variables and displays the raw output. This is
the QA loop without deploying.

**B-07** Banned phrases are enforced at save time: if the system prompt
itself contains any banned phrase, show an error and block save.

**B-08** Prompt templates are stored in PostgreSQL (not code files) so
edits take effect on next insight generation without redeployment.

---

### Module C: User Manager (P0)

**C-01** Paginated user list (50 per page). Columns: email, tier, status,
joined date, chart generated (Y/N), last insight delivered, total insights.

**C-02** Search by email. Filter by tier, status.

**C-03** User detail page showing:
- Full profile: email, birth data summary (date + location, NOT time for privacy)
- Subscription: tier, status, Stripe customer ID (link to Stripe dashboard)
- Chart status: HD chart cached (Y/N), Vedic chart cached (Y/N)
- Insight history: last 10 insights with type, date, delivery status, accuracy rating
- Consultation history

**C-04** Manual tier override: admin can set tier to FREE / CORE / VIP
with a reason field. Action is logged.

**C-05** Invalidate chart cache: button that calls `invalidateChartCache(userId)`.
Use case: user reports chart error, you want to force regeneration.

**C-06** Trigger insight: manually queue an insight generation for a user
(type selector). Bypasses the cron schedule.

**C-07** View/export user data: triggers the same GDPR export as the user
self-service endpoint. Admin use case: verify data before deletion request.

**C-08** Delete user: admin-initiated deletion. Requires typing the user's
email as confirmation. Calls the same deletion flow as Task 11.2.
Cannot be undone — no undo button, no recycle bin.

---

### Module D: Insight Quality Dashboard (P0)

**D-01** Summary metrics panel (last 7 days / 30 days toggle):
- Total insights generated
- Total insights approved / rejected / pending
- Average time in review queue
- Average accuracy rating (from user in-email polls)
- Email open rates: daily / weekly / monthly
- % rated "accurate" or "very accurate"

**D-02** Per-HD-type accuracy breakdown: bar chart showing average accuracy
rating by HD type. Surfaces which type's prompts are underperforming.

**D-03** Insight volume over time: sparkline chart showing daily generation
volume for the past 30 days.

**D-04** Low-rated insights list: all insights with accuracy rating ≤ 2,
showing the full content + which prompt version generated them. Direct link
to that prompt version in the editor.

**D-05** Content quality alert: if average accuracy rating drops below 60%
for any insight type over 7 days, show a yellow warning banner linking to
the relevant prompt editor.

---

### Module E: Consultation Manager (P1)

**E-01** List of all consultations: user email, type, booked at, session at,
status.

**E-02** Filter by: status (pending / confirmed / completed / cancelled),
type (SINGLE_90 / VIP_QUARTERLY), date range.

**E-03** Update status: dropdown to change consultation status. Updating to
`completed` prompts: "Send session notes email to user? (Y/N)".

**E-04** Add session notes: rich text field on consultation detail. Saved
to DB. Visible to user in their dashboard (per CB-05 in PRD).

**E-05** VIP tracker: list of VIP users with their quarterly session cadence.
Shows: sessions used this quarter, sessions remaining, next check-in due.

---

### Module F: Cron Job Monitor (P0)

**F-01** Table showing last 10 runs of each cron job:
- `generate-insights` (daily)
- Any future jobs

**F-02** Each run shows: started at, completed at, duration, users processed,
insights generated, errors (count + expandable error list).

**F-03** Manual trigger: "Run now" button for each job. Requires confirmation.
Protected — only fires in the admin panel, never public.

**F-04** Error log: full error messages from failed runs, with user IDs
affected (so you can manually trigger for those users).

---

### Module G: System Config (P1)

**G-01** Feature flags: toggles stored in DB/KV. Initial flags:
- `CONTENT_REVIEW_REQUIRED` (boolean — Phase 3: set to false to enable
  fully automated delivery)
- `DAILY_INSIGHTS_ENABLED`
- `WEEKLY_INSIGHTS_ENABLED`
- `MONTHLY_REPORTS_ENABLED`
- `CONSULTATION_BOOKING_ENABLED`

**G-02** Insight generation settings:
- `MAX_USERS_PER_CRON_RUN` (integer, default 50)
- `INSIGHT_GENERATION_HOUR_UTC` (integer 0-23, default 4)

**G-03** Content defaults:
- Default `maxTokens` per insight type
- Default `temperature` per insight type
(These are fallbacks when prompt-level settings are not set)

**G-04** All config changes are logged to AuditLog.

---

### Module H: Audit Log (P0)

**H-01** Immutable log of every admin action. Cannot be deleted from the UI.

**H-02** Each entry: timestamp, admin email, action type, target (user ID or
insight ID or prompt key), before/after values (JSON diff for edits).

**H-03** Filterable by: admin, action type, date range, target.

**H-04** Action types logged:
- `INSIGHT_APPROVED`, `INSIGHT_REJECTED`, `INSIGHT_EDITED`
- `PROMPT_SAVED`, `PROMPT_ROLLED_BACK`
- `USER_TIER_CHANGED`, `USER_CHART_INVALIDATED`, `USER_DELETED`
- `CONSULTATION_STATUS_CHANGED`, `CONSULTATION_NOTES_ADDED`
- `CONFIG_CHANGED`, `FEATURE_FLAG_TOGGLED`
- `CRON_MANUALLY_TRIGGERED`

---

## DATABASE ADDITIONS (New Prisma Models)

```
PromptTemplate
  id               String   @id @default(cuid())
  promptKey        String   @unique  -- e.g. "daily.generator"
  feature          PromptFeature  -- enum
  hdType           HDType?  -- null = not HD-type-specific
  systemPrompt     String   @db.Text
  userPromptTemplate String  @db.Text
  bannedPhrases    String   @db.Text  -- comma-separated
  maxTokens        Int      @default(800)
  temperature      Float    @default(0.8)
  version          Int      @default(1)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  updatedBy        String   -- admin email
  history          PromptTemplateVersion[]

PromptTemplateVersion
  id               String   @id @default(cuid())
  promptTemplateId String
  promptTemplate   PromptTemplate @relation(...)
  systemPrompt     String   @db.Text
  userPromptTemplate String  @db.Text
  version          Int
  savedAt          DateTime @default(now())
  savedBy          String

AuditLog
  id               String   @id @default(cuid())
  timestamp        DateTime @default(now())
  adminEmail       String
  actionType       AuditActionType
  targetId         String?  -- userId, insightId, promptKey, etc.
  targetType       String?  -- "User", "Insight", "PromptTemplate", etc.
  before           Json?
  after            Json?
  notes            String?

FeatureFlag
  key              String   @id
  value            Boolean  @default(true)
  updatedAt        DateTime @updatedAt
  updatedBy        String

SystemConfig
  key              String   @id
  value            String
  updatedAt        DateTime @updatedAt
  updatedBy        String

enum PromptFeature {
  DAILY_INSIGHT
  WEEKLY_FORECAST
  MONTHLY_REPORT
  HD_TIP
  ONBOARDING_REPORT
  WELCOME_EMAIL
  PRESESSION_EMAIL
  TRANSIT_ALERT_EMAIL
}

enum AuditActionType {
  INSIGHT_APPROVED
  INSIGHT_REJECTED
  INSIGHT_EDITED
  PROMPT_SAVED
  PROMPT_ROLLED_BACK
  USER_TIER_CHANGED
  USER_CHART_INVALIDATED
  USER_DELETED
  CONSULTATION_STATUS_CHANGED
  CONSULTATION_NOTES_ADDED
  CONFIG_CHANGED
  FEATURE_FLAG_TOGGLED
  CRON_MANUALLY_TRIGGERED
}
```

---

## AUTH REQUIREMENT

Admin routes are protected by a role check. Add `role` field to User model:

```
User
  role  UserRole @default(USER)

enum UserRole {
  USER
  ADMIN
}
```

All `/app/(admin)/**` routes and `/app/api/admin/**` routes must call
`requireRole(session, 'ADMIN')` — throws 403 if user is not admin.

Set admin role manually in DB for the first admin (Milosh). No self-service
admin escalation.

---

## DESIGN REQUIREMENTS

Follow the existing `FRONTEND.md` design system exactly:
- Dark-only, cosmic-luxury glassmorphism aesthetic
- Color tokens: cosmos `#0d1220`, amber `#c8873a`, gold `#e8b96a`,
  star `#f0dca0`, earth `#2e1f0f`, sky `#1c2340`
- Typography: Cormorant Garamond (headings), DM Mono (data/code),
  Instrument Sans (body)
- Admin sidebar is separate from the user dashboard sidebar
- Admin palette should feel "operational" within the cosmic system:
  use the existing tokens but lean on amber/gold for action buttons,
  star for active states, muted cosmos backgrounds for data tables
- Status indicators: green glow = approved/active, amber = pending,
  red glow = error/rejected (subtle, not jarring)

---

## FILE STRUCTURE

```
app/
  (admin)/
    layout.tsx              -- admin shell: requireRole check + sidebar
    page.tsx                -- redirect to /admin/review
    review/
      page.tsx              -- Module A: content review queue
    prompts/
      page.tsx              -- Module B: prompt list
      [promptKey]/
        page.tsx            -- Module B: prompt editor
    users/
      page.tsx              -- Module C: user list
      [userId]/
        page.tsx            -- Module C: user detail
    insights/
      page.tsx              -- Module D: quality dashboard
    consultations/
      page.tsx              -- Module E: consultation manager
    cron/
      page.tsx              -- Module F: cron monitor
    config/
      page.tsx              -- Module G: system config + feature flags
    audit/
      page.tsx              -- Module H: audit log

app/api/
  admin/
    review/
      pending/route.ts      -- GET pending reviews
      [insightId]/route.ts  -- POST approve/reject/edit
    prompts/
      route.ts              -- GET list, POST create
      [promptKey]/route.ts  -- GET, PUT, DELETE
      [promptKey]/test/route.ts -- POST: run test against Claude
      [promptKey]/history/route.ts -- GET version history
      [promptKey]/rollback/route.ts -- POST rollback to version
    users/
      route.ts              -- GET paginated list
      [userId]/route.ts     -- GET detail
      [userId]/tier/route.ts -- POST change tier
      [userId]/invalidate-cache/route.ts -- POST
      [userId]/trigger-insight/route.ts  -- POST
    insights/
      metrics/route.ts      -- GET quality metrics
    consultations/
      route.ts              -- GET list
      [consultationId]/route.ts -- GET, PATCH status, POST notes
    cron/
      status/route.ts       -- GET recent run logs
      [jobName]/trigger/route.ts -- POST manual trigger
    config/
      route.ts              -- GET all, PATCH key
    flags/
      route.ts              -- GET all, PATCH key
    audit/
      route.ts              -- GET paginated log

lib/
  admin/
    requireAdmin.ts         -- requireRole helper
    auditLogger.ts          -- writeAuditLog(action, target, before, after)
    promptService.ts        -- getPrompt(key), savePrompt(key, data)
    metricsService.ts       -- getInsightMetrics(days)
```

---

## AGENT TASK INSTRUCTIONS (Copilot-Ready)

Each task below is scoped for a single Copilot session. Dispatch one at a time.

---

### Task A.1 — DB additions for admin

Reference: `crossroads-compass.instructions.md` for DB patterns.

Add to `prisma/schema.prisma`:
- `PromptTemplate` model (fields above)
- `PromptTemplateVersion` model
- `AuditLog` model
- `FeatureFlag` model
- `SystemConfig` model
- `PromptFeature` enum
- `AuditActionType` enum
- Add `role UserRole @default(USER)` to `User` model
- Add `UserRole` enum with values `USER` and `ADMIN`

Run `npx prisma generate` and `npx prisma migrate dev --name admin-schema`.

Done when: migration succeeds, `npx prisma studio` shows all new tables.

Scope: schema + migration only. Do NOT create routes or components.

---

### Task A.2 — Admin auth guard

Create `/lib/admin/requireAdmin.ts`.

Export:
```typescript
export async function requireAdminSession(): Promise<Session>
// calls getRequiredSession(), then checks session.user.role === 'ADMIN'
// throws redirect to /dashboard with error param if not admin
// never returns for non-admin users

export async function requireAdminApi(req: Request): Promise<Session>
// same check for API routes
// throws NextResponse with status 403 if not admin
```

Create `/app/(admin)/layout.tsx`:
- Calls `requireAdminSession()` (server component)
- Renders a sidebar with links to all 8 admin modules
- Sidebar shows logged-in admin email + "Admin" badge
- Completely separate from the user dashboard layout

Done when: navigating to `/admin` redirects a regular user to `/dashboard`,
and renders the admin shell for an admin user.

Scope: auth guard + layout shell only. No module pages yet.

---

### Task A.3 — Audit logger

Create `/lib/admin/auditLogger.ts`.

Export:
```typescript
export async function writeAuditLog(params: {
  adminEmail: string
  actionType: AuditActionType
  targetId?: string
  targetType?: string
  before?: unknown
  after?: unknown
  notes?: string
}): Promise<void>
```

- Writes to the `AuditLog` table via Prisma
- Never throws to caller — log failures silently server-side
- Call this from every admin API route that mutates data

Done when: function compiles and writes a test entry to the DB.

---

### Task A.4 — Prompt service

Create `/lib/admin/promptService.ts`.

Export:
```typescript
export async function getPrompt(promptKey: string): Promise<PromptTemplate | null>
export async function getAllPrompts(): Promise<PromptTemplate[]>
export async function savePrompt(
  promptKey: string,
  data: PromptUpdateInput,
  adminEmail: string
): Promise<PromptTemplate>
// savePrompt: upsert the template, increment version, write a
// PromptTemplateVersion record for history, call writeAuditLog

export async function getPromptHistory(promptKey: string): Promise<PromptTemplateVersion[]>

export async function rollbackPrompt(
  promptKey: string,
  version: number,
  adminEmail: string
): Promise<PromptTemplate>
// copies the versioned fields back to the active template
// writes a new version record + audit log entry
```

Done when: all functions compile. Do not call from routes yet.

---

### Task A.5 — Update promptBuilder to use DB

Update `/lib/content/promptBuilder.ts` (created in Task 9.1).

Change all four `build*Prompt` functions to:
1. Call `getPrompt(promptKey)` where promptKey follows the convention
   `daily.generator`, `daily.projector`, etc. (HD-type-specific)
   or `monthly.base`, `weekly.base` (non-type-specific)
2. If prompt found in DB: interpolate variables into `userPromptTemplate`
   using a simple `{{variable}}` → value replacement
3. If not found in DB: fall back to the hardcoded string (keep existing code
   as fallback, add a console.warn)

Export a `PROMPT_VARIABLE_MAP` constant showing which variables each
prompt type receives, for use in the admin preview panel.

Done when: `buildDailyInsightPrompt` reads from DB if a record exists.

---

### Task A.6 — Content review API routes

Create `/app/api/admin/review/pending/route.ts` (GET):
- Requires admin session
- Returns Insights where ContentReview.approved = false and
  ContentReview exists, ordered by generatedAt ASC
- Include: insight id, type, content, generatedAt, user email (partial),
  user HD type
- Max 50 per request (add pagination cursor param)

Create `/app/api/admin/review/[insightId]/route.ts` (POST):
- Body: `{ action: 'approve' | 'reject' | 'edit_approve', editedContent?: string }`
- For approve: set ContentReview.approved = true, set ContentReview.reviewedAt,
  set ContentReview.reviewedBy from session, set Insight.deliveredAt = now()
- For edit_approve: update Insight.content with editedContent, then approve
- For reject: set new status field `rejected` (add to schema if needed) —
  log but do not delete
- Write audit log for every action
- Return updated insight

Done when: both routes work end-to-end against the DB.

---

### Task A.7 — Content review UI

Create `/app/(admin)/review/page.tsx`.

Server component that fetches pending reviews via the API.

Render a list where each item shows:
- User identifier (partial email), HD type badge, insight type badge, date
- Full insight text in an editable textarea (client component)
- Three buttons: "Approve", "Edit + Approve", "Reject"
- Pending count in page header: "14 insights pending review"

Client interaction:
- Clicking "Approve" POSTs to the review API and removes the item from the list
- Clicking "Edit + Approve" makes the textarea editable; on second click POSTs
  the edited content and removes the item
- Show optimistic UI: immediately remove the item, re-fetch if error

Use the cosmic-luxury design system from FRONTEND.md.
Amber glow on approve button. Red tint on reject button.
Use DM Mono for the insight content textarea.

Done when: the review queue renders and approve/reject works.

---

### Task A.8 — Prompt editor: list view

Create `/app/(admin)/prompts/page.tsx`.

Display all prompt templates grouped by PromptFeature (Daily Insight,
Weekly Forecast, Monthly Report, HD Tip, Onboarding Report, Emails).

For each prompt: name, HD type (if applicable), last updated, version
number, active toggle.

"Edit" button → `/admin/prompts/[promptKey]`.

If no DB records exist yet, show a "Seed default prompts" button that
calls a seed endpoint (create `/app/api/admin/prompts/seed/route.ts` that
writes the existing hardcoded prompts from promptBuilder.ts into the DB
as version 1 records).

Done when: list renders with real DB data and the seed function populates
templates from existing code.

---

### Task A.9 — Prompt editor: edit view

Create `/app/(admin)/prompts/[promptKey]/page.tsx`.

Two-panel layout:
- Left panel: form with systemPrompt (large textarea), userPromptTemplate
  (large textarea with monospace font), bannedPhrases (text input),
  maxTokens (number input), temperature (range slider 0.0–1.0 with
  decimal display), isActive (toggle). Save button.
- Right panel: "Variable preview" showing the prompt rendered with sample
  values from `PROMPT_VARIABLE_MAP`. Updates live as user types.

Below the editor: version history table (version number, saved at,
saved by) with "Rollback" button on each row.

"Run test" button: calls `/api/admin/prompts/[promptKey]/test` (POST),
renders the raw Claude output in a modal.

All saves call `savePrompt` via the API route. Show success/error toast.
Banned phrase validation runs client-side on save attempt.

Done when: a prompt can be edited, saved, previewed, tested, and rolled back.

---

### Task A.10 — User manager

Create `/app/(admin)/users/page.tsx`:
- Server-rendered paginated table with search
- Columns: email (truncated), tier badge, status, joined, chart status,
  last insight date

Create `/app/(admin)/users/[userId]/page.tsx`:
- User detail with all sections described in Module C
- Action buttons: Change Tier, Invalidate Cache, Trigger Insight, Export Data,
  Delete User
- Each action calls the corresponding admin API route
- Delete User: shows a confirmation modal requiring email re-entry

Create supporting API routes in `/app/api/admin/users/`.

Done when: user list loads, detail page shows correct data, tier change
and cache invalidation work.

---

### Task A.11 — Insight quality dashboard

Create `/app/(admin)/insights/page.tsx`.

Fetch metrics from `/api/admin/insights/metrics`.

Display:
- 4 metric cards: total generated, approval rate, avg accuracy, avg queue time
- Toggle: last 7 days / 30 days
- Bar chart showing accuracy by HD type (use a simple CSS-based bar chart,
  no charting library needed)
- Low-rated insights table (accuracy ≤ 2): content preview, prompt version,
  link to prompt editor
- Warning banner if any type's 7-day accuracy average drops below 60%

Create `/app/api/admin/insights/metrics/route.ts` that aggregates from
the Insight and ContentReview tables.

Done when: metrics page loads with real aggregated data.

---

### Task A.12 — Cron monitor + system config

Create `/app/(admin)/cron/page.tsx`:
- Table of recent job runs with status, duration, users processed, errors
- "Run now" button with confirmation modal
- Error log expandable per run

Create `/app/(admin)/config/page.tsx`:
- Feature flags: toggle list, each saves via PATCH to `/api/admin/flags/[key]`
- System config: key-value form fields, saves via PATCH to `/api/admin/config/[key]`
- All changes show in an audit preview before saving

Done when: feature flags can be toggled and system config values saved.

---

### Task A.13 — Audit log page

Create `/app/(admin)/audit/page.tsx`:
- Paginated table: timestamp, admin, action type, target, before/after diff
- Filter bar: admin email, action type, date range
- Before/after values shown as collapsible JSON diff
- Read-only — no edit or delete UI

Done when: audit entries are visible and filterable.

---

## OPEN DECISIONS (Admin Panel)

1. Should the prompt "Run test" use real user chart data or only sample data?
   Risk: using real data in admin test calls could create audit noise.
   Recommendation: sample data only for now.

2. Should rejected insights auto-trigger regeneration, or queue for manual
   re-trigger? Recommendation: manual trigger in Phase 1 (lower complexity,
   you stay in control).

3. Should the admin panel be at `/admin` (same Next.js app) or a separate
   deployment? Recommendation: same app, separate route group, simpler auth.
   Revisit if you add other admins who shouldn't see user data.

---

*Crossroads Compass ADMIN_PANEL.md v1.0 | March 2026 | Milosh*

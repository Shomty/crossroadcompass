# Task: Admin — Custom Report Builder

**Product:** Crossroads Compass
**Location in codebase:** `app/(admin)/reports/`
**Depends on:** Prisma schema (User, BirthProfile, Insight, Consultation), auth helpers, FRONTEND.md design tokens
**Priority:** P1 admin tooling

---

## Objective

Build an admin-only interface that lets the consultant (Milosh) compose and generate custom reports for any user by selecting which data variables to include. The report is assembled server-side, rendered as a structured preview in the admin UI, and optionally sent to the user via email or exported as PDF.

This is NOT a user-facing feature. It sits behind admin auth only.

---

## Files to Create

```
app/(admin)/reports/page.tsx              — Report builder UI (server component shell)
app/(admin)/reports/ReportBuilder.tsx     — Client component: variable selector + preview
app/api/admin/reports/generate/route.ts  — POST: assemble report from selected variables
app/api/admin/reports/send/route.ts      — POST: deliver report to user via email
lib/content/customReportAssembler.ts     — Core logic: fetch and assemble selected variables
lib/content/customReportPrompts.ts       — Prompt builders for each variable section
types/index.ts                           — Add ReportVariable, CustomReportConfig types
```

---

## Step 1 — Add Types to `types/index.ts`

Append these types. Do NOT modify existing types.

```typescript
// Custom Report Builder — Admin

export type ReportVariable =
  | 'hd_type_strategy'
  | 'hd_authority'
  | 'hd_profile'
  | 'hd_defined_centers'
  | 'hd_incarnation_cross'
  | 'vedic_natal_overview'
  | 'current_dasha'
  | 'dasha_guidance'
  | 'active_transits'
  | 'sade_sati_status'
  | 'career_purpose_theme'
  | 'relationship_theme'
  | 'shadow_growth_theme'
  | 'monthly_focus'
  | 'custom_note'    // freeform text the consultant writes manually

export interface CustomReportConfig {
  userId: string
  title: string
  variables: ReportVariable[]
  customNote?: string        // only used when 'custom_note' is in variables
  deliveryMode: 'preview' | 'email' | 'pdf'
}

export interface ReportSection {
  variable: ReportVariable
  label: string
  content: string           // AI-generated or resolved text for this section
}

export interface CustomReportOutput {
  config: CustomReportConfig
  sections: ReportSection[]
  generatedAt: Date
  userEmail: string
}
```

---

## Step 2 — Variable Metadata Map

Create a constant map in `lib/content/customReportAssembler.ts`. This is used to render labels in the UI and to route each variable to the correct data source.

```typescript
export const REPORT_VARIABLE_META: Record<ReportVariable, {
  label: string
  description: string
  dataSource: 'hd_chart' | 'vedic_chart' | 'dashas' | 'transits' | 'db' | 'consultant'
}> = {
  hd_type_strategy: {
    label: 'HD Type & Strategy',
    description: 'Type name, strategy, and plain-language explanation',
    dataSource: 'hd_chart',
  },
  hd_authority: {
    label: 'HD Authority',
    description: 'Authority type and decision-making guidance',
    dataSource: 'hd_chart',
  },
  hd_profile: {
    label: 'HD Profile',
    description: 'Profile lines and archetypal role',
    dataSource: 'hd_chart',
  },
  hd_defined_centers: {
    label: 'Defined & Undefined Centers',
    description: 'Which centers are defined vs open and what that means',
    dataSource: 'hd_chart',
  },
  hd_incarnation_cross: {
    label: 'Incarnation Cross',
    description: 'Cross name and life purpose theme',
    dataSource: 'hd_chart',
  },
  vedic_natal_overview: {
    label: 'Vedic Natal Overview',
    description: 'Lagna, Sun, Moon placements and key yogas',
    dataSource: 'vedic_chart',
  },
  current_dasha: {
    label: 'Current Dasha Period',
    description: 'Active Mahadasha/Antardasha with dates and duration',
    dataSource: 'dashas',
  },
  dasha_guidance: {
    label: 'Dasha Guidance',
    description: 'AI-generated practical guidance for the current dasha period',
    dataSource: 'dashas',
  },
  active_transits: {
    label: 'Active Transits',
    description: 'Significant current transits affecting this chart',
    dataSource: 'transits',
  },
  sade_sati_status: {
    label: 'Sade Sati Status',
    description: 'Whether the user is in Sade Sati and which phase',
    dataSource: 'vedic_chart',
  },
  career_purpose_theme: {
    label: 'Career & Purpose Theme',
    description: '10th house + HD Profile synthesis for career direction',
    dataSource: 'vedic_chart',
  },
  relationship_theme: {
    label: 'Relationship Theme',
    description: '7th house + HD emotional authority for relationship patterns',
    dataSource: 'vedic_chart',
  },
  shadow_growth_theme: {
    label: 'Shadow & Growth Edge',
    description: '12th house + undefined centers for shadow work framing',
    dataSource: 'hd_chart',
  },
  monthly_focus: {
    label: 'Monthly Focus',
    description: 'Current month theme based on active dasha and transits',
    dataSource: 'transits',
  },
  custom_note: {
    label: 'Consultant Note',
    description: 'Freeform observation written directly by the consultant',
    dataSource: 'consultant',
  },
}
```

---

## Step 3 — Core Assembler Logic (`lib/content/customReportAssembler.ts`)

Implement the main assembly function:

```typescript
export async function assembleCustomReport(
  config: CustomReportConfig
): Promise<CustomReportOutput>
```

Logic per variable:

- `hd_*` variables: read from KV `chart:hd:{userId}`. If cache miss, return a section with `content: 'HD chart data not yet available.'` — do NOT recalculate.
- `vedic_*` and `sade_sati_status`: read from KV `chart:vedic:{userId}`. Same fallback pattern.
- `current_dasha`: read from KV `chart:dashas:{userId}`.
- `dasha_guidance`, `career_purpose_theme`, `relationship_theme`, `shadow_growth_theme`, `monthly_focus`: these require AI generation. Call `buildCustomSectionPrompt(variable, chartData)` from `lib/content/customReportPrompts.ts`, then call Claude API (`claude-sonnet-4-6`). Max 300 words per section. Apply all content rules (no prediction language, warm + practical tone).
- `active_transits`: read from KV transit cache for today's date. Same fallback if missing.
- `custom_note`: use `config.customNote` directly as the section content. No AI involved.

Fetch user email from DB (Prisma) for the output metadata.

Handle errors per section in isolation — if one section fails, include it with `content: 'Could not generate this section. Please try again.'` and continue assembling the rest. Do not throw and abort the entire report.

---

## Step 4 — Prompt Builders (`lib/content/customReportPrompts.ts`)

Implement:

```typescript
export function buildCustomSectionPrompt(
  variable: ReportVariable,
  chartData: { hd: HDChartData | null; vedic: VedicChartData | null; dashas: unknown }
): string
```

Each prompt must:
- Begin with the global content rules as a system instruction block (banned phrases: `['you will', 'this will cause', 'this means you will']`)
- Be specific to the variable — not a generic astrology prompt
- Constrain output to 200-300 words
- End with: `Return plain text only. No markdown. No bullet points.`

Write one branch per AI-generated variable (`dasha_guidance`, `career_purpose_theme`, `relationship_theme`, `shadow_growth_theme`, `monthly_focus`). Use a `switch` statement.

---

## Step 5 — API Route: Generate (`app/api/admin/reports/generate/route.ts`)

POST handler:

1. Require admin session (use `requireTier` or a dedicated admin role check — use whatever pattern the existing admin review routes use)
2. Validate body with Zod:
   ```typescript
   z.object({
     userId: z.string().cuid(),
     title: z.string().min(1).max(120),
     variables: z.array(z.enum([...ReportVariable values...])).min(1).max(12),
     customNote: z.string().max(1000).optional(),
     deliveryMode: z.enum(['preview', 'email', 'pdf']),
   })
   ```
3. Call `assembleCustomReport(config)`
4. Return `{ report: CustomReportOutput }`

Timeout guard: if assembly takes longer than 25 seconds, return 504 with `{ error: 'Report generation timed out', code: 'TIMEOUT' }`.

---

## Step 6 — API Route: Send (`app/api/admin/reports/send/route.ts`)

POST handler:

1. Require admin session
2. Body: `{ report: CustomReportOutput }` (the already-assembled report passed back from the client after preview)
3. Send email to `report.userEmail` using the existing `sendEmail` helper from `lib/email/client.ts`
4. Email subject: `report.config.title`
5. Email body: render each section as `<h2>{section.label}</h2><p>{section.content}</p>` in sequence, using React Email components. Follow the same template structure as the existing email templates.
6. Return `{ delivered: true }`

PDF delivery mode: add `// TODO(P2): PDF generation for custom reports — see Task 6.2` and return `{ error: 'PDF export not yet available', code: 'NOT_IMPLEMENTED' }` with 501 status.

---

## Step 7 — Admin UI (`app/(admin)/reports/ReportBuilder.tsx`)

This is a client component (`'use client'`). Apply the cosmic-luxury design system tokens from `FRONTEND.md` (`--cosmos`, `--glass-bg`, `--glass-border`, `--gold`, `--amber`, `--star`).

UI sections:

**User selector**
- Text input: search by email or user ID
- On submit: fetch user display name and subscription tier from `/api/admin/reports/generate` (or a separate `/api/admin/users/search` endpoint if it exists — check first, add a `// DECISION NEEDED` comment if it does not)
- Show selected user's email and tier as a pill badge

**Variable selector**
- Render all 15 variables from `REPORT_VARIABLE_META` as a grid of toggle cards
- Each card shows: label, description, data source badge
- Selected variables are highlighted with `--gold` border
- Variables with `dataSource: 'consultant'` (custom_note) reveal a textarea when toggled on
- Order matters: selected variables render in the order they were toggled on. Show a numbered badge on each selected card indicating its position in the report.

**Report title input**
- Single text input, required

**Delivery mode selector**
- Three options: Preview, Email, PDF (PDF shows a "coming soon" badge and is disabled)

**Generate button**
- Disabled until: user selected + at least 1 variable selected + title filled
- On click: POST to `/api/admin/reports/generate`, show loading state per section as they stream in (or show a single loading spinner if not streaming)

**Preview panel**
- Renders below (or beside on wide screens) after generation
- Shows each `ReportSection` as a card: section label as heading, generated content as body text
- Sections with errors show a muted error state with a retry option for that section only (re-POST with just that variable)
- "Send to user" button at the bottom — only visible when `deliveryMode === 'email'` and all sections loaded

**State management:** use `useState` for all local state. No external state library. Keep it simple.

---

## Step 8 — Page Shell (`app/(admin)/reports/page.tsx`)

Server component. Check admin session server-side — redirect to `/login` if not authenticated.

```typescript
import { getRequiredSession } from '@/lib/auth/helpers'
import { ReportBuilder } from './ReportBuilder'

export default async function AdminReportsPage() {
  await getRequiredSession() // redirects if unauthenticated
  return (
    <div>
      <h1>Custom Report Builder</h1>
      <ReportBuilder />
    </div>
  )
}
```

Add a link to this page in whatever admin nav exists. If no admin nav exists yet, add a `// TODO: add to admin nav` comment.

---

## Do NOT

- Build a report template save/load system — that is out of scope for this task
- Add user-facing access to custom reports — admin only
- Implement PDF export — mark as TODO
- Add scheduling or automation — reports here are always on-demand
- Modify any existing Prisma schema — no new DB tables needed for this task
- Refactor existing admin routes from Task 9.2

---

## Done When

- POST to `/api/admin/reports/generate` with a valid config returns a `CustomReportOutput` with populated sections
- UI renders the variable selector, generates a report on submit, and displays the preview
- "Send to user" triggers email delivery and returns success
- All files have `// STATUS: done | Task admin-report-builder` at the top
- `npm run build` passes with no TypeScript errors

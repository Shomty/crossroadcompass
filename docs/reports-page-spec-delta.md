# Reports Page Spec Delta (Task R.1–R.13)

This document maps `instructions/task-reports-page.md` to the current repo architecture and flags what’s missing/partial.

## Legend

- `Present`: matches the spec already exists in the repo
- `Partial`: exists but likely does not match the spec contract fully
- `Missing`: not found in the repo (by search)

## Checklist

### R.1 Database schema (Prisma models)
- Expected: `ReportProduct`, `ReportPurchase`, `GeneratedReport` + `User.reportPurchases`
- Repo status: `Missing`
- Notes: `prisma/schema.prisma` currently contains `User`, `BirthProfile`, `Transit`, `Dasha`, `Insight`, and `ConsultationBooking`, but no report marketplace models.

### R.2 Types
- Expected: `ReportCategory`, `ReportPurchaseStatus`, and report-related interfaces in `types/index.ts`
- Repo status: `Missing`
- Notes: `types/index.ts` exists but no report marketplace unions/interfaces were found.

### R.3 Environment variables
- Expected: `GEMINI_API_KEY`, `GEMINI_MODEL`, `ADMIN_EMAIL` added to `.env.example`/`.env.local` and parsed in `lib/env.ts` (Zod)
- Repo status: `Partial`
- Notes: env validation exists in `lib/env.ts` but the required Gemini/report keys are not confirmed present yet.

### R.4 Gemini client
- Expected: `lib/gemini/client.ts` with `generateReportWithGemini` using `@google/generative-ai`
- Repo status: `Missing`
- Notes: Gemini usage exists for other AI services, but no dedicated report Gemini client file is present.

### R.5 Context builder
- Expected: `lib/reports/contextBuilder.ts` builds structured context from DB + KV
- Repo status: `Missing`
- Notes: repo has chart services and AI services; specific `lib/reports/contextBuilder.ts` file does not exist yet.

### R.6 Prompt interpolation
- Expected: `lib/reports/promptInterpolator.ts` interpolates `{{...}}` placeholders
- Repo status: `Missing`

### R.7 Report generation service
- Expected: `lib/reports/reportGenerationService.ts` orchestrates purchase->generate->persist->status updates
- Repo status: `Missing`

### R.8 API Routes (marketplace + reader + admin trigger + purchase stub)
- Expected:
  - `app/api/reports/route.ts` (GET list)
  - `app/api/reports/[purchaseId]/route.ts` (GET read)
  - `app/api/reports/generate/route.ts` (POST admin-only trigger)
  - `app/api/reports/purchase/route.ts` (POST stub)
- Repo status: `Missing`
- Notes: there is an existing single-report API under `app/api/report/*`, but not a `/api/reports/*` marketplace.

### R.9 `/reports` marketplace page
- Expected: authenticated page at `/reports` with category pills + marketplace grid
- Repo status: `Missing`
- Notes: there is no `app/**/reports/**/page.tsx` in the repo.

### R.10 `/reports/[purchaseId]` reader page
- Expected: authenticated reader renders markdown via `react-markdown`
- Repo status: `Missing`
- Notes: `react-markdown` is not present in `package.json`.

### R.11 Navigation rename (My Cart -> My Reports)
- Expected: sidebar entry updated to label “My Reports” and point to `/reports`
- Repo status: `Partial`
- Notes: `components/app/SidebarNav.tsx` currently points to `/report` as “My Chart”; it must be updated to `/reports`.

### R.12 Seed script
- Expected: `scripts/seed-test-report.ts` to create a test `ReportProduct`
- Repo status: `Missing`

### R.13 Manual end-to-end test
- Expected: 10-step flow using admin + test user
- Repo status: `Missing`

## UI/UX guideline alignment notes (v4 Digital Grimoire)
- `PageLayout`: `components/layout/PageLayout.tsx` exists and should wrap authenticated reports pages.
- `V4GlassCard`: `components/v4/V4GlassCard.tsx` exists and should be used for card surfaces.
- Spec references `FRONTEND.md`, but this repo’s canonical sources are `STYLE_GUIDE.md` and the operative token layer in `app/globals.css`.

## Decision gates in the spec that must be resolved
- Purchase flow: Stripe checkout session vs admin marking (spec R.8d)
- Reader PDF export CTA: whether to implement now (spec R.10)
- Context builder HD field names: confirm against `openhumandesign-library` output (spec R.5)


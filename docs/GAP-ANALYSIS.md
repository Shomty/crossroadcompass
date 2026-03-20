# Crossroads Compass — Gap Analysis & Development Plan

**Date:** 2026-03-17
**Scope:** Comparison of incoming task instructions (ZIP) vs current codebase state
**Goal:** Structured, token-efficient development plan for remaining features

---

## 1. Codebase Reality Check — What Is Already Built

The project is significantly further along than the task index (which marks everything as unchecked). The following phases are **fully or partially complete**:

| Phase | Task | Status | Evidence |
|-------|------|--------|----------|
| 0 | Scaffold + folder structure | ✅ Done | Project exists, Next.js 16.1.6 running |
| 0 | Dependencies installed | ✅ Done | `package.json` has all deps |
| 0 | Env validation | ✅ Done | `lib/env.ts` with Zod |
| 1 | Core TypeScript types | ✅ Done | `types/index.ts` — `// STATUS: done | Task 1.1` |
| 1 | Prisma schema | ✅ Done | `prisma/schema.prisma` — full schema with all models |
| 1 | Migration run | ✅ Done | DB is live (SQLite) |
| 1 | KV client + key schema | ✅ Done | `lib/kv/` — `// STATUS: done | Task 2.2` |
| 2 | Vedic API client | ✅ Done | `lib/astro/vedicApiClient.ts` — advanced, with real endpoint `/birth-charts` |
| 2 | HD calculator wrapper | ✅ Done | `lib/astro/hdCalculator.ts` |
| 2 | Chart service (cache) | ✅ Done | `lib/astro/chartService.ts` — `// STATUS: done | Tasks 3.3, 3.4, 3.5` |
| 2 | Transit service | ✅ Done | `lib/astro/transitService.ts` |
| 3 | NextAuth config | ✅ Done | `lib/auth.ts` — magic link + Google OAuth |
| 3 | Auth helpers | ✅ Done | Auth session wired throughout |
| 3 | Stripe checkout + webhooks | ✅ Done | `lib/payments/stripeClient.ts`, `app/api/stripe/` |
| 7 | Prompt builder (partial) | ✅ Done | `lib/ai/` — multiple AI services |
| 7 | Insight cron job | ✅ Done | `app/api/cron/daily-insights/` |
| 8 | Email client + templates | ✅ Done | `lib/email/` with Resend + React Email |
| 8 | Welcome sequence | ✅ Done | `lib/email/sequences/welcomeSequence.ts` |

**Summary:** Phases 0–3 are essentially complete. Phase 7 and 8 are partially complete. The critical missing piece is **Phase 4 (Glimpse System)**, and the entire dashboard UI layer (Phases 5–6).

---

## 2. Actual Conflicts — Must Resolve Before Proceeding

These are real incompatibilities between the new instructions and the existing codebase. Each one requires a decision.

> **Clarification:** The new `CLAUDE.md` from the ZIP is Claude Code context (instructions for the dev tool). Gemini API for in-app content generation is an **intentional choice** and is not a conflict. The `lib/ai/*.ts` files stay as-is.

---

### CONFLICT 1 — Subscription Tier Names

**RESOLVED.** Tier names stay as `FREE / CORE / VIP` in all code, schema, and types. SEEKER/NAVIGATOR are marketing display names only and do not appear in code.

---

### CONFLICT 2 — Database: SQLite vs PostgreSQL

**RESOLVED.** Existing SQLite schema and live data stay intact. No migration planned at this time. PostgreSQL migration is deferred to a future production-readiness sprint.

---

### CONFLICT 3 — RTK Instructions Preservation

**RESOLVED.** New project instructions appended to `.claude/CLAUDE.md` after the RTK block. RTK stays at the top. Project context follows. The file is now the single source of truth for Claude Code sessions.

---

### CONFLICT 5 — App Router Folder Structure Divergence (MODERATE)

| | Existing Codebase | New Instructions |
|--|---|---|
| **Main app** | `app/(app)/dashboard/` | `app/(dashboard)/` |
| **Auth** | `app/login/`, `app/onboarding/` (top-level) | `app/(auth)/` |
| **Marketing** | `app/page.tsx` (top-level) | `app/(marketing)/` |
| **Admin** | Not yet built | `app/(admin)/` |

**Impact:** The existing routing works and the dashboard pages exist under `(app)`. Renaming the route groups is a pure refactor with no functional change, but it requires updating all `Link` hrefs, layouts, and auth middleware that references these paths.

**Decision required:** Migrate folder structure now or defer?

> **Recommendation:** Defer. The existing `(app)` structure works. When building new feature pages (Phase 6), create them in a new `(dashboard)` route group alongside `(app)` or simply under `(app)`. Address the rename in a dedicated refactor task once the feature set is stable.

---

### CONFLICT 6 — Consultation Tier Naming (LOW)

| | Existing Prisma Schema | New Instructions |
|--|---|---|
| **Enum** | `ConsultationTier { SINGLE_90, VIP_QUARTERLY }` | `ConsultationType { DISCOVERY_60, DEEP_DIVE_90, BLUEPRINT_WALK_60, RELATIONSHIP_75 }` |
| **Pricing** | `$150` (SINGLE_90), `$497/quarter` (VIP_QUARTERLY) | `$150` (DISCOVERY), `$225` (DEEP_DIVE), `$200` (BLUEPRINT), `$250` (RELATIONSHIP) |

**Impact:** The new instructions have a richer consultation product lineup. The existing schema only has 2 tiers vs 4.

> **Recommendation:** Extend the existing schema in a future migration when building Phase 10 (consultation booking). Not blocking.

---

## 3. Gaps — Features Not Yet Built

These are things defined in the instructions that have zero implementation in the codebase.

### Phase 4 — Glimpse System (THE MOST CRITICAL GAP)

The entire conversion engine is missing. Nothing in `components/glimpse/` exists.

Missing files:
- `components/glimpse/GlimpseBlur.tsx` — blur wall component (Pattern 1)
- `components/glimpse/GlimpseGate.tsx` — tier-check wrapper
- `components/glimpse/GlimpseCTA.tsx` — upgrade button (primary/secondary/inline variants)
- `components/glimpse/LockedInsightCard.tsx` — locked insight card (Pattern 2)
- `components/glimpse/TeaserScore.tsx` — score reveal (Pattern 3)
- `components/glimpse/TimelineCliff.tsx` — dasha cliffhanger (Pattern 4)
- `components/glimpse/DateWithoutTime.tsx` — muhurta teaser (Pattern 5)
- `components/glimpse/ShadowHeadline.tsx` — shadow portal hook (Pattern 6)
- `lib/analytics/glimpse.ts` — event tracking
- `app/api/analytics/glimpse/route.ts` — event storage API
- `GlimpseEvent` model in Prisma schema (Phase 4 Task 4 adds this)

**This blocks all monetization.** Without Glimpse, free users see nothing, premium users see everything, and there is no conversion hook.

---

### Phase 5 — Onboarding Flow (Partial)

- `BirthDataForm.tsx` exists at `components/onboarding/BirthDataForm.tsx` ✅
- `app/onboarding/page.tsx` exists ✅
- `app/api/birth-profile/route.ts` exists ✅
- Missing: formal Zod schema in `lib/validation/birthData.ts` (using inline validation currently)
- Missing: `app/api/onboarding/chart/` route (using `/api/birth-profile/` instead)

**Assessment:** Functionally complete enough. Formalize schema in lib/validation when time permits.

---

### Phase 6 — Dashboard & Feature Pages (Mostly Missing)

The dashboard exists (`app/(app)/dashboard/`) but is a generic scaffold. Feature-specific pages are missing:

| Feature | Route | Status |
|---------|-------|--------|
| Daily Alignment card | `app/(app)/dashboard/page.tsx` | Partial (generic card) |
| Life Blueprint | `app/(app)/blueprint/` | ❌ Missing |
| Energy Blueprint / Bodygraph | `app/(app)/energy/` | ❌ Missing |
| Karma Timeline | `app/(app)/timeline/` | ❌ Missing |
| Transit Pulse | `app/(app)/transit/page.tsx` | ✅ Partial exists |
| Dharma Compass | `app/(app)/compass/` | ❌ Missing (prototype in `public/dharma-compass 2/`) |

---

### Phase 9 — Premium Features (Not Built)

None of the premium-only features are built:
- Dharma Compass interactive wheel
- Muhurta Finder
- Cosmic Chemistry compatibility
- Purpose Decoder
- Shadow Work Portal

---

### Phase 11 — Landing Page & GDPR

- Landing page: `app/page.tsx` exists but is minimal — needs full marketing page
- Cookie consent: Missing
- GDPR export/delete: Missing (`lib/gdpr/` folder does not exist)

---

### Phase 12 — PDF Report (Partial)

- `puppeteer` is installed in `package.json` ✅
- `app/api/report/generate/route.ts` exists ✅
- Missing: formal `lib/content/reportAssembler.ts`
- The `V4Report.tsx` component exists as a visual prototype

---

### Missing: `ContentReview` Model in Prisma Schema

The existing Prisma schema has an `Insight` model but no `ContentReview` relation (defined in new instructions). The `reviewedByConsultant` boolean is on `Insight` directly instead. This is a schema difference to address in a migration.

---

### Missing: `vitest` Test Runner

The existing `package.json` does not have `vitest` as a dev dependency, but test files exist (`.test.ts`). RTK references `rtk vitest run`. Install with:
```bash
npm install --save-dev vitest @vitest/ui
```

---

## 4. Recommended Development Plan

This plan is ordered for maximum token efficiency using RTK and minimum context-switching.

### Pre-Work: Resolve Conflicts First

**Do these before any feature work — they affect every task that follows.**

```
PRE-1: Merge new CLAUDE.md into existing .claude/CLAUDE.md
       Keep RTK block at top, append project instructions below
       ~20 minutes

PRE-2: Plan PostgreSQL migration (don't execute yet)
       Document the migration steps, provision Railway DB
       Execute when ready to move to staging
       ~1 hour setup

PRE-3: Install vitest (test files exist but runner is missing)
       npm install --save-dev vitest
       ~5 minutes
```

---

### Phase 4 (Start Here): Build the Glimpse System

This is the highest-priority unbuilt feature. Without it, there is no monetization layer.

Execute tasks in this order (each depends on the previous):

```
4.1 → GlimpseBlur component
4.2 → GlimpseGate + LockedInsightCard
4.3 → GlimpseCTA + TeaserScore + ShadowHeadline
4.4 → Glimpse analytics event system
      (Also: add GlimpseEvent to Prisma schema and run migration)
```

**Token-saving commands for Phase 4 work:**
```bash
rtk tsc              # After each file — TypeScript check only
rtk npm run dev      # Verify app starts
rtk vitest run       # Run component tests if added
rtk git diff         # Review changes before commit
```

---

### Phase 5 / 6: Dashboard Features (After Glimpse)

Build in order of user value, integrating Glimpse into each:

```
5.1 → Formalize lib/validation/birthData.ts (Zod schema)
6.1 → Dashboard layout review (sidebar already exists)
6.2 → Daily Alignment card with Glimpse wired in
6.3 → Transit Pulse with LockedInsightCard pattern
6.4 → Karma Timeline with TimelineCliff pattern
6.5 → Life Blueprint page with GlimpseBlur on chapters 2-6
6.6 → Energy Blueprint / Bodygraph page
```

---

### Phase 9: Premium Features (After MVP is live)

```
9.1 → Dharma Compass (prototype already in public/dharma-compass 2/ — move to components)
9.2 → Muhurta Finder with DateWithoutTime glimpse
9.3 → Cosmic Chemistry with TeaserScore glimpse
9.4 → Purpose Decoder
9.5 → Shadow Work Portal with ShadowHeadline glimpse
```

---

### Phase 11: Landing Page & GDPR

```
11.1 → Landing page (marketing page — current app/page.tsx is placeholder)
11.2 → Cookie consent banner
11.3 → GDPR data export + deletion (lib/gdpr/)
```

---

### Phase 12: PDF Report (Polish)

```
12.1 → lib/content/reportAssembler.ts
12.2 → Polish PDF generation via puppeteer
```

---

## 5. Token Efficiency Guide for Development Sessions

Since the project uses RTK, here are the recommended patterns for each type of task:

### Starting a new task session
```bash
# Minimal context refresh — read task file only, not full codebase
rtk read docs/tasks/phase-XX-task-YY.md

# Quick status check
rtk git status
rtk tsc
```

### After writing new files
```bash
# Type-check only (not full build — saves 87% vs next build)
rtk tsc

# Start dev server to visual-check
rtk npm run dev
```

### Before committing
```bash
rtk git diff          # Review (80% smaller output)
rtk git add app/ components/ lib/   # Specific paths only
rtk git commit -m "feat: phase 4.1 GlimpseBlur component"
```

### Prisma changes
```bash
rtk prisma migrate dev --name <migration-name>   # 88% less output
rtk prisma generate
```

### Running tests
```bash
rtk vitest run        # Failures only (99.5% savings vs verbose)
```

---

## 6. Open Decisions Tracker

These must be decided by Milosh before the blocking tasks can proceed:

```
RESOLVED — AI Provider
Gemini API for in-app content generation. lib/ai/*.ts stays as-is.
Claude Code is the development tool — separate concern.

RESOLVED — Tier Names
FREE / CORE / VIP in all code and schema. SEEKER/NAVIGATOR = marketing labels only.

RESOLVED — Database
SQLite + existing data stays intact. PostgreSQL migration deferred.

RESOLVED — RTK
Project instructions appended to .claude/CLAUDE.md after the RTK block.

DECISION NEEDED — Jyotish API Schema
Question: When to migrate from SQLite to PostgreSQL?
Blocking: Production deployment
Options: (a) Now — provision Railway DB, run migration immediately
         (b) When ready to deploy to staging (recommended)
Status: OPEN

DECISION NEEDED — Phase 2 (from original task index)
Question: Confirm all Jyotish API endpoint paths and request/response schemas
Blocking: Full chart generation, transit fetching
Current state: vedicApiClient.ts uses /birth-charts — needs validation
Status: OPEN

DECISION NEEDED — Phase 2 (from original task index)
Question: Swiss Ephemeris commercial license (AGPL-3.0 vs LGPL-3.0)
Blocking: Production deployment of HD calculations
Status: OPEN

DECISION NEEDED — Phase 10
Question: Calendly URL + consultant profile details
Blocking: Booking page
Status: OPEN
```

---

## 7. Files to Create vs Modify

Quick reference for the first development sprint (Phase 4 + Pre-work):

### New files to create
```
lib/analytics/glimpse.ts
app/api/analytics/glimpse/route.ts
components/glimpse/GlimpseBlur.tsx
components/glimpse/GlimpseGate.tsx
components/glimpse/GlimpseCTA.tsx
components/glimpse/LockedInsightCard.tsx
components/glimpse/TeaserScore.tsx
components/glimpse/TimelineCliff.tsx
components/glimpse/DateWithoutTime.tsx
components/glimpse/ShadowHeadline.tsx
lib/validation/birthData.ts
```

### Files to modify
```
prisma/schema.prisma              → Add GlimpseEvent model
app/globals.css                   → Add glimpse-glow-pulse animation
.claude/CLAUDE.md                 → Merge new project instructions (keep RTK block at top)
```

### Files NOT to modify (already correct)
```
lib/kv/keys.ts                    → KV schema matches instructions
lib/astro/chartService.ts         → Chart caching matches architecture
lib/astro/vedicApiClient.ts       → API client is ahead of task spec
lib/env.ts                        → Env validation is complete
types/index.ts                    → Types match instructions
prisma/schema.prisma              → All core models exist (only GlimpseEvent missing)
```

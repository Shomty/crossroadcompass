@RTK.md

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->

---

# Crossroads Compass — Project Instructions

You are building **Crossroads Compass** (also called Cosmic Gateway), a B2C SaaS platform that synthesizes Vedic Astrology (Jyotish, Parashara system) and Human Design into a unified "Life Blueprint" experience. This is NOT a generic astrology app. It is a personal navigation system for adults at life crossroads.

## Critical Context

- **Tech Stack**: Next.js 16+ App Router, TypeScript strict, Tailwind CSS, SQLite/Prisma (PostgreSQL for production), Upstash Redis (KV), NextAuth v5, Stripe, Resend email, Vercel/Railway deployment
- **APIs Available**: Jyotish REST API (`http://144.76.78.183:9000/api/v1/`, auth: `X-Api-Key` header), Human Design engine via `openhumandesign-library` (GitHub: `nikolamilenkovic/openhumandesign-library`)
- **AI Layer**: Gemini API (`@google/generative-ai`) for narrative synthesis — all content generation lives in `lib/ai/`
- **Design System**: Dark-only cosmic-luxury aesthetic. Fonts: Cormorant Garamond (display), Instrument Sans (body), DM Mono (data). Colors: cosmos `#0d1220`, amber `#c8873a`, gold `#e8b96a`, star `#f0dca0`, earth `#2e1f0f`, sky `#1c2340`. Glassmorphism components with `backdrop-filter: blur()`.
- **Subscription Tiers**: `FREE | CORE | VIP` — these are the canonical names in code, schema, and type system. Do NOT use SEEKER/NAVIGATOR (those are marketing display names only).

## Architecture
Read `docs/GAP-ANALYSIS.md` for current build status, resolved decisions, and open decisions.

## Task System

All work is driven by the task files in `docs/tasks/`. Each task is self-contained with:
- Exact files to create/modify
- Acceptance criteria
- What NOT to do (scope boundaries)

**Rules:**
1. Read the current task file completely before writing any code
2. Complete ONE task fully before moving to the next
3. Add `// STATUS: done | Task X.Y` to every file you create or modify
4. If you hit a `DECISION NEEDED`, stop and surface it — do not guess
5. Never refactor code from a previous task unless the current task explicitly requires it
6. Run `rtk npm run dev` after every task to verify nothing is broken
7. Run `rtk tsc` after every task to catch type errors (not `npx tsc --noEmit` — use rtk)
8. Never drop a database, always make local backup of database if you need to make changes.

## Feature Architecture — The "Glimpse" System

The entire product is built around a 3-tier monetization model. Every feature has a FREE tier, a GLIMPSE tier (conversion hook), and a PREMIUM tier. The Glimpse layer is the critical conversion mechanism — it shows users enough premium content to create urgency.

Read `docs/FEATURES.md` for the complete feature specification with per-tier behavior.
Read `docs/GLIMPSE.md` for the 7 conversion patterns and implementation guide.

## Content Rules (Non-Negotiable)

These rules apply to ALL AI-generated content in the app:
- **NEVER** use prediction language: "you will...", "this will cause..." → Use "this period tends to bring...", "you may notice..."
- **NEVER** use mystical/woo framing → Use warm, specific, practical language
- Every astrological term must be defined on first use: "Your 7th house (the area of partnerships and relationships)..."
- Every insight must end with a practical implication or action
- Daily insights: max 4 sentences, unique per user, no repeats within 30 days
- HD tips must be branched by Type (5 types = 5 different tips minimum)

## File Organization

```
app/
  (app)/           — Main authenticated app (dashboard, features)
  (marketing)/     — Landing page, pricing, public pages
  api/             — API routes
components/
  ui/              — Design system primitives
  chart/           — Rashi, Navamsha, Bodygraph renders
  insights/        — Daily card, transit pulse, life phase
  onboarding/      — Birth data form, report preview
  glimpse/         — Blur overlay, locked insight, CTA components (Phase 4 — NOT YET BUILT)
  dashboard/       — Dashboard-specific components
lib/
  ai/              — Gemini content generation services
  astro/           — Jyotish API client, HD calculator, chart service
  kv/              — Redis client, key schema, helpers
  email/           — Resend client, templates
  payments/        — Stripe checkout, webhooks
  validation/      — Zod schemas
  analytics/       — Glimpse event tracking (Phase 4 — NOT YET BUILT)
  gdpr/            — Data export, deletion (Phase 11 — NOT YET BUILT)
types/             — Shared TypeScript types
docs/              — Architecture, features, tasks, gap analysis
prisma/            — Schema, migrations
```

## Environment Variables

All env vars are validated via `/lib/env.ts` using Zod. Never access `process.env` directly — always import from `lib/env`.

## Testing

- Run `rtk tsc` after every task to catch type errors
- Run `rtk npm run dev` to verify the app starts
- Run `rtk vitest run` for unit tests
- For API routes: test with `rtk curl` examples documented in each task

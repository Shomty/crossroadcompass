# Task: Muhurta Finder™ — Auspicious Timing Engine
# Feature: F.MH (Muhurta Finder)
# Phase: Premium Feature — P1
# Purpose: Find and rank auspicious timing windows for life decisions
#          using Panchanga Shuddhi, Tara Bala, and 8th House Rule scoring.

---

## SYSTEM IDENTITY

You are the Jyotish Gem Developer AI building the Muhurta Finder™ for
Crossroads Compass. Your goal is to translate the following Vedic
principles from the Brihat Parashara Hora Shastra into clean, modular
TypeScript: Panchanga Shuddhi, Tara Bala, and the 8th House occupancy
rule.

Balance technical precision with empathetic, growth-oriented output
language. The user sees a practical recommendation ("Best window:
Tuesday 2:00–4:30 PM"), not raw score data. The score is the engine,
not the UI.

---

## CONTEXT (read before writing any code)

**Product:** Crossroads Compass — a SaaS platform combining Vedic
astrology and Human Design for life navigation.

**Feature position:** Muhurta Finder is a premium-only feature (CORE
and VIP tiers). Free tier users see a locked teaser with dates visible
but times and reasoning blurred.

**What this feature does:** Given a user's birth profile and a target
date range (default: next 7 days), score every available time window
using three Jyotish filters and return ranked results per intention
category (Career, Relationships, Health, Finance, New Project).

**Upstream dependencies:**
- `lib/astro/vedicApiClient.ts` — authenticated Vedic API client
- `lib/astro/chartService.ts` — natal chart retrieval from KV cache
- `lib/kv/helpers.ts` — KV get/set helpers
- `lib/kv/keys.ts` — KV key builders
- `types/index.ts` — shared types including `VedicChartData`, `BirthProfile`
- `lib/auth/helpers.ts` — `getRequiredSession`, `requireTier`

**Stack:** Next.js 14 App Router, TypeScript strict mode, Prisma,
Upstash Redis, Vedic REST API at `env.VEDIC_API_URL`.

---

## ATOMIC TASKS — complete in order, one at a time

---

### Task MH.1 — Muhurta types
**File:** `types/muhurta.ts` (new file)

**Do:**
- Define and export all Muhurta-specific TypeScript types:

```typescript
export type IntentionCategory =
  | 'CAREER'
  | 'RELATIONSHIPS'
  | 'HEALTH'
  | 'FINANCE'
  | 'NEW_PROJECT'

export type PanchangaLimb = 'TITHI' | 'VARA' | 'NAKSHATRA' | 'YOGA' | 'KARANA'

export interface PanchangaData {
  tithi: string          // e.g. "Shukla Navami"
  vara: string           // e.g. "Tuesday"
  nakshatra: string      // e.g. "Rohini"
  yoga: string           // e.g. "Siddhi"
  karana: string         // e.g. "Bava"
}

export interface AshtakavargaData {
  houses: number[]       // array of 12 SAV scores, index 0 = house 1
}

export interface MuhurtaWindowRaw {
  startTime: Date
  endTime: Date
  panchanga: PanchangaData
  proposedLagna: string              // zodiac sign string, e.g. "Aries"
  lagnaHousePlanets: Record<number, string[]>  // house number -> planet names
  ashtakavarga: AshtakavargaData
}

export interface MuhurtaScore {
  panchangaShuddhi: number           // 0–5
  taraBala: number                   // 0 (blocked) or 1 (pass)
  eighthHouseRule: boolean           // true = clean (no planets in 8th)
  total: number                      // composite score 0–6
  auspiciousLimbs: PanchangaLimb[]   // which Panchanga limbs passed
  taraBalaRemainder: number          // raw remainder for audit/debug
}

export interface MuhurtaWindow {
  startTime: Date
  endTime: Date
  score: MuhurtaScore
  intentionCategories: IntentionCategory[]
  reasoning: string                  // AI-generated plain-language explanation
  jyotishReasoning: string           // raw Jyotish logic string for admin/debug
  isBlocked: boolean                 // true if Tara Bala remainder is 3, 5, or 7
}

export interface MuhurtaResult {
  userId: string
  dateRange: { start: Date; end: Date }
  windows: MuhurtaWindow[]           // sorted by score descending
  generatedAt: Date
  cachedUntil: Date
}
```

**Do NOT do:** implement any scoring logic here.

**Done when:** `types/muhurta.ts` compiles with zero TypeScript errors.

---

### Task MH.2 — Panchanga Shuddhi scorer
**File:** `lib/astro/muhurta/panchangaScorer.ts` (new file)

**Do:**
- Implement the Panchanga Shuddhi scoring function.
- A score of +1 is awarded per auspicious limb. Maximum score is 5.
- Define which values are auspicious for each limb using the lookup
  tables below. If a value is not in the auspicious list, it scores 0
  for that limb (neutral, not penalized).

**Auspicious lookup tables to hardcode:**

```typescript
// Auspicious Tithis (lunar days)
const AUSPICIOUS_TITHIS = [
  'Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya',
  'Shukla Panchami', 'Shukla Saptami', 'Shukla Dashami',
  'Shukla Ekadashi', 'Shukla Trayodashi', 'Purnima'
]

// Auspicious Varas (weekdays)
const AUSPICIOUS_VARAS = ['Monday', 'Wednesday', 'Thursday', 'Friday']

// Auspicious Nakshatras
const AUSPICIOUS_NAKSHATRAS = [
  'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
  'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Mula',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Uttara Bhadrapada', 'Revati'
]

// Auspicious Yogas
const AUSPICIOUS_YOGAS = [
  'Vishkambha', 'Siddhi', 'Variyan', 'Dhruva',
  'Harshana', 'Vajra', 'Siddha', 'Shubha', 'Shukla',
  'Brahma', 'Mahendra', 'Vaidhriti'
]

// Auspicious Karanas
const AUSPICIOUS_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija']
```

**Export:**
```typescript
export function scorePanchanga(panchanga: PanchangaData): {
  score: number
  auspiciousLimbs: PanchangaLimb[]
}
```

**Done when:** function returns correct score for a set of three
hand-verified test cases added as inline `// TEST:` comments at the
bottom of the file.

---

### Task MH.3 — Tara Bala calculator
**File:** `lib/astro/muhurta/taraBala.ts` (new file)

**Do:**
- Implement Tara Bala as a two-step function.
- Step 1: Calculate the distance `D` between the user's Janma Nakshatra
  (birth nakshatra, from natal chart) and the current Nakshatra of the
  proposed Muhurta window.
- Step 2: Calculate remainder `R = D mod 9`.
- If `R` is 3, 5, or 7 — the window is blocked (Tara Bala fails).
  Return `{ pass: false, remainder: R }`.
- All other values of R (including 0) — the window passes.
  Return `{ pass: true, remainder: R }`.

**Nakshatra ordering constant to define:**
```typescript
// 27 Nakshatras in order, index 0 = Ashwini
export const NAKSHATRA_ORDER: readonly string[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
  'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
  'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada',
  'Revati'
]
```

**Distance calculation:**
- `D = (indexOf(currentNakshatra) - indexOf(janmaNakshatra) + 27) % 27 + 1`
- Note: D is always 1–27, never 0.

**Export:**
```typescript
export function calculateTaraBala(
  janmaNakshatra: string,
  currentNakshatra: string
): { pass: boolean; remainder: number; distance: number }
```

- Throw a typed `TaraBalaError` if either nakshatra string is not found
  in `NAKSHATRA_ORDER`.

**Done when:** function correctly returns `pass: false` for remainders
3, 5, 7 and `pass: true` for all others. Add inline `// TEST:` comments
with three verified cases.

---

### Task MH.4 — 8th House Rule checker
**File:** `lib/astro/muhurta/eighthHouseRule.ts` (new file)

**Do:**
- Implement the 8th House Rule: reject any Muhurta window where the 8th
  house from the proposed Lagna is occupied by any planet.
- The proposed Lagna is the rising sign at the start of the time window.
- The API provides `lagnaHousePlanets: Record<number, string[]>` where
  keys are house numbers 1–12.

**Export:**
```typescript
export function checkEighthHouseRule(
  lagnaHousePlanets: Record<number, string[]>
): { clean: boolean; occupants: string[] }
```

- `clean: true` if house 8 is empty or key 8 does not exist.
- `clean: false` if house 8 has one or more planets; include their names
  in `occupants` for debug/audit.
- Luminaries (Sun, Moon) count as occupants. Do not create exceptions.

**Done when:** function returns correct result for an empty house 8, a
house 8 with one planet, and a house 8 with two planets.

---

### Task MH.5 — Composite Muhurta scorer
**File:** `lib/astro/muhurta/muhurtaScorer.ts` (new file)

**Do:**
- Import and compose the three scorers from MH.2, MH.3, MH.4.
- Implement the composite scorer:

```typescript
export function scoreMuhurtaWindow(
  window: MuhurtaWindowRaw,
  janmaNakshatra: string
): MuhurtaScore
```

**Scoring logic:**
1. Run `scorePanchanga(window.panchanga)` — get `panchangaShuddhi` (0–5)
   and `auspiciousLimbs`.
2. Run `calculateTaraBala(janmaNakshatra, window.panchanga.nakshatra)` —
   get `pass` and `remainder`.
3. Run `checkEighthHouseRule(window.lagnaHousePlanets)` — get `clean`.
4. Set `isBlocked = !taraBala.pass` — a blocked window gets total = 0
   regardless of other scores.
5. Composite total (if not blocked):
   - Base = `panchangaShuddhi` (0–5)
   - Add +1 if `eighthHouseRule.clean === true`
   - `total` = 0–6
6. If blocked: `total = 0`.

**Return** a fully populated `MuhurtaScore` object.

**Done when:** scorer returns correct totals for at least three test
cases covering: a blocked window, a clean 6/6 window, and a partial
window. Add as inline `// TEST:` comments.

---

### Task MH.6 — Ashtakavarga transit filter
**File:** `lib/astro/muhurta/ashtakavargaFilter.ts` (new file)

**Do:**
- Implement a filter that adjusts a window's recommendation text based
  on the SAV (Samudaya Ashtakavarga) score of the relevant transit house.
- This is applied AFTER scoring. It does not change the numeric score
  but does change the `reasoning` output tier.

**Logic:**
```typescript
export type AshtakavargaTier = 'WEAK' | 'NEUTRAL' | 'AUSPICIOUS'

export function getAshtakavargaTier(
  savScore: number
): AshtakavargaTier {
  if (savScore < 20)  return 'WEAK'
  if (savScore <= 28) return 'NEUTRAL'
  return 'AUSPICIOUS'
}

export function getAshtakavargaForHouse(
  ashtakavarga: AshtakavargaData,
  houseNumber: number  // 1–12
): number
// Returns the SAV score for the given house.
// Throws if houseNumber is out of range or array has fewer than 12 entries.
```

**Done when:** both functions compile and handle edge cases (missing
index, out-of-range house number) with typed errors.

---

### Task MH.7 — Intention category mapper
**File:** `lib/astro/muhurta/intentionMapper.ts` (new file)

**Do:**
- Implement a function that maps a scored `MuhurtaWindow` to one or more
  `IntentionCategory` values based on which Panchanga limbs passed and
  the Ashtakavarga tier.
- These mappings are heuristics and should be clearly commented as such.

**Mapping rules:**
```
CAREER:        panchangaShuddhi >= 3 AND vara is Wednesday or Thursday
RELATIONSHIPS: tithi is auspicious AND vara is Friday or Monday
HEALTH:        nakshatra is auspicious AND eighthHouseRule.clean === true
FINANCE:       karana is auspicious AND panchangaShuddhi >= 2
NEW_PROJECT:   yoga is auspicious AND panchangaShuddhi >= 4
```

**Export:**
```typescript
export function mapIntentionCategories(
  window: MuhurtaWindow
): IntentionCategory[]
// Returns an empty array if no categories match.
// A window can match multiple categories.
```

**Done when:** function returns correct categories for three test cases
covering a multi-category match, a single-category match, and no match.

---

### Task MH.8 — Jyotish reasoning builder
**File:** `lib/astro/muhurta/reasoningBuilder.ts` (new file)

**Do:**
- Build plain-language and technical reasoning strings for each scored
  window. This is NOT an AI call — it is a deterministic template.
  AI-generated reasoning (for the premium narrative) is added in MH.11.

**Export:**
```typescript
export function buildJyotishReasoning(
  window: MuhurtaWindowRaw,
  score: MuhurtaScore,
  avTier: AshtakavargaTier
): string
// Returns a single string of Jyotish logic for admin/debug display.
// Format: "Panchanga: 4/5 (Tithi, Vara, Nakshatra, Yoga pass). 
//          Tara Bala: pass (remainder 2). 8th house: clean. 
//          SAV: 31 (Auspicious)."

export function buildUserReasoning(
  score: MuhurtaScore,
  avTier: AshtakavargaTier,
  categories: IntentionCategory[]
): string
// Returns a user-facing plain-language string, 2–3 sentences.
// Must NOT use prediction language ("you will", "this will cause").
// Use: "This window tends to support...", "The planetary weather favors..."
// Must NOT mention raw score numbers to the user.
// Example: "The planetary weather strongly favors this window for career
//           decisions. The Nakshatra and Yoga are both supportive, and
//           the Lagna is unobstructed. Consider decisions made here with
//           more confidence than usual."
```

**Blocked window output:**
- If `score.isBlocked === true`, `buildUserReasoning` must return:
  "The Tara Bala for this window is unfavorable relative to your birth
  Nakshatra. This window is not recommended for important decisions."

**Done when:** both functions return non-empty strings for a blocked and
a high-scoring window.

---

### Task MH.9 — KV cache layer for Muhurta results
**File:** `lib/astro/muhurta/muhurtaCache.ts` (new file)

**Do:**
- Extend the existing KV key schema for Muhurta. Add to `lib/kv/keys.ts`:
  ```typescript
  muhurtaWeekly: (userId: string, weekStart: string) =>
    `muhurta:${userId}:${weekStart}`
  // weekStart format: YYYY-MM-DD (Monday of the week)
  ```
- In `muhurtaCache.ts`, implement:

```typescript
export async function getCachedMuhurta(
  userId: string,
  weekStart: string
): Promise<MuhurtaResult | null>

export async function cacheMuhurta(
  userId: string,
  weekStart: string,
  result: MuhurtaResult
): Promise<void>
// TTL: 7 days (604800 seconds)
// Muhurta windows are expensive to compute — cache aggressively.
// Invalidate on birth profile update (handled by chartService.invalidateChartCache).
```

- Use `kvGet` and `kvSet` from `lib/kv/helpers.ts`. Do not instantiate
  a Redis client directly.

**Done when:** both functions compile. `getCachedMuhurta` returns `null`
on cache miss, not an error.

---

### Task MH.10 — Muhurta service (orchestrator)
**File:** `lib/astro/muhurta/muhurtaService.ts` (new file)

**Do:**
- Implement the main service function that orchestrates the full pipeline.
- This function coordinates: API fetch, scoring, filtering, caching.

```typescript
export async function getMuhurtaWindows(
  userId: string,
  birthProfile: BirthProfile,
  dateRange: { start: Date; end: Date },
  intentionFilter?: IntentionCategory
): Promise<MuhurtaResult>
```

**Pipeline steps:**
1. Compute `weekStart` (Monday ISO date) from `dateRange.start`.
2. Check cache: call `getCachedMuhurta`. If hit, return cached result
   (optionally filter by `intentionFilter` before returning).
3. If cache miss:
   a. Fetch natal chart from KV via `getOrCreateVedicChart`.
   b. Extract `janmaNakshatra` from natal chart.
   c. Call Vedic API to fetch raw Muhurta windows for the date range.
      - Add `// DECISION NEEDED: confirm /muhurta endpoint path, request
        //   schema, and response schema with Milosh before implementing.
        //   Placeholder: throw new Error('Muhurta API endpoint not confirmed')`
   d. For each raw window:
      - `scoreMuhurtaWindow(window, janmaNakshatra)`
      - `getAshtakavargaTier(getAshtakavargaForHouse(window.ashtakavarga, houseFocusedOn))`
      - `mapIntentionCategories(scoredWindow)`
      - `buildJyotishReasoning(...)` and `buildUserReasoning(...)`
      - Assemble final `MuhurtaWindow`
   e. Sort windows by `score.total` descending.
   f. Construct `MuhurtaResult` and call `cacheMuhurta`.
4. Return `MuhurtaResult`.

**Error handling:**
- If natal chart is unavailable, throw a typed `MuhurtaServiceError`
  with message: `'Natal chart required for Muhurta calculation'`.
- If the date range exceeds 14 days, throw: `'Date range must not exceed
  14 days'`.
- All other errors: log server-side, re-throw as `MuhurtaServiceError`.

**Done when:** service compiles. Steps 3a–3e may throw placeholder errors
until the API endpoint is confirmed (see DECISION NEEDED).

---

### Task MH.11 — AI reasoning enrichment
**File:** `lib/astro/muhurta/muhurtaAI.ts` (new file)

**Do:**
- For the top 3 scored windows only, call Claude to enrich the
  `reasoning` field with a more personalized narrative.
- This is a secondary enrichment pass. The deterministic `buildUserReasoning`
  output is always the fallback if the AI call fails.

```typescript
export async function enrichMuhurtaReasoning(
  window: MuhurtaWindow,
  hdType: string,           // user's Human Design type, e.g. "Generator"
  hdAuthority: string,      // user's HD authority, e.g. "Sacral"
  intentionCategory: IntentionCategory
): Promise<string>
// Returns enriched reasoning string.
// Falls back to window.reasoning on any error — never throws to caller.
```

**Claude prompt template (include verbatim in the function):**
```
You are a Vedic astrology consultant writing a practical timing
recommendation for a client.

Context:
- Client HD Type: {hdType}
- Client HD Authority: {hdAuthority}
- Intention: {intentionCategory}
- Auspicious Panchanga limbs this window: {auspiciousLimbs}
- Ashtakavarga strength: {avTier}

Write 2–3 sentences of practical guidance for this timing window.
Rules:
- Never use prediction language: "you will", "this will cause", "this means you will"
- Use language like: "This window tends to support...", "The planetary weather favors..."
- Reference the client's HD authority once if relevant
  (e.g., "As a Sacral Generator, trust your gut response in this window")
- Do not mention score numbers or Panchanga term names to the client
- Tone: warm, specific, practical — not mystical
```

**Done when:** function returns a non-empty string for a test window.
AI errors fall back to `window.reasoning` without throwing.

---

### Task MH.12 — API route
**File:** `app/api/muhurta/route.ts` (new file)

**Do:**
- Implement the GET handler.

**Request:** `GET /api/muhurta?intention=CAREER&weekStart=2026-03-16`

**Query params:**
- `weekStart` (required): ISO date string (Monday), e.g. `2026-03-16`
- `intention` (optional): one of `IntentionCategory` values

**Handler steps:**
1. Call `getRequiredSession()` — redirects to `/login` if no session.
2. Call `requireTier(session, 'CORE')` — returns 403 if FREE tier.
3. Validate `weekStart` with Zod: must be a valid ISO date, must be a
   Monday, must not be more than 14 days in the past.
4. Validate `intention` if provided: must be a valid `IntentionCategory`.
5. Fetch `BirthProfile` from Prisma for the session user.
   - If not found: return 404 `{ error: 'Birth profile not found' }`.
6. Compute `dateRange`: `weekStart` to `weekStart + 7 days`.
7. Call `getMuhurtaWindows(userId, birthProfile, dateRange, intention)`.
8. Return `{ windows: result.windows, generatedAt: result.generatedAt }`.

**Error responses:**
- 400 for invalid query params (include Zod error message).
- 403 for insufficient tier.
- 404 for missing birth profile.
- 500 for service errors (log server-side, return generic message to client).

**Do NOT** return raw `MuhurtaScore` numeric values in the response.
Strip them before returning — users should not see score breakdowns.

**Done when:** route handles all error cases and returns correct shape
for a valid request.

---

### Task MH.13 — Glimpse (free tier teaser) API route
**File:** `app/api/muhurta/glimpse/route.ts` (new file)

**Do:**
- Implement the FREE tier glimpse: returns dates only, no times, no reasoning.

**Request:** `GET /api/muhurta/glimpse?weekStart=2026-03-16`

**Response shape:**
```typescript
{
  dates: string[]          // ISO date strings only, e.g. ["2026-03-18", "2026-03-20"]
  count: number            // total auspicious windows found (e.g. 7)
  revealedCount: number    // always 3 for free tier
  upgradeRequired: true
}
```

**Handler steps:**
1. Require authentication (any tier including FREE).
2. Fetch full results via `getMuhurtaWindows` (no intention filter).
3. Take the top 3 windows by score. Extract only the date portion of
   `startTime` (strip time). Return as `dates`.
4. Return `count` as the total number of windows, `revealedCount: 3`.

**This creates the "date without time" Glimpse pattern**: the user can
see WHEN but not the exact time or reasoning. The blur wall is
implemented in the UI component (Task MH.14), not here.

**Done when:** route returns correct shape for a FREE tier user.

---

### Task MH.14 — MuhurtaFinder UI component
**File:** `components/muhurta/MuhurtaFinder.tsx` (new file)

**Do:**
- Build the full premium UI component and the free tier glimpse variant.
- This component is used on the dashboard and on the dedicated
  `/muhurta` page.

**Props:**
```typescript
interface MuhurtaFinderProps {
  tier: 'FREE' | 'CORE' | 'VIP'
  initialWeekStart?: string  // ISO date string, defaults to current Monday
}
```

**State:**
- `selectedIntention: IntentionCategory | null`
- `weekStart: string`
- `windows: MuhurtaWindow[]` (premium) or `glimpseData` (free)
- `isLoading: boolean`
- `error: string | null`

**UI sections:**
1. Intention selector — 5 category buttons with icons:
   - Career (briefcase), Relationships (heart), Health (leaf),
     Finance (coins), New Project (sparkle).
   - No selection = show all categories.
2. Week navigator — previous/next week arrows + current week label.
3. Results list — for each window:
   - Time range display: e.g. "Tuesday, Mar 18 — 2:00 PM to 4:30 PM"
   - Score indicator: 3 stars (6/6–5/6), 2 stars (4/6–3/6), 1 star (2/6–1/6)
   - Reasoning text
   - Intention category badge(s)
4. FREE tier blur overlay:
   - Show dates (from glimpse API) without times.
   - Overlay the times section with a CSS blur + upgrade CTA.
   - CTA text: "Unlock exact timing and guidance — upgrade to Core"

**Design system requirements (read `FRONTEND.md` before building):**
- Dark-only, glassmorphism cards.
- cosmos/amber/gold palette — use CSS variables, not hardcoded hex.
- Cormorant Garamond for headings, Instrument Sans for body text.
- Star rating display: use amber/gold filled stars.
- Blur overlay: `backdrop-filter: blur(8px)` with amber glow on CTA.
- Add `// DESIGN: reference FRONTEND.md for all tokens before styling`
  at the top of the file.

**Accessibility:**
- Intention buttons must have `aria-pressed` state.
- Loading state: `aria-busy="true"` on the results container.
- Blocked windows: visually de-emphasized (opacity 0.5) but still
  accessible in the DOM.

**Do NOT:** implement the weekly cache invalidation logic here. That is
server-side only.

**Done when:** component renders for both FREE and CORE tier props with
correct blur overlay behavior.

---

### Task MH.15 — Muhurta page route
**File:** `app/(dashboard)/muhurta/page.tsx` (new file)

**Do:**
- Create the dedicated Muhurta Finder page.
- Server component: fetch session and birth profile server-side.
- Pass tier and initial data as props to `<MuhurtaFinder />`.
- Page title: "Muhurta Finder — Auspicious Timing"
- Add a brief educational header (2–3 sentences) explaining what
  Muhurta is in plain language. No jargon without explanation.
- Example: "Muhurta is the Vedic science of choosing the right moment.
  Just as a seed planted in the right season grows stronger, decisions
  made in auspicious windows tend to unfold with less friction."
- Link from dashboard sidebar nav (update sidebar component to include
  the Muhurta link, gated visually for FREE tier with a lock icon).

**Done when:** page renders, passes correct tier prop, and sidebar link
is present.

---

### Task MH.16 — Prisma schema addition (Muhurta history)
**File:** `prisma/schema.prisma` (modify existing)

**Do:**
- Add a `MuhurtaQuery` model to track which windows a user has viewed
  or acted on. This supports the consultation trigger logic (NT-05 in
  PRD) and future analytics.

```prisma
model MuhurtaQuery {
  id                String              @id @default(cuid())
  userId            String
  user              User                @relation(...)
  weekStart         DateTime
  intentionCategory IntentionCategoryEnum?
  windowsReturned   Int
  queriedAt         DateTime            @default(now())
}
```

- Add `MuhurtaQuery[]` relation to the `User` model.
- Add `IntentionCategoryEnum` Prisma enum matching `IntentionCategory`
  type from `types/muhurta.ts`.
- Run `npx prisma generate` (do NOT run migration yet — note with TODO).
- Add `// TODO: run migration after MH.16 is reviewed — npx prisma migrate dev --name add_muhurta_query`

**Done when:** `npx prisma generate` succeeds with no errors.

---

## OPEN DECISIONS — STOP AND SURFACE THESE

```
DECISION NEEDED
Task: MH.10
File: lib/astro/muhurta/muhurtaService.ts
Question: What is the Vedic API endpoint path for Muhurta window
          calculation? What is the request schema (date range format,
          location required? natal chart data format)? What does the
          response shape look like for a raw window (fields, types)?
Blocking: Tasks MH.10, MH.12, MH.13 — service can compile but will
          throw a placeholder error until confirmed.
Raised: 2026-03-18
Resolved: [date + answer, filled in by Milosh]
```

```
DECISION NEEDED
Task: MH.10
File: lib/astro/muhurta/muhurtaService.ts
Question: For the Ashtakavarga filter (Task MH.6), which house number
          should be used as the "transit house" when scoring a Muhurta
          window? Options: (a) the house occupied by the proposed Lagna
          lord, (b) the 1st house SAV score of the proposed Lagna,
          (c) the house relevant to the intention category (e.g. 10th
          for CAREER, 7th for RELATIONSHIPS). Which approach is correct
          per Parashara principles?
Blocking: Task MH.6 and MH.10 scoring logic.
Raised: 2026-03-18
Resolved: [date + answer, filled in by Milosh]
```

```
DECISION NEEDED
Task: MH.11
File: lib/astro/muhurta/muhurtaAI.ts
Question: Should AI reasoning enrichment (Task MH.11) be done at
          request time (synchronous, adds latency) or pre-computed
          during the nightly cron job? Pre-computing means stale
          reasoning if user changes intention filter. Request-time
          means ~1–2s additional latency for the top 3 windows.
Blocking: MH.11 implementation approach.
Raised: 2026-03-18
Resolved: [date + answer, filled in by Milosh]
```

---

## COMPLETION CHECKLIST — Muhurta Finder

- [ ] MH.1  Types (`types/muhurta.ts`)
- [ ] MH.2  Panchanga Shuddhi scorer
- [ ] MH.3  Tara Bala calculator
- [ ] MH.4  8th House Rule checker
- [ ] MH.5  Composite scorer
- [ ] MH.6  Ashtakavarga filter
- [ ] MH.7  Intention category mapper
- [ ] MH.8  Reasoning builder
- [ ] MH.9  KV cache layer
- [ ] MH.10 Service orchestrator (placeholder until API confirmed)
- [ ] MH.11 AI reasoning enrichment
- [ ] MH.12 Premium API route
- [ ] MH.13 Glimpse API route
- [ ] MH.14 UI component
- [ ] MH.15 Page route
- [ ] MH.16 Prisma schema addition

**Blocked on open decisions:** MH.10 (API endpoint), MH.6/MH.10
(Ashtakavarga house), MH.11 (AI timing approach).

All other tasks (MH.1–MH.9, MH.11–MH.16) can proceed in parallel
with the placeholder error in MH.10.

---

## CODING STANDARDS FOR THIS FEATURE

1. **Precision:** Use standard JavaScript `Date` objects. Do not use
   integer timestamps for date comparisons — use ISO strings or Date
   methods. Planetary degree values use `number` (float64 is sufficient
   for this use case).

2. **Module boundaries:** Keep all Jyotish logic inside
   `lib/astro/muhurta/`. The API route (`app/api/muhurta/`) imports
   from the service only — never directly from scorers or calculators.

3. **No prediction language:** Every string output by any function in
   this feature — whether deterministic or AI-generated — must avoid
   "you will", "this will cause", "this means you will". This is a
   content rule, not a style preference. Use "tends to", "may", "often".

4. **Error typing:** All custom errors must extend `Error` with a
   `code` string property. No raw `throw new Error('string')` in
   service or API layer — use typed errors.

5. **Test comments:** Every scoring function must include at least three
   inline `// TEST: input -> expected output` comments. These are not
   a substitute for a test suite but they document intent clearly for
   the next developer.

6. **Status comments:** At the top of every file created or modified,
   add: `// STATUS: done | Task MH.X` once the task is complete.

---

*Crossroads Compass — task-feature-muhurta-finder.md | March 2026 | Milosh*

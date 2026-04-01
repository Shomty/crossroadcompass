# Synthesis Engine — Implementation Task

**Status:** Phases 1-3 Complete | Phase 4 In Progress
**Phases:** 1-3 Done (Commit: 240d7dd) | 4 Active
**Priority:** High (Core differentiator)
**Owner:** Claude

---

## Feature Overview

**Synthesis Engine** is the flagship feature that bridges Western and Vedic astrology to answer two critical questions:
- **Western (Tropical):** "Who am I in this situation?" → Psychological capacity & internal readiness
- **Vedic (Sidereal):** "When is the time to act?" → Karmic timing & dasha activation

**The Synthesis:** Connect inner readiness with outer timing via If-Then rules (e.g., "IF Western Saturn Transit AND Vedic Rahu Dasha THEN great testing of ego").

**User Value Proposition:**
- Users at life crossroads receive a map connecting their psychological readiness with astrological timing
- Unified "Opportunity Score" (1-10) for life areas (Career, Love, Relocation, etc.)
- Human-readable verdicts: "Your Western transits indicate drive for change, your Vedic Jupiter Dasha supports expansion. Proceed with confidence."

---

## Core Architecture

### 1. Western Module (Tropical)

**Scope:**
- Planets: 10 major (Sun through Pluto)
- Focus: Planets in Houses & Aspects
- House system: Placidus (standard, configurable)
- System: Tropical (0° Aries = vernal equinox)

**Key Data:**
- **Progressions:** Secondary progressions (1 day natal = 1 year life)
- **Transits:** Slow planets only (Jupiter 12yr, Saturn 29yr, Uranus 84yr, Neptune 165yr, Pluto 248yr)
- **Aspects:** Conjunction, Sextile, Square, Trine, Opposition; 6° orb standard

**Goal:** Identify internal pressure for change
- Saturn Return (age 29-30) = major life restructuring
- Uranus Opposition (age 42) = existential questioning
- Other slow-planet transits = phases of gradual external influence

**Implementation Strategy:**
- Use `openastrology-library` WesternAstrologyCalculator
- Initialize with `{ system: 'tropical', houseSystem: 'placidus' }`
- Calculate aspects with 6° orb for major aspects
- Cache transits in KV (24h TTL per date)
- Store 1-year forecasts in KV (permanent, invalidate on profile change)

---

### 2. Vedic Module (Sidereal - Lahiri Ayanamsa)

**Scope:**
- System: Sidereal (Lahiri ayanamsa, already in openastrology-library)
- Focus: Vimshottari Dasha system (120-year cycle)
- Key periods: Maha Dasha (major, ~7-20yr each) + Antar Dasha (sub, ~1-3yr each)

**Key Data:**
- **Maha Dasha:** 9 planetary periods totaling 120 years
- **Antar Dasha:** Sub-periods within each Maha Dasha
- **Activation Scoring:** Does dasha lord activate natal chart promise?
  - Exalted or own sign = strong activation (3/3)
  - Neutral dignity = moderate (1/3)
  - Debilitated or 6/8/12 houses = weak (0/3)
  - Consider: Dig Bala (directional strength), yoga activation, Atmakaraka alignment

**Goal:** Determine if "promise" in natal is activated
- A user desires career change (promise in chart), but Jupiter Dasha is weak → Not the right time
- Another user has strong Rajayoga in chart, Saturn Dasha activates it → Excellent timing

**Implementation Strategy:**
- Use existing `dashaService.ts` for DB persistence (no new schema)
- Create `dashaTimelineService.ts` to:
  - Build 120-year timeline from Maha/Antar periods
  - Score activation strength (0-3 scale) based on dasha lord dignity + natal alignment
  - Identify next transitions
- Cache timeline in KV (permanent, invalidate on profile change)

---

### 3. Synthesis Layer (If-Then Rules)

**Core Logic:** Combine Western transits + Vedic Dasha activation into unified timeline.

**Example If-Then Rules:**

```
IF (Saturn transit aspect to Sun) AND (Vedic Rahu Dasha)
THEN "A period of great testing of ego and authority. Inner doubt meets external pressure."
      Opportunity Score: 3/10 (challenging period)

IF (Saturn transit to Midheaven) AND (Vedic Jupiter Dasha strong)
THEN "Career restructuring with expansion opportunity. Authority matured."
      Opportunity Score: 7/10 (excellent for career moves)

IF (Uranus transit to Venus) AND (Vedic Venus Dasha)
THEN "Sudden relationship shifts. Liberation through love."
      Opportunity Score: 6/10 (volatile but transformative)

IF (No major Western transit) AND (Strong Vedic Dasha activation)
THEN "Silent inner shift. The seeds of change are germinating internally."
      Opportunity Score: 5/10 (introspective period)
```

**Convergence Scoring:** (0-100 scale)
- 0-25 = Independent periods (no overlap)
- 25-50 = Minor alignment (weak dasha, gentle transits)
- 50-75 = Notable alignment (moderate dasha activation + Western aspect)
- 75-100 = High convergence (strong dasha + major Western transit same day)

---

## Implementation Phases

### Phase 1: Core Calculation Services (Week 1-2)

**Deliverables:** Calculation logic, caching, type safety

**Tasks:**

**1.1 — Western Module Setup**
- Expand `lib/astro/transitService.ts`
  - Implement `getWesternTransitsForDate(userId, date, birthProfile)` using WesternAstrologyCalculator
  - Implement `getSecondaryProgressions(natalBirthInfo, currentDate)` (1 day = 1 year formula)
  - Implement `identifyLifeStageMilestones(birthDate, currentDate)` (Saturn Return, Uranus opp, etc.)
  - Initialize calculator: `{ system: 'tropical', houseSystem: 'placidus' }`
  - Calculate aspects: Conjunction, Sextile, Square, Trine, Opposition; 6° orb
  - Cache in KV: `transit:${userId}:${YYYY-MM-DD}` with 24h TTL

**Files to Create/Modify:**
- `lib/astro/transitService.ts` (expand, replace "DECISION NEEDED" stub)
- `lib/astro/types.ts` (add WesternPlanetPosition, WesternAspect, WesternTransit types)

**Acceptance Criteria:**
- `getWesternTransitsForDate()` returns correct tropical planet positions
- Aspects calculated with 6° orb
- Saturn Return detected for user born ~30yr ago
- Uranus opposition detected for user born ~42yr ago
- KV cache working (hit/miss/expiry)
- No `any` types; all TS strict
- Tests: 80%+ coverage (unit tests for calculation logic)

**NOT in scope:**
- UI/components
- Gemini API integration
- Database persistence of transits (KV only)

---

**1.2 — Vedic Module: Dasha Timeline Service**
- Create `lib/astro/dashaTimelineService.ts`
  - Implement `buildFullDashaTimeline(userId, birthProfile, natalChart)`
    - Fetch all Dasha periods from DB (via `dashaService.getOrFetchDashas()`)
    - Group by Maha Dasha blocks
    - Generate 120-year timeline
  - Implement `scoreAntardashaActivation(antardashaData, natalChart)` → strength 0-3
    - Check: Dasha lord exalted/own/debilitated?
    - Check: Dasha lord in kendra/kona/dusthana?
    - Check: Activates any yoga in natal?
    - Check: Is Atmakaraka or Amatyakaraka?
    - Return: { strength: 0|1|2|3, reasons: string[] }
  - Implement `getNextDashaTransition(timeline, referenceDate)` → next Antar/Maha change
  - Cache timeline in KV: `dasha-timeline:${userId}` (permanent, invalidate on profile change)

**Files to Create/Modify:**
- `lib/astro/dashaTimelineService.ts` (new)
- `lib/astro/types.ts` (add DashaPeriod, AntardashaWindow, MahadashaBlock, VedicDashaTimeline)

**Acceptance Criteria:**
- `buildFullDashaTimeline()` returns 120-year blocks
- `scoreAntardashaActivation()` returns 0-3 with documented reasoning
- Activation logic matches classical Jyotish rules (exaltation, houses, yogas)
- KV caching working
- No `any` types
- Tests: 80%+ coverage (edge cases: age 0, 120+, leap years, weak vs strong dashas)

**NOT in scope:**
- UI/components
- Gemini API insights
- Advanced yogas (only major: Rajayoga, Daridrayoga, etc.)

---

**1.3 — Synthesis Service: If-Then Orchestrator**
- Create `lib/astro/synthesisService.ts`
  - Implement `synthesizeCharts(userId, birthProfile, dateRange?)` → SynthesisResult
    - Call Western module → get transits + progressions
    - Call Vedic module → get current/next dasha
    - Merge: For each day in range, score convergence (0-3)
    - Identify If-Then rule matches
    - Return unified result
  - Implement `scoreConvergence(westernData, vedicData, date)` → 0-3
    - Check: Is there a Western aspect today?
    - Check: Is Dasha changing (Antar or Maha)?
    - Check: Is Dasha strength high?
    - Calculate combined score
  - Implement `matchIfThenRules(westernAspects, dashaData)` → matched rules
    - Hardcode If-Then rules (see examples above)
    - Return matching rules + descriptions
  - Cache in KV: `synthesis:${userId}:${dateRange}` (24h TTL)

**Files to Create/Modify:**
- `lib/astro/synthesisService.ts` (new)
- `lib/astro/types.ts` (add SynthesisResult, ConvergenceEvent, IfThenRule)
- `lib/kv/keys.ts` (add synthesis, western-transit KV key patterns)

**Acceptance Criteria:**
- `synthesizeCharts()` returns SynthesisResult with convergence timeline
- Convergence scoring 0-3 (clear logic, documented)
- If-Then rules fire correctly (Saturn transit + Rahu Dasha → "testing of ego")
- KV cache working (24h TTL)
- No `any` types
- Tests: 80%+ coverage (convergence scoring, rule matching)

**NOT in scope:**
- UI/components
- Opportunity scores (calculated in Phase 3)
- Gemini AI synthesis text

---

**1.4 — Types & KV Keys**
- Update `lib/astro/types.ts`
  - Add: WesternPlanetPosition, WesternAspect, WesternTransit, TransitTimeline
  - Add: DashaPeriod, AntardashaWindow, MahadashaBlock, VedicDashaTimeline
  - Add: SynthesisResult, ConvergenceEvent, IfThenRule
  - All strictly typed (no `any`)
  - Include JSDoc comments for each type
- Update `lib/kv/keys.ts`
  - Add: `westernTransit(userId, date)` → `western-transit:${userId}:${date}`
  - Add: `dashaTimeline(userId)` → `dasha-timeline:${userId}`
  - Add: `synthesis(userId, dateRange)` → `synthesis:${userId}:${dateRange}`
  - Add: KV_TTL entries (`WESTERN_TRANSIT_SECONDS = 86400`, `SYNTHESIS_SECONDS = 86400`)

**Files:**
- `lib/astro/types.ts` (modify)
- `lib/kv/keys.ts` (modify)

**Acceptance Criteria:**
- All new types exported + used in services
- KV keys consistent with naming conventions
- JSDoc complete and clear

---

**1.5 — Testing & Validation**
- Create test files:
  - `lib/astro/transitService.test.ts` (Western module tests)
  - `lib/astro/dashaTimelineService.test.ts` (Vedic module tests)
  - `lib/astro/synthesisService.test.ts` (Synthesis layer tests)
- Test coverage:
  - Transit calculation for known dates (e.g., 2024-04-01)
  - Saturn Return detection (user age 29.5yr)
  - Uranus opposition detection (user age 42yr)
  - Dasha timeline generation (full 120yr)
  - Activation scoring (exalted, debilitated, yoga activation)
  - Convergence scoring (0-3 logic)
  - If-Then rule matching
  - Timezone handling
  - Edge cases (age 0, 120+, leap years, DST)
  - KV cache hit/miss/expiry
- Aim for 80%+ coverage

**Files:**
- `lib/astro/transitService.test.ts` (new)
- `lib/astro/dashaTimelineService.test.ts` (new)
- `lib/astro/synthesisService.test.ts` (new)

**Acceptance Criteria:**
- All tests pass (`rtk vitest run`)
- 80%+ coverage
- No type errors (`rtk tsc`)
- No console warnings/errors

---

### Phase 2: API Routes (Week 2-3)

**Deliverables:** HTTP endpoints + caching + auth

**Tasks:**

**2.1 — Main Synthesis Endpoint**
- Create `app/api/chart/synthesis/route.ts`
  - GET handler: Fetch synthesis result via `synthesizeCharts()`
  - Query params: `dateRange` (optional; default: today ± 30d)
  - Auth required (check session)
  - Return KV cache if available (24h TTL)
  - Error handling: 401 Unauthorized, 404 Birth Profile not found, 500 Calculation error
  - Response: { currentMahaDasha, currentAntarDasha, convergenceWindow, criticalDates, ... }

**2.2 — Western Transits Endpoint**
- Create `app/api/chart/western-transits/route.ts`
  - GET handler: Fetch Western transits via `getWesternTransitsForDate()`
  - Query params: `date1`, `date2` (YYYY-MM-DD; default: today ± 30d)
  - Auth required
  - Cache: Aggregate daily KV entries
  - Response: { transits[], keyEvents[] }

**2.3 — Dasha Timeline Endpoint**
- Create `app/api/chart/dasha-timeline/route.ts`
  - GET handler: Fetch dasha timeline via `buildFullDashaTimeline()`
  - Auth required
  - Cache: KV (permanent, invalidated on profile change)
  - Response: { currentMahaDasha, currentAntarDasha, timeline[], nextTransition }

**Files:**
- `app/api/chart/synthesis/route.ts` (new)
- `app/api/chart/western-transits/route.ts` (new)
- `app/api/chart/dasha-timeline/route.ts` (new)

**Acceptance Criteria:**
- All routes return correct JSON schema
- Auth required + 401 on missing session
- Birth profile not found → 404
- Calculation errors → 500 with message
- <2s response time for cached users
- <3s response time for uncached users (first calculation)
- E2E tests (Playwright): Happy path + error cases

---

### Phase 3: Recomputation Logic (Event-Driven)

**Deliverables:** Profile update detection + async recalculation + cache invalidation

**Scope:** When a user updates birth data (via `PATCH /api/user/profile`), automatically:
1. Detect change (middleware)
2. Set `is_recalculating = true` flag
3. Parallel execution:
   - Vedic engine recalculates charts
   - Western engine recalculates progressions/transits
4. Synthesis aggregator merges results
5. Cache invalidation (KV keys)
6. WebSocket notification to UI (user sees live update)

**Implementation Strategy:**
- Add middleware to `app/api/user/profile` route
- Use background job queue (e.g., Vercel Cron or Upstash)
- Update DB transaction:
  - BirthProfile
  - Invalidate KV: vedicChart, hdChart, westernTransit, synthesis, dashaTimeline
  - Update recalculating flag
- WebSocket push: Notify UI when complete

**Files to Create/Modify:**
- `app/api/user/profile/route.ts` (add middleware)
- `lib/astro/recalculationService.ts` (new, orchestrate recalc)
- Possibly: WebSocket service (if not already present)

**NOT in Phase 1 — Defer to Phase 3**

---

### Phase 4: Dashboard & UI Components (Week 4-5)

**Deliverables:** "Crossroads" dashboard, synthesis feed, opportunity scores

**Scope:**

**4.1 — Opportunity Score Calculation**
- Implement `lib/astro/opportunityScoreService.ts`
  - Calculate score 1-10 per life area: Career, Love, Relocation, Health, Spirituality
  - Input: SynthesisResult (Western transits + Vedic Dasha)
  - Logic:
    - Strong Dasha activation + supporting Western transits → 8-10
    - Moderate alignment → 5-7
    - Challenging convergence → 3-5
    - Independent weak periods → 1-2
  - Return: { career: 7, love: 4, relocation: 8, health: 6, spirituality: 9 }

**4.2 — React Components**
- `components/synthesis/SynthesisDashboard.tsx` (main container)
- `components/synthesis/WesternTransitView.tsx` (slow planets, aspects, progressions)
- `components/synthesis/VedicDashaView.tsx` (Maha/Antar blocks, activation strength)
- `components/synthesis/ConvergenceTimeline.tsx` (merged West+Vedic, 30-day view)
- `components/synthesis/SynthesisCard.tsx` (dashboard widget, opportunity scores)
- `components/synthesis/OpportunityScorecardView.tsx` (life areas, 1-10 per area)

**4.3 — Pages**
- Create `app/(app)/synthesis/page.tsx` (full-page synthesis view)
- Integrate into dashboard (as tab or main widget)

**4.4 — Automated Insights**
- Implement `lib/ai/synthesisInsightService.ts`
  - Use Gemini API to generate human-readable verdicts
  - Input: SynthesisResult, matched If-Then rules
  - Output: Insight text (2-4 sentences, actionable)
  - Cache: KV (24h TTL)
  - Example: "Your Western transits indicate an internal drive for career change, and your Vedic Jupiter Dasha currently supports financial expansion. Proceed with confidence over the next 6 months."

**NOT in Phase 1 — Defer to Phase 4**

---

## Data Flow & Caching Strategy

### Cache Layers

| Data | Key Pattern | TTL | Invalidation | Storage |
|------|------------|-----|--------------|---------|
| Western Transits (daily) | `western-transit:${userId}:${YYYY-MM-DD}` | 24h | Auto-expire | KV (Upstash) |
| Western Transits (range) | Aggregate daily keys | 24h | Auto-expire | KV |
| Dasha Timeline (full 120yr) | `dasha-timeline:${userId}` | None | On profile change | KV |
| Synthesis (30-day) | `synthesis:${userId}:${start}-${end}` | 24h | Auto-expire | KV |
| Opportunity Scores | `opp-score:${userId}:${area}` | 24h | Auto-expire | KV |
| Dasha Periods (DB) | Dasha table (existing) | None | On chart generation | Prisma/SQLite |
| Insights (AI) | `insight:${userId}:${type}:${date}` | 24h | Auto-expire | KV |

### Recomputation Trigger Flow

```
User edits birth time/location (PATCH /api/user/profile)
  ↓
Middleware detects change → sets is_recalculating = true
  ↓
KV invalidation: [westernTransit:*, dasha-timeline, synthesis, opp-score]
  ↓
Background job (parallel):
  - VedicEngine(newData) → recalculate charts → DB update
  - WesternEngine(newData) → recalculate transits → KV clear
  ↓
Synthesis Aggregator: Merge new data
  ↓
set is_recalculating = false
  ↓
WebSocket push to UI: "Charts updated!"
```

---

## Type-Safety & Code Structure

**Rules:**
- No `any` types; use explicit types or generics
- All services: Pure functions, testable, no side effects (except cache/DB)
- Timestamps: Always UTC (use `Date` or `ISO string`)
- Interfaces: Shared in `lib/astro/types.ts`
- Error handling: Typed errors, graceful fallbacks

**Folder Structure (after Phase 1):**
```
lib/astro/
  ├── types.ts (all shared interfaces)
  ├── transitService.ts (Western module)
  ├── dashaTimelineService.ts (Vedic module)
  ├── synthesisService.ts (If-Then merger)
  ├── opportunityScoreService.ts (1-10 scoring)
  ├── [other existing services...]
  └── [tests: *.test.ts]

app/api/chart/
  ├── synthesis/route.ts (main endpoint)
  ├── western-transits/route.ts
  └── dasha-timeline/route.ts

components/synthesis/
  ├── SynthesisDashboard.tsx
  ├── WesternTransitView.tsx
  ├── VedicDashaView.tsx
  ├── ConvergenceTimeline.tsx
  ├── SynthesisCard.tsx
  └── OpportunityScorecardView.tsx
```

---

## Decision Points (CONFIRMED ✅)

1. ✅ **Aspect Orbs:** 6° standard for all major aspects (Conjunction, Sextile, Square, Trine, Opposition)

2. ✅ **Planets:** All planets + luminaries (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Nodes). Focus on key nature/dignity, not just slow planets.

3. ✅ **House System:** Placidus (Western standard)

4. ✅ **Dasha Activation Scoring:** Custom formula based on exaltation/own/debilitated, houses, yogas, Dig Bala, Atmakaraka alignment

5. ✅ **If-Then Rules:** Hardcode ~10 core rules + Gemini expands + **0-100 score scale** (not 0-3)

---

## Acceptance Criteria (Phase 1 Complete)

- [ ] All 3 services implemented (Western, Vedic, Synthesis)
- [ ] All types defined in `lib/astro/types.ts` (no `any`)
- [ ] KV keys documented in `lib/kv/keys.ts`
- [ ] Tests: 80%+ coverage, all pass (`rtk vitest run`)
- [ ] No TypeScript errors (`rtk tsc`)
- [ ] No runtime errors on typical user profile
- [ ] Caching working (KV hit/miss verified)
- [ ] Edge cases handled (age 0, 120+, leap years, DST)
- [ ] Code status marker: `// STATUS: done | Synthesis Engine Phase 1.X`
- [ ] Demo: Can manually call services and see output

---

## Not in Scope (Phase 1)

- UI/components (Phase 4)
- API routes (Phase 2)
- Recomputation logic (Phase 3)
- Opportunity scores (Phase 4)
- Automated insights/Gemini (Phase 4)
- WebSocket notifications (Phase 3)
- Database schema changes (using existing Dasha table)
- Advanced yoga detection (only basic yogas)
- ML/classification (hardcoded If-Then rules)

---

## Files to Create/Modify Summary

| File | Task | Action |
|------|------|--------|
| `lib/astro/transitService.ts` | 1.1 | Expand (replace DECISION NEEDED) |
| `lib/astro/dashaTimelineService.ts` | 1.2 | Create new |
| `lib/astro/synthesisService.ts` | 1.3 | Create new |
| `lib/astro/opportunityScoreService.ts` | 4.1 | Create in Phase 4 |
| `lib/ai/synthesisInsightService.ts` | 4.4 | Create in Phase 4 |
| `lib/astro/types.ts` | 1.4 | Update (add types) |
| `lib/kv/keys.ts` | 1.4 | Update (add keys + TTLs) |
| Tests | 1.5 | Create *.test.ts files |
| `app/api/chart/synthesis/route.ts` | 2.1 | Create in Phase 2 |
| `app/api/chart/western-transits/route.ts` | 2.2 | Create in Phase 2 |
| `app/api/chart/dasha-timeline/route.ts` | 2.3 | Create in Phase 2 |
| Components | Phase 4 | Create SynthesisDashboard + 5 others |

---

## References & Links

- **openastrology-library:** Used for both Vedic + Western calculations
- **Vimshottari Dasha:** 120-year cycle of 9 planets
- **Secondary Progressions:** 1 day natal = 1 year life
- **Lahiri Ayanamsa:** ~23.8° as of 2024
- **Placidus Houses:** Standard Western house system

---

## Timeline Estimate

- **Phase 1:** 2 weeks (services + tests)
- **Phase 2:** 1 week (API routes)
- **Phase 3:** 1 week (recomputation + WebSocket)
- **Phase 4:** 2 weeks (components + dashboard)
- **Total:** ~6 weeks

---

## Next Steps

1. ✅ Create task file (this document)
2. ⏭️ **Confirm decision points** (aspect orbs, slow planets, etc.)
3. ⏭️ Start Phase 1, Task 1.1 (Western Module)

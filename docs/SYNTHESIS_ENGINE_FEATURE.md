# Synthesis Engine - Feature Documentation

**Status:** Complete (Phase 1-4)
**Last Updated:** April 2026
**Codebase:** Crossroads Compass / Cosmic Gateway

---

## Overview

The Synthesis Engine is a unified system that merges Western tropical astrology with Vedic sidereal astrology into a cohesive "Life Blueprint" experience. It answers two fundamental life questions:

- **Western Astrology:** "Who am I in this situation?" (psychological capacity & personality)
- **Vedic Astrology:** "When is the time to act?" (karmic timing & cycles)

This feature is the core value proposition of Crossroads Compass—helping users at life crossroads understand both their innate nature and the optimal timing for major life decisions.

---

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│  React UI Layer (Phase 4)                                   │
│  - SynthesisDashboard, WesternTransitView, VedicDashaView   │
│  - ConvergenceTimeline, OpportunityScorecardView, SynthesisCard
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  API Routes (Phase 2)                                       │
│  - /api/chart/synthesis                                    │
│  - /api/chart/western-transits                             │
│  - /api/chart/dasha-timeline                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  Core Services (Phase 1 & 4)                                │
│  - transitService (Western calc)                           │
│  - dashaTimelineService (Vedic timing)                     │
│  - synthesisService (merge + rules)                        │
│  - opportunityScoreService (0-100 scoring)                 │
│  - synthesisInsightService (AI narrative)                  │
│  - recalculationService (async updates)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  External APIs                                              │
│  - Jyotish API (Vedic chart calc)                          │
│  - OpenHumanDesign Library (Human Design)                  │
│  - Gemini API (AI synthesis text)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 1: Core Services (Complete)
**Files:** `lib/astro/`, `types/index.ts`, `lib/kv/keys.ts`

Implemented:
- `transitService.ts` - Western tropical astrology calculations
  - `getWesternTransitsForDate()` - Daily planet positions + aspects
  - `getWesternTransitTimeline()` - 30-day forecast
  - `identifyLifeStageMilestones()` - Saturn Return, Uranus Opposition, Jupiter returns

- `dashaTimelineService.ts` - Vedic sidereal timing
  - `getCurrentDashas()` - Extract active Maha/Antar Dasha
  - `buildFullDashaTimeline()` - 120-year timeline
  - `scoreAntardashaActivation()` - 0-100 activation scoring
  - `getOrBuildDashaTimeline()` - Cached timeline with KV persistence

- `synthesisService.ts` - Western + Vedic merge
  - 10 hardcoded If-Then rules combining Western transits + Vedic Dasha signals
  - `calculateConvergenceScore()` - 0-100 alignment measure
  - Returns `SynthesisResult` with convergence timeline + critical dates

**Type Definitions:** 20+ interfaces in `types/index.ts`
- `WesternPlanetPosition`, `WesternAspect`, `WesternTransit`
- `DashaPeriod`, `MahadashaBlock`, `AntardashaWindow`
- `IfThenRule`, `ConvergenceEvent`, `SynthesisResult`

**KV Caching:** Upstash Redis with 24h TTL for transits/synthesis, permanent storage for dasha timeline

---

### Phase 2: API Routes (Complete)
**Files:** `app/api/chart/`

Endpoints:
- `GET /api/chart/synthesis` - Returns `SynthesisResult`
  - Query: `start`, `end` (optional, YYYY-MM-DD)
  - Auth required, returns convergence window + critical dates + current Dashas

- `GET /api/chart/western-transits` - Returns `TransitTimeline`
  - Query: `start`, `end` (required)
  - Includes 30-day transits + key events + life stage milestones

- `GET /api/chart/dasha-timeline` - Returns `VedicDashaTimeline`
  - Full 120-year Vedic cycle with current position

---

### Phase 3: Recalculation Logic (Complete)
**Files:** `lib/astro/recalculationService.ts`, `app/api/birth-profile/recalc-status/route.ts`

Implements async background processing:
- `triggerRecalculation()` - Queues job, returns immediately
- `getRecalcStatus()` - Returns status (pending/done/error) + progress (0-100%)
- 5-step progress tracking: 10% → 30% → 50% → 70% → 85% → 100%
- Triggered on profile updates, KV-based progress polling for UI

---

### Phase 4: React Components + Services (Complete)
**Files:** `components/synthesis/`, `app/(app)/synthesis/page.tsx`, `lib/ai/`, `lib/astro/opportunityScoreService.ts`

**Components (6 created):**

1. **SynthesisDashboard.tsx** (314 lines)
   - Main container with recalc status polling
   - Summary stats: current Dasha, convergence score, best opportunity area
   - Next critical event display
   - Props: `synthesis`, `opportunityScores`, `onRecalcComplete?`

2. **WesternTransitView.tsx** (152 lines)
   - 30-day transit calendar
   - Color-coded planets by type
   - Aspect strength indicators
   - Key events summary (Saturn Return, Uranus Opposition, etc.)
   - Props: `transitTimeline`

3. **VedicDashaView.tsx** (212 lines)
   - Full Mahadasha/Antardasha timeline
   - Color intensity = activation strength (0-100)
   - Current period highlight
   - Scrollable timeline with 120-year view
   - Props: `dashaTimeline`, `currentMahaDasha`, `currentAntarDasha`

4. **ConvergenceTimeline.tsx** (132 lines)
   - Expandable convergence events (30-day window)
   - Each event shows: date, dasha phase, convergence score, matched rules, reasoning
   - Color-coded by convergence strength
   - Props: `events` (ConvergenceEvent[])

5. **OpportunityScorecardView.tsx** (123 lines)
   - 5 life area cards: Career, Love, Relocation, Health, Spirituality
   - Each scored 0-100 with color gradient (emerald ≥80, amber 60-79, yellow 40-59, red <40)
   - Overall convergence score (center)
   - Risk areas section
   - Props: `scores` (OpportunityScores)

6. **SynthesisCard.tsx** (77 lines)
   - Dashboard widget for quick snapshot
   - Current Dasha, best opportunity, next event
   - "View Full Synthesis" CTA
   - Props: `synthesis`, `isRecalculating?`

**Dashboard Page:**

7. **app/(app)/synthesis/page.tsx** (193 lines)
   - Full-page dashboard with 5 tabs:
     - **Dashboard** - Summary stats + recalc polling
     - **Western Transits** - 30-day calendar
     - **Vedic Dasha** - 120-year timeline
     - **Convergence** - Merged events
     - **Opportunities** - Life area scorecard
   - Async fetching from all 3 synthesis endpoints
   - Tab navigation with smooth transitions

**Services:**

8. **lib/ai/synthesisInsightService.ts** (157 lines)
   - `generateSynthesisInsight()` - Calls Gemini API with matched rules + scores
   - `generateDailyGuidance()` - 2-sentence morning guidance
   - Graceful fallback if Gemini unavailable
   - 24h KV caching
   - Null-safe initialization

9. **lib/astro/opportunityScoreService.ts** (220 lines)
   - `calculateOpportunityScores()` - Returns scores for all 5 life areas
   - Per-area scoring logic:
     - **Career:** Midheaven transits + 10th house Dasha
     - **Love:** Venus aspects + 7th house planets
     - **Relocation:** 4th house + Moon/Saturn aspects
     - **Health:** 6th house + Mars/Mercury favorable
     - **Spirituality:** 9th/12th houses + Jupiter/Neptune
   - `scoreToGuidance()` - Converts 0-100 to verbal guidance

---

## Data Flow

### Example: User Views Synthesis Dashboard

```
1. User navigates to /synthesis
   ↓
2. SynthesisPage fetches data in parallel:
   - GET /api/chart/synthesis → SynthesisResult
   - GET /api/chart/western-transits → TransitTimeline
   - GET /api/chart/dasha-timeline → VedicDashaTimeline
   ↓
3. SynthesisPage renders 5 tabs:
   - Dashboard tab shows SynthesisDashboard component
     - Displays current Dasha, convergence score, best opportunity
     - Polls /api/birth-profile/recalc-status every 2s if recalculating
   ↓
4. User clicks "Western Transits" tab
   - Renders WesternTransitView with transitTimeline
   - Shows 30-day calendar + life stage milestones
   ↓
5. User updates birth time on dashboard
   - PATCH /api/birth-profile triggers recalculation
   - Background job runs 5-step process (10/30/50/70/85/100%)
   - Dashboard status bar updates via polling
   - On completion, data refetches and UI updates
```

### If-Then Rule Matching

Example rule: "Saturn transit to natal Sun + Rahu Dasha = testing of ego and authority"

```javascript
// From synthesisService.ts
const rule = {
  id: "saturn-sun-rahu",
  condition: "Saturn transit to Sun + Rahu Dasha",
  verdict: "A period of great testing... ego structures are examined...",
  strength: 85 // 0-100
}

// Matched when:
1. Western transits include Saturn aspect to natal Sun (within 6° orb)
2. Current Dasha = Rahu Mahadasha
3. Convergence score = (Saturn strength + Rahu activation) / 2
```

---

## File Structure

```
Synthesis Engine Files:

lib/
  astro/
    transitService.ts              (209 LOC) - Western calculations
    dashaTimelineService.ts        (280 LOC) - Vedic timeline
    synthesisService.ts            (290 LOC) - Merge + rules
    opportunityScoreService.ts     (220 LOC) - 0-100 scoring
    recalculationService.ts        (220 LOC) - Async updates
  ai/
    synthesisInsightService.ts     (157 LOC) - Gemini AI text
  kv/
    keys.ts                        (updated) - KV key patterns

components/
  synthesis/
    SynthesisDashboard.tsx         (314 LOC)
    WesternTransitView.tsx         (152 LOC)
    VedicDashaView.tsx             (212 LOC)
    ConvergenceTimeline.tsx        (132 LOC)
    OpportunityScorecardView.tsx   (123 LOC)
    SynthesisCard.tsx              (77 LOC)

app/
  (app)/
    synthesis/
      page.tsx                     (193 LOC)
  api/
    chart/
      synthesis/
        route.ts                   (API endpoint)
      western-transits/
        route.ts                   (API endpoint)
      dasha-timeline/
        route.ts                   (API endpoint)
    birth-profile/
      recalc-status/
        route.ts                   (Status polling)

types/
  index.ts                         (updated with 20+ interfaces)

docs/
  SYNTHESIS_ENGINE_FEATURE.md      (this file)
```

---

## Type System

All types are strictly typed (no `any`). Key interfaces:

```typescript
// Western Astrology
export type WesternPlanetName = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
export interface WesternPlanetPosition {
  name: WesternPlanetName
  longitude: number              // 0-360 tropical
  house: number                  // 1-12 Placidus
  sign: string                   // 'aries' ... 'pisces'
  isRetrograde: boolean
  speed: number                  // degrees/day
}
export interface WesternAspect {
  planet1: WesternPlanetName
  planet2: WesternPlanetName
  angleName: WesternAspectType   // conjunction, sextile, square, trine, opposition
  orb: number                    // 0-6 degrees
  strength: number               // 0-100
}

// Vedic Astrology
export interface DashaPeriod {
  planetName: string
  startDate: Date
  endDate: Date
  level: 'MAHADASHA' | 'ANTARDASHA'
  strength?: number              // 0-100 activation
}
export interface MahadashaBlock {
  mahadashaPlanet: string
  startDate: Date
  endDate: Date
  antardashas: AntardashaWindow[]
  overallStrength: number        // 0-100
}

// Synthesis
export interface SynthesisResult {
  currentMahaDasha: DashaPeriod
  currentAntarDasha: DashaPeriod
  currentTransits: WesternTransit
  convergenceWindow: ConvergenceEvent[]
  criticalDates: Array<{
    date: string
    reason: string
    module: 'western' | 'vedic' | 'both'
    strength: number
  }>
}
export interface OpportunityScores {
  career: number                 // 0-100
  love: number                   // 0-100
  relocation: number             // 0-100
  health: number                 // 0-100
  spirituality: number           // 0-100
  overall: number                // Average
  bestArea: string               // Highest scoring
  risky: string[]                // Areas < 40
}
```

---

## Integration Points

### 1. Dashboard Integration
- `SynthesisCard` component embedded on main dashboard
- Shows current Dasha + best opportunity + next event
- Links to `/synthesis` for full view

### 2. Birth Profile Updates
- Updating birth time/location triggers recalculation
- Progress tracked via polling `/api/birth-profile/recalc-status`
- UI displays status bar with percentage

### 3. Insights System
- Daily insights use `synthesisInsightService.generateDailyGuidance()`
- Returns Gemini-generated 2-sentence guidance based on synthesis
- Cached 24h per user

### 4. KV Cache Strategy
- **24h TTL (auto-refresh):**
  - Western transits
  - Synthesis results
  - AI insight text
- **Permanent (invalidate on profile change):**
  - Dasha timeline (expensive to recalculate)
  - Chart data

---

## Scoring Logic

### Convergence Score (0-100)
```
convergenceScore = (westernAspectStrength + vedicActivationScore) / 2
```

Example:
- Saturn square natal Sun (Western): strength 75
- Rahu Mahadasha activation: 65
- Convergence = (75 + 65) / 2 = 70 (good alignment)

### Opportunity Scores (0-100 per area)

**Career:**
- Base: Midheaven transits
- +20 if Saturn/Jupiter aspect Midheaven
- +15 if 10th house Dasha active
- -15 if opposition aspect
- Result capped 0-100

**Love:**
- Base: Venus transits
- +20 if Venus benefic aspect (sextile, trine)
- +15 if 7th house activated
- -20 if Mars/Saturn harsh aspects
- Result capped 0-100

Similar logic for Relocation, Health, Spirituality

### Guidance Conversion
- 80-100: "Excellent opportunity"
- 60-79: "Good timing for this area"
- 40-59: "Mixed signals; proceed with caution"
- <40: "Challenging period; focus elsewhere"

---

## Performance Considerations

### Optimization Strategies
1. **KV Caching** - Reduce Jyotish API calls
2. **Async Recalculation** - Non-blocking background jobs
3. **Parallel Data Fetching** - Dashboard page fetches all 3 endpoints at once
4. **Component Memoization** - OpportunityScorecardView prevents unnecessary re-renders

### Load Times (Estimated)
- First synthesis load: ~800ms (fetches all 3 endpoints)
- Tab switches: <100ms (data already loaded)
- Recalculation: 5-10 seconds (background)

---

## Error Handling

### Graceful Degradation
- **Gemini API unavailable:** Falls back to heuristic guidance from matched rules
- **Jyotish API timeout:** Uses cached dasha timeline if available
- **KV cache miss:** Recalculates on-demand

### User Feedback
- Loading spinner during initial fetch
- Recalc status bar with percentage
- Error messages with "Try Again" button

---

## Future Enhancements

1. **Phase 5:** Insights generation (daily cards, weekly reports)
2. **Phase 6:** Muhurta (auspicious timing) for specific actions
3. **Phase 7:** Relationship compatibility (synastry)
4. **Phase 8:** Financial astrology
5. **Phase 9:** Career roadmap generation
6. **Phase 10:** Consultation booking + video integration
7. **Phase 11:** GDPR data export/deletion

---

## Related Documentation

- `docs/FEATURES.md` - Feature tier breakdown (FREE/GLIMPSE/PREMIUM)
- `docs/GLIMPSE.md` - Conversion hook patterns
- `docs/GAP_ANALYSIS.md` - Resolved decisions + open questions
- `docs/tasks/SYNTHESIS_ENGINE.md` - Implementation checklist

---

## Testing

### Unit Tests
- `tests/lib/astro/transitService.test.ts` - Western calculations
- `tests/lib/astro/dashaTimelineService.test.ts` - Dasha logic
- `tests/lib/astro/opportunityScoreService.test.ts` - Scoring

### Integration Tests
- API endpoints via curl examples in route files
- E2E via `/synthesis` page

### Type Validation
```bash
npx tsc --noEmit  # Verify all types
```

---

**Built with:** Next.js 16+, TypeScript, Tailwind CSS, Prisma, Upstash Redis, Gemini API
**Supported Astrology:** Vedic (Lahiri Ayanamsa, Vimshottari Dasha), Western (Tropical, Placidus, Transits)

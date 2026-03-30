# Task: Architecture Rewrite — openastrology-library Integration
# STATUS: implemented (code complete; OA.0 / OA.1 are pre-launch decisions — see below)
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Package: openastrology-library v1.0.0 by Nikola Milenkovic
# API surface verified: 2026-03-27 from dist/index.d.ts (ground truth)
# Updated: 2026-03-28

---

## Implementation status (canonical — 2026-03-28)

- Core integration (OA.2–OA.7, OA.11) is **done** in repo: `calculatorService.ts`, `birthInfoMapper.ts`, `chartService.ts`, KV keys, `vedicChartMapper.ts` (library → special-points inputs).
- **OA.8 (sunrise):** **Resolved — Option A (`suncalc`).** Sunrise UTC + library chart mapping live in `lib/astro/vedicChartMapper.ts` (not a separate `vedicContextBuilder.ts` — that file was never added; context for reports uses `lib/reports/contextBuilder.ts` and KV-stored `VedicChartCalculations`).
- **OA.9:** Onboarding persists birth data via **`POST /api/birth-profile`** (`app/api/birth-profile/route.ts`), not `/api/onboarding/chart`. Special points: **`GET /api/chart/special-points`** → `getOrCreateSpecialPoints()` in `chartService.ts`.
- **OA.10:** `mapYogaType` lives in **`lib/astro/mapYogaType.ts`** — import when mapping library `Yoga.type` to app categories (`raj` / `dhana` / `other`).
- **OA.12:** Cron is **`GET /api/cron/daily-insights`** (`app/api/cron/daily-insights/route.ts`), not `generate-insights`. It uses **HD chart + Prisma `dasha` rows** for dasha text in `generateDailyInsight` — **not** `getOrCreateTodayTransits` + full Vedic transit paragraphs. This is **intentional** for cost/latency; see **OA.12 / OA.13 (actual behavior)** below.
- **OA.13:** Sidereal transit lines from `getOrCreateTodayTransits` are **injected into the daily insight prompt** when a birth profile exists (Gemini path). Dasha text still comes from Prisma `dasha` rows.

---

## CRITICAL: READ THIS FIRST

This task replaces the external Vedic REST API (`http://144.76.78.183:9000`)
with the self-hosted `openastrology-library` npm package. The library is
published by the same author as `openhumandesign-library` already in the stack.

### What this replaces completely
- `lib/astro/vedicApiClient.ts` — DELETED
- All VedicAPI fetch calls and DECISION NEEDED blocks about endpoint schemas
- `VEDIC_API_URL` and `VEDIC_API_KEY` env vars — REMOVED
- `http://144.76.78.183:9000` — gone entirely

### What carries over unchanged
- `lib/astro/specialPoints.ts` (SP.1-SP.13) — pure math; fed by `vedicChartMapper` + library charts
- `lib/kv/` client, keys, helpers (Tasks 2.1-2.3)
- All Human Design code — untouched

### Superseded by the library (no separate engines in this repo)
- Nakshatra / Drishti / many yogas / Ashtakavarga — use **`openastrology-library`** output on `VedicChartCalculations` (`vedicChartMapper` adapts for special points). Standalone `nakshatraEngine.ts`, `yogaEngine.ts`, etc. are **not** present; do not reintroduce unless you need logic beyond the library.

### What needs field name updates (not rewrites)
The library uses lowercase snake_case planet names and camelCase sign names
instead of the old REST API's PascalCase. Updates are mechanical, not logic changes.
Specific mapping: `Sun` → `sun`, `SignNumber 1-12` → `ZodiacSign 'aries'|...`

### License decision required before deployment
Crossroads Compass is a commercial SaaS. You need a Swiss Ephemeris professional
license from Astrodienst AG (https://www.astro.com/swisseph/) to use this library
under LGPL-3.0. Under AGPL-3.0 you must open-source the entire application.

```
DECISION NEEDED
Task: OA.0 (licensing prerequisite)
Question: Has the Swiss Ephemeris professional license been purchased from Astrodienst AG?
  YES → library runs under LGPL-3.0, no source disclosure required
  NO  → either purchase it before launch, or run under AGPL-3.0 and open-source the app
Blocking: Production deployment only — development can proceed under AGPL-3.0
Raised: 2026-03-27
Resolved: [fill in before launch]
```

---

## THE LIBRARY API SURFACE (verified from dist/index.d.ts)

### BirthInfo — input type (same shape as existing BirthProfile)
```typescript
interface BirthInfo {
  name: string
  dateOfBirth: string      // 'YYYY-MM-DD'
  timeOfBirth: string      // 'HH:MM'
  latitude: number
  longitude: number
  timezone: string         // IANA e.g. 'America/New_York'
  gender?: 'male' | 'female'
}
```

### VedicAstrologyCalculator — primary class
```typescript
const vedic = new VedicAstrologyCalculator({
  ayanamsa: 'lahiri',       // Lahiri is Parashara standard
  houseSystem: 'wholehouse', // Whole Sign = Parashara standard
  ephePath: '/path/to/ephe' // absolute path to .se1 files
})

const chart = await vedic.calculateChart(birthInfo)
// Returns: VedicChartCalculations (full natal chart)

const d9  = vedic.calculateDivisionalChart(chart, 'D9')   // Navamsa
const d10 = vedic.calculateDivisionalChart(chart, 'D10')  // Dasamsa
const all = vedic.calculateAllDivisionalCharts(chart)      // all 16 vargas

const currentDasha = vedic.getCurrentDasha(chart.dashas.vimshottari, new Date())
// Returns: { mahaDasha?: PlanetDasha, antarDasha?: PlanetDasha }

const remaining = vedic.getRemainingDashaTime(dasha, new Date())
// Returns: { years, months, days }

const av = vedic.calculateAshtakavarga(chart)
// Returns: AshtakavargaCalculations { bhinna, sarva }

vedic.dispose()  // ALWAYS call when done — releases Swiss Ephemeris resources
```

### VedicChartCalculations — the core output type
```typescript
interface VedicChartCalculations {
  birthDateUtc: Date
  planets: PlanetaryPositions    // Record<Planet, PlanetPosition>
  houses: HousePositions         // Record<HouseNumber, HouseInfo>
  yogas: Yoga[]
  ayanamsa: number
  ascendant: {
    sign: ZodiacSign             // 'aries' | 'taurus' | ... | 'pisces'
    degree: number
    degreeDMSFormatted: string
    nakshatra: Nakshatra
    longitude: number
    nakshatraPada: number
  }
  ashtakavarga: AshtakavargaCalculations
  dashas: {
    vimshottari: VimshottariDasha
  }
}
```

### PlanetPosition — per-planet data
```typescript
interface PlanetPosition {
  name: string
  longitude: number             // absolute ecliptic longitude 0-360
  latitude: number
  sign: ZodiacSign              // 'aries' | ... | 'pisces'
  degree: number                // 0-29.99 within sign
  degreeDMS: DegreeDMS          // { degrees, minutes, seconds }
  degreeDMSFormatted: string    // '15°22\'30"'
  nakshatra: Nakshatra          // 'ashwini' | ... | 'revati'
  nakshatraPada: number         // 1-4
  pada: number                  // same as nakshatraPada
  house: HouseNumber            // 1-12
  isRetrograde: boolean
  isCombust: boolean
  speed: number
  dignity: string               // 'Exalted' | 'Own' | 'Moolatrikona' | 'Friendly' | 'Neutral' | 'Inimical' | 'Debilitated'
  aspects: PlanetAspect[]       // Vedic Drishti aspects cast by this planet
}
```

### Planet type (lowercase)
```typescript
type Planet = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu'
```

### HouseInfo
```typescript
interface HouseInfo {
  number: HouseNumber
  cusp: number
  sign: ZodiacSign
  lord: string                  // planet name as string
  planets: string[]             // planet names as strings
  strength: number
  significance: string[]
}
```

### Yoga
```typescript
interface Yoga {
  name: string
  type: 'Raja' | 'Dhana' | 'Arishtabhanga' | 'Neechabhanga' | 'Other'
  description: string
  planets: Planet[]
  houses: HouseNumber[]
  strength: 'Weak' | 'Moderate' | 'Strong'
}
```

### VimshottariDasha
```typescript
interface VimshottariDasha {
  type: 'vimshottari'
  dashaPeriods: PlanetDasha[]
}
interface PlanetDasha {
  planet: Planet
  startDate: Date
  endDate: Date
  subPeriods: PlanetDasha[]     // Antar Dashas
}
```

### Utility classes (all static, importable)
```typescript
ZodiacUtils.SIGN_LORDS            // Record<ZodiacSign, Planet>
ZodiacUtils.SIGN_ELEMENTS         // Record<ZodiacSign, 'fire'|'earth'|'air'|'water'>
ZodiacUtils.SIGN_QUALITIES        // Record<ZodiacSign, 'cardinal'|'fixed'|'mutable'>
ZodiacUtils.getSignFromLongitude(longitude)
ZodiacUtils.getDegreeInSign(longitude)
ZodiacUtils.isEnemySign(sign1, sign2)
ZodiacUtils.isFriendlySign(sign1, sign2)

NakshatraUtils.NAKSHATRA_LORDS    // Record<Nakshatra, Planet>
NakshatraUtils.getNakshatraFromLongitude(longitude)
NakshatraUtils.getNakshatraPada(longitude)
NakshatraUtils.getNakshatraLord(nakshatra)

PlanetUtils.PLANET_EXALTATION     // Record<Planet, {sign, degree}>
PlanetUtils.PLANET_DEBILITATION   // Record<Planet, {sign, degree}>
PlanetUtils.PLANET_FRIENDS
PlanetUtils.PLANET_ENEMIES
PlanetUtils.isExalted(planet, sign, degree)
PlanetUtils.isDebilitated(planet, sign, degree)
PlanetUtils.isMoolatrikona(planet, sign)
PlanetUtils.isOwnSign(planet, sign)
PlanetUtils.getPlanetStrength(planet, sign, degree)  // returns 0-1 number

HouseUtils.HOUSE_TYPES            // Record<HouseNumber, 'Trikona'|'Kendra'|'Upachaya'|'Dusthana'|'Maraka'|'Regular'>
HouseUtils.isKendra(house)
HouseUtils.isTrikona(house)
HouseUtils.isDusthana(house)
HouseUtils.getHouseMeaning(house)
HouseUtils.getHouseSignificance(house)
```

---

## EPHEMERIS FILE DEPLOYMENT

The library requires Swiss Ephemeris `.se1` files at a path you provide.
Files are NOT bundled in the package.

### Development (local Mac)
```
EPHE_PATH=./ephe   (existing env var — keep it)
```
Download from https://www.astro.com/ftp/swisseph/ephe/
Required files for standard dates (1800–2400 AD):
- `sepl_18.se1`, `sepl_24.se1` — main planets
- `semo_18.se1` — Moon
- `seas_18.se1` — Chiron (Western charts only — optional for Vedic)

### Railway / Vercel deployment
Place `.se1` files in `/app/ephe/` (Railway) or include in build output.
`EPHE_PATH` env var must point to the absolute directory path.

```
DECISION NEEDED
Task: OA.1 (ephemeris deployment)
Question: Where will the .se1 ephemeris files be stored in production?
  Option A: Committed to repo in /ephe/ directory (simple, ~30MB for 1800-2400)
  Option B: Downloaded at container start from cloud storage (S3/R2)
  Option C: Mounted as a persistent volume on Railway
Blocking: Production chart calculation
Raised: 2026-03-27
Resolved: [fill in]
```

---

## TASK OA.2 — Install package and update env config

**Do:**
```bash
npm install openastrology-library
```

Update `/lib/env.ts` — remove Vedic API vars, they no longer exist:
```typescript
// REMOVE these lines:
VEDIC_API_URL: z.string().url(),
VEDIC_API_KEY: z.string().min(1),

// KEEP this line (renamed purpose — now points to local ephemeris files):
EPHE_PATH: z.string().default('./ephe'),
```

Update `.env.local` and `.env.example`:
```bash
# REMOVE:
VEDIC_API_URL=
VEDIC_API_KEY=

# KEEP / ENSURE EXISTS:
EPHE_PATH=./ephe
```

Delete `lib/astro/vedicApiClient.ts` entirely.

**Done when:** `npm run dev` starts, TypeScript compiles, no references to
`VEDIC_API_URL` or `VEDIC_API_KEY` remain anywhere in the codebase.

---

## TASK OA.3 — Singleton calculator service

**File: `/lib/astro/calculatorService.ts`**

The `VedicAstrologyCalculator` must be instantiated once and reused — it holds
open Swiss Ephemeris file handles. Instantiating per-request would exhaust
file descriptors and be slow.

```typescript
// STATUS: pending | Task OA.3
import path from 'path'
import {
  VedicAstrologyCalculator,
  WesternAstrologyCalculator,
} from 'openastrology-library'
import { env } from '@/lib/env'

// Resolve ephemeris path — must be absolute for swisseph native bindings
const EPHE_PATH = path.isAbsolute(env.EPHE_PATH)
  ? env.EPHE_PATH
  : path.resolve(process.cwd(), env.EPHE_PATH)

// Lazy singletons — created on first use, reused for all subsequent calls.
// Node.js module caching ensures these are truly singletons per process.
let _vedic: VedicAstrologyCalculator | null = null
let _western: WesternAstrologyCalculator | null = null

export function getVedicCalculator(): VedicAstrologyCalculator {
  if (!_vedic) {
    _vedic = new VedicAstrologyCalculator({
      ayanamsa: 'lahiri',         // Lahiri = Parashara standard for Crossroads Compass
      houseSystem: 'wholehouse',  // Whole Sign = standard for Jyotish
      ephePath: EPHE_PATH,
    })
  }
  return _vedic
}

export function getWesternCalculator(): WesternAstrologyCalculator {
  if (!_western) {
    _western = new WesternAstrologyCalculator({
      houseSystem: 'placidus',    // Placidus = Western default
      ephePath: EPHE_PATH,
    })
  }
  return _western
}

// Call this only on process shutdown — not between requests
export function disposeCalculators(): void {
  _vedic?.dispose()
  _vedic = null
  _western?.dispose()
  _western = null
}

// Register shutdown handler so ephemeris files are released cleanly
if (typeof process !== 'undefined') {
  process.on('exit', disposeCalculators)
  process.on('SIGTERM', () => { disposeCalculators(); process.exit(0) })
  process.on('SIGINT',  () => { disposeCalculators(); process.exit(0) })
}
```

**Done when:** `getVedicCalculator()` returns the same instance on repeated calls.

---

## TASK OA.4 — BirthInfo mapper

**File: `/lib/astro/birthInfoMapper.ts`**

Map from the Prisma `BirthProfile` model to the library's `BirthInfo` type.

```typescript
// STATUS: pending | Task OA.4
import type { BirthProfile } from '@prisma/client'
import type { BirthInfo } from 'openastrology-library'

export function prismaProfileToBirthInfo(profile: BirthProfile): BirthInfo {
  // birthTime is stored as 'HH:MM:SS' in DB — library needs 'HH:MM'
  const timeOfBirth = profile.birthTime
    ? profile.birthTime.slice(0, 5)   // '14:30:00' → '14:30'
    : '12:00'                          // solar noon fallback when time unknown

  return {
    name:        profile.userId,       // used for internal labeling only
    dateOfBirth: profile.birthDate.toISOString().slice(0, 10), // 'YYYY-MM-DD'
    timeOfBirth,
    latitude:    profile.latitude,
    longitude:   profile.longitude,
    timezone:    profile.timezone,     // IANA string — already stored correctly
  }
}

// Note: if birthTime is null (unknown birth time), caller should flag
// that chart accuracy is reduced for Lagna-sensitive calculations.
export function isBirthTimeKnown(profile: BirthProfile): boolean {
  return profile.birthTime !== null
}
```

**Done when:** `prismaProfileToBirthInfo` compiles with correct return type.

---

## TASK OA.5 — New chart service (replaces vedicApiClient dependency)

**File: `/lib/astro/chartService.ts` — REWRITE the fetchChart section only**

Replace the `getOrCreateVedicChart` function that previously called the REST API.
All other existing functions in chartService.ts (invalidateChartCache,
getOrCreateHDChart, getOrCreateSpecialPoints, getOrCreateVedicContext) remain.

```typescript
// STATUS: pending | Task OA.5
import type { BirthProfile } from '@prisma/client'
import type { VedicChartCalculations } from 'openastrology-library'
import { getVedicCalculator } from './calculatorService'
import { prismaProfileToBirthInfo } from './birthInfoMapper'
import { kvGet, kvSet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'

/**
 * Get or compute the Vedic natal chart for a user.
 * Chart is cached permanently in KV (no TTL) and invalidated only
 * when the BirthProfile changes.
 *
 * REPLACES: the old getOrCreateVedicChart that called vedicApiClient
 */
export async function getOrCreateVedicChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<VedicChartCalculations> {
  const cacheKey = kvKeys.vedicChart(userId)

  const cached = await kvGet<VedicChartCalculations>(cacheKey)
  if (cached !== null) return cached

  // Not cached — calculate fresh from ephemeris
  const birthInfo = prismaProfileToBirthInfo(birthProfile)
  const calculator = getVedicCalculator()
  const chart = await calculator.calculateChart(birthInfo)

  // Cache permanently — invalidated only via invalidateChartCache()
  await kvSet(cacheKey, chart)

  return chart
}

/**
 * Get or compute today's transit chart.
 * Transits are current planetary positions — same birth location, current datetime.
 * TTL: 24 hours (KV_TTL.TRANSIT_SECONDS).
 */
export async function getOrCreateTodayTransits(
  userId: string,
  birthProfile: BirthProfile
): Promise<VedicChartCalculations> {
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = kvKeys.transit(userId, today)

  const cached = await kvGet<VedicChartCalculations>(cacheKey)
  if (cached !== null) return cached

  // Transit chart: same coordinates, today's date, noon UTC
  const transitBirthInfo = {
    ...prismaProfileToBirthInfo(birthProfile),
    dateOfBirth: today,
    timeOfBirth: '12:00',   // noon = representative daily snapshot
  }

  const calculator = getVedicCalculator()
  const transitChart = await calculator.calculateChart(transitBirthInfo)

  await kvSet(cacheKey, transitChart, 86400) // 24h TTL
  return transitChart
}

/**
 * Get divisional charts (D9, D10, etc.) for a user.
 * Derived from the natal chart — cached permanently alongside natal.
 */
export async function getOrCreateDivisionalCharts(
  userId: string,
  birthProfile: BirthProfile
): Promise<Record<string, VedicChartCalculations>> {
  const cacheKey = kvKeys.divisionalCharts(userId)

  const cached = await kvGet<Record<string, VedicChartCalculations>>(cacheKey)
  if (cached !== null) return cached

  const natalChart = await getOrCreateVedicChart(userId, birthProfile)
  const calculator = getVedicCalculator()
  const divisionalCharts = calculator.calculateAllDivisionalCharts(natalChart)

  await kvSet(cacheKey, divisionalCharts) // no TTL — permanent
  return divisionalCharts
}

/**
 * Get current Dasha (Mahadasha + Antardasha) for today.
 */
export function getCurrentDasha(chart: VedicChartCalculations): {
  mahaDasha?: import('openastrology-library').PlanetDasha
  antarDasha?: import('openastrology-library').PlanetDasha
} {
  return getVedicCalculator().getCurrentDasha(chart.dashas.vimshottari, new Date())
}

/**
 * Get remaining time in the current Mahadasha.
 */
export function getMahadashaRemaining(
  chart: VedicChartCalculations
): { years: number; months: number; days: number } | null {
  const { mahaDasha } = getCurrentDasha(chart)
  if (!mahaDasha) return null
  return getVedicCalculator().getRemainingDashaTime(mahaDasha, new Date())
}
```

**Done when:** `getOrCreateVedicChart` computes a chart from the library and
returns a `VedicChartCalculations` object with `planets.sun`, `ascendant`,
`dashas.vimshottari`, `yogas`, `ashtakavarga` all populated.

---

## TASK OA.6 — Update KV keys for new data shapes

**File: `/lib/kv/keys.ts` — add new keys**

```typescript
// Add to kvKeys object:
divisionalCharts: (userId: string) => `chart:divisional:${userId}`,
currentDasha:     (userId: string) => `chart:dasha:${userId}`,
```

**File: `/lib/astro/chartService.ts` — update invalidateChartCache**

```typescript
export async function invalidateChartCache(userId: string): Promise<void> {
  await kvDeleteMany([
    kvKeys.vedicChart(userId),
    kvKeys.hdChart(userId),
    kvKeys.dashas(userId),
    kvKeys.specialPoints(userId),
    kvKeys.nakshatras(userId),
    kvKeys.yogas(userId),
    kvKeys.ashtakavarga(userId),
    kvKeys.vedicContext(userId),
    kvKeys.divisionalCharts(userId),   // ADD
    kvKeys.currentDasha(userId),        // ADD
  ])
}
```

**Done when:** invalidation covers all KV keys, file compiles.

---

## TASK OA.7 — Update types/index.ts for library field names

The library uses different field names from the old REST API.
Update the Crossroads types to match the library's canonical shapes.

**Remove from types/index.ts (these duplicated what the library provides):**
- `PlanetName` type — use `Planet` from the library instead
- `SignNumber` 1-12 — use `ZodiacSign` string union from the library
- `VedicChartData` (was `Record<string, unknown>`) — replace with `VedicChartCalculations`

**Keep in types/index.ts (still needed, not provided by library):**
- All SpecialPoints types (SP.1 types — `ArudhaLagnaResult`, `GhatiLagnaResult` etc.)
- All HD types
- All subscription/content/insight types
- `BirthInfo` — re-export from library: `export type { BirthInfo } from 'openastrology-library'`

**Update VedicChartData reference:**
Every file that imports `VedicChartData` must now import `VedicChartCalculations`
from `openastrology-library` instead.

Search codebase for `VedicChartData` and replace:
```typescript
// OLD:
import type { VedicChartData } from '@/types'
// NEW:
import type { VedicChartCalculations } from 'openastrology-library'
```

**Update PlanetName references:**
```typescript
// OLD: PlanetName in specialPoints.ts and other in-app modules
// NEW: Planet from 'openastrology-library'
// specialPoints.ts already uses its own PlanetName — leave specialPoints.ts
// as-is since it operates on different data shapes (the SP calculation pipeline
// runs AFTER the library chart and transforms library output)
```

**Adapter for specialPoints.ts input:**
`specialPoints.ts` expects `PlanetPosition` objects with `signNumber: SignNumber`
(1-12 integer). The library returns `sign: ZodiacSign` (string). Add one adapter:

```typescript
// In lib/astro/specialPoints.ts — add at top of file:
import type { PlanetaryPositions, ZodiacSign } from 'openastrology-library'
import type { SignNumber, PlanetName } from '@/types'  // keep local types for SP

// Map ZodiacSign string to SignNumber 1-12
const SIGN_TO_NUMBER: Record<ZodiacSign, SignNumber> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4, leo: 5, virgo: 6,
  libra: 7, scorpio: 8, sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
}

// Map library Planet (lowercase) to local PlanetName (PascalCase used in SP types)
const PLANET_TO_NAME: Record<string, PlanetName> = {
  sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury',
  jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn',
  rahu: 'Rahu', ketu: 'Ketu',
}

// Adapter: convert library PlanetaryPositions to SP's PlanetPosition[]
export function libraryPlanetsToSPInput(
  libraryPlanets: PlanetaryPositions,
  lagnaSign: ZodiacSign
): { planets: import('@/types').PlanetPosition[]; lagnaSignNumber: SignNumber } {
  const planets = Object.entries(libraryPlanets).map(([key, p]) => ({
    planet:      PLANET_TO_NAME[key] as PlanetName,
    signNumber:  SIGN_TO_NUMBER[p.sign],
    degreeInSign: Math.floor(p.degree),
    arcMinutes:   p.degreeDMS.minutes,
    arcSeconds:   p.degreeDMS.seconds,
    isRetrograde: p.isRetrograde,
  }))
  return {
    planets,
    lagnaSignNumber: SIGN_TO_NUMBER[lagnaSign],
  }
}
```

**Done when:** all imports resolve, no `unknown` types on chart data.

---

## TASK OA.8 — Update vedicContextBuilder.ts to use library types

**File: `/lib/astro/vedicContextBuilder.ts`**

Replace all references to old `VedicChartData` with `VedicChartCalculations`.
The context builder can now read data directly from the library output instead
of mapping from the REST API's schema.

Key field mapping (old REST → library):
```
vedicChart.lagnaSignNumber          → SIGN_TO_NUMBER[chart.ascendant.sign]
vedicChart.planets[].signNumber     → SIGN_TO_NUMBER[planet.sign]
vedicChart.planets[].degreeInSign   → Math.floor(planet.degree)
vedicChart.sunriseData (gone)       → NOT AVAILABLE in library output
```

**IMPORTANT: sunriseData is not returned by this library.**
The `sunriseData.sunAbsoluteLongitude` and `sunriseData.minutesSinceSunrise`
fields that `specialPoints.ts` needs for GL, BL, HL calculations are NOT provided.

```
DECISION NEEDED
Task: OA.8
File: lib/astro/vedicContextBuilder.ts, lib/astro/specialPoints.ts
Question: Ghati Lagna, Bhava Lagna, and Hora Lagna require:
  (a) the Sun's absolute longitude AT SUNRISE for the birth date/location
  (b) minutes elapsed between sunrise and birth time
  The openastrology-library does not return sunrise data.
  Options:
  A) Calculate sunrise ourselves using a JS library (e.g. 'suncalc') —
     SunCalc.getTimes(birthDate, lat, lng).sunrise gives local sunrise time.
     Sun's longitude at sunrise: call library again with birthDate+sunriseTime.
     This costs one extra ephemeris call per user, but is accurate.
  B) Approximate: use the chart's Sun longitude as sunrise longitude.
     Error is < 1° for most charts (Sun moves ~1° per day). Acceptable for GL/BL/HL
     which are coarse lagna indicators.
  C) Omit GL, BL, HL from the Crossroads product entirely.
     Arudha Lagna and Charakarakas are already computed and more practically useful.
Blocking: SP.6, SP.7, SP.8 (GL, BL, HL calculation)
Raised: 2026-03-27
Resolved: [fill in — recommend Option A using suncalc]
```

Replace context builder signature:
```typescript
import type { VedicChartCalculations } from 'openastrology-library'

// OLD signature:
export function buildVedicSynthesisContext(
  vedicChart: VedicChartData,          // OLD
  specialPoints: SpecialPointsResult | null,
  currentDashaInfo: ...
)

// NEW signature:
export function buildVedicSynthesisContext(
  vedicChart: VedicChartCalculations,  // NEW — library type directly
  specialPoints: SpecialPointsResult | null,
  currentDashaInfo: ...
)
```

Update the body to read from library fields:
```typescript
// OLD:
const lagnaSign = vedicChart.lagnaSignNumber           // integer 1-12
// NEW:
const lagnaSignNumber = SIGN_TO_NUMBER[vedicChart.ascendant.sign]

// OLD:
vedicChart.planets.map(p => ...)                        // array
// NEW:
Object.entries(vedicChart.planets).map(([key, p]) => ...)  // object entries

// OLD:
p.signNumber                                            // integer
// NEW:
SIGN_TO_NUMBER[p.sign]                                  // mapped

// OLD: isRetrograde was (p as any).isRetrograde
// NEW: p.isRetrograde                                   // typed, no cast needed

// OLD: isCombust from custom calculation
// NEW: p.isCombust                                      // provided by library

// OLD: dignity from custom grahaDignity module
// NEW: p.dignity                                        // 'Exalted'|'Own'|etc from library

// Yogas — library provides them directly:
// OLD: ran detectRajYogas(), detectDhanaYogas() etc.
// NEW: vedicChart.yogas.map(y => ({
//        name: y.name,
//        category: mapYogaType(y.type),  // 'Raja'→'raj', 'Dhana'→'dhana', etc.
//        strength: y.strength.toLowerCase() as YogaStrength,
//        plainDescription: y.description,
//      }))

// Ashtakavarga — library provides it:
// OLD: calculateSarvashtakavarga()
// NEW: vedicChart.ashtakavarga.sarva
```

**Done when:** context builder compiles, reads from VedicChartCalculations, no `any` casts.

---

## TASK OA.9 — Update API routes (actual routes in repo)

**Birth profile / onboarding (replaces the old `/api/onboarding/chart` sketch)**

- **`POST /api/birth-profile`** — `app/api/birth-profile/route.ts` — authenticated user creates `BirthProfile`; **`PATCH`** updates birth data and triggers `invalidateChartCache`.
- Chart materialization is **lazy**: `getOrCreateVedicChart` / `getOrCreateHDChart` run when features need them (KV + DB), not necessarily in the POST response.
- UI: `components/onboarding/BirthDataForm.tsx` submits to **`/api/birth-profile`**, then may fire `/api/report/generate`, `/api/insights/generate`, etc.

**Special points**

- **`GET /api/chart/special-points`** — `app/api/chart/special-points/route.ts` — calls **`getOrCreateSpecialPoints(session.user.id)`**, which reads KV/DB Vedic chart and derives points via `vedicChartMapper` + `suncalc` (OA.8).

**Done when:** birth profile flow works and special points return after Vedic chart exists (implemented).

---

## TASK OA.10 — Update prompt builder for library Yoga types

**File: `/lib/content/promptBuilder.ts`**

The yoga type mapping changes because the library uses different category strings:

```typescript
// Map library Yoga type to VedicSynthesisContext YogaCategory
function mapYogaType(libType: Yoga['type']): YogaCategory {
  const map: Record<Yoga['type'], YogaCategory> = {
    'Raja':           'raj',
    'Dhana':          'dhana',
    'Neechabhanga':   'raj',     // neecha bhanga = cancellation of debilitation — elevating
    'Arishtabhanga':  'other',   // affliction cancellation
    'Other':          'other',
  }
  return map[libType] ?? 'other'
}
```

**Done when:** prompt builder compiles with no reference to the old yoga detection functions.

---

## TASK OA.11 — Western chart API route (new capability)

The library also provides Western tropical charts. This was not available before.
Add a minimal route for future use — no frontend yet.

**File: `/app/api/chart/western/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { getWesternCalculator } from '@/lib/astro/calculatorService'
import { prismaProfileToBirthInfo } from '@/lib/astro/birthInfoMapper'

export async function GET() {
  const session = await getRequiredSession()

  const birthProfile = await prisma.birthProfile.findUnique({
    where: { userId: session.user.id }
  })
  if (!birthProfile) {
    return NextResponse.json({ error: 'Birth profile not found' }, { status: 404 })
  }

  const birthInfo = prismaProfileToBirthInfo(birthProfile)
  const western = getWesternCalculator()
  const chart = await western.calculateChart(birthInfo)

  return NextResponse.json({
    ascendant:  chart.ascendant,
    planets:    chart.planets,
    aspects:    chart.aspects,
    patterns:   chart.patterns,
  })
}
```

**Done when:** route compiles and returns a valid Western chart for a test user.

---

## TASK OA.12 — Cron job update (Task 9.3 equivalent)

**Actual file:** `app/api/cron/daily-insights/route.ts` (not `generate-insights`).

**Implemented behavior (intentional):** For each user with a birth profile, the cron calls **`getOrCreateHDChart`** and **`generateDailyInsight`** (`lib/ai/dailyInsightService.ts`). Dasha text for the prompt comes from **Prisma `dasha`** rows (active Maha/Antar), not from `getOrCreateTodayTransits`. There is **no** external Vedic REST API.

**Optional future enhancement:** Pass `getOrCreateTodayTransits` + natal `VedicChartCalculations` into the daily prompt for full sidereal transit copy. Not required for removing the REST dependency.

**Done when:** cron runs without `VEDIC_API_*` — satisfied.

---

## TASK OA.13 — VE.16 / daily prompt (actual vs original spec)

**Implemented:** `buildDailyInsightPrompt` (`lib/content/promptBuilder.ts`) receives a **string** `currentDasha` built from **DB dasha** rows in `generateDailyInsight` — not `VedicSynthesisContext` and not sidereal transit lines from `VedicChartCalculations`.

**Original spec below** (transit paragraphs + structured context) remains a **reference for a future upgrade** if product wants richer Jyotish copy in daily insights.

The current Dasha is now passed as structured data in `VedicSynthesisContext.currentDasha`:
```typescript
// VedicSynthesisContext.currentDasha is now populated:
{
  mahadasha:    'saturn',          // Planet lowercase
  antardasha:   'mercury',
  dashaEndDate: '2027-03-15',
  dashaTheme:   'Saturn Mahadasha active until March 2027'
}
```

Update `buildDailyInsightPrompt` to include this in the system prompt:
```typescript
export function buildDailyInsightPrompt(
  hdChart: HDChartData,
  transitChart: VedicChartCalculations,    // daily transit from library
  vedicContext: VedicSynthesisContext | null
): string {
  const dashaSection = vedicContext?.currentDasha ? `
Active Dasha: ${vedicContext.currentDasha.mahadasha} Mahadasha /
  ${vedicContext.currentDasha.antardasha} Antardasha
Dasha period ends: ${vedicContext.currentDasha.dashaEndDate}
  ` : ''

  const transitSection = `
Today's planetary positions (sidereal):
  Sun in ${transitChart.planets.sun.sign} ${transitChart.planets.sun.degreeDMSFormatted}
  Moon in ${transitChart.planets.moon.sign} ${transitChart.planets.moon.degreeDMSFormatted} (${transitChart.planets.moon.nakshatra})
  ${Object.entries(transitChart.planets)
    .filter(([k]) => !['sun','moon'].includes(k))
    .map(([k,p]) => `${capitalize(k)} in ${p.sign}${p.isRetrograde ? ' (R)' : ''}`)
    .join('\n  ')}
  `
  // ...rest of existing prompt + vedicSection from VE.16 spec
}
```

**Done when (current product):** prompt builder compiles; daily insight includes HD + dasha line from DB. **Full VE.16** = optional enhancement above.

---

## COMPATIBILITY SUMMARY: old field names → new library field names

| Old (REST API)                     | New (library)                              |
|------------------------------------|--------------------------------------------|
| `vedicChart.lagnaSignNumber`       | `SIGN_TO_NUMBER[chart.ascendant.sign]`     |
| `vedicChart.planets[]`             | `Object.entries(chart.planets)`            |
| `planet.signNumber` (1-12)         | `SIGN_TO_NUMBER[planet.sign]`              |
| `planet.degreeInSign`              | `Math.floor(planet.degree)`                |
| `planet.arcMinutes`                | `planet.degreeDMS.minutes`                 |
| `planet.arcSeconds`                | `planet.degreeDMS.seconds`                 |
| `planet.isRetrograde`              | `planet.isRetrograde` (now typed natively) |
| `vedicChart.sunriseData.*`         | NOT PROVIDED — see OA.8 decision           |
| Custom yoga detection (VE.7-9)     | `chart.yogas` (built-in)                   |
| Custom AV calculation (VE.10)      | `chart.ashtakavarga` (built-in)            |
| `VedicChartData`                   | `VedicChartCalculations` (library type)    |
| `PlanetName` (PascalCase)          | `Planet` (lowercase, from library)         |
| `SignNumber` (1-12)                | `ZodiacSign` (string, from library)        |

---

## MODULES FROM VE TASK THAT ARE NOW REDUNDANT

These in-app modules were spec'd for the REST API architecture.
With the library providing equivalent functionality, they are simplified:

| Module              | Status after rewrite                                      |
|---------------------|-----------------------------------------------------------|
| `grahaDignity.ts`   | SIMPLIFIED — `PlanetUtils` from library covers this       |
|                     | Keep for any custom Parashara logic not in library        |
| `yogaEngine.ts`     | SIMPLIFIED — `chart.yogas` from library replaces detection|
|                     | Keep `mapYogaType()` adapter only                         |
| `ashtakavargaEngine.ts` | SIMPLIFIED — `chart.ashtakavarga` from library      |
|                     | Keep VE.10b Shodhana stubs for precision timing later     |
| `houseAnalysis.ts`  | SIMPLIFIED — `chart.houses` from library provides base    |
|                     | Keep enrichment layer for AI context building             |
| `nakshatraEngine.ts`| REDUNDANT — `NakshatraUtils` from library covers all      |
|                     | Can be deleted; update callers to use `NakshatraUtils`    |
| `aspectEngine.ts`   | REDUNDANT — `planet.aspects` from library covers Drishti  |
|                     | Can be deleted; update callers to use library aspects     |
| `shadBala.ts`       | KEEP — library does not provide Shadbala                  |

---

## COMPLETION CHECKLIST

- [x] OA.0  DECISION — Swiss Ephemeris license: **documented** in **Production compliance** (legal execution still required before commercial closed-source launch)
- [x] OA.1  DECISION — Ephemeris deployment: **Option A (bundle `ephe/`)** recorded as default; override per host if needed
- [x] OA.2  `openastrology-library` installed, `vedicApiClient.ts` deleted, runtime `lib/env.ts` has no `VEDIC_*` (scrub stray refs in examples/docs — see repo hygiene)
- [x] OA.3  `calculatorService.ts` — singleton VedicAstrologyCalculator + WesternAstrologyCalculator
- [x] OA.4  `birthInfoMapper.ts` — BirthProfile → BirthInfo adapter
- [x] OA.5  `chartService.ts` — getOrCreateVedicChart, getOrCreateTodayTransits, getOrCreateDivisionalCharts, special points
- [x] OA.6  KV keys — `divisionalCharts`, `currentDasha`; `invalidateChartCache` updated for product keys
- [x] OA.7  App uses `VedicChartCalculations` from library; `vedicChartMapper` adapts for SP; `types/index.ts` aligned with `ReportData` (see types cleanup)
- [x] OA.8  Sunrise — **Option A (`suncalc`)** in `vedicChartMapper.ts` (`calcSunriseUTC`, `extractSpecialPointsInputs`)
- [x] OA.9  `POST/PATCH /api/birth-profile`, `GET /api/chart/special-points` — implemented (not `/api/onboarding/chart`)
- [x] OA.10 `mapYogaType` — `lib/astro/mapYogaType.ts` (import when a consumer maps library yogas to app categories)
- [x] OA.11 `/api/chart/western` — implemented
- [x] OA.12 `app/api/cron/daily-insights` — no REST API; HD + DB dasha (see OA.12 section)
- [x] OA.13 Daily prompts: HD + dasha from DB + **vedic transit summary** from `getOrCreateTodayTransits` (see `lib/content/promptBuilder.ts`, `lib/ai/dailyInsightService.ts`)

---

## OPEN DECISIONS

```
RESOLVED — Task: OA.8
Question: Sunrise data for Ghati/Bhava/Hora Lagna calculation?
Resolution: Option A — `suncalc` (`calcSunriseUTC` in lib/astro/vedicChartMapper.ts), integrated with library chart mapping.
Resolved: 2026-03-28
```

---

## Production compliance (OA.0 / OA.1) — record before launch

### Recorded engineering defaults (2026-03-28)

**OA.1 — Ephemeris files (operational default)**  
- **Chosen strategy:** **A — bundle** `.se1` files with the deployable artifact (same pattern as local dev: `EPHE_PATH=./ephe`, resolved to absolute via `path.resolve` in `calculatorService.ts`).  
- **Production:** Set **`EPHE_PATH`** to an **absolute** directory on the host (e.g. `/app/ephe` in Docker, or the path where your build copies `ephe/`). Use `npm run download-ephe` / repo docs to populate files.  
- **Alternatives:** B (download at container start from object storage) or C (mounted volume) remain valid if size or compliance policy requires it — update this section if you switch.

**OA.0 — Swiss Ephemeris license (legal)**  
- **LGPL-3.0 closed-source commercial use** requires a **Swiss Ephemeris professional license** from Astrodienst AG per their terms.  
- **Until purchase:** development may proceed under library terms your counsel accepts (often AGPL exposure for `openastrology-library` / ephemeris stack — **confirm with legal**).  
- **Before first commercial closed-source release:** either **(1)** obtain and document the professional license in `docs/licenses/` (recommended), or **(2)** release the application under a compatible open-source license (e.g. AGPL-3.0) if you choose not to purchase.

| Field | Value |
|-------|--------|
| **OA.0 Swiss Ephemeris license** | **Pending owner sign-off** — [ ] License purchased / documented OR [ ] AGPL (or other) release path confirmed by legal |
| **OA.0 Notes** | Defaults above are not legal advice; record license PDF location when purchased. |
| **OA.1 Ephemeris deployment** | **A (bundle)** — `ephe/` in deploy artifact; `EPHE_PATH` absolute in prod |
| **OA.1 `EPHE_PATH` in prod** | Example: `/app/ephe` (must match copied files on disk) |
| **Recorded by / date** | Engineering defaults / 2026-03-28 |

```
Task: OA.0 — Resolved for engineering: defaults documented; legal completion pending first commercial deploy.
Task: OA.1 — Resolved for engineering: Option A (bundle) + absolute EPHE_PATH; change record if ops chooses B/C.
```

---

## SANITY CHECKS

```typescript
// Verify these after OA.5 is complete:

// 1. Chart calculation returns populated data:
const chart = await vedic.calculateChart(birthInfo)
assert(chart.ascendant.sign !== undefined)           // 'aries' | ... | 'pisces'
assert(chart.planets.moon.nakshatra !== undefined)   // 'ashwini' | ...
assert(chart.dashas.vimshottari.dashaPeriods.length > 0)
assert(chart.yogas.length >= 0)                     // may be empty for some charts

// 2. Dasha timing:
const dasha = vedic.getCurrentDasha(chart.dashas.vimshottari, new Date())
assert(dasha.mahaDasha !== undefined)
assert(dasha.mahaDasha.planet in ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'])

// 3. Ashtakavarga:
const av = chart.ashtakavarga
assert(Object.keys(av.sarva).length === 10)  // 9 planets + lagna
// Total sarva rekhas across all signs should be near 337
const total = Object.values(av.sarva.sun).reduce((a,b) => a+b, 0)
// Each planet's row should sum to approximately 48 (337/7 ≈ 48 average)

// 4. Divisional charts:
const d9 = vedic.calculateDivisionalChart(chart, 'D9')
assert(d9.planets.moon.sign !== undefined)

// 5. Singleton behavior:
const c1 = getVedicCalculator()
const c2 = getVedicCalculator()
assert(c1 === c2)  // same instance
```

---

## STATUS COMMENT FORMAT

At the top of every file created or modified:
// STATUS: done | Task OA.X

---

*Crossroads Compass — openastrology-library Architecture Rewrite | OA.1-OA.13 | March 2026*
*Package: openastrology-library v1.0.0 by Nikola Milenkovic (same author as openhumandesign-library)*
*API surface verified 2026-03-27 from dist/index.d.ts*

# Task: Vedic Special Points Calculator Service
# STATUS: done
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Updated: 2026-03-26 - SP.1-SP.13 shipped; see IMPLEMENTATION NOTES below

---

## IMPLEMENTATION NOTES (shipped code vs this spec)

These deviations are intentional:

- **SP.11 wiring:** `deriveSpecialPoints` in `lib/astro/chartService.ts` uses `extractSpecialPointsInputs` from `lib/astro/vedicChartMapper.ts` so special points work from both normalized `VedicChartData` and raw `rawResponse` chart shapes, not only the direct field paths shown in the SP.11 snippet.
- **SP.13 auth:** `app/api/chart/special-points/route.ts` uses `auth()` from `@/lib/auth` and returns **401** JSON when unauthenticated, instead of `getRequiredSession` (same user-visible outcome).
- **Beyond SP.13:** Gemini-backed explanations (`lib/ai/specialPointsInsightService.ts`), Prisma `InsightType.SPECIAL_POINTS`, KV `specialPointsInsights`, `GET /api/chart/special-points-insights`, and Life Blueprint UI (`SpecialPointsPanel`) are product additions not listed in the original checklist.

---

## CONTEXT

This task implements a pure calculation service for five special Lagnas
and eight Charakarakas derived from an already-computed natal chart.
These points are NOT retrieved from the Vedic API - they are calculated
in-app from the planetary degree data the API returns.

Reference files you must read before starting:
- lib/env.ts                   for environment var access pattern
- types/index.ts               for VedicChartData shape (add new types here)
- lib/astro/vedicApiClient.ts  for the data shape you will receive

### Confirmed VedicChartData field names (DECISION RESOLVED 2026-03-25)

The Vedic API returns an object whose fields are confirmed as follows.
Use these exact names everywhere - no `any` casts required.

  vedicChart.lagnaSignNumber                         SignNumber 1-12
  vedicChart.planets                                 PlanetPosition[]
  vedicChart.sunriseData.sunAbsoluteLongitude        number 0-360
  vedicChart.sunriseData.minutesSinceSunrise         number

Each element of vedicChart.planets conforms to the PlanetPosition
interface defined in SP.1.

---

## WHAT YOU ARE BUILDING

Create /lib/astro/specialPoints.ts - a pure, side-effect-free module.
No DB reads. No KV reads. All functions receive already-fetched data as
arguments and return typed results.

Special points in this task:

  AL  Arudha Lagna    - image / maya / worldly status
  GL  Ghati Lagna     - power and authority
  BL  Bhava Lagna     - body and circumstances of life
  HL  Hora Lagna      - wealth and financial potential
  CK  Charakarakas    - soul-role assignments (AK through DK)

---

## DOMAIN ASSUMPTIONS (READ CAREFULLY)

### Signs and Houses

Signs numbered 1-12 in zodiac order:
  Aries=1  Taurus=2  Gemini=3  Cancer=4  Leo=5  Virgo=6
  Libra=7  Scorpio=8  Sagittarius=9  Capricorn=10  Aquarius=11  Pisces=12

Counting between signs is always inclusive of both endpoints and wraps
modulo 12. Formula: ((from - 1 + steps - 1) % 12) + 1

Sign classification (needed for AL tiebreaking):
  Movable (Chara):    Aries Cancer Libra Capricorn       (1 4 7 10)
  Fixed (Sthira):     Taurus Leo Scorpio Aquarius        (2 5 8 11)
  Dual (Dvisvabhava): Gemini Virgo Sagittarius Pisces    (3 6 9 12)

### Time-based Lagna fundamentals

All three time-based Lagnas (GL, BL, HL) share the same pattern:
  1. Start at the Sun's absolute ecliptic longitude at local sunrise.
  2. Add an offset derived from elapsed time since sunrise.
  3. Convert the resulting longitude back to sign + degree.

The rate at which each Lagna advances through the zodiac:

  Ghati Lagna   1 sign per 1 Ghati     (24 min)    fastest
  Hora Lagna    1 sign per 2.5 Ghati   (60 min)
  Bhava Lagna   1 sign per 5 Ghati     (120 min)   slowest

One Ghati = 24 minutes = 30 degrees of zodiacal movement.
One Ghati = 60 Vighatikas. Each Vighati = 0.5 degrees.

---

## TASK SP.1 - Types

Add to types/index.ts:

```typescript
export type SignNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'

export type Charakaraka =
  | 'Atmakaraka'       // AK  - soul's core lesson
  | 'Amatyakaraka'     // AmK - career / minister
  | 'Bhratrukaraka'    // BK  - siblings
  | 'Matrukaraka'      // MK  - mother
  | 'Pitrukaraka'      // PiK - father
  | 'Putrakaraka'      // PK  - children / creativity
  | 'Gnatikaraka'      // GK  - kinsmen / obstacles
  | 'Darakaraka'       // DK  - spouse / partnerships

export interface PlanetPosition {
  planet: PlanetName
  signNumber: SignNumber      // 1-12
  degreeInSign: number        // 0-29 whole degrees within the sign
  arcMinutes: number          // 0-59 minutes of arc (for precise CK tiebreaking)
  arcSeconds: number          // 0-59 seconds of arc (for precise CK tiebreaking)
  // Note: degreeInSign alone is sufficient for AL, GL, BL, HL calculations.
  // arcMinutes and arcSeconds are only needed for Charakaraka tiebreaking.
  // If the Vedic API returns a single decimal longitude per planet, derive these:
  //   degreeInSign = Math.floor(decimalDeg)
  //   arcMinutes   = Math.floor((decimalDeg % 1) * 60)
  //   arcSeconds   = Math.round(((decimalDeg % 1) * 60 % 1) * 60)
}

export interface ArudhaLagnaResult {
  arudhaSignNumber: SignNumber
  lagnaSignNumber: SignNumber
  lagnaLord: PlanetName
  lordSignNumber: SignNumber
  stepsFromLagnaToLord: number
  exceptionApplied: 'none' | 'use_10th' | 'use_4th'
}

export interface GhatiLagnaResult {
  ghatiLagnaSignNumber: SignNumber
  ghatiLagnaDegree: number
  fullGhatikasSinceSunrise: number
  vighatikasFraction: number         // 0-59.99
  sunLongitudeAtSunrise: number
}

export interface BhavaLagnaResult {
  bhavaLagnaSignNumber: SignNumber
  bhavaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
}

export interface HoraLagnaResult {
  horaLagnaSignNumber: SignNumber
  horaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
}

export interface CharakarakaResult {
  rank: Charakaraka
  planet: PlanetName
  rankingDegree: number          // whole degrees (after Rahu inversion)
  rankingArcMinutes: number      // arc-minutes component (after Rahu inversion)
  rankingArcSeconds: number      // arc-seconds component (after Rahu inversion)
  rawDegreeInSign: number
  sharedRank: boolean            // true if another planet holds the identical longitude
}

export interface SthiraKarakaDeficit {
  missingRank: Charakaraka       // the Karaka position left vacant
  sthiraKaraka: PlanetName       // the constant significator to use instead
  reason: string                 // human-readable explanation
}

export interface CharakarakaSetResult {
  karakas: CharakarakaResult[]   // length 7 or 8 depending on deficit
  deficit: SthiraKarakaDeficit | null  // present only when a shared-rank tie occurred
}

export interface SpecialPointsResult {
  arudhaLagna:  ArudhaLagnaResult
  ghatiLagna:   GhatiLagnaResult
  bhavaLagna:   BhavaLagnaResult
  horaLagna:    HoraLagnaResult
  charakarakas: CharakarakaSetResult
}
```

Done when: types/index.ts compiles with zero TypeScript errors.

---

## TASK SP.2 - Lagna Lord Lookup Table

At the top of /lib/astro/specialPoints.ts define all constants.
Aquarius and Scorpio list two lords because SP.4 needs both.

```typescript
// STATUS: pending | Task SP.2

import type {
  SignNumber, PlanetName, PlanetPosition,
  ArudhaLagnaResult, GhatiLagnaResult,
  BhavaLagnaResult, HoraLagnaResult,
  CharakarakaResult, Charakaraka, SpecialPointsResult
} from '@/types'

const SIGN_LORDS: Record<SignNumber, PlanetName | [PlanetName, PlanetName]> = {
  1:  'Mars',
  2:  'Venus',
  3:  'Mercury',
  4:  'Moon',
  5:  'Sun',
  6:  'Mercury',
  7:  'Venus',
  8:  ['Mars', 'Ketu'],    // Scorpio
  9:  'Jupiter',
  10: 'Saturn',
  11: ['Saturn', 'Rahu'],  // Aquarius
  12: 'Jupiter',
}

type SignNature = 'movable' | 'fixed' | 'dual'

const SIGN_NATURE: Record<SignNumber, SignNature> = {
  1: 'movable', 2: 'fixed',   3: 'dual',
  4: 'movable', 5: 'fixed',   6: 'dual',
  7: 'movable', 8: 'fixed',   9: 'dual',
  10: 'movable', 11: 'fixed', 12: 'dual',
}

const EXALTATION_SIGN: Partial<Record<PlanetName, SignNumber>> = {
  Sun: 1, Moon: 2, Mars: 10, Mercury: 6,
  Jupiter: 4, Venus: 12, Saturn: 7, Rahu: 3, Ketu: 9,
}

const DEBILITATION_SIGN: Partial<Record<PlanetName, SignNumber>> = {
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12,
  Jupiter: 10, Venus: 6, Saturn: 1, Rahu: 9, Ketu: 3,
}

// 1 Ghati = 24 minutes (traditional Vedic time unit)
const MINUTES_PER_GHATI   = 24
const VIGHATIS_PER_GHATI  = 60
const DEGREES_PER_SIGN    = 30
const DEGREES_PER_VIGHATI = DEGREES_PER_SIGN / VIGHATIS_PER_GHATI  // 0.5
```

Do NOT implement any functions yet.

Done when: file compiles with only constants and imports.

---

## TASK SP.3 - Sign Arithmetic Helpers

Add to /lib/astro/specialPoints.ts:

```typescript
/**
 * Count signs from fromSign to toSign inclusive, wrapping at 12.
 * Returns 1-12.
 *
 * countSignsBetween(1, 4) = 4   (Aries to Cancer)
 * countSignsBetween(4, 1) = 10  (wraps forward)
 * countSignsBetween(7, 7) = 1   (same sign)
 */
export function countSignsBetween(
  fromSign: SignNumber,
  toSign: SignNumber
): number {
  return ((toSign - fromSign + 12) % 12) + 1
}

/**
 * Advance startSign forward by (steps - 1) positions.
 * First step stays at startSign (Parashara inclusive counting).
 *
 * advanceSigns(1, 4)  = 4   Cancer
 * advanceSigns(10, 4) = 1   Aries (wraps)
 * advanceSigns(7, 7)  = 1   Aries
 */
export function advanceSigns(
  startSign: SignNumber,
  steps: number
): SignNumber {
  return (((startSign - 1) + (steps - 1)) % 12 + 1) as SignNumber
}

/**
 * Convert absolute ecliptic longitude (0-360) to sign number and
 * degree within that sign.
 *
 * longitudeToSignAndDegree(0)   = { sign: 1,  degree: 0  }
 * longitudeToSignAndDegree(45)  = { sign: 2,  degree: 15 }
 * longitudeToSignAndDegree(359) = { sign: 12, degree: 29 }
 */
export function longitudeToSignAndDegree(longitude: number): {
  sign: SignNumber
  degree: number
} {
  const n = ((longitude % 360) + 360) % 360
  return {
    sign:   (Math.floor(n / DEGREES_PER_SIGN) + 1) as SignNumber,
    degree: n % DEGREES_PER_SIGN,
  }
}
```

Done when: all three functions compile.

---

## TASK SP.4 - Dual-Lord Tiebreaker

For Aquarius (sign 11) and Scorpio (sign 8) two lords are possible.
Choose the stronger using this five-step Parashara hierarchy:

  1. Planet count: lord in sign with more planets wins
  2. Own-sign: lord placed in its own sign wins
  3. Exaltation beats debilitation (debilitated = weaker)
  4. Sign nature: Dual > Fixed > Movable
  5. Sign number: higher number wins

Add to /lib/astro/specialPoints.ts:

```typescript
function getOwnSigns(planet: PlanetName): SignNumber[] {
  const result: SignNumber[] = []
  for (const [s, lord] of Object.entries(SIGN_LORDS)) {
    const sign = Number(s) as SignNumber
    if (Array.isArray(lord) ? lord.includes(planet) : lord === planet) {
      result.push(sign)
    }
  }
  return result
}

export function getStrongerLord(
  lordA: PlanetName,
  lordB: PlanetName,
  planets: PlanetPosition[]
): PlanetName {
  const signOf = (p: PlanetName): SignNumber =>
    planets.find(x => x.planet === p)!.signNumber

  const countIn = (sign: SignNumber): number =>
    planets.filter(x => x.signNumber === sign).length

  const sA = signOf(lordA), sB = signOf(lordB)

  // Step 1
  const cA = countIn(sA), cB = countIn(sB)
  if (cA !== cB) return cA > cB ? lordA : lordB

  // Step 2
  const ownA = getOwnSigns(lordA).includes(sA)
  const ownB = getOwnSigns(lordB).includes(sB)
  if (ownA !== ownB) return ownA ? lordA : lordB

  // Step 3
  const exA = EXALTATION_SIGN[lordA] === sA
  const exB = EXALTATION_SIGN[lordB] === sB
  const dbA = DEBILITATION_SIGN[lordA] === sA
  const dbB = DEBILITATION_SIGN[lordB] === sB
  if (exA !== exB) return exA ? lordA : lordB
  if (dbA !== dbB) return dbA ? lordB : lordA   // debilitated = weaker

  // Step 4
  const order: Record<SignNature, number> = { movable: 0, fixed: 1, dual: 2 }
  const nA = order[SIGN_NATURE[sA]], nB = order[SIGN_NATURE[sB]]
  if (nA !== nB) return nA > nB ? lordA : lordB

  // Step 5
  return sA >= sB ? lordA : lordB
}
```

Done when: function compiles with no `any` types.

---

## TASK SP.5 - Arudha Lagna Calculator

The Arudha Lagna (AL) represents worldly image and financial status.

Algorithm:
  1. Find the Lagna lord (resolve dual lords via getStrongerLord).
  2. Count signs from Lagna to lord inclusive = N.
  3. Advance N signs from the lord = raw AL.
  4. Exceptions:
       raw AL = Lagna      -> use 10th from Lagna
       raw AL = 7th house  -> use 4th from Lagna

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateArudhaLagna(
  lagnaSignNumber: SignNumber,
  planets: PlanetPosition[]
): ArudhaLagnaResult {
  const rawLord = SIGN_LORDS[lagnaSignNumber]
  const lagnaLord: PlanetName = Array.isArray(rawLord)
    ? getStrongerLord(rawLord[0], rawLord[1], planets)
    : rawLord

  const lordPos = planets.find(p => p.planet === lagnaLord)
  if (!lordPos) throw new Error(
    `[calculateArudhaLagna] Lagna lord "${lagnaLord}" not found in planets array`
  )

  const lordSignNumber = lordPos.signNumber
  const steps = countSignsBetween(lagnaSignNumber, lordSignNumber)
  let rawAL   = advanceSigns(lordSignNumber, steps)

  const seventh = advanceSigns(lagnaSignNumber, 7)
  let exceptionApplied: ArudhaLagnaResult['exceptionApplied'] = 'none'

  if (rawAL === lagnaSignNumber) {
    rawAL = advanceSigns(lagnaSignNumber, 10)
    exceptionApplied = 'use_10th'
  } else if (rawAL === seventh) {
    rawAL = advanceSigns(lagnaSignNumber, 4)
    exceptionApplied = 'use_4th'
  }

  return { arudhaSignNumber: rawAL, lagnaSignNumber, lagnaLord,
           lordSignNumber, stepsFromLagnaToLord: steps, exceptionApplied }
}
```

Done when: function compiles with correct return type.

---

## TASK SP.6 - Ghati Lagna Calculator

Ghati Lagna indicates power and authority.
Rate: 1 sign per Ghati (24 minutes). Fastest moving Lagna.

Algorithm:
  1. Divide minutesSinceSunrise by 24 = total Ghatikas.
  2. Floor = full Ghatikas; remainder * 60 = Vighatikas.
  3. Degrees = (fullGhatikas * 30) + (vighatikas * 0.5).
  4. Add to sunAbsoluteLongitudeAtSunrise, convert to sign + degree.

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateGhatiLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number
): GhatiLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateGhatiLagna] minutesSinceSunrise must be >= 0')

  // 1 Ghati = 24 minutes (traditional Vedic time unit)
  const total    = minutesSinceSunrise / MINUTES_PER_GHATI
  const full     = Math.floor(total)
  const vigh     = (total - full) * VIGHATIS_PER_GHATI
  const degrees  = (full * DEGREES_PER_SIGN) + (vigh * DEGREES_PER_VIGHATI)

  const { sign, degree } = longitudeToSignAndDegree(
    sunAbsoluteLongitudeAtSunrise + degrees
  )

  return {
    ghatiLagnaSignNumber:     sign,
    ghatiLagnaDegree:         Math.round(degree * 1000) / 1000,
    fullGhatikasSinceSunrise: full,
    vighatikasFraction:       Math.round(vigh * 100) / 100,
    sunLongitudeAtSunrise:    sunAbsoluteLongitudeAtSunrise,
  }
}
```

Done when: function compiles.

---

## TASK SP.7 - Bhava Lagna Calculator

Bhava Lagna indicates the body and circumstances of life.
Rate: 1 sign per 5 Ghatikas (120 minutes / 2 hours). Slowest Lagna.

Algorithm: same pattern as GL but the zodiac advances once per 5 Ghatikas
instead of once per 1 Ghati. Dividing total Ghatikas by 5 yields the
number of signs traversed (as a decimal). Multiply by 30 = degrees to add.

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateBhavaLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number
): BhavaLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateBhavaLagna] minutesSinceSunrise must be >= 0')

  const GHATIKAS_PER_SIGN = 5  // 1 sign per 5 Ghatikas = 1 sign per 120 min

  const totalGhatikas  = minutesSinceSunrise / MINUTES_PER_GHATI
  const signsTraversed = totalGhatikas / GHATIKAS_PER_SIGN
  const degrees        = signsTraversed * DEGREES_PER_SIGN

  const { sign, degree } = longitudeToSignAndDegree(
    sunAbsoluteLongitudeAtSunrise + degrees
  )

  return {
    bhavaLagnaSignNumber:      sign,
    bhavaLagnaDegree:          Math.round(degree * 1000) / 1000,
    totalGhatikasSinceSunrise: Math.round(totalGhatikas * 1000) / 1000,
    sunLongitudeAtSunrise:     sunAbsoluteLongitudeAtSunrise,
  }
}
```

Done when: function compiles.

---

## TASK SP.8 - Hora Lagna Calculator

Hora Lagna indicates wealth and financial accumulation potential.
Rate: 1 sign per 2.5 Ghatikas (60 minutes / 1 hour).

Algorithm: same as BL but divisor is 2.5.
HL advances exactly twice as fast as BL and half as fast as GL.

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateHoraLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number
): HoraLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateHoraLagna] minutesSinceSunrise must be >= 0')

  const GHATIKAS_PER_SIGN = 2.5  // 1 sign per 2.5 Ghatikas = 1 sign per 60 min

  const totalGhatikas  = minutesSinceSunrise / MINUTES_PER_GHATI
  const signsTraversed = totalGhatikas / GHATIKAS_PER_SIGN
  const degrees        = signsTraversed * DEGREES_PER_SIGN

  const { sign, degree } = longitudeToSignAndDegree(
    sunAbsoluteLongitudeAtSunrise + degrees
  )

  return {
    horaLagnaSignNumber:       sign,
    horaLagnaDegree:           Math.round(degree * 1000) / 1000,
    totalGhatikasSinceSunrise: Math.round(totalGhatikas * 1000) / 1000,
    sunLongitudeAtSunrise:     sunAbsoluteLongitudeAtSunrise,
  }
}
```

Cross-check: for the same 120-minute birth (5 Ghatikas elapsed):
  GL advances 5 signs, HL advances 2 signs, BL advances 1 sign.

Done when: function compiles.

---

## TASK SP.9 - Charakaraka Calculator

Eight Charakarakas rank planets by their traversed longitude within
their current sign, from highest to lowest.

Include: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu
Exclude: Ketu (represents moksha; not a soul-role carrier)

Rahu special rule: moves retrograde.
Ranking longitude = (30 - degreeInSign) degrees, with arc-minutes and
arc-seconds also inverted: rankingMinutes = (59 - arcMinutes) when
seconds > 0, else (60 - arcMinutes). See implementation below for the
precise inversion.

### Three-level tiebreaking per Brihat Parashara Hora Shastra

  Level 1: degree in sign (whole degrees) - higher wins
  Level 2: arc-minutes                    - higher wins
  Level 3: arc-seconds                    - higher wins

### The Shared-Rank / Deficit Rule (BPHS)

If two planets reach identical longitude to the arc-second, they both
receive the same Charakaraka rank. This is called a shared rank.

A shared rank creates a deficit: the sequence now has only 7 unique
positions filled instead of 8. The missing position is NOT left blank.
Instead, the Sthira (constant/fixed) Karaka for that function is used
as the significator for the missing rank.

The Sthira Karaka table:

  Atmakaraka   -> Sun      (soul / self)
  Amatyakaraka -> Jupiter  (career / counsel)
  Bhratrukaraka -> Mars    (siblings)
  Matrukaraka  -> Moon     (mother)
  Pitrukaraka  -> Sun      (father)
  Putrakaraka  -> Jupiter  (children)
  Gnatikaraka  -> Mars     (kinsmen)
  Darakaraka   -> Venus    (spouse)

The deficit result is surfaced in the SthiraKarakaDeficit object so
that the AI synthesis layer can note it in the narrative output.

### Implementation

Add to /lib/astro/specialPoints.ts:

```typescript
const CHARAKARAKA_ORDER: Charakaraka[] = [
  'Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 'Matrukaraka',
  'Pitrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka',
]

const CK_PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'
  // Ketu excluded: represents liberation, not an active soul-role
]

// Sthira (constant) Karakas used when a shared-rank deficit occurs
const STHIRA_KARAKA: Record<Charakaraka, PlanetName> = {
  Atmakaraka:    'Sun',
  Amatyakaraka:  'Jupiter',
  Bhratrukaraka: 'Mars',
  Matrukaraka:   'Moon',
  Pitrukaraka:   'Sun',
  Putrakaraka:   'Jupiter',
  Gnatikaraka:   'Mars',
  Darakaraka:    'Venus',
}

interface RankingLongitude {
  planet:          PlanetName
  rawDegreeInSign: number
  deg:  number    // ranking whole degrees  (0-29)
  min:  number    // ranking arc-minutes    (0-59)
  sec:  number    // ranking arc-seconds    (0-59)
}

/**
 * Compute the ranking longitude for a planet.
 * Rahu moves retrograde, so its longitude is inverted before ranking.
 * Inversion: subtract from 30d 00m 00s (exclusive upper bound of a sign).
 */
function toRankingLongitude(p: PlanetPosition): RankingLongitude {
  if (p.planet !== 'Rahu') {
    return {
      planet:          p.planet,
      rawDegreeInSign: p.degreeInSign,
      deg: p.degreeInSign,
      min: p.arcMinutes,
      sec: p.arcSeconds,
    }
  }

  // Rahu retrograde inversion: 29d 59m 60s - (deg, min, sec)
  // which equals (30 * 3600) - (deg * 3600 + min * 60 + sec) total seconds
  const totalRawSec = p.degreeInSign * 3600 + p.arcMinutes * 60 + p.arcSeconds
  const invertedSec = 30 * 3600 - totalRawSec

  return {
    planet:          p.planet,
    rawDegreeInSign: p.degreeInSign,
    deg: Math.floor(invertedSec / 3600),
    min: Math.floor((invertedSec % 3600) / 60),
    sec: invertedSec % 60,
  }
}

/**
 * Compare two ranking longitudes. Returns negative if a > b (higher rank).
 * Three-level comparison: degree -> arc-minute -> arc-second.
 */
function compareRankingDesc(a: RankingLongitude, b: RankingLongitude): number {
  if (a.deg !== b.deg) return b.deg - a.deg
  if (a.min !== b.min) return b.min - a.min
  return b.sec - a.sec
}

/**
 * Returns true if two ranking longitudes are identical to the arc-second.
 * This triggers the shared-rank / deficit rule per BPHS.
 */
function rankingLongitudesEqual(a: RankingLongitude, b: RankingLongitude): boolean {
  return a.deg === b.deg && a.min === b.min && a.sec === b.sec
}

/**
 * Calculate the Charakarakas with full BPHS tiebreaking and deficit handling.
 *
 * @param planets  Full planet position array. Must contain all 9 planets.
 *                 Ketu is silently excluded.
 * @throws         If fewer than 8 eligible planets are present.
 */
export function calculateCharakarakas(
  planets: PlanetPosition[]
): CharakarakaSetResult {
  const eligible = planets.filter(p => CK_PLANETS.includes(p.planet))

  if (eligible.length < 8) throw new Error(
    `[calculateCharakarakas] Need 8 planets (Sun-Saturn + Rahu). ` +
    `Found: ${eligible.map(p => p.planet).join(', ')}`
  )

  // Compute ranking longitude for each planet
  const ranked: RankingLongitude[] = eligible.map(toRankingLongitude)

  // Sort descending by three-level longitude
  ranked.sort(compareRankingDesc)

  // Detect shared-rank pairs (identical to arc-second)
  // Only one shared pair can occur in a real chart; handle the first found.
  let sharedPairIndex: number | null = null
  for (let i = 0; i < ranked.length - 1; i++) {
    if (rankingLongitudesEqual(ranked[i], ranked[i + 1])) {
      sharedPairIndex = i
      break
    }
  }

  if (sharedPairIndex === null) {
    // No tie: straightforward 8-planet assignment
    const karakas: CharakarakaResult[] = ranked.map((item, i) => ({
      rank:              CHARAKARAKA_ORDER[i],
      planet:            item.planet,
      rankingDegree:     item.deg,
      rankingArcMinutes: item.min,
      rankingArcSeconds: item.sec,
      rawDegreeInSign:   item.rawDegreeInSign,
      sharedRank:        false,
    }))
    return { karakas, deficit: null }
  }

  // Shared rank found: both planets at sharedPairIndex and sharedPairIndex+1
  // receive the same Charakaraka. The next rank position is skipped (deficit).
  const sharedRankName = CHARAKARAKA_ORDER[sharedPairIndex]
  const deficitRankName = CHARAKARAKA_ORDER[sharedPairIndex + 1]

  const karakas: CharakarakaResult[] = []
  let orderIndex = 0  // tracks position in CHARAKARAKA_ORDER

  for (let i = 0; i < ranked.length; i++) {
    const item = ranked[i]
    const isSharedA = i === sharedPairIndex
    const isSharedB = i === sharedPairIndex + 1

    if (isSharedB) {
      // Both A and B get the same rank; B does not advance the order index
      karakas.push({
        rank:              sharedRankName,
        planet:            item.planet,
        rankingDegree:     item.deg,
        rankingArcMinutes: item.min,
        rankingArcSeconds: item.sec,
        rawDegreeInSign:   item.rawDegreeInSign,
        sharedRank:        true,
      })
      // orderIndex stays at sharedPairIndex + 1 (the deficit slot) - skip it
      orderIndex = sharedPairIndex + 2
    } else if (isSharedA) {
      karakas.push({
        rank:              sharedRankName,
        planet:            item.planet,
        rankingDegree:     item.deg,
        rankingArcMinutes: item.min,
        rankingArcSeconds: item.sec,
        rawDegreeInSign:   item.rawDegreeInSign,
        sharedRank:        true,
      })
      // orderIndex stays at sharedPairIndex; will be skipped after B is added
    } else {
      karakas.push({
        rank:              CHARAKARAKA_ORDER[orderIndex],
        planet:            item.planet,
        rankingDegree:     item.deg,
        rankingArcMinutes: item.min,
        rankingArcSeconds: item.sec,
        rawDegreeInSign:   item.rawDegreeInSign,
        sharedRank:        false,
      })
      orderIndex++
    }
  }

  const deficit: SthiraKarakaDeficit = {
    missingRank:  deficitRankName,
    sthiraKaraka: STHIRA_KARAKA[deficitRankName],
    reason:
      `${ranked[sharedPairIndex].planet} and ${ranked[sharedPairIndex + 1].planet} ` +
      `share identical longitude (${sharedRankName}). ` +
      `Use ${STHIRA_KARAKA[deficitRankName]} as the constant significator ` +
      `for ${deficitRankName}.`,
  }

  return { karakas, deficit }
}
```

Done when: function compiles. Test mentally with these scenarios:
  - No tie: returns karakas.length = 8, deficit = null
  - Tie at index 0 (two planets share AK): both get Atmakaraka,
    Amatyakaraka is the deficit, karakas.length = 8 (7 unique ranks + 1 shared)

---

## TASK SP.10 - Main Aggregator Function

Add to /lib/astro/specialPoints.ts as the sole public entry point:

```typescript
/**
 * Calculate all five special point categories from natal chart data.
 * Sub-calculators above are exported for unit testing only.
 */
export function calculateSpecialPoints(
  lagnaSignNumber: SignNumber,
  planets: PlanetPosition[],
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number
): SpecialPointsResult {
  return {
    arudhaLagna:  calculateArudhaLagna(lagnaSignNumber, planets),
    ghatiLagna:   calculateGhatiLagna(sunAbsoluteLongitudeAtSunrise, minutesSinceSunrise),
    bhavaLagna:   calculateBhavaLagna(sunAbsoluteLongitudeAtSunrise, minutesSinceSunrise),
    horaLagna:    calculateHoraLagna(sunAbsoluteLongitudeAtSunrise, minutesSinceSunrise),
    charakarakas: calculateCharakarakas(planets),  // returns CharakarakaSetResult
  }
}
```

Done when: entire specialPoints.ts compiles with zero TypeScript errors.

---

## TASK SP.11 - Wire Into Chart Service

Edit /lib/astro/chartService.ts.

Imports to add at top:
```typescript
import { calculateSpecialPoints } from './specialPoints'
import type { SpecialPointsResult } from '@/types'
```

Add the following function. No `any` casts - field names are confirmed:

```typescript
/**
 * Derive special points from a stored VedicChartData object.
 * Returns null with a warning if required fields are missing.
 *
 * Field mapping confirmed 2026-03-25:
 *   vedicChart.lagnaSignNumber                    -> ascendant sign
 *   vedicChart.planets                            -> PlanetPosition[]
 *   vedicChart.sunriseData.sunAbsoluteLongitude   -> Sun longitude at sunrise
 *   vedicChart.sunriseData.minutesSinceSunrise    -> elapsed minutes
 */
export function deriveSpecialPoints(
  vedicChart: VedicChartData
): SpecialPointsResult | null {
  const lagnaSign    = vedicChart.lagnaSignNumber
  const planets      = vedicChart.planets
  const sunLongitude = vedicChart.sunriseData?.sunAbsoluteLongitude
  const minsSunrise  = vedicChart.sunriseData?.minutesSinceSunrise

  if (!lagnaSign || !planets || sunLongitude == null || minsSunrise == null) {
    console.warn('[deriveSpecialPoints] Missing required fields in VedicChartData')
    return null
  }

  try {
    return calculateSpecialPoints(lagnaSign, planets, sunLongitude, minsSunrise)
  } catch (err) {
    console.error('[deriveSpecialPoints] Calculation error:', err)
    return null
  }
}
```

Note: if VedicChartData is currently typed as Record<string, unknown>
in types/index.ts, add the confirmed fields to that interface before
removing TypeScript errors here.

Done when: chartService.ts compiles with no `any` casts in this function.

---

## TASK SP.12 - KV Caching for Special Points

Special points are deterministic for a given birth chart and must be
cached permanently. Invalidated only when the birth profile changes.

Edit /lib/kv/keys.ts - add to the kvKeys object:
```typescript
specialPoints: (userId: string) => `chart:specialpoints:${userId}`,
```

Edit /lib/astro/chartService.ts - add caching wrapper:

```typescript
export async function getOrCreateSpecialPoints(
  userId: string
): Promise<SpecialPointsResult | null> {
  const cacheKey = kvKeys.specialPoints(userId)

  const cached = await kvGet<SpecialPointsResult>(cacheKey)
  if (cached !== null) return cached

  const vedicChart = await kvGet<VedicChartData>(kvKeys.vedicChart(userId))
  if (!vedicChart) {
    console.warn(`[getOrCreateSpecialPoints] No Vedic chart in KV for user ${userId}`)
    return null
  }

  const result = deriveSpecialPoints(vedicChart)
  if (result) {
    await kvSet(cacheKey, result)  // no TTL - permanent until chart is invalidated
  }
  return result
}
```

Update invalidateChartCache to include the new key:
```typescript
await kvDeleteMany([
  kvKeys.vedicChart(userId),
  kvKeys.hdChart(userId),
  kvKeys.dashas(userId),
  kvKeys.specialPoints(userId),   // add this line
])
```

Done when: key added, wrapper compiles, invalidation covers specialPoints.

---

## TASK SP.13 - Expose via API Route

Create /app/api/chart/special-points/route.ts:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { getOrCreateSpecialPoints } from '@/lib/astro/chartService'

export async function GET() {
  const session = await getRequiredSession()
  const result  = await getOrCreateSpecialPoints(session.user.id)

  if (!result) {
    return NextResponse.json(
      {
        error: 'Special points not yet available.',
        detail: 'Vedic chart may still be generating. Retry after chart generation completes.',
      },
      { status: 202 }
    )
  }

  return NextResponse.json(result)
}
```

Behaviour contract:
  - 401 JSON if no session (`auth()` in route; same intent as getRequiredSession)
  - 202 if special points not yet computable (no Vedic chart in KV/DB or missing inputs)
  - 200 + SpecialPointsResult JSON when available

Done when: route compiles and returns 202 for users without Vedic chart data.

---

## COMPLETION CHECKLIST

- [x] SP.1   Types in types/index.ts - all five result types present
- [x] SP.2   Constants in specialPoints.ts - time constants present
- [x] SP.3   countSignsBetween, advanceSigns, longitudeToSignAndDegree compile
- [x] SP.4   getStrongerLord - five tiebreaker steps, no `any`
- [x] SP.5   calculateArudhaLagna - both exceptions handled
- [x] SP.6   calculateGhatiLagna - Ghati + Vighati arithmetic
- [x] SP.7   calculateBhavaLagna - 5-Ghati rate
- [x] SP.8   calculateHoraLagna - 2.5-Ghati rate
- [x] SP.9   calculateCharakarakas - three-level tiebreak, shared-rank + deficit logic, Sthira Karaka table
- [x] SP.10  calculateSpecialPoints aggregator - all five results present
- [x] SP.11  deriveSpecialPoints in chartService.ts - mapper-based inputs, no `any`
- [x] SP.12  KV key added, getOrCreateSpecialPoints correct, invalidation updated
- [x] SP.13  API route /api/chart/special-points - 401/202/200 contract correct

---

## OPEN DECISIONS

```
RESOLVED (2026-03-26)
Task: SP.11
File: lib/astro/chartService.ts
Question: If vedicChart.sunriseData is absent from the stored KV object,
  deriveSpecialPoints returns null silently. Should this trigger a re-fetch
  from the Vedic API, or is null + 202 the correct degraded-mode behaviour?

Resolution: Do NOT auto re-fetch the Vedic API from deriveSpecialPoints or
getOrCreateSpecialPoints when sunrise data is missing. Rationale: (1) read
paths must not trigger surprise paid API usage or partial writes; (2) chart
population and invalidateChartCache on birth-profile changes already drive
re-fetch at the appropriate boundary. Behaviour: callers get null from
getOrCreateSpecialPoints; GET /api/chart/special-points returns 202 with the
existing error payload; clients retry after chart generation completes or
after the user updates birth data. If sunriseData is persistently missing,
fix the Vedic API response mapping or the chart-persist path—not silent
re-fetch inside special-points reads.
Raised: 2026-03-25
Resolved: 2026-03-26 — degraded mode = null + 202 + retry; no API re-fetch here.
```

---

## SANITY CHECKS

Add this block as comments at the bottom of specialPoints.ts:

```typescript
// Sanity checks - verify mentally before marking tasks done:
//
// countSignsBetween(1, 4)  = 4    countSignsBetween(4, 1)  = 10
// advanceSigns(1, 4) = 4 (Cancer)  advanceSigns(10, 4) = 1 (Aries wraps)
// longitudeToSignAndDegree(0)   -> { sign: 1,  degree: 0  }
// longitudeToSignAndDegree(45)  -> { sign: 2,  degree: 15 }
// longitudeToSignAndDegree(359) -> { sign: 12, degree: 29 }
//
// Time-based Lagna rates for 120-minute birth (5 Ghatikas elapsed):
//   GL: 5 signs advanced   (1 sign/Ghati)
//   HL: 2 signs advanced   (1 sign/2.5 Ghati)
//   BL: 1 sign advanced    (1 sign/5 Ghati)
//
// Rahu inversion (arc-second precision):
//   Rahu at 10d 30m 00s -> ranking longitude 19d 29m 60s = 19d 30m 00s (30*3600 - raw)
//   Rahu at 25d 00m 00s -> ranking longitude 5d 00m 00s
//
// Three-level tiebreak:
//   Planet A: 18d 15m 30s vs Planet B: 18d 15m 29s -> A wins (higher sec)
//   Planet A: 18d 15m 30s vs Planet B: 18d 15m 30s -> SHARED RANK, deficit applies
//
// Shared-rank deficit example:
//   Sun and Moon both at 18d 15m 30s (after Rahu inversion if applicable)
//   -> Both receive Atmakaraka
//   -> Amatyakaraka is the deficit rank
//   -> Use Jupiter (Sthira Karaka for Amatyakaraka) as the significator
```

---

## STATUS COMMENT FORMAT

At the top of every file you create or modify, add:
// STATUS: done | Task SP.X

---

*Crossroads Compass - Special Points Task File | SP.1-SP.13 | March 2026*

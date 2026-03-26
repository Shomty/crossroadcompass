# Vedic Special Points — Master Task File
# Project: Crossroads Compass
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Status: pending
# Last updated: 2026-03-26
# Supersedes: task-vedic-special-points.md + task-vedic-special-points-extended.md

---

## HOW TO USE THIS FILE

You are a coding agent with a limited context window. Read one task
block at a time. Complete it fully. Mark it done. Move to the next.

Rules:
1. Read only the current task block. Do not read ahead.
2. Complete the task fully before moving to the next one.
3. At the end of every task, write a STATUS comment at the top of every
   file you created or modified: `// STATUS: done | Task VSP-XX`
4. If a task carries a DECISION NEEDED block, read it. If marked
   RESOLVED, proceed. If marked OPEN, implement the fallback described
   and add the comment — do not block the whole task.
5. Never refactor code from a previous task unless the current task
   explicitly requires it.

---

## OPEN DECISIONS — RESOLVE BEFORE STARTING

Read all of these first. Resolved ones are already answered inline.
Open ones require Milosh to answer before the affected tasks can produce
correct output. The agent may still implement those tasks using the
stated fallback, but must leave the DECISION NEEDED comment in place.

```
DECISION [1] — STATUS: OPEN
Affects: VSP-09 (GL), VSP-10 (BL), VSP-11 (HL)
Question 1: Does the Vedic API return isNightBirth as a boolean on
  vedicChart or sunriseData? Or must it be derived by comparing
  minutesSinceSunrise against the daytime arc duration?
Question 2: Does the Vedic API return udayaLagnaLongitude (the Lagna
  longitude at the exact birth moment, 0-360)?
Fallback: pass null for both. Functions fall back to day-birth logic
  and emit console.warn. Day-birth output is correct. Night-birth
  output is wrong until this is resolved.
Implementation (2026-03): calculators and calculateSpecialPoints(..., timeLagnaOpts)
  support optional night inputs; extractSpecialPointsInputs / chartService do not
  yet pass them until this decision is resolved.
Raised: 2026-03-26 | Resolved: [fill in]
```

```
DECISION [2] — STATUS: OPEN
Affects: VSP-10 (BL), VSP-11 (HL)
Question: BL rate is stated as "1 sign per 2 hours" in BPHS and as
  "5 Ghatikas per sign" in Ghati arithmetic. HL is "1 sign per 1 hour"
  vs "2.5 Ghatikas per sign". Both pairs are mathematically identical
  but confirm which formula expression the API documentation uses.
Fallback: Ghati-based formula is implemented. Output is correct either
  way. This is a documentation/audit question only.
Raised: 2026-03-26 | Resolved: [fill in]
```

```
DECISION [3] — STATUS: OPEN
Affects: VSP-20 (Kaal Velas), VSP-17 (Trisphuta — depends on Gulika)
Question 1: Does vedicChart.sunriseData contain sunset time or daytime
  duration in minutes?
Question 2: Is birth weekday (0=Sun through 6=Sat) available from the
  Vedic API, or must it be derived from BirthProfile timestamp?
Fallback: calculateKaalVelas returns null. kaalVelas field in result is
  null. Trisphuta is also null. Both are handled gracefully downstream.
Raised: 2026-03-26 | Resolved: [fill in]
```

```
DECISION [4] — STATUS: OPEN
Affects: VSP-17 (Trisphuta)
Question: Trisphuta uses the Lagna longitude. Confirm whether this is
  the exact degree of the Lagna (e.g. from udayaLagnaLongitude) or
  always the sign cusp (sign - 1) * 30.
Fallback: sign cusp is used. Most traditions use the cusp; this is
  unlikely to be wrong.
Raised: 2026-03-26 | Resolved: [fill in]
```

```
DECISION [5] — STATUS: OPEN
Affects: VSP-08 (Varnada Lagna)
Question: Some traditions count Varnada from Pisces when both Lagnas
  are in even signs. Current implementation always counts from Aries.
Fallback: count from Aries (most common Parashara interpretation).
  Edge case — correct for the vast majority of charts.
Raised: 2026-03-26 | Resolved: [fill in]
```

```
DECISION [6] — STATUS: RESOLVED 2026-03-25
Affects: VSP-03, VSP-04 (VedicChartData field names)
Confirmed field names:
  vedicChart.lagnaSignNumber                        SignNumber 1-12
  vedicChart.planets                                PlanetPosition[]
  vedicChart.sunriseData.sunAbsoluteLongitude       number 0-360
  vedicChart.sunriseData.minutesSinceSunrise        number
```

```
DECISION [7] — STATUS: RESOLVED 2026-03-26
Affects: VSP-12 (Pranapada Lagna)
Confirmed: Movable/Fixed/Dual starting-point rule per BPHS.
  Movable sign (1,4,7,10): start from Sun.
  Fixed sign (2,5,8,11):   start from 9th house from Sun.
  Dual sign (3,6,9,12):    start from 5th house from Sun.
```

```
DECISION [8] — STATUS: RESOLVED 2026-03-26
Affects: VSP-21 (Bhrigu Bindu)
Confirmed formula: (Moon longitude + Rahu longitude) / 2, wrapped 0-360.
Rahu longitude = raw sign position. Do NOT apply the Charakaraka
retrograde inversion here.
```

```
DECISION [9] — STATUS: RESOLVED 2026-03-26
Affects: VSP-20 (Kaal Velas — Gulika vs Maandi distinction)
Confirmed: Gulika = degree at START of Saturn's portion.
           Maandi = degree at MIDPOINT of Saturn's portion.
These are two distinct points, not the same.
```

---

## ARCHITECTURE REFERENCE
(Read once. All calculator tasks reference this section rather than
repeating it. Do not skip this section.)

### Project file locations

  /lib/astro/specialPoints.ts     pure calculation module (create this)
  /lib/astro/chartService.ts      orchestration + KV wiring (edit this)
  /lib/kv/keys.ts                 KV key schema (edit this)
  /lib/kv/helpers.ts              kvGet / kvSet / kvDelete (use as-is)
  /lib/auth/helpers.ts            getRequiredSession (use as-is)
  /types/index.ts                 shared TypeScript types (edit this)
  /app/api/chart/special-points/  API routes (create these)

### Architecture rules

- specialPoints.ts is a pure module. No DB reads. No KV reads.
  All functions receive already-fetched data as arguments.
- chartService.ts is the only file that reads/writes KV.
- types/index.ts is the only file that defines shared interfaces.
- All new KV keys follow the pattern: chart:{category}:{userId}
- Permanent cache (no TTL) for all natal/derived chart data.
- All KV keys must be added to invalidateChartCache so they are
  cleared when a user updates their birth profile.

### Shipped implementation alignment (code vs monolithic spec below)

The **canonical TypeScript types** live in `types/index.ts`. The codebase splits calculators into two layers (this is intentional):

- **Foundation** — `SpecialPointsResult`: Arudha Lagna, Ghati/Bhava/Hora Lagnas, Charakarakas, plus optional `natalLagna` merged in by `deriveSpecialPoints`. Produced by `calculateSpecialPoints()` in `lib/astro/specialPoints.ts`.
- **Extended (SP-EXT)** — `ExtendedSpecialPointsResult`: Varnada, Pranapada, Upapada, Sree, Bhrigu Bindu, Beeja/Kshetra, Trisphuta, Dhooma chain, Kaal Velas. Produced by `calculateExtendedSpecialPoints()` in the same module.

**Orchestration** (`lib/astro/chartService.ts`): `deriveSpecialPoints(vedicChartRaw, birthYear, birthMonth, birthDay, birthHourUTC, birthMinuteUTC, lat, lon)` loads nothing from KV itself; callers such as `getOrCreateSpecialPoints` pass stored chart JSON + birth profile fields. Chart inputs are normalized by `extractSpecialPointsInputs()` in `lib/astro/vedicChartMapper.ts` (top-level `sunriseData` path or `rawResponse.chartD1` + computed sunrise). `deriveExtendedSpecialPoints` reuses `SpecialPointsInputs` plus Hora Lagna sign and optional `calculateKaalVelas` output from `getOrCreateExtendedSpecialPoints`.

**Gl/Bh/Hl and DECISION [1]:** `calculateGhatiLagna`, `calculateBhavaLagna`, and `calculateHoraLagna` accept optional `isNightBirth` and `udayaLagnaLongitude`. Until the Vedic API exposes them, the pipeline omits them (day-birth / sunrise base). Results include optional `isNightBirth` and `baseLongitudeUsed` when present.

**Kaal Vela:** `KaalVelaResult` exposes `referenceLongitude` (DECISION [9]); `midpointLongitude` is set to the same value for backward compatibility with older cached payloads.

### Signs and numbers

Signs 1-12 in zodiac order:
  Aries=1  Taurus=2  Gemini=3  Cancer=4  Leo=5  Virgo=6
  Libra=7  Scorpio=8  Sagittarius=9  Capricorn=10  Aquarius=11  Pisces=12

Sign nature:
  Movable (Chara):    1 4 7 10
  Fixed (Sthira):     2 5 8 11
  Dual (Dvisvabhava): 3 6 9 12
  Odd  (Visama):      1 3 5 7 9 11
  Even (Sama):        2 4 6 8 10 12

Inclusive sign counting wraps modulo 12:
  countSignsBetween(from, to) = ((to - from + 12) % 12) + 1
  advanceSigns(start, steps)  = ((start - 1 + steps - 1) % 12 + 1)

Longitude to sign + degree:
  sign   = Math.floor(longitude / 30) + 1
  degree = longitude % 30

### Lagna lords

  Aries=Mars  Taurus=Venus  Gemini=Mercury  Cancer=Moon
  Leo=Sun     Virgo=Mercury  Libra=Venus
  Scorpio=[Mars, Ketu]    Sagittarius=Jupiter
  Capricorn=Saturn  Aquarius=[Saturn, Rahu]  Pisces=Jupiter

For dual-lord signs (Scorpio, Aquarius), use the five-step
strength hierarchy (see VSP-04) to pick the stronger lord.

### Time constants

  1 Ghati          = 24 minutes
  1 Ghati          = 60 Vighatikas
  1 Vighati        = 0.5 degrees of zodiacal movement
  1 sign           = 30 degrees

Lagna advance rates:
  Ghati Lagna  1 sign / 1 Ghati  (24 min)   fastest
  Hora Lagna   1 sign / 2.5 Ghati (60 min)
  Bhava Lagna  1 sign / 5 Ghati  (120 min)   slowest

Day birth:   base longitude = Sun's absolute longitude at sunrise
Night birth: base longitude = Udaya Lagna longitude at birth moment
             (requires DECISION [1] to be resolved)

### Absolute longitude helper

For any planet:
  absoluteLongitude = (signNumber - 1) * 30 + degreeInSign

For Rahu in Charakaraka ranking only (retrograde inversion):
  rankingLongitude = 30 * 3600 - (deg * 3600 + min * 60 + sec) total seconds
  then split back into deg/min/sec

For Rahu in Bhrigu Bindu: use raw absolute longitude, no inversion.

---

## DEPENDENCY MAP

Read this before starting. It shows which tasks must be complete
before a given task can begin.

  VSP-01 (Types)             no dependencies
  VSP-02 (Constants)         no dependencies
  VSP-03 (Sign helpers)      VSP-02
  VSP-04 (Dual-lord picker)  VSP-02, VSP-03
  VSP-05 (AL)                VSP-03, VSP-04
  VSP-06 (UL)                VSP-03, VSP-04  [same logic as AL from 12th]
  VSP-07 (Sree Lagna)        VSP-03, VSP-04
  VSP-08 (Varnada Lagna)     VSP-03  [depends on HL result at runtime]
  VSP-09 (GL)                VSP-02, VSP-03  [DECISION [1] for night birth]
  VSP-10 (BL)                VSP-02, VSP-03  [DECISION [1],[2] for night birth]
  VSP-11 (HL)                VSP-02, VSP-03  [DECISION [1],[2] for night birth]
  VSP-12 (Pranapada)         VSP-03  [RESOLVED]
  VSP-13 (Charakarakas)      VSP-02, VSP-03
  VSP-14 (Dhooma chain)      VSP-02  [fully self-contained]
  VSP-15 (Beeja Sphuta)      VSP-02
  VSP-16 (Kshetra Sphuta)    VSP-02
  VSP-17 (Trisphuta)         VSP-02  [DECISION [3],[4] — Gulika + Lagna degree]
  VSP-18 (Bhrigu Bindu)      VSP-02  [RESOLVED]
  VSP-19 (Kaal Velas)        VSP-02  [DECISION [3] — weekday + daytime arc]
  VSP-20 (Aggregator)        VSP-05 through VSP-19
  VSP-21 (chartService wire) VSP-20
  VSP-22 (KV cache)          VSP-21
  VSP-23 (API routes)        VSP-22

Execution order the agent should follow:
  VSP-01 -> VSP-02 -> VSP-03 -> VSP-04
  -> VSP-05, VSP-06, VSP-07, VSP-08 (parallel — all need 03+04)
  -> VSP-09, VSP-10, VSP-11, VSP-12 (parallel — time-based Lagnas)
  -> VSP-13 (Charakarakas — complex, do separately)
  -> VSP-14, VSP-15, VSP-16, VSP-17, VSP-18, VSP-19 (parallel — math points)
  -> VSP-20 (aggregator — all calculators must be done first)
  -> VSP-21 -> VSP-22 -> VSP-23

---

## LAYER 1 — TYPES

### VSP-01 — All TypeScript types

File: types/index.ts
Add all of the following. Do not remove existing types.

```typescript
// ── Primitive types ───────────────────────────────────────────────────────

export type SignNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'

export type Charakaraka =
  | 'Atmakaraka'       // AK  — soul's core lesson
  | 'Amatyakaraka'     // AmK — career / minister
  | 'Bhratrukaraka'    // BK  — siblings
  | 'Matrukaraka'      // MK  — mother
  | 'Pitrukaraka'      // PiK — father
  | 'Putrakaraka'      // PK  — children / creativity
  | 'Gnatikaraka'      // GK  — kinsmen / obstacles
  | 'Darakaraka'       // DK  — spouse / partnerships

export type KaalVelaPlanet =
  | 'Gulika' | 'Maandi' | 'Kaala' | 'Mrityu'
  | 'Ardhaprahara' | 'Yamaghantaka'

// ── Input shape from Vedic API ────────────────────────────────────────────

export interface PlanetPosition {
  planet: PlanetName
  signNumber: SignNumber
  degreeInSign: number        // 0–29 whole degrees within the sign
  arcMinutes: number          // 0–59 (for Charakaraka tiebreaking only)
  arcSeconds: number          // 0–59 (for Charakaraka tiebreaking only)
  // If API returns decimal longitude, derive these as:
  //   degreeInSign = Math.floor(decimalDeg)
  //   arcMinutes   = Math.floor((decimalDeg % 1) * 60)
  //   arcSeconds   = Math.round(((decimalDeg % 1) * 60 % 1) * 60)
}

// ── Arudha Padas ──────────────────────────────────────────────────────────

export interface ArudhaLagnaResult {
  arudhaSignNumber: SignNumber
  lagnaSignNumber: SignNumber
  lagnaLord: PlanetName
  lordSignNumber: SignNumber
  stepsFromLagnaToLord: number
  exceptionApplied: 'none' | 'use_10th' | 'use_4th'
}

export interface UpapadaLagnaResult {
  upapadaSignNumber: SignNumber
  twelfthHouseLord: PlanetName
  lordSignNumber: SignNumber
  stepsFromTwelfthToLord: number
  exceptionApplied: 'none' | 'use_10th_from_12th' | 'use_4th_from_12th'
}

// ── Wealth / relationship Lagnas ──────────────────────────────────────────

export interface SreeLagnaResult {
  sreeLagnaSignNumber: SignNumber
  ninthLordFromLagnaKalas: number
  ninthLordFromMoonKalas: number
  totalKalas: number
  remainder: number
}

export interface VarnadaLagnaResult {
  varnadaLagnaSignNumber: SignNumber
  lagnaIsOdd: boolean
  horaLagnaIsOdd: boolean
  countFromAries: number
  countFromHoraLagna: number
}

// ── Time-based Lagnas ─────────────────────────────────────────────────────
// All three carry isNightBirth + baseLongitudeUsed for audit trail.
// DECISION [1]: isNightBirth will be false until night-birth data confirmed.

export interface GhatiLagnaResult {
  ghatiLagnaSignNumber: SignNumber
  ghatiLagnaDegree: number
  fullGhatikasSinceSunrise: number
  vighatikasFraction: number
  sunLongitudeAtSunrise: number
  isNightBirth: boolean
  baseLongitudeUsed: number
}

export interface BhavaLagnaResult {
  // DECISION [2]: rate equivalence flagged. Formula is correct either way.
  bhavaLagnaSignNumber: SignNumber
  bhavaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
  isNightBirth: boolean
  baseLongitudeUsed: number
}

export interface HoraLagnaResult {
  // DECISION [2]: rate equivalence flagged. Formula is correct either way.
  horaLagnaSignNumber: SignNumber
  horaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
  isNightBirth: boolean
  baseLongitudeUsed: number
}

export interface PranapadalagnaResult {
  // DECISION [7]: RESOLVED. Movable/Fixed/Dual rule confirmed.
  pranapadalagnaSignNumber: SignNumber
  pranapadalagnaDegree: number
  sunSignAtSunrise: SignNumber
  startingRule: 'from_sun' | 'from_9th_from_sun' | 'from_5th_from_sun'
  startingSignNumber: SignNumber
  sunLongitudeAtSunrise: number
  vighatisSinceSunrise: number
  offsetDegrees: number
}

// ── Charakarakas ──────────────────────────────────────────────────────────

export interface CharakarakaResult {
  rank: Charakaraka
  planet: PlanetName
  rankingDegree: number
  rankingArcMinutes: number
  rankingArcSeconds: number
  rawDegreeInSign: number
  sharedRank: boolean
}

export interface SthiraKarakaDeficit {
  missingRank: Charakaraka
  sthiraKaraka: PlanetName
  reason: string
}

export interface CharakarakaSetResult {
  karakas: CharakarakaResult[]
  deficit: SthiraKarakaDeficit | null
}

// ── Mathematical points (Sphutas) ─────────────────────────────────────────

export interface BeejaSphutaResult {
  beejaSphutaLongitude: number
  beejaSphutaSign: SignNumber
  beejaSphutaDegree: number
}

export interface KsheetraSphutaResult {
  kshetraSphutaLongitude: number
  kshetraSphutaSign: SignNumber
  kshetraSphutaDegree: number
}

export interface TriSphutaResult {
  // DECISION [4]: Lagna degree — sign cusp used as fallback.
  triSphutaLongitude: number
  triSphutaSign: SignNumber
  triSphutaDegree: number
  gulikaLongitudeUsed: number
}

export interface BhriguBinduResult {
  // DECISION [8]: RESOLVED. Formula = (Moon + Rahu) / 2.
  bhriguBinduLongitude: number
  bhriguBinduSign: SignNumber
  bhriguBinduDegree: number
  moonLongitudeUsed: number
  rahuLongitudeUsed: number
}

// ── Non-luminous points ───────────────────────────────────────────────────

export interface DhoomaChainResult {
  dhooma: number
  vyatipata: number
  parivesha: number
  indraChapa: number
  upaketu: number
  dhoomaSign: SignNumber
  vyatipataSign: SignNumber
  pariveshaSign: SignNumber
  indraChapSign: SignNumber
  upaKetuSign: SignNumber
}

// ── Kaal Velas ────────────────────────────────────────────────────────────

export interface KaalVelaResult {
  planet: KaalVelaPlanet
  portionNumber: number
  startMinutesFromSunrise: number
  endMinutesFromSunrise: number
  referenceLongitude: number      // start for Gulika, midpoint for all others
  signNumber: SignNumber
}

export interface KaalVelaSetResult {
  gulika: KaalVelaResult          // DECISION [9] RESOLVED: start of Saturn's portion
  maandi: KaalVelaResult          // DECISION [9] RESOLVED: midpoint of Saturn's portion
  kaala: KaalVelaResult
  mrityu: KaalVelaResult
  ardhaprahara: KaalVelaResult
  yamaghantaka: KaalVelaResult
}

// ── Aggregate result shapes ───────────────────────────────────────────────

export interface SpecialPointsResult {
  // Core set — all fields are always present
  arudhaLagna: ArudhaLagnaResult
  upapadaLagna: UpapadaLagnaResult
  sreeLagna: SreeLagnaResult
  varnadaLagna: VarnadaLagnaResult
  ghatiLagna: GhatiLagnaResult
  bhavaLagna: BhavaLagnaResult
  horaLagna: HoraLagnaResult
  pranapada: PranapadalagnaResult
  charakarakas: CharakarakaSetResult
  dhooma: DhoomaChainResult
  beejaSphuata: BeejaSphutaResult
  kshetraSphuata: KsheetraSphutaResult
  bhriguBindu: BhriguBinduResult
  // Conditionally null pending open decisions
  trisphuta: TriSphutaResult | null      // null until DECISION [3] + [4] resolved
  kaalVelas: KaalVelaSetResult | null    // null until DECISION [3] resolved
}
```

Done when: types/index.ts compiles with zero TypeScript errors.

---

## LAYER 2 — SHARED HELPERS

### VSP-02 — Constants

File: /lib/astro/specialPoints.ts (create this file)

```typescript
// STATUS: pending | Task VSP-02
// See ARCHITECTURE REFERENCE for the meaning of every constant.

import type {
  SignNumber, PlanetName, PlanetPosition, Charakaraka,
  ArudhaLagnaResult, UpapadaLagnaResult, SreeLagnaResult,
  VarnadaLagnaResult, GhatiLagnaResult, BhavaLagnaResult,
  HoraLagnaResult, PranapadalagnaResult, CharakarakaResult,
  CharakarakaSetResult, SthiraKarakaDeficit, BeejaSphutaResult,
  KsheetraSphutaResult, TriSphutaResult, BhriguBinduResult,
  DhoomaChainResult, KaalVelaResult, KaalVelaSetResult,
  SpecialPointsResult, KaalVelaPlanet
} from '@/types'

type SignNature = 'movable' | 'fixed' | 'dual'

const SIGN_LORDS: Record<SignNumber, PlanetName | [PlanetName, PlanetName]> = {
  1:  'Mars',
  2:  'Venus',
  3:  'Mercury',
  4:  'Moon',
  5:  'Sun',
  6:  'Mercury',
  7:  'Venus',
  8:  ['Mars', 'Ketu'],
  9:  'Jupiter',
  10: 'Saturn',
  11: ['Saturn', 'Rahu'],
  12: 'Jupiter',
}

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

const MINUTES_PER_GHATI    = 24
const VIGHATIS_PER_GHATI   = 60
const DEGREES_PER_SIGN     = 30
const DEGREES_PER_VIGHATI  = DEGREES_PER_SIGN / VIGHATIS_PER_GHATI  // 0.5

// Weekday to ruling planet (0=Sunday, 6=Saturday)
const WEEKDAY_LORDS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
]

const PLANET_TO_SATELLITE: Partial<Record<PlanetName, KaalVelaPlanet>> = {
  Sun:     'Kaala',
  Mars:    'Mrityu',
  Mercury: 'Ardhaprahara',
  Jupiter: 'Yamaghantaka',
  Saturn:  'Gulika',
}

const CHARAKARAKA_ORDER: Charakaraka[] = [
  'Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 'Matrukaraka',
  'Pitrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka',
]

const CK_PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'
]

const STHIRA_KARAKA: Record<Charakaraka, PlanetName> = {
  Atmakaraka: 'Sun', Amatyakaraka: 'Jupiter', Bhratrukaraka: 'Mars',
  Matrukaraka: 'Moon', Pitrukaraka: 'Sun', Putrakaraka: 'Jupiter',
  Gnatikaraka: 'Mars', Darakaraka: 'Venus',
}
```

Done when: file compiles (imports only, no functions yet).

---

### VSP-03 — Sign arithmetic helpers

File: /lib/astro/specialPoints.ts (add to existing file)

```typescript
/** Count signs from fromSign to toSign inclusive, wrapping at 12. */
export function countSignsBetween(fromSign: SignNumber, toSign: SignNumber): number {
  return ((toSign - fromSign + 12) % 12) + 1
}

/** Advance startSign by (steps - 1) positions. First step = startSign. */
export function advanceSigns(startSign: SignNumber, steps: number): SignNumber {
  return (((startSign - 1) + (steps - 1)) % 12 + 1) as SignNumber
}

/** Convert absolute ecliptic longitude (0–360) to sign + degree. */
export function longitudeToSignAndDegree(longitude: number): { sign: SignNumber; degree: number } {
  const n = ((longitude % 360) + 360) % 360
  return {
    sign:   (Math.floor(n / DEGREES_PER_SIGN) + 1) as SignNumber,
    degree: n % DEGREES_PER_SIGN,
  }
}

/** Wrap any longitude to 0–360. */
export function wrapLongitude(n: number): number {
  return ((n % 360) + 360) % 360
}

/** Planet sign position to absolute longitude. */
export function toAbsoluteLongitude(signNumber: SignNumber, degreeInSign: number): number {
  return (signNumber - 1) * DEGREES_PER_SIGN + degreeInSign
}
```

Sanity checks (verify mentally — do not delete these comments):
```typescript
// countSignsBetween(1, 4)  === 4
// countSignsBetween(4, 1)  === 10
// advanceSigns(1, 4)       === 4   (Cancer)
// advanceSigns(10, 4)      === 1   (Aries, wraps)
// longitudeToSignAndDegree(0)   -> { sign: 1,  degree: 0  }
// longitudeToSignAndDegree(45)  -> { sign: 2,  degree: 15 }
// longitudeToSignAndDegree(359) -> { sign: 12, degree: 29 }
```

Done when: all five functions compile.

---

### VSP-04 — Dual-lord tiebreaker

File: /lib/astro/specialPoints.ts

Used only for Scorpio (Mars vs Ketu) and Aquarius (Saturn vs Rahu).
Five-step Parashara hierarchy: planet count → own sign → exaltation/
debilitation → sign nature (Dual > Fixed > Movable) → sign number.

```typescript
function getOwnSigns(planet: PlanetName): SignNumber[] {
  const result: SignNumber[] = []
  for (const [s, lord] of Object.entries(SIGN_LORDS)) {
    const sign = Number(s) as SignNumber
    if (Array.isArray(lord) ? lord.includes(planet) : lord === planet) result.push(sign)
  }
  return result
}

export function getStrongerLord(
  lordA: PlanetName, lordB: PlanetName, planets: PlanetPosition[]
): PlanetName {
  const signOf   = (p: PlanetName) => planets.find(x => x.planet === p)!.signNumber
  const countIn  = (s: SignNumber) => planets.filter(x => x.signNumber === s).length
  const sA = signOf(lordA), sB = signOf(lordB)

  const cA = countIn(sA), cB = countIn(sB)
  if (cA !== cB) return cA > cB ? lordA : lordB

  const ownA = getOwnSigns(lordA).includes(sA)
  const ownB = getOwnSigns(lordB).includes(sB)
  if (ownA !== ownB) return ownA ? lordA : lordB

  const exA = EXALTATION_SIGN[lordA] === sA,   exB = EXALTATION_SIGN[lordB] === sB
  const dbA = DEBILITATION_SIGN[lordA] === sA, dbB = DEBILITATION_SIGN[lordB] === sB
  if (exA !== exB) return exA ? lordA : lordB
  if (dbA !== dbB) return dbA ? lordB : lordA

  const order: Record<SignNature, number> = { movable: 0, fixed: 1, dual: 2 }
  const nA = order[SIGN_NATURE[sA]], nB = order[SIGN_NATURE[sB]]
  if (nA !== nB) return nA > nB ? lordA : lordB

  return sA >= sB ? lordA : lordB
}
```

Done when: function compiles with no `any` types.

---

## LAYER 3 — CALCULATORS

Each calculator is independent of all others in this layer.
They all depend on VSP-02, VSP-03. Those marked with VSP-04 also
need the dual-lord tiebreaker.

---

### VSP-05 — Arudha Lagna (AL)

Meaning: worldly image, public perception, financial status.
Depends on: VSP-03, VSP-04

Algorithm:
1. Find Lagna lord (resolve dual lords via getStrongerLord).
2. Count signs from Lagna to lord inclusive = N.
3. Advance N signs from lord = raw AL.
4. Exceptions: raw AL = Lagna → use 10th. raw AL = 7th → use 4th.

```typescript
export function calculateArudhaLagna(
  lagnaSignNumber: SignNumber, planets: PlanetPosition[]
): ArudhaLagnaResult {
  const rawLord = SIGN_LORDS[lagnaSignNumber]
  const lagnaLord: PlanetName = Array.isArray(rawLord)
    ? getStrongerLord(rawLord[0], rawLord[1], planets) : rawLord

  const lordPos = planets.find(p => p.planet === lagnaLord)
  if (!lordPos) throw new Error(`[calculateArudhaLagna] "${lagnaLord}" not in planets`)

  const lordSignNumber = lordPos.signNumber
  const steps = countSignsBetween(lagnaSignNumber, lordSignNumber)
  let rawAL   = advanceSigns(lordSignNumber, steps)

  const seventh = advanceSigns(lagnaSignNumber, 7)
  let exceptionApplied: ArudhaLagnaResult['exceptionApplied'] = 'none'

  if (rawAL === lagnaSignNumber) {
    rawAL = advanceSigns(lagnaSignNumber, 10); exceptionApplied = 'use_10th'
  } else if (rawAL === seventh) {
    rawAL = advanceSigns(lagnaSignNumber, 4);  exceptionApplied = 'use_4th'
  }

  return { arudhaSignNumber: rawAL, lagnaSignNumber, lagnaLord,
           lordSignNumber, stepsFromLagnaToLord: steps, exceptionApplied }
}
```

Done when: function compiles and both exceptions are reachable.

---

### VSP-06 — Upapada Lagna (UL)

Meaning: marriage and the nature of the spouse.
Depends on: VSP-03, VSP-04

Same algorithm as AL but anchored to the 12th house.

```typescript
export function calculateUpapadaLagna(
  lagnaSignNumber: SignNumber, planets: PlanetPosition[]
): UpapadaLagnaResult {
  const twelfthHouseSign = advanceSigns(lagnaSignNumber, 12)

  const rawLord = SIGN_LORDS[twelfthHouseSign]
  const twelfthLord: PlanetName = Array.isArray(rawLord)
    ? getStrongerLord(rawLord[0], rawLord[1], planets) : rawLord

  const lordPos = planets.find(p => p.planet === twelfthLord)
  if (!lordPos) throw new Error(`[calculateUpapadaLagna] "${twelfthLord}" not in planets`)

  const lordSignNumber = lordPos.signNumber
  const steps = countSignsBetween(twelfthHouseSign, lordSignNumber)
  let rawUP   = advanceSigns(lordSignNumber, steps)

  const seventhFromTwelfth = advanceSigns(twelfthHouseSign, 7)
  let exceptionApplied: UpapadaLagnaResult['exceptionApplied'] = 'none'

  if (rawUP === twelfthHouseSign) {
    rawUP = advanceSigns(twelfthHouseSign, 10); exceptionApplied = 'use_10th_from_12th'
  } else if (rawUP === seventhFromTwelfth) {
    rawUP = advanceSigns(twelfthHouseSign, 4);  exceptionApplied = 'use_4th_from_12th'
  }

  return { upapadaSignNumber: rawUP, twelfthHouseLord: twelfthLord,
           lordSignNumber, stepsFromTwelfthToLord: steps, exceptionApplied }
}
```

Done when: function compiles and both exceptions are reachable.

---

### VSP-07 — Sree Lagna (SL)

Meaning: potential for great wealth.
Depends on: VSP-03, VSP-04

Algorithm:
1. Find 9th lord from Lagna. Its sign number = Kala A.
2. Find 9th lord from Moon. Its sign number = Kala B.
3. Add A + B. Remainder when divided by 12.
4. Count that many signs from Moon's sign. That is the Sree Lagna.
   If remainder = 0, Sree Lagna = Moon's sign.

```typescript
export function calculateSreeLagna(
  lagnaSignNumber: SignNumber, planets: PlanetPosition[]
): SreeLagnaResult {
  const moon = planets.find(p => p.planet === 'Moon')
  if (!moon) throw new Error('[calculateSreeLagna] Moon not found')
  const moonSignNumber = moon.signNumber

  const resolveLord = (sign: SignNumber): PlanetName => {
    const r = SIGN_LORDS[sign]
    return Array.isArray(r) ? getStrongerLord(r[0], r[1], planets) : r
  }

  const getKala = (sign: SignNumber): number => {
    const lord = resolveLord(sign)
    const pos  = planets.find(p => p.planet === lord)
    if (!pos) throw new Error(`[calculateSreeLagna] lord "${lord}" not found`)
    return pos.signNumber
  }

  const ninthFromLagna = advanceSigns(lagnaSignNumber, 9)
  const ninthFromMoon  = advanceSigns(moonSignNumber, 9)
  const kalaA = getKala(ninthFromLagna)
  const kalaB = getKala(ninthFromMoon)

  const totalKalas = kalaA + kalaB
  const remainder  = totalKalas % 12
  const sreeLagnaSign = remainder === 0 ? moonSignNumber : advanceSigns(moonSignNumber, remainder)

  return { sreeLagnaSignNumber: sreeLagnaSign,
           ninthLordFromLagnaKalas: kalaA, ninthLordFromMoonKalas: kalaB,
           totalKalas, remainder }
}
```

Done when: function compiles.

---

### VSP-08 — Varnada Lagna (VL)

Meaning: longevity analysis and lifespan of relatives.
Depends on: VSP-03 (runtime: also needs HL result from VSP-11)

DECISION [5]: OPEN — some traditions count from Pisces when both signs
are even. Current implementation always counts from Aries. Leave comment.

Algorithm:
1. A = Lagna sign number. B = Hora Lagna sign number.
2. Both odd or both even → result = A + B (from Aries).
3. One odd, one even → result = |A - B| (from Aries).
4. Wrap to 1–12.

```typescript
export function calculateVarnadaLagna(
  lagnaSignNumber: SignNumber, horaLagnaSignNumber: SignNumber
): VarnadaLagnaResult {
  // DECISION [5]: OPEN — always counting from Aries (most common Parashara rule)
  const ODD = new Set<SignNumber>([1, 3, 5, 7, 9, 11])
  const lagnaIsOdd     = ODD.has(lagnaSignNumber)
  const horaLagnaIsOdd = ODD.has(horaLagnaSignNumber)

  const A = lagnaSignNumber, B = horaLagnaSignNumber
  const rawCount = lagnaIsOdd === horaLagnaIsOdd ? A + B : Math.abs(A - B)
  const varnadaSignNumber = (((rawCount - 1) % 12) + 12) % 12 + 1

  return {
    varnadaLagnaSignNumber: varnadaSignNumber as SignNumber,
    lagnaIsOdd, horaLagnaIsOdd,
    countFromAries: A, countFromHoraLagna: B,
  }
}
```

Sanity checks:
```typescript
// Lagna=Aries(1 odd), HL=Gemini(3 odd): both odd -> 1+3=4 -> Cancer
// Lagna=Aries(1 odd), HL=Taurus(2 even): one odd -> |1-2|=1 -> Aries
```

Done when: function compiles.

---

### VSP-09 — Ghati Lagna (GL)

Meaning: power, authority, command.
Rate: 1 sign per 24 minutes (1 Ghati). Fastest.
DECISION [1]: OPEN — night birth falls back to day logic until resolved.

```typescript
export function calculateGhatiLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number,
  isNightBirth: boolean | null,
  udayaLagnaLongitude: number | null
): GhatiLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateGhatiLagna] minutesSinceSunrise must be >= 0')

  // DECISION [1]: OPEN — confirm isNightBirth + udayaLagnaLongitude field names
  let baseLongitude: number
  let nightBirthApplied: boolean

  if (isNightBirth === true && udayaLagnaLongitude !== null) {
    baseLongitude = udayaLagnaLongitude; nightBirthApplied = true
  } else {
    if (isNightBirth === true)
      console.warn('[calculateGhatiLagna] Night birth but udayaLagnaLongitude is null. Using day fallback.')
    baseLongitude = sunAbsoluteLongitudeAtSunrise; nightBirthApplied = false
  }

  const total   = minutesSinceSunrise / MINUTES_PER_GHATI
  const full    = Math.floor(total)
  const vigh    = (total - full) * VIGHATIS_PER_GHATI
  const degrees = (full * DEGREES_PER_SIGN) + (vigh * DEGREES_PER_VIGHATI)
  const { sign, degree } = longitudeToSignAndDegree(baseLongitude + degrees)

  return {
    ghatiLagnaSignNumber: sign,
    ghatiLagnaDegree: Math.round(degree * 1000) / 1000,
    fullGhatikasSinceSunrise: full,
    vighatikasFraction: Math.round(vigh * 100) / 100,
    sunLongitudeAtSunrise: sunAbsoluteLongitudeAtSunrise,
    isNightBirth: nightBirthApplied,
    baseLongitudeUsed: baseLongitude,
  }
}
```

Sanity check: 120-minute birth (5 Ghatikas) -> GL advances 5 signs.

Done when: function compiles, both day and night paths reachable.

---

### VSP-10 — Bhava Lagna (BL)

Meaning: body, physical constitution, general circumstances.
Rate: 1 sign per 120 minutes (5 Ghatikas). Slowest.
DECISION [1]: OPEN — night birth fallback.
DECISION [2]: OPEN — rate equivalence. Formula is correct either way.

```typescript
export function calculateBhavaLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number,
  isNightBirth: boolean | null,
  udayaLagnaLongitude: number | null
): BhavaLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateBhavaLagna] minutesSinceSunrise must be >= 0')

  // DECISION [2]: OPEN — 5 Ghatikas/sign = 1 sign/2 hours. Mathematically identical.
  const GHATIKAS_PER_SIGN = 5

  let baseLongitude: number, nightBirthApplied: boolean
  if (isNightBirth === true && udayaLagnaLongitude !== null) {
    baseLongitude = udayaLagnaLongitude; nightBirthApplied = true
  } else {
    if (isNightBirth === true)
      console.warn('[calculateBhavaLagna] Night birth but udayaLagnaLongitude is null. Using day fallback.')
    baseLongitude = sunAbsoluteLongitudeAtSunrise; nightBirthApplied = false
  }

  const totalGhatikas  = minutesSinceSunrise / MINUTES_PER_GHATI
  const degrees        = (totalGhatikas / GHATIKAS_PER_SIGN) * DEGREES_PER_SIGN
  const { sign, degree } = longitudeToSignAndDegree(baseLongitude + degrees)

  return {
    bhavaLagnaSignNumber: sign,
    bhavaLagnaDegree: Math.round(degree * 1000) / 1000,
    totalGhatikasSinceSunrise: Math.round(totalGhatikas * 1000) / 1000,
    sunLongitudeAtSunrise: sunAbsoluteLongitudeAtSunrise,
    isNightBirth: nightBirthApplied, baseLongitudeUsed: baseLongitude,
  }
}
```

Sanity check: 120-minute birth -> BL advances 1 sign.

Done when: function compiles.

---

### VSP-11 — Hora Lagna (HL)

Meaning: wealth, financial potential, accumulation.
Rate: 1 sign per 60 minutes (2.5 Ghatikas).
DECISION [1]: OPEN — night birth fallback.
DECISION [2]: OPEN — rate equivalence. Formula is correct either way.

```typescript
export function calculateHoraLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number,
  isNightBirth: boolean | null,
  udayaLagnaLongitude: number | null
): HoraLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateHoraLagna] minutesSinceSunrise must be >= 0')

  // DECISION [2]: OPEN — 2.5 Ghatikas/sign = 1 sign/1 hour. Mathematically identical.
  const GHATIKAS_PER_SIGN = 2.5

  let baseLongitude: number, nightBirthApplied: boolean
  if (isNightBirth === true && udayaLagnaLongitude !== null) {
    baseLongitude = udayaLagnaLongitude; nightBirthApplied = true
  } else {
    if (isNightBirth === true)
      console.warn('[calculateHoraLagna] Night birth but udayaLagnaLongitude is null. Using day fallback.')
    baseLongitude = sunAbsoluteLongitudeAtSunrise; nightBirthApplied = false
  }

  const totalGhatikas  = minutesSinceSunrise / MINUTES_PER_GHATI
  const degrees        = (totalGhatikas / GHATIKAS_PER_SIGN) * DEGREES_PER_SIGN
  const { sign, degree } = longitudeToSignAndDegree(baseLongitude + degrees)

  return {
    horaLagnaSignNumber: sign,
    horaLagnaDegree: Math.round(degree * 1000) / 1000,
    totalGhatikasSinceSunrise: Math.round(totalGhatikas * 1000) / 1000,
    sunLongitudeAtSunrise: sunAbsoluteLongitudeAtSunrise,
    isNightBirth: nightBirthApplied, baseLongitudeUsed: baseLongitude,
  }
}
```

Sanity check: 120-minute birth -> HL advances 2 signs.

Done when: function compiles.

---

### VSP-12 — Pranapada Lagna (PP)

Meaning: auspiciousness of birth. Fortunate when falling in houses
2, 4, 5, 9, 10, or 11 from the natal Lagna.
DECISION [7]: RESOLVED — Movable/Fixed/Dual starting-point rule.

Algorithm:
1. vighatikas = minutesSinceSunrise * 2.5
2. offsetDegrees = vighatikas / 15
3. Determine Sun's sign nature at sunrise.
4. Movable (1,4,7,10): start from Sun. Fixed (2,5,8,11): start from
   9th from Sun. Dual (3,6,9,12): start from 5th from Sun.
5. Starting longitude = cusp of starting sign = (sign - 1) * 30.
6. Add offsetDegrees, convert to sign + degree.

```typescript
export function calculatePranapada(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number
): PranapadalagnaResult {
  const vighatikas    = minutesSinceSunrise * 2.5
  const offsetDegrees = vighatikas / 15

  const { sign: sunSign } = longitudeToSignAndDegree(sunAbsoluteLongitudeAtSunrise)

  const MOVABLE = new Set<SignNumber>([1, 4, 7, 10])
  const FIXED   = new Set<SignNumber>([2, 5, 8, 11])
  let startingSignNumber: SignNumber
  let startingRule: PranapadalagnaResult['startingRule']

  if (MOVABLE.has(sunSign)) {
    startingSignNumber = sunSign;                     startingRule = 'from_sun'
  } else if (FIXED.has(sunSign)) {
    startingSignNumber = advanceSigns(sunSign, 9);   startingRule = 'from_9th_from_sun'
  } else {
    startingSignNumber = advanceSigns(sunSign, 5);   startingRule = 'from_5th_from_sun'
  }

  const startingLongitude  = (startingSignNumber - 1) * DEGREES_PER_SIGN
  const { sign, degree }   = longitudeToSignAndDegree(startingLongitude + offsetDegrees)

  return {
    pranapadalagnaSignNumber: sign,
    pranapadalagnaDegree:     Math.round(degree * 1000) / 1000,
    sunSignAtSunrise:         sunSign,
    startingRule,
    startingSignNumber,
    sunLongitudeAtSunrise:    sunAbsoluteLongitudeAtSunrise,
    vighatisSinceSunrise:     Math.round(vighatikas * 100) / 100,
    offsetDegrees:            Math.round(offsetDegrees * 1000) / 1000,
  }
}
```

Sanity checks:
```typescript
// Sun in Aries (movable):  start from Sun
// Sun in Taurus (fixed):   start from 9th from Sun = Capricorn (sign 10)
// Sun in Gemini (dual):    start from 5th from Sun = Libra    (sign 7)
```

Done when: function compiles, all three branches reachable.

---

### VSP-13 — Charakarakas (8 Soul Significators)

Meaning: eight soul-role assignments ranking Sun through Saturn + Rahu
by degree traversed in their current sign.
Depends on: VSP-02, VSP-03
Ketu excluded always. Rahu inverted before ranking.
Three-level tiebreak: degree -> arc-minutes -> arc-seconds.
Shared-rank triggers the deficit + Sthira Karaka rule.

```typescript
interface RankingLong {
  planet: PlanetName; rawDegreeInSign: number
  deg: number; min: number; sec: number
}

function toRankingLong(p: PlanetPosition): RankingLong {
  if (p.planet !== 'Rahu') {
    return { planet: p.planet, rawDegreeInSign: p.degreeInSign,
             deg: p.degreeInSign, min: p.arcMinutes, sec: p.arcSeconds }
  }
  const totalRawSec = p.degreeInSign * 3600 + p.arcMinutes * 60 + p.arcSeconds
  const inv = 30 * 3600 - totalRawSec
  return { planet: p.planet, rawDegreeInSign: p.degreeInSign,
           deg: Math.floor(inv / 3600),
           min: Math.floor((inv % 3600) / 60),
           sec: inv % 60 }
}

function cmpDesc(a: RankingLong, b: RankingLong): number {
  if (a.deg !== b.deg) return b.deg - a.deg
  if (a.min !== b.min) return b.min - a.min
  return b.sec - a.sec
}

function rankEqual(a: RankingLong, b: RankingLong): boolean {
  return a.deg === b.deg && a.min === b.min && a.sec === b.sec
}

export function calculateCharakarakas(planets: PlanetPosition[]): CharakarakaSetResult {
  const eligible = planets.filter(p => CK_PLANETS.includes(p.planet))
  if (eligible.length < 8) throw new Error(
    `[calculateCharakarakas] Need 8 planets. Found: ${eligible.map(p => p.planet).join(', ')}`
  )

  const ranked = eligible.map(toRankingLong).sort(cmpDesc)

  let sharedIdx: number | null = null
  for (let i = 0; i < ranked.length - 1; i++) {
    if (rankEqual(ranked[i], ranked[i + 1])) { sharedIdx = i; break }
  }

  if (sharedIdx === null) {
    return {
      karakas: ranked.map((r, i) => ({
        rank: CHARAKARAKA_ORDER[i], planet: r.planet,
        rankingDegree: r.deg, rankingArcMinutes: r.min, rankingArcSeconds: r.sec,
        rawDegreeInSign: r.rawDegreeInSign, sharedRank: false,
      })),
      deficit: null,
    }
  }

  const sharedRankName  = CHARAKARAKA_ORDER[sharedIdx]
  const deficitRankName = CHARAKARAKA_ORDER[sharedIdx + 1]
  const karakas: CharakarakaResult[] = []
  let oi = 0

  for (let i = 0; i < ranked.length; i++) {
    const r = ranked[i]
    const isA = i === sharedIdx, isB = i === sharedIdx + 1

    if (isA || isB) {
      karakas.push({ rank: sharedRankName, planet: r.planet,
        rankingDegree: r.deg, rankingArcMinutes: r.min, rankingArcSeconds: r.sec,
        rawDegreeInSign: r.rawDegreeInSign, sharedRank: true })
      if (isB) oi = sharedIdx + 2
    } else {
      karakas.push({ rank: CHARAKARAKA_ORDER[oi], planet: r.planet,
        rankingDegree: r.deg, rankingArcMinutes: r.min, rankingArcSeconds: r.sec,
        rawDegreeInSign: r.rawDegreeInSign, sharedRank: false })
      oi++
    }
  }

  return {
    karakas,
    deficit: {
      missingRank: deficitRankName, sthiraKaraka: STHIRA_KARAKA[deficitRankName],
      reason: `${ranked[sharedIdx].planet} and ${ranked[sharedIdx + 1].planet} ` +
              `share identical longitude (${sharedRankName}). ` +
              `Use ${STHIRA_KARAKA[deficitRankName]} as Sthira Karaka for ${deficitRankName}.`,
    },
  }
}
```

Sanity checks:
```typescript
// No tie:  karakas.length=8, deficit=null
// Tie at 0: both planets get Atmakaraka, Amatyakaraka is deficit
// Rahu at 10d 30m 00s -> ranking 19d 30m 00s (30*3600 - raw)
// Planet A 18d 15m 30s vs B 18d 15m 29s -> A wins (higher sec)
```

Done when: function compiles. No-tie path and shared-rank path
must both be structurally reachable (no dead code).

---

### VSP-14 — Dhooma Chain (5 non-luminous malefic points)

Meaning: karmic affliction points derived from natal Sun.
Depends on: VSP-02 only. Uses natal Sun longitude, not sunrise longitude.

```typescript
export function calculateDhoomaChain(sunNatalLongitude: number): DhoomaChainResult {
  const w = (n: number) => wrapLongitude(n)
  const s = (n: number) => (Math.floor(n / 30) + 1) as SignNumber

  const DHOOMA_OFFSET  = 133 + 20 / 60   // 133° 20′
  const UPAKETU_OFFSET = 16  + 40 / 60   //  16° 40′

  const dhooma     = w(sunNatalLongitude + DHOOMA_OFFSET)
  const vyatipata  = w(360 - dhooma)
  const parivesha  = w(vyatipata + 180)
  const indraChapa = w(360 - parivesha)
  const upaketu    = w(indraChapa + UPAKETU_OFFSET)

  return {
    dhooma, vyatipata, parivesha, indraChapa, upaketu,
    dhoomaSign: s(dhooma), vyatipataSign: s(vyatipata),
    pariveshaSign: s(parivesha), indraChapSign: s(indraChapa),
    upaKetuSign: s(upaketu),
  }
}
```

Note: sunNatalLongitude = natal Sun position from vedicChart.planets
(not sunrise longitude — these are different values).

Sanity check (Sun at 0° Aries = longitude 0):
```typescript
// Dhooma     = 133.333 -> Gemini  13.33
// Vyatipata  = 226.666 -> Scorpio 16.66
// Parivesha  = 46.666  -> Taurus  16.66
// Indra Chapa = 313.333 -> Aquarius 13.33
// Upaketu    = 330.000 -> Pisces   0.00
```

Done when: function compiles and sanity check passes mentally.

---

### VSP-15 — Beeja Sphuta

Meaning: male procreative capacity.
Formula: Sun + Venus + Jupiter (absolute longitudes).

```typescript
export function calculateBeejaSphuta(planets: PlanetPosition[]): BeejaSphutaResult {
  const get = (name: PlanetName) => {
    const p = planets.find(x => x.planet === name)
    if (!p) throw new Error(`[calculateBeejaSphuta] ${name} not found`)
    return toAbsoluteLongitude(p.signNumber, p.degreeInSign)
  }
  const longitude = wrapLongitude(get('Sun') + get('Venus') + get('Jupiter'))
  const sign   = (Math.floor(longitude / 30) + 1) as SignNumber
  const degree = longitude % 30
  return { beejaSphutaLongitude: longitude, beejaSphutaSign: sign, beejaSphutaDegree: degree }
}
```

Done when: function compiles.

---

### VSP-16 — Kshetra Sphuta

Meaning: female fertility.
Formula: Mars + Moon + Jupiter (absolute longitudes).

```typescript
export function calculateKsheetraSphuta(planets: PlanetPosition[]): KsheetraSphutaResult {
  const get = (name: PlanetName) => {
    const p = planets.find(x => x.planet === name)
    if (!p) throw new Error(`[calculateKsheetraSphuta] ${name} not found`)
    return toAbsoluteLongitude(p.signNumber, p.degreeInSign)
  }
  const longitude = wrapLongitude(get('Mars') + get('Moon') + get('Jupiter'))
  const sign   = (Math.floor(longitude / 30) + 1) as SignNumber
  const degree = longitude % 30
  return { kshetraSphutaLongitude: longitude, kshetraSphutaSign: sign, kshetraSphutaDegree: degree }
}
```

Done when: function compiles.

---

### VSP-17 — Trisphuta

Meaning: used in timing of death calculations.
Formula: Lagna + Moon + Gulika (absolute longitudes).
DECISION [3]: OPEN — Gulika requires Kaal Velas to be resolved.
DECISION [4]: OPEN — Lagna longitude: sign cusp used as fallback.
Returns null when gulikaLongitude is null.

```typescript
export function calculateTrisphuta(
  lagnaSignNumber: SignNumber,
  planets: PlanetPosition[],
  gulikaLongitude: number | null
): TriSphutaResult | null {
  if (gulikaLongitude === null) return null  // DECISION [3]: OPEN

  // DECISION [4]: OPEN — using sign cusp (lagnaSignNumber - 1) * 30
  const lagnaLongitude = (lagnaSignNumber - 1) * DEGREES_PER_SIGN

  const moon = planets.find(p => p.planet === 'Moon')
  if (!moon) throw new Error('[calculateTrisphuta] Moon not found')
  const moonLongitude = toAbsoluteLongitude(moon.signNumber, moon.degreeInSign)

  const longitude = wrapLongitude(lagnaLongitude + moonLongitude + gulikaLongitude)
  const sign   = (Math.floor(longitude / 30) + 1) as SignNumber
  const degree = longitude % 30

  return {
    triSphutaLongitude: longitude, triSphutaSign: sign, triSphutaDegree: degree,
    gulikaLongitudeUsed: gulikaLongitude,
  }
}
```

Done when: function compiles, null path for blocked Gulika is handled.

---

### VSP-18 — Bhrigu Bindu

Meaning: Destiny Point — confluence of mind (Moon) and karmic desire (Rahu).
Formula (RESOLVED): (Moon longitude + Rahu longitude) / 2.
Do NOT apply Charakaraka retrograde inversion to Rahu here.

```typescript
export function calculateBhriguBindu(planets: PlanetPosition[]): BhriguBinduResult {
  const moon = planets.find(p => p.planet === 'Moon')
  const rahu = planets.find(p => p.planet === 'Rahu')
  if (!moon) throw new Error('[calculateBhriguBindu] Moon not found')
  if (!rahu) throw new Error('[calculateBhriguBindu] Rahu not found')

  const moonLong = toAbsoluteLongitude(moon.signNumber, moon.degreeInSign)
  const rahuLong = toAbsoluteLongitude(rahu.signNumber, rahu.degreeInSign)
  const longitude = wrapLongitude((moonLong + rahuLong) / 2)
  const sign   = (Math.floor(longitude / 30) + 1) as SignNumber
  const degree = longitude % 30

  return {
    bhriguBinduLongitude: Math.round(longitude * 1000) / 1000,
    bhriguBinduSign: sign,
    bhriguBinduDegree: Math.round(degree * 1000) / 1000,
    moonLongitudeUsed: Math.round(moonLong * 1000) / 1000,
    rahuLongitudeUsed: Math.round(rahuLong * 1000) / 1000,
  }
}
```

Sanity check:
  Moon at Aries 15 (long 15) + Rahu at Libra 15 (long 195) -> midpoint 105 -> Cancer 15.

Done when: function compiles.

---

### VSP-19 — Kaal Velas (Gulika, Maandi + 4 satellites)

Meaning: time-based malefic satellite points. Gulika and Maandi are
the most important — they obstruct the houses they occupy.
DECISION [3]: OPEN — requires weekday index and daytime arc duration.
Returns null when either is unavailable.

Gulika  = start of Saturn's portion (DECISION [9] RESOLVED).
Maandi  = midpoint of Saturn's portion (DECISION [9] RESOLVED).
All other satellites = midpoint of their own portion.

```typescript
export function calculateKaalVelas(
  sunAbsoluteLongitudeAtSunrise: number,
  dayDurationMinutes: number | null,  // DECISION [3]: OPEN
  weekdayIndex: number | null         // DECISION [3]: OPEN (0=Sun, 6=Sat)
): KaalVelaSetResult | null {
  // DECISION [3]: OPEN — return null until daytime arc + weekday confirmed
  if (dayDurationMinutes === null || weekdayIndex === null) return null

  const portionMinutes = dayDurationMinutes / 8

  // Build the 7 ruled portions in weekday-lord sequence from today's ruler
  const portionLords: PlanetName[] = Array.from({ length: 7 },
    (_, i) => WEEKDAY_LORDS[(weekdayIndex + i) % 7]
  )

  const results: Partial<Record<KaalVelaPlanet, KaalVelaResult>> = {}

  portionLords.forEach((lord, index) => {
    const satellite = PLANET_TO_SATELLITE[lord]
    if (!satellite) return

    const portionNumber = index + 1
    const startMin      = index * portionMinutes
    const endMin        = startMin + portionMinutes

    // DECISION [9] RESOLVED: Gulika = start; Maandi = midpoint; others = midpoint
    const refMin = satellite === 'Gulika' ? startMin : startMin + portionMinutes / 2

    const longitude  = wrapLongitude(sunAbsoluteLongitudeAtSunrise + (refMin / 24) * 30)
    const signNumber = (Math.floor(longitude / 30) + 1) as SignNumber

    results[satellite] = {
      planet: satellite, portionNumber,
      startMinutesFromSunrise: Math.round(startMin * 100) / 100,
      endMinutesFromSunrise:   Math.round(endMin   * 100) / 100,
      referenceLongitude:      Math.round(longitude * 1000) / 1000,
      signNumber,
    }

    // Maandi shares Saturn's portion but uses midpoint (already handled above if needed)
    if (satellite === 'Gulika') {
      const maandiRef  = startMin + portionMinutes / 2
      const maandiLong = wrapLongitude(sunAbsoluteLongitudeAtSunrise + (maandiRef / 24) * 30)
      results['Maandi'] = {
        planet: 'Maandi', portionNumber,
        startMinutesFromSunrise: Math.round(startMin    * 100) / 100,
        endMinutesFromSunrise:   Math.round(endMin      * 100) / 100,
        referenceLongitude:      Math.round(maandiLong  * 1000) / 1000,
        signNumber: (Math.floor(maandiLong / 30) + 1) as SignNumber,
      }
    }
  })

  const required: KaalVelaPlanet[] = ['Gulika','Maandi','Kaala','Mrityu','Ardhaprahara','Yamaghantaka']
  for (const r of required) {
    if (!results[r]) throw new Error(`[calculateKaalVelas] ${r} not assigned`)
  }

  return results as KaalVelaSetResult
}
```

Done when: function compiles. Both null path and full path are reachable.

---

## LAYER 4 — AGGREGATOR

### VSP-20 — Main aggregator function

File: /lib/astro/specialPoints.ts

All calculators from VSP-05 to VSP-19 must be complete before this task.
This is the only function external code should call.

```typescript
/**
 * Calculate all Vedic special points from natal chart data.
 *
 * @param lagnaSignNumber                 Ascendant sign 1-12
 * @param planets                         Nine-planet position array
 * @param sunAbsoluteLongitudeAtSunrise   Sun longitude at local sunrise (0-360)
 * @param sunNatalLongitude               Sun natal position (for Dhooma chain)
 * @param minutesSinceSunrise             Elapsed minutes from sunrise to birth
 * @param isNightBirth                    null until DECISION [1] resolved
 * @param udayaLagnaLongitude             null until DECISION [1] resolved
 * @param dayDurationMinutes              null until DECISION [3] resolved
 * @param weekdayIndex                    null until DECISION [3] resolved
 */
export function calculateSpecialPoints(
  lagnaSignNumber: SignNumber,
  planets: PlanetPosition[],
  sunAbsoluteLongitudeAtSunrise: number,
  sunNatalLongitude: number,
  minutesSinceSunrise: number,
  isNightBirth: boolean | null = null,
  udayaLagnaLongitude: number | null = null,
  dayDurationMinutes: number | null = null,
  weekdayIndex: number | null = null
): SpecialPointsResult {
  // Time-based Lagnas — all share the same day/night params
  const ghatiLagna = calculateGhatiLagna(sunAbsoluteLongitudeAtSunrise,
    minutesSinceSunrise, isNightBirth, udayaLagnaLongitude)
  const bhavaLagna = calculateBhavaLagna(sunAbsoluteLongitudeAtSunrise,
    minutesSinceSunrise, isNightBirth, udayaLagnaLongitude)
  const horaLagna  = calculateHoraLagna(sunAbsoluteLongitudeAtSunrise,
    minutesSinceSunrise, isNightBirth, udayaLagnaLongitude)

  // Kaal Velas (may be null — see DECISION [3])
  const kaalVelas = calculateKaalVelas(
    sunAbsoluteLongitudeAtSunrise, dayDurationMinutes, weekdayIndex)

  // Trisphuta depends on Gulika (may be null — see DECISION [3])
  const gulikaLongitude = kaalVelas?.gulika?.referenceLongitude ?? null
  const trisphuta = calculateTrisphuta(lagnaSignNumber, planets, gulikaLongitude)

  return {
    arudhaLagna:   calculateArudhaLagna(lagnaSignNumber, planets),
    upapadaLagna:  calculateUpapadaLagna(lagnaSignNumber, planets),
    sreeLagna:     calculateSreeLagna(lagnaSignNumber, planets),
    varnadaLagna:  calculateVarnadaLagna(lagnaSignNumber, horaLagna.horaLagnaSignNumber),
    ghatiLagna,
    bhavaLagna,
    horaLagna,
    pranapada:     calculatePranapada(sunAbsoluteLongitudeAtSunrise, minutesSinceSunrise),
    charakarakas:  calculateCharakarakas(planets),
    dhooma:        calculateDhoomaChain(sunNatalLongitude),
    beejaSphuata:  calculateBeejaSphuta(planets),
    kshetraSphuata: calculateKsheetraSphuta(planets),
    bhriguBindu:   calculateBhriguBindu(planets),
    trisphuta,
    kaalVelas,
  }
}
```

Done when: entire specialPoints.ts compiles with zero TypeScript errors.

---

## LAYER 5 — INFRASTRUCTURE

### VSP-21 — Chart service integration

File: /lib/astro/chartService.ts

Add the following. No `any` casts — field names from DECISION [6] are confirmed.
Night-birth fields use `any` casts with DECISION [1] comment — leave them.

```typescript
import { calculateSpecialPoints } from './specialPoints'
import type { SpecialPointsResult, SignNumber, PlanetPosition } from '@/types'

/**
 * Derive all special points from a stored VedicChartData object.
 * Returns null if required fields are absent.
 */
export function deriveSpecialPoints(
  vedicChart: VedicChartData
): SpecialPointsResult | null {
  // Confirmed fields — DECISION [6] RESOLVED
  const lagnaSign    = vedicChart.lagnaSignNumber
  const planets      = vedicChart.planets
  const sunAtSunrise = vedicChart.sunriseData?.sunAbsoluteLongitude
  const minsSunrise  = vedicChart.sunriseData?.minutesSinceSunrise

  if (!lagnaSign || !planets || sunAtSunrise == null || minsSunrise == null) {
    console.warn('[deriveSpecialPoints] Missing required fields in VedicChartData')
    return null
  }

  // Natal Sun longitude (different from sunrise longitude)
  const sunPlanet = planets.find((p: PlanetPosition) => p.planet === 'Sun')
  if (!sunPlanet) {
    console.warn('[deriveSpecialPoints] Sun not found in planets array')
    return null
  }
  const sunNatalLongitude = (sunPlanet.signNumber - 1) * 30 + sunPlanet.degreeInSign

  // DECISION [1]: OPEN — confirm isNightBirth and udayaLagnaLongitude field names
  const isNightBirth        = (vedicChart as any).isNightBirth        ?? null
  const udayaLagnaLongitude = (vedicChart as any).udayaLagnaLongitude ?? null

  // DECISION [3]: OPEN — confirm dayDurationMinutes and weekdayIndex field names
  const dayDurationMinutes = (vedicChart as any).sunriseData?.dayDurationMinutes ?? null
  const weekdayIndex       = (vedicChart as any).weekdayIndex                    ?? null

  try {
    return calculateSpecialPoints(
      lagnaSign, planets, sunAtSunrise, sunNatalLongitude, minsSunrise,
      isNightBirth, udayaLagnaLongitude, dayDurationMinutes, weekdayIndex
    )
  } catch (err) {
    console.error('[deriveSpecialPoints] Calculation error:', err)
    return null
  }
}
```

Done when: chartService.ts compiles. The four `any` casts have DECISION
comments — they must remain until the respective decisions are resolved.

---

### VSP-22 — KV caching

File: /lib/kv/keys.ts — add one key:
```typescript
specialPoints: (userId: string) => `chart:specialpoints:${userId}`,
```

File: /lib/astro/chartService.ts — add the get-or-create wrapper:
```typescript
export async function getOrCreateSpecialPoints(
  userId: string
): Promise<SpecialPointsResult | null> {
  const cacheKey = kvKeys.specialPoints(userId)
  const cached   = await kvGet<SpecialPointsResult>(cacheKey)
  if (cached !== null) return cached

  const vedicChart = await kvGet<VedicChartData>(kvKeys.vedicChart(userId))
  if (!vedicChart) {
    console.warn(`[getOrCreateSpecialPoints] No Vedic chart in KV for user ${userId}`)
    return null
  }

  const result = deriveSpecialPoints(vedicChart)
  if (result) await kvSet(cacheKey, result)  // no TTL — permanent
  return result
}
```

File: /lib/astro/chartService.ts — update invalidateChartCache:
```typescript
// Add to the kvDeleteMany array inside invalidateChartCache:
kvKeys.specialPoints(userId),
```

Done when: key added, wrapper compiles, invalidation includes the key.

---

### VSP-23 — API routes

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

Response contract:
  401  no session (getRequiredSession handles redirect)
  202  Vedic chart absent from KV — not an error, still processing
  200  full SpecialPointsResult JSON

Note: trisphuta and kaalVelas fields inside a 200 response may be null
when DECISION [3] is unresolved. This is expected — clients must handle
null gracefully for those two fields.

Done when: route compiles, returns 202 when Vedic chart is absent.

---

## COMPLETION CHECKLIST

Layer 1 — Types
- [ ] VSP-01  All types in types/index.ts — compiles clean

Layer 2 — Helpers
- [ ] VSP-02  Constants block in specialPoints.ts
- [ ] VSP-03  countSignsBetween, advanceSigns, longitudeToSignAndDegree, wrapLongitude, toAbsoluteLongitude
- [ ] VSP-04  getStrongerLord — five tiebreaker steps, no `any`

Layer 3 — Calculators (can run in parallel after Layer 2)
- [ ] VSP-05  calculateArudhaLagna — both exceptions handled
- [ ] VSP-06  calculateUpapadaLagna — mirrors AL from 12th house
- [ ] VSP-07  calculateSreeLagna — Kala counting from Moon's sign
- [ ] VSP-08  calculateVarnadaLagna — odd/even logic, DECISION [5] comment present
- [ ] VSP-09  calculateGhatiLagna — day/night branches, DECISION [1] comment present
- [ ] VSP-10  calculateBhavaLagna — day/night branches, DECISION [1]+[2] comments present
- [ ] VSP-11  calculateHoraLagna — day/night branches, DECISION [1]+[2] comments present
- [ ] VSP-12  calculatePranapada — three starting-point branches (Movable/Fixed/Dual)
- [ ] VSP-13  calculateCharakarakas — three-level tiebreak, shared-rank/deficit, Sthira Karaka
- [ ] VSP-14  calculateDhoomaChain — sanity check passes
- [ ] VSP-15  calculateBeejaSphuta
- [ ] VSP-16  calculateKsheetraSphuta
- [ ] VSP-17  calculateTrisphuta — returns null when Gulika absent, DECISION [3]+[4] comments
- [ ] VSP-18  calculateBhriguBindu — sanity check passes
- [ ] VSP-19  calculateKaalVelas — Gulika/Maandi distinct, returns null when blocked, DECISION [3] comment

Layer 4 — Aggregator
- [ ] VSP-20  calculateSpecialPoints — all 15 fields present, null fields handled

Layer 5 — Infrastructure
- [ ] VSP-21  deriveSpecialPoints in chartService.ts — four `any` casts with DECISION comments
- [ ] VSP-22  KV key, getOrCreateSpecialPoints wrapper, invalidation updated
- [ ] VSP-23  API route — 202/200 contract correct, null fields documented

---

## STATUS COMMENT FORMAT

At the top of every file you create or modify, add:
// STATUS: done | Task VSP-XX

---

*Crossroads Compass — Vedic Special Points Master Task File*
*VSP-01 through VSP-23 | March 2026 | Milosh*

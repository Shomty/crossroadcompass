# Task: Muhurta Finder — Enhanced Auspicious Timing Engine
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Created: 2026-03-30
# Depends on: lib/astro/specialPoints.ts, lib/astro/chartService.ts, lib/kv/keys.ts, types/index.ts

---

## CONTEXT

This task builds the Muhurta Finder™ feature end-to-end. Muhurta is
Vedic electional astrology — finding auspicious time windows for specific
intentions. This implementation goes beyond standard panchanga checks
by layering five personalized filters on top of basic auspiciousness:

  1. Functional Benefic/Malefic classification per Lagna
  2. Samudaya Ashtakavarga power-zone overlay
  3. Vimshottari Dasha context modifier
  4. Avastha (planetary state/readiness) filter
  5. Virtual conjunction damage check (within 5° orb)

A "Moksha vs. Artha" intent toggle labels windows by house domain.

Reference files you MUST read before starting:
  - types/index.ts                        for existing types (VedicChartData, PlanetPosition, SignNumber, etc.)
  - lib/astro/specialPoints.ts            for sign arithmetic helpers (advanceSigns, countSignsBetween, longitudeToSignAndDegree)
  - lib/astro/chartService.ts             for getOrCreateVedicChart, getOrCreateSpecialPoints
  - lib/kv/keys.ts                        for the KV key schema pattern
  - lib/kv/helpers.ts                     for kvGet, kvSet
  - lib/env.ts                            for env var access
  - app/api/chart/special-points/route.ts for the route pattern to follow

### Variable name source of truth (CONFIRMED)

The variables.md file confirms the exact field names available from the
data layer. Use these throughout — do NOT invent alternative names.

Key confirmed field names relevant to this task:

  Dasha fields (confirmed, resolves MH-E.6 DECISION):
    {{current_mahadasha}}           -> current Mahadasha lord (PlanetName string)
    {{current_antardasha}}          -> current Antardasha lord (PlanetName string)
    {{dasha_mahadasha_start}}       -> Mahadasha start date
    {{dasha_mahadasha_end}}         -> Mahadasha end date
    {{dasha_antardasha_start}}      -> Antardasha start date
    {{dasha_antardasha_end}}        -> Antardasha end date
    {{dashas_json}}                 -> full dasha timeline as JSON

  Vedic chart fields (confirmed, resolves MH-E.7/10 transit source):
    {{transit_json}}                -> current transit data as JSON
    {{transit_date}}                -> transit date
    {{vedic_json}}                  -> full Vedic chart as JSON
    {{vedic_planets_json}}          -> all planet positions as JSON
    {{lagna}}                       -> Ascendant sign name (string)
    {{vedic_lagna_degree}}          -> Ascendant degree within sign

  Per-planet position fields (confirmed):
    {{vedic_{planet}_sign}}         -> sign name string
    {{vedic_{planet}_degree}}       -> degree within sign (number)
    {{vedic_{planet}_retro}}        -> retrograde boolean
    (planet = sun, moon, mars, mercury, jupiter, venus, saturn, rahu, ketu)

  Ashtakavarga (NOT present in variables.md — see DECISION below)

  Observation location (relevant for transit calculation):
    {{observation_city}}            -> current city for transit calculation
    {{observation_latitude}}
    {{observation_longitude}}

---

## DOMAIN ASSUMPTIONS

### Functional Benefics and Malefics by Lagna

For each Lagna (Ascendant sign), certain planets are functional
benefics (FB) and others are functional malefics (FM).

The standard Parashara classification used here:

  Aries  (1):  FB = Sun Mars Jupiter        FM = Mercury Venus Saturn Rahu Ketu
  Taurus (2):  FB = Mercury Saturn          FM = Jupiter Sun Moon Mars Rahu Ketu
  Gemini (3):  FB = Venus Saturn            FM = Mars Jupiter Sun Moon Rahu Ketu
  Cancer (4):  FB = Moon Mars Jupiter       FM = Mercury Venus Saturn Rahu Ketu
  Leo    (5):  FB = Sun Mars Jupiter        FM = Mercury Venus Saturn Rahu Ketu
  Virgo  (6):  FB = Mercury Venus           FM = Mars Moon Jupiter Sun Rahu Ketu
  Libra  (7):  FB = Mercury Saturn Venus    FM = Mars Jupiter Sun Moon Rahu Ketu
  Scorpio(8):  FB = Moon Jupiter            FM = Mercury Venus Saturn Rahu Ketu
  Sagitt.(9):  FB = Sun Mars Jupiter        FM = Mercury Venus Saturn Rahu Ketu
  Capric.(10): FB = Mercury Venus Saturn    FM = Mars Moon Jupiter Sun Rahu Ketu
  Aquar. (11): FB = Venus Saturn            FM = Mars Moon Jupiter Sun Rahu Ketu
  Pisces (12): FB = Moon Mars Jupiter       FM = Mercury Venus Saturn Rahu Ketu

Note: Rahu and Ketu are treated as functional malefics for all Lagnas
in this implementation. The single-lord or co-lord scheme for Scorpio
and Aquarius (from specialPoints.ts) applies to sign lordship only,
not to this functional benefic table.

### Samudaya Ashtakavarga Thresholds

Samudaya (combined) Ashtakavarga assigns a Rekha (strength point)
count from 0-56 to each of the 12 signs.

  Strong (Green):  >= 30 Rekhas
  Moderate (Amber): 25-29 Rekhas
  Weak (Red):      < 25 Rekhas

When a transiting functional benefic enters a Strong sign, the window
is scored positively. When any planet enters a Weak sign, it is scored
negatively regardless of functional nature.

### Avastha (Planetary State)

Avastha determines whether a planet can deliver results.

  Awakened (Jagrat):   Planet in own sign OR exaltation sign
  Active (Swapna):     Planet in friendly sign (not own/exalt/debil/enemy)
  Sleeping (Sushupti): Planet in debilitation OR enemy sign

Exaltation and debilitation signs per specialPoints.ts constants
(EXALTATION_SIGN, DEBILITATION_SIGN) — import and reuse them here.

Own-sign determination: same logic as getOwnSigns() in specialPoints.ts.

Friendly-sign lookup table (standard Parashara planetary friendships):

  Sun:     friends = Moon Mars Jupiter
           enemies = Venus Saturn
           neutral = Mercury
  Moon:    friends = Sun Mercury
           enemies = (none)
           neutral = Mars Jupiter Venus Saturn
  Mars:    friends = Sun Moon Jupiter
           enemies = Mercury
           neutral = Venus Saturn
  Mercury: friends = Sun Venus
           enemies = Moon
           neutral = Mars Jupiter Saturn
  Jupiter: friends = Sun Moon Mars
           enemies = Mercury Venus
           neutral = Saturn
  Venus:   friends = Mercury Saturn
           enemies = Sun Moon
           neutral = Mars Jupiter
  Saturn:  friends = Mercury Venus
           enemies = Sun Moon Mars
           neutral = Jupiter
  Rahu:    treat as Saturn for friendship purposes
  Ketu:    treat as Mars for friendship purposes

### Virtual Conjunction Damage

A virtual (Graha Yuddha-style) conjunction occurs when a transiting
planet comes within 5 degrees of any natal planet in the user's chart
measured along the ecliptic (absolute longitude, no sign boundary).

If the within-5° natal planet is a functional malefic for the user's
Lagna, the transiting benefic's window is "damaged" — downgrade its
score by 2 points and add a warning label.

The damage window opens when separation drops below 5° and closes when
separation rises above 5° again after exact conjunction.

### Dasha Context Modifier

The currently running Mahadasha and Antardasha modify Muhurta scoring:

  Running Dasha lord is a Functional Benefic:  +1 to all window scores
  Running Dasha lord is a Functional Malefic:  -1 to all window scores
  Running Antardasha lord is a FB:             +0.5 (round to nearest 0.5)
  Running Antardasha lord is a FM:             -0.5

This means a Saturn Mahadasha (FM for most Lagnas) reduces baseline
scores across all windows by 1 point, reflecting the heavier backdrop.

### House Domain Labels (Moksha vs. Artha Toggle)

When a transiting planet occupies a specific house from the user's
natal Lagna, label the window:

  1st house:  Identity / New Beginnings
  2nd house:  Wealth Accumulation (Artha)
  3rd house:  Communication / Courage
  4th house:  Home / Emotional Foundation
  5th house:  Creativity / Speculation
  6th house:  Service / Health / Competition
  7th house:  Partnerships / Contracts
  8th house:  Deep Transformation / Strategy (Moksha-adjacent)
  9th house:  Dharma / Philosophy / Long Travel
  10th house: Career / Public Action (Artha, highest)
  11th house: Financial Windfall / Gains (Artha, strong)
  12th house: Spiritual Practice / Surrender (Moksha)

Houses 10 and 11 are the strongest Artha windows.
Houses 8 and 12 are the Moksha/transformation windows.
Houses 1, 5, 9 are Dharma windows.
Houses 3, 6, 7 are mixed (context-dependent).

The intent toggle allows users to filter for Artha (material) or
Moksha (spiritual/transformational) windows. Default: show all.

### Window Scoring Algorithm

Each candidate window starts at score 0. Apply modifiers:

  Transiting planet is a FB for user's Lagna:    +2
  Transiting planet enters a 30+ Rekha sign:     +2
  Transiting planet enters a 25-29 Rekha sign:   +1
  Transiting planet enters a <25 Rekha sign:     -2
  Planet Avastha = Awakened:                     +2
  Planet Avastha = Active:                       +1
  Planet Avastha = Sleeping:                     -2
  Virtual conjunction with natal FM (within 5°): -2 (+ "Damaged" warning)
  Dasha lord is FB:                              +1
  Dasha lord is FM:                              -1
  Antardasha lord is FB:                         +0.5
  Antardasha lord is FM:                         -0.5

Final classification:
  Score >= 4:  Green  (Highly Auspicious)
  Score 2-3:   Amber  (Moderately Auspicious)
  Score 0-1:   Neutral
  Score < 0:   Red    (Avoid)

---

## TASKS

---

### MH-E.1 — Types

Add to types/index.ts:

```typescript
export type MuhurtaIntentCategory =
  | 'career'
  | 'relationship'
  | 'finance'
  | 'health'
  | 'travel'
  | 'spiritual'
  | 'all'

export type MuhurtaWindowColor = 'green' | 'amber' | 'neutral' | 'red'

export type AvasthaState = 'awakened' | 'active' | 'sleeping'

export type HouseDomain =
  | 'identity'
  | 'wealth'
  | 'communication'
  | 'home'
  | 'creativity'
  | 'service'
  | 'partnership'
  | 'transformation'
  | 'dharma'
  | 'career'
  | 'windfall'
  | 'spiritual'

export interface MuhurtaWindowScoreBreakdown {
  functionalNature: 'benefic' | 'malefic' | 'neutral'  // planet's role for user's Lagna
  avasthaState: AvasthaState
  ashtakavargaRekhas: number                            // Rekhas in the sign being transited
  virtualConjunctionDamage: boolean                     // within 5° of a natal FM
  dashaModifier: number                                 // from Maha + Antaradasha
  totalScore: number
}

export interface MuhurtaWindow {
  id: string                                    // uuid
  startTime: Date
  endTime: Date
  planet: PlanetName
  transitSignNumber: SignNumber
  houseFromLagna: number                        // 1-12
  houseDomain: HouseDomain
  color: MuhurtaWindowColor
  scoreBreakdown: MuhurtaWindowScoreBreakdown
  intentCategories: MuhurtaIntentCategory[]    // which intent filters this window satisfies
  warningLabel: string | null                  // e.g. "Damaged: near natal Saturn"
  aiReasoning: string | null                   // populated after AI enrichment
}

export interface MuhurtaRequest {
  userId: string
  startDate: Date
  endDate: Date                                // max 30 days ahead
  intentFilter: MuhurtaIntentCategory
  includeAiReasoning: boolean
}

export interface MuhurtaResponse {
  windows: MuhurtaWindow[]
  dashaContext: {
    mahadashaLord: PlanetName
    antaradashaLord: PlanetName
    mahadashaEndDate: Date
    modifierApplied: number
  }
  generatedAt: Date
  cacheHit: boolean
}

export interface SamudayaAshtakavarga {
  // Map of SignNumber to total Rekha count (0-56)
  rekhasBySign: Record<SignNumber, number>
}

export interface DashaContext {
  mahadashaLord: PlanetName
  antaradashaLord: PlanetName
  mahadashaEndDate: Date
  antaradashaEndDate: Date
}
```

Done when: types/index.ts compiles with zero TypeScript errors.

---

### MH-E.2 — Functional Benefic/Malefic Lookup

Create /lib/astro/muhurta/functionalNature.ts:

```typescript
// STATUS: pending | Task MH-E.2

import type { PlanetName, SignNumber } from '@/types'

type FunctionalClass = 'benefic' | 'malefic' | 'neutral'

// Parashara functional benefic/malefic table indexed by Lagna sign number.
// Rahu and Ketu are always malefic regardless of Lagna.
const FUNCTIONAL_NATURE_TABLE: Record<
  SignNumber,
  { benefics: PlanetName[]; malefics: PlanetName[] }
> = {
  1:  { benefics: ['Sun', 'Mars', 'Jupiter'],          malefics: ['Mercury', 'Venus', 'Saturn', 'Rahu', 'Ketu'] },
  2:  { benefics: ['Mercury', 'Saturn'],               malefics: ['Jupiter', 'Sun', 'Mars', 'Rahu', 'Ketu'] },
  3:  { benefics: ['Venus', 'Saturn'],                 malefics: ['Mars', 'Jupiter', 'Sun', 'Rahu', 'Ketu'] },
  4:  { benefics: ['Moon', 'Mars', 'Jupiter'],         malefics: ['Mercury', 'Venus', 'Saturn', 'Rahu', 'Ketu'] },
  5:  { benefics: ['Sun', 'Mars', 'Jupiter'],          malefics: ['Mercury', 'Venus', 'Saturn', 'Rahu', 'Ketu'] },
  6:  { benefics: ['Mercury', 'Venus'],                malefics: ['Mars', 'Moon', 'Jupiter', 'Sun', 'Rahu', 'Ketu'] },
  7:  { benefics: ['Mercury', 'Saturn', 'Venus'],      malefics: ['Mars', 'Jupiter', 'Sun', 'Moon', 'Rahu', 'Ketu'] },
  8:  { benefics: ['Moon', 'Jupiter'],                 malefics: ['Mercury', 'Venus', 'Saturn', 'Rahu', 'Ketu'] },
  9:  { benefics: ['Sun', 'Mars', 'Jupiter'],          malefics: ['Mercury', 'Venus', 'Saturn', 'Rahu', 'Ketu'] },
  10: { benefics: ['Mercury', 'Venus', 'Saturn'],      malefics: ['Mars', 'Moon', 'Jupiter', 'Sun', 'Rahu', 'Ketu'] },
  11: { benefics: ['Venus', 'Saturn'],                 malefics: ['Mars', 'Moon', 'Jupiter', 'Sun', 'Rahu', 'Ketu'] },
  12: { benefics: ['Moon', 'Mars', 'Jupiter'],         malefics: ['Mercury', 'Venus', 'Saturn', 'Rahu', 'Ketu'] },
}

export function getFunctionalNature(
  planet: PlanetName,
  lagnaSignNumber: SignNumber
): FunctionalClass {
  const table = FUNCTIONAL_NATURE_TABLE[lagnaSignNumber]
  if (table.benefics.includes(planet)) return 'benefic'
  if (table.malefics.includes(planet)) return 'malefic'
  return 'neutral'
}

export function getFunctionalBenefics(lagnaSignNumber: SignNumber): PlanetName[] {
  return FUNCTIONAL_NATURE_TABLE[lagnaSignNumber].benefics
}

export function getFunctionalMalefics(lagnaSignNumber: SignNumber): PlanetName[] {
  return FUNCTIONAL_NATURE_TABLE[lagnaSignNumber].malefics
}
```

Done when: file compiles. No runtime calls in this task.

---

### MH-E.3 — Avastha Calculator

Create /lib/astro/muhurta/avastha.ts:

```typescript
// STATUS: pending | Task MH-E.3

import type { PlanetName, SignNumber } from '@/types'
import type { AvasthaState } from '@/types'

// Import the constants already defined in specialPoints.ts
// rather than redefining them here
import {
  EXALTATION_SIGN,
  DEBILITATION_SIGN,
} from '@/lib/astro/specialPoints'

// DECISION NEEDED: EXALTATION_SIGN and DEBILITATION_SIGN are currently
// defined as module-level constants in specialPoints.ts but are NOT exported.
// Either:
//   (a) Export them from specialPoints.ts (preferred - add `export` keyword), or
//   (b) Duplicate them here with a comment pointing to specialPoints.ts
// Resolve before implementing this file.

// Own-sign lookup (same data as SIGN_LORDS in specialPoints.ts, restructured)
const OWN_SIGNS: Partial<Record<PlanetName, SignNumber[]>> = {
  Sun:     [5],
  Moon:    [4],
  Mars:    [1, 8],
  Mercury: [3, 6],
  Jupiter: [9, 12],
  Venus:   [2, 7],
  Saturn:  [10, 11],
  // Rahu and Ketu have no traditional own signs in Parashara
}

// Planetary friendship table (standard Parashara)
const FRIENDLY_SIGNS: Record<PlanetName, { friends: PlanetName[]; enemies: PlanetName[] }> = {
  Sun:     { friends: ['Moon', 'Mars', 'Jupiter'],    enemies: ['Venus', 'Saturn'] },
  Moon:    { friends: ['Sun', 'Mercury'],              enemies: [] },
  Mars:    { friends: ['Sun', 'Moon', 'Jupiter'],     enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'],                enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'],        enemies: ['Mercury', 'Venus'] },
  Venus:   { friends: ['Mercury', 'Saturn'],           enemies: ['Sun', 'Moon'] },
  Saturn:  { friends: ['Mercury', 'Venus'],            enemies: ['Sun', 'Moon', 'Mars'] },
  Rahu:    { friends: ['Mercury', 'Venus', 'Saturn'], enemies: ['Sun', 'Moon', 'Mars'] },
  Ketu:    { friends: ['Sun', 'Moon', 'Mars'],        enemies: ['Mercury', 'Venus'] },
}

/**
 * Determine the Avastha (readiness state) of a planet transiting a given sign.
 *
 * Awakened: planet in own sign or exaltation
 * Sleeping: planet in debilitation or enemy sign
 * Active:   all other cases (neutral / friendly sign)
 */
export function calculateAvastha(
  planet: PlanetName,
  transitSignNumber: SignNumber,
  allPlanets: { planet: PlanetName; signNumber: SignNumber }[]
): AvasthaState {
  // Awakened: own sign
  if (OWN_SIGNS[planet]?.includes(transitSignNumber)) return 'awakened'

  // Awakened: exaltation
  if (EXALTATION_SIGN[planet] === transitSignNumber) return 'awakened'

  // Sleeping: debilitation
  if (DEBILITATION_SIGN[planet] === transitSignNumber) return 'sleeping'

  // Sleeping: enemy sign
  // RESOLVED (2026-03-30): Avastha is planetary dignity. SIGN_LORDS,
  // EXALTATION_SIGN, and DEBILITATION_SIGN must be exported from
  // specialPoints.ts. Add `export` keyword to those three constants.
  // The enemy-sign check uses the FRIENDLY_SIGNS table defined above:
  // if the sign lord is in the enemies list for this planet, it's sleeping.
  const signLordEntry = SIGN_LORDS_LOCAL[transitSignNumber]
  const signLord = Array.isArray(signLordEntry) ? signLordEntry[0] : signLordEntry
  const friendship = FRIENDLY_SIGNS[planet]
  if (friendship && signLord && friendship.enemies.includes(signLord as PlanetName)) {
    return 'sleeping'
  }

  return 'active'
}

// Local copy of SIGN_LORDS needed for enemy-sign check.
// Once specialPoints.ts exports SIGN_LORDS, replace this with an import.
// ACTION REQUIRED: add `export` to SIGN_LORDS, EXALTATION_SIGN, DEBILITATION_SIGN
// in lib/astro/specialPoints.ts and remove this local copy.
const SIGN_LORDS_LOCAL: Record<number, string | [string, string]> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
  7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter',
}
```

ACTION REQUIRED before running MH-E.3:
  File: lib/astro/specialPoints.ts
  Add `export` keyword to these three constants:
    export const EXALTATION_SIGN = ...
    export const DEBILITATION_SIGN = ...
    export const SIGN_LORDS = ...
  Then in avastha.ts: import them and remove SIGN_LORDS_LOCAL.
  This is a one-line change per constant in specialPoints.ts.

Done when: enemy-sign Avastha check works, SIGN_LORDS_LOCAL removed after export added to specialPoints.ts.

---

### MH-E.4 — Virtual Conjunction Checker

Create /lib/astro/muhurta/virtualConjunction.ts:

```typescript
// STATUS: pending | Task MH-E.4

import type { PlanetName, PlanetPosition, SignNumber } from '@/types'
import { getFunctionalMalefics } from './functionalNature'

const VIRTUAL_CONJUNCTION_ORB_DEGREES = 5

/**
 * Convert a planet's sign + degree to absolute ecliptic longitude (0-360).
 */
function toAbsoluteLongitude(signNumber: SignNumber, degreeInSign: number): number {
  return (signNumber - 1) * 30 + degreeInSign
}

/**
 * Calculate the minimum angular separation between two absolute longitudes.
 * Returns a value between 0 and 180 degrees.
 */
export function angularSeparation(longA: number, longB: number): number {
  const diff = Math.abs(((longA - longB + 540) % 360) - 180)
  return diff
}

export interface VirtualConjunctionResult {
  isDamaged: boolean
  nearestMaleficPlanet: PlanetName | null
  separationDegrees: number | null
  warningLabel: string | null
}

/**
 * Check whether a transiting planet (at transitLongitude) is within
 * VIRTUAL_CONJUNCTION_ORB_DEGREES of any natal functional malefic.
 *
 * @param transitLongitude   Absolute ecliptic longitude of the transiting planet (0-360)
 * @param natalPlanets       The user's natal planet positions
 * @param lagnaSignNumber    User's Lagna for FM classification
 */
export function checkVirtualConjunction(
  transitPlanet: PlanetName,
  transitLongitude: number,
  natalPlanets: PlanetPosition[],
  lagnaSignNumber: SignNumber
): VirtualConjunctionResult {
  const functionalMalefics = getFunctionalMalefics(lagnaSignNumber)

  let closestSeparation = Infinity
  let closestMalefic: PlanetName | null = null

  for (const natalPlanet of natalPlanets) {
    if (!functionalMalefics.includes(natalPlanet.planet)) continue
    if (natalPlanet.planet === transitPlanet) continue  // skip self

    const natalLongitude = toAbsoluteLongitude(
      natalPlanet.signNumber,
      natalPlanet.degreeInSign
    )
    const sep = angularSeparation(transitLongitude, natalLongitude)

    if (sep < closestSeparation) {
      closestSeparation = sep
      closestMalefic = natalPlanet.planet
    }
  }

  if (closestSeparation <= VIRTUAL_CONJUNCTION_ORB_DEGREES && closestMalefic) {
    return {
      isDamaged: true,
      nearestMaleficPlanet: closestMalefic,
      separationDegrees: Math.round(closestSeparation * 100) / 100,
      warningLabel: `Damaged: within ${closestSeparation.toFixed(1)}° of natal ${closestMalefic}`,
    }
  }

  return {
    isDamaged: false,
    nearestMaleficPlanet: null,
    separationDegrees: closestSeparation === Infinity ? null : closestSeparation,
    warningLabel: null,
  }
}
```

Done when: file compiles with no `any` types.

---

### MH-E.5 — Window Scorer

Create /lib/astro/muhurta/windowScorer.ts:

```typescript
// STATUS: pending | Task MH-E.5

import type {
  PlanetName, SignNumber, MuhurtaWindowColor,
  MuhurtaWindowScoreBreakdown, AvasthaState, HouseDomain
} from '@/types'
import { getFunctionalNature } from './functionalNature'
import type { VirtualConjunctionResult } from './virtualConjunction'

const HOUSE_DOMAIN_MAP: Record<number, HouseDomain> = {
  1:  'identity',
  2:  'wealth',
  3:  'communication',
  4:  'home',
  5:  'creativity',
  6:  'service',
  7:  'partnership',
  8:  'transformation',
  9:  'dharma',
  10: 'career',
  11: 'windfall',
  12: 'spiritual',
}

// Intent category affinity — which intent filters map to which house domains
const INTENT_DOMAIN_MAP: Record<string, HouseDomain[]> = {
  career:       ['career', 'communication', 'dharma'],
  relationship: ['partnership', 'identity', 'home'],
  finance:      ['wealth', 'windfall', 'career'],
  health:       ['service', 'home', 'identity'],
  travel:       ['dharma', 'communication'],
  spiritual:    ['spiritual', 'transformation', 'dharma'],
}

export function colorFromScore(score: number): MuhurtaWindowColor {
  if (score >= 4)  return 'green'
  if (score >= 2)  return 'amber'
  if (score >= 0)  return 'neutral'
  return 'red'
}

export function getHouseFromLagna(
  transitSignNumber: SignNumber,
  lagnaSignNumber: SignNumber
): number {
  // Parashara inclusive house counting
  return ((transitSignNumber - lagnaSignNumber + 12) % 12) + 1
}

export function getHouseDomain(houseNumber: number): HouseDomain {
  return HOUSE_DOMAIN_MAP[houseNumber] ?? 'identity'
}

export function getIntentCategories(houseDomain: HouseDomain): string[] {
  return Object.entries(INTENT_DOMAIN_MAP)
    .filter(([, domains]) => domains.includes(houseDomain))
    .map(([intent]) => intent)
}

export interface ScoreInputs {
  planet: PlanetName
  transitSignNumber: SignNumber
  ashtakavargaRekhas: number
  avasthaState: AvasthaState
  virtualConjunction: VirtualConjunctionResult
  dashaModifier: number    // pre-calculated from MH-E.6
  lagnaSignNumber: SignNumber
}

export function scoreMuhurtaWindow(inputs: ScoreInputs): MuhurtaWindowScoreBreakdown {
  let score = 0
  const functionalNature = getFunctionalNature(inputs.planet, inputs.lagnaSignNumber)

  // Functional nature modifier
  if (functionalNature === 'benefic')  score += 2
  if (functionalNature === 'malefic')  score -= 0  // already penalised by low Avastha in most cases

  // Ashtakavarga
  if (inputs.ashtakavargaRekhas >= 30) score += 2
  else if (inputs.ashtakavargaRekhas >= 25) score += 1
  else score -= 2

  // Avastha
  if (inputs.avasthaState === 'awakened') score += 2
  else if (inputs.avasthaState === 'active') score += 1
  else score -= 2

  // Virtual conjunction damage
  if (inputs.virtualConjunction.isDamaged) score -= 2

  // Dasha modifier (already a number, just add)
  score += inputs.dashaModifier

  return {
    functionalNature,
    avasthaState: inputs.avasthaState,
    ashtakavargaRekhas: inputs.ashtakavargaRekhas,
    virtualConjunctionDamage: inputs.virtualConjunction.isDamaged,
    dashaModifier: inputs.dashaModifier,
    totalScore: Math.round(score * 10) / 10,
  }
}
```

Done when: file compiles with correct return types.

---

### MH-E.6 — Dasha Context Resolver

Create /lib/astro/muhurta/dashaContext.ts:

```typescript
// STATUS: pending | Task MH-E.6
// Reads the running Dasha from KV and computes the Muhurta score modifier.

import type { PlanetName, SignNumber, DashaContext } from '@/types'
import { kvGet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'
import { getFunctionalNature } from './functionalNature'

/**
 * Retrieve the current Dasha context from KV.
 * Returns null if Dasha data not yet available.
 *
 * RESOLVED (variables.md 2026-03-30):
 * Confirmed template variable names for Dasha data:
 *   current_mahadasha      -> Mahadasha lord string
 *   current_antardasha     -> Antardasha lord string
 *   dasha_mahadasha_end    -> Mahadasha end date ISO string
 *   dasha_antardasha_end   -> Antardasha end date ISO string
 *
 * The fallback chain below handles both camelCase and snake_case KV shapes.
 *
 * DECISION NEEDED (narrow, non-blocking):
 *   Is the KV payload at kvKeys.dashas(userId) keyed with camelCase or
 *   snake_case? The fallback chain handles both; remove the unused branch
 *   once confirmed.
 *   Raised: 2026-03-30
 */
export async function getDashaContext(
  userId: string
): Promise<DashaContext | null> {
  const dashaData = await kvGet<Record<string, unknown>>(kvKeys.dashas(userId))
  if (!dashaData) return null

  // Fallback chain: handles camelCase and snake_case KV shapes
  const mahaLord =
    (dashaData['currentMahadasha'] ?? dashaData['current_mahadasha']) as string | undefined
  const antaraLord =
    (dashaData['currentAntardasha'] ?? dashaData['current_antardasha']) as string | undefined
  const mahaEnd =
    (dashaData['dashasMahadashaEnd'] ?? dashaData['dasha_mahadasha_end'] ?? dashaData['mahadashaEndDate']) as string | undefined
  const antaraEnd =
    (dashaData['dashasAntardashaEnd'] ?? dashaData['dasha_antardasha_end'] ?? dashaData['antaradashaEndDate']) as string | undefined

  if (!mahaLord || !antaraLord) {
    console.warn('[getDashaContext] Could not resolve Dasha lord fields from KV. Check KV key casing.')
    return null
  }

  return {
    mahadashaLord:       mahaLord as PlanetName,
    antaradashaLord:     antaraLord as PlanetName,
    mahadashaEndDate:    new Date(mahaEnd ?? Date.now()),
    antaradashaEndDate:  new Date(antaraEnd ?? Date.now()),
  }
}

/**
 * Compute the numeric Muhurta score modifier from the current Dasha.
 * Returns 0 if no Dasha data is available (fail-open).
 */
export function computeDashaModifier(
  dashaContext: DashaContext | null,
  lagnaSignNumber: SignNumber
): number {
  if (!dashaContext) return 0

  const mahaClass = getFunctionalNature(dashaContext.mahadashaLord, lagnaSignNumber)
  const antaraClass = getFunctionalNature(dashaContext.antaradashaLord, lagnaSignNumber)

  let modifier = 0
  if (mahaClass === 'benefic')  modifier += 1
  if (mahaClass === 'malefic')  modifier -= 1
  if (antaraClass === 'benefic') modifier += 0.5
  if (antaraClass === 'malefic') modifier -= 0.5

  return modifier
}
```

Done when: file compiles. Dasha source is confirmed as openastrology-library via variables.md field names. Fallback chain handles KV casing.

---

### MH-E.7 — Muhurta Window Generator

Create /lib/astro/muhurta/windowGenerator.ts:

```typescript
// STATUS: pending | Task MH-E.7
// Core engine: produces MuhurtaWindow[] for a date range by scanning
// transiting planet positions at configurable intervals.

import { v4 as uuidv4 } from 'uuid'
import type {
  MuhurtaWindow, MuhurtaRequest, PlanetName,
  PlanetPosition, SignNumber, SamudayaAshtakavarga,
  DashaContext
} from '@/types'
import { longitudeToSignAndDegree } from '@/lib/astro/specialPoints'
import { calculateAvastha } from './avastha'
import { checkVirtualConjunction } from './virtualConjunction'
import { scoreMuhurtaWindow, colorFromScore, getHouseFromLagna,
         getHouseDomain, getIntentCategories } from './windowScorer'
import { computeDashaModifier } from './dashaContext'

// Planets to track for transit window generation.
// Exclude Rahu/Ketu for Muhurta (they are always shadowy, not window-generators).
const TRANSIT_PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
]

// Scan interval: check every 4 hours for sign changes and conjunction entries/exits.
// Moon moves ~13°/day so a 4-hour interval gives ~2° resolution — sufficient.
const SCAN_INTERVAL_HOURS = 4

export interface TransitPositionProvider {
  /**
   * Return the absolute ecliptic longitude (0-360) for each tracked planet
   * at the given UTC timestamp.
   *
   * DECISION NEEDED: This interface needs to be wired to the actual transit
   * data source once the openastrology-library transit API is confirmed.
   * For now: stub with a function signature. The caller (muhurtaService.ts)
   * will inject the real implementation.
   */
  getPlanetLongitudesAt(utcTimestamp: Date): Promise<Record<PlanetName, number>>
}

/**
 * Generate all Muhurta windows in the requested date range.
 *
 * Windows are created when a planet enters a new sign. The window
 * spans from sign ingress to sign egress. For fast planets (Moon, Mercury)
 * this may be hours; for slow planets (Saturn, Jupiter) it is weeks.
 *
 * The virtual conjunction sub-window is calculated as a narrower window
 * WITHIN a sign window where the <=5° orb is active — but for scoring
 * purposes, a sign-level window that contains a conjunction is simply
 * marked as damaged rather than split.
 */
export async function generateMuhurtaWindows(
  request: MuhurtaRequest,
  natalPlanets: PlanetPosition[],
  lagnaSignNumber: SignNumber,
  ashtakavarga: SamudayaAshtakavarga,
  dashaContext: DashaContext | null,
  transitProvider: TransitPositionProvider
): Promise<MuhurtaWindow[]> {
  const dashaModifier = computeDashaModifier(dashaContext, lagnaSignNumber)
  const windows: MuhurtaWindow[] = []

  // Track the current sign of each planet to detect ingress events
  const currentSigns: Partial<Record<PlanetName, SignNumber>> = {}

  // Active window per planet (open until sign changes)
  const activeWindows: Partial<Record<PlanetName, MuhurtaWindow>> = {}

  let cursor = new Date(request.startDate)
  const end = new Date(request.endDate)

  while (cursor <= end) {
    const longitudes = await transitProvider.getPlanetLongitudesAt(cursor)

    for (const planet of TRANSIT_PLANETS) {
      const longitude = longitudes[planet]
      if (longitude === undefined) continue

      const { sign: transitSign, degree: transitDegree } =
        longitudeToSignAndDegree(longitude)

      const previousSign = currentSigns[planet]
      currentSigns[planet] = transitSign

      // Close the active window for this planet if it existed and sign changed
      if (previousSign !== undefined && previousSign !== transitSign) {
        const closing = activeWindows[planet]
        if (closing) {
          closing.endTime = new Date(cursor)
          windows.push(closing)
          delete activeWindows[planet]
        }
      }

      // Open a new window on sign ingress (or on the very first scan)
      if (previousSign === undefined || previousSign !== transitSign) {
        const avastha = calculateAvastha(planet, transitSign, natalPlanets)
        const conjunction = checkVirtualConjunction(
          planet, longitude, natalPlanets, lagnaSignNumber
        )
        const rekhas = ashtakavarga.rekhasBySign[transitSign] ?? 0
        const scoreBreakdown = scoreMuhurtaWindow({
          planet,
          transitSignNumber: transitSign,
          ashtakavargaRekhas: rekhas,
          avasthaState: avastha,
          virtualConjunction: conjunction,
          dashaModifier,
          lagnaSignNumber,
        })

        const houseFromLagna = getHouseFromLagna(transitSign, lagnaSignNumber)
        const houseDomain = getHouseDomain(houseFromLagna)
        const intentCategories = getIntentCategories(houseDomain) as any[]

        const newWindow: MuhurtaWindow = {
          id: uuidv4(),
          startTime: new Date(cursor),
          endTime: end,  // placeholder; closed when sign changes
          planet,
          transitSignNumber: transitSign,
          houseFromLagna,
          houseDomain,
          color: colorFromScore(scoreBreakdown.totalScore),
          scoreBreakdown,
          intentCategories,
          warningLabel: conjunction.warningLabel,
          aiReasoning: null,  // populated in MH-E.9
        }

        activeWindows[planet] = newWindow
      }
    }

    cursor = new Date(cursor.getTime() + SCAN_INTERVAL_HOURS * 60 * 60 * 1000)
  }

  // Close any windows still open at the end of the range
  for (const planet of TRANSIT_PLANETS) {
    const open = activeWindows[planet]
    if (open) {
      open.endTime = end
      windows.push(open)
    }
  }

  // Filter by intent if requested
  if (request.intentFilter !== 'all') {
    return windows.filter(w => w.intentCategories.includes(request.intentFilter))
  }

  return windows
}
```

Done when: file compiles. KvTransitProvider reads confirmed field names from transit KV.

---

### MH-E.7b — Extend Cron Job for 30-Day Transit Pre-Cache

RESOLVED (2026-03-30): The cron job must be extended to pre-compute
transit snapshots for the next 30 days, not just today. This is what
enables the full date range for Muhurta window generation.

Edit /app/api/cron/generate-insights/route.ts:

Add a second loop after the existing daily insight generation:

```typescript
// --- MUHURTA TRANSIT PRE-CACHE (add after existing insight generation) ---
//
// For each CORE + VIP user, pre-compute transit snapshots for the next
// 30 days and store at kvKeys.transit(userId, 'YYYY-MM-DD') with a
// 32-day TTL (covers the window + buffer).
//
// This makes KvTransitProvider work for the full 30-day Muhurta range.

const TRANSIT_LOOKAHEAD_DAYS = 30
const TRANSIT_TTL_SECONDS = 32 * 24 * 60 * 60

async function precomputeTransitsForUser(
  userId: string,
  birthProfile: BirthProfile
): Promise<void> {
  const today = new Date()

  for (let dayOffset = 0; dayOffset <= TRANSIT_LOOKAHEAD_DAYS; dayOffset++) {
    const targetDate = new Date(today)
    targetDate.setUTCDate(today.getUTCDate() + dayOffset)
    const dateKey = targetDate.toISOString().split('T')[0]
    const cacheKey = kvKeys.transit(userId, dateKey)

    // Skip if already cached
    const existing = await kvGet(cacheKey)
    if (existing) continue

    // DECISION NEEDED (implementation detail):
    // Call the openastrology-library to get planetary positions for targetDate.
    // The exact API call depends on the library's transit/ephemeris interface.
    // Expected output shape matches the confirmed variables:
    //   vedic_sun_sign, vedic_sun_degree, vedic_sun_retro, ... (per planet)
    // Stub:
    // const transitData = await vedicCalculator.getTransitPositions({
    //   date: targetDate,
    //   latitude: birthProfile.latitude,
    //   longitude: birthProfile.longitude,
    // })
    // await kvSet(cacheKey, transitData, TRANSIT_TTL_SECONDS)
    throw new Error(
      '[precomputeTransitsForUser] Replace this stub with the real ' +
      'openastrology-library transit call once the API is confirmed.'
    )
  }
}
```

Add to the cron's main loop (per-user processing):
```typescript
await precomputeTransitsForUser(userId, birthProfile)
```

Done when: cron pre-populates 30-day transit KV snapshots for all active users.

---

### MH-E.8 — Muhurta Service (Orchestrator + KV Cache)

Create /lib/astro/muhurta/muhurtaService.ts:

```typescript
// STATUS: pending | Task MH-E.8

import type {
  MuhurtaRequest, MuhurtaResponse, VedicChartData,
  SamudayaAshtakavarga, SignNumber
} from '@/types'
import { kvGet, kvSet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'
import { getDashaContext } from './dashaContext'
import { generateMuhurtaWindows } from './windowGenerator'
import type { TransitPositionProvider } from './windowGenerator'

// Cache TTL: 7 days for a given start/end date range
// Windows are deterministic for a given chart + date range,
// so caching for a week is safe.
const MUHURTA_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60

function muhurtaCacheKey(userId: string, startDate: Date, endDate: Date): string {
  const s = startDate.toISOString().split('T')[0]
  const e = endDate.toISOString().split('T')[0]
  return `muhurta:${userId}:${s}:${e}`
}

/**
 * DECISION NEEDED: Samudaya Ashtakavarga source.
 *   The openastrology-library may return Ashtakavarga data as part of
 *   the natal chart calculation, or it may require a separate call.
 *   Until confirmed, this function expects the data to be present on
 *   vedicChart.samudayaAshtakavarga (field name TBD).
 *   If absent, a neutral default (28 Rekhas per sign) is used so the
 *   feature does not break.
 *   Blocking: accurate Ashtakavarga scoring
 *   Raised: 2026-03-30
 */
function extractAshtakavarga(vedicChart: VedicChartData): SamudayaAshtakavarga {
  // TODO: replace with confirmed field name from openastrology-library
  const raw = (vedicChart as any).samudayaAshtakavarga
  if (raw && typeof raw === 'object') {
    return { rekhasBySign: raw }
  }
  // Neutral fallback: 28 Rekhas per sign (below Green threshold, above Red)
  const neutral: Record<number, number> = {}
  for (let i = 1; i <= 12; i++) neutral[i] = 28
  return { rekhasBySign: neutral as any }
}

/**
 * Main entry point for the Muhurta Finder feature.
 * Checks cache first, generates and caches if miss.
 */
export async function getMuhurtaWindows(
  request: MuhurtaRequest,
  vedicChart: VedicChartData,
  transitProvider: TransitPositionProvider
): Promise<MuhurtaResponse> {
  const cacheKey = muhurtaCacheKey(
    request.userId, request.startDate, request.endDate
  )
  const cached = await kvGet<MuhurtaResponse>(cacheKey)
  if (cached) {
    return { ...cached, cacheHit: true }
  }

  const lagnaSignNumber = vedicChart.lagnaSignNumber as SignNumber
  const natalPlanets = vedicChart.planets
  const ashtakavarga = await getAshtakavarga(request.userId)
  const dashaContext = await getDashaContext(request.userId)

  const windows = await generateMuhurtaWindows(
    request,
    natalPlanets,
    lagnaSignNumber,
    ashtakavarga,
    dashaContext,
    transitProvider
  )

  const response: MuhurtaResponse = {
    windows,
    dashaContext: dashaContext
      ? {
          mahadashaLord: dashaContext.mahadashaLord,
          antaradashaLord: dashaContext.antaradashaLord,
          mahadashaEndDate: dashaContext.mahadashaEndDate,
          modifierApplied: 0,  // computed inline above; could surface here
        }
      : {
          mahadashaLord: 'Saturn',  // fallback placeholder
          antaradashaLord: 'Saturn',
          mahadashaEndDate: new Date(),
          modifierApplied: 0,
        },
    generatedAt: new Date(),
    cacheHit: false,
  }

  await kvSet(cacheKey, response, MUHURTA_CACHE_TTL_SECONDS)
  return response
}
```

Add to /lib/kv/keys.ts inside the kvKeys object:
```typescript
muhurta: (userId: string, startDate: string, endDate: string) =>
  `muhurta:${userId}:${startDate}:${endDate}`,
```

Done when: file compiles. Ashtakavarga KV read is correct; fallback logs a warning.

---

### MH-E.8b — Samudaya Ashtakavarga Calculator (Separate Calculation)

RESOLVED (2026-03-30): Ashtakavarga is NOT part of the natal chart
payload from the openastrology-library. It must be computed in-app.

Add to /lib/kv/keys.ts:
```typescript
ashtakavarga: (userId: string) => `chart:ashtakavarga:${userId}`,
```

Add to invalidateChartCache in /lib/astro/chartService.ts:
```typescript
kvKeys.ashtakavarga(userId),   // add to the kvDeleteMany call
```

Create /lib/astro/muhurta/ashtakavargaCalculator.ts:

```typescript
// STATUS: pending | Task MH-E.8b
// Computes Samudaya (combined) Ashtakavarga from natal planet positions.
// Algorithm: Brihat Parashara Hora Shastra — each of the 8 contributors
// (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna) casts
// benefic dots into signs based on a fixed contribution table.
// The sum across all contributors per sign = Samudaya Ashtakavarga.

import type { PlanetName, SignNumber, PlanetPosition } from '@/types'
import type { SamudayaAshtakavarga } from '@/types'
import { kvGet, kvSet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'

// BPHS Ashtakavarga contribution tables.
// Each planet casts a benefic dot (1) into specific houses COUNTED FROM
// that planet's own sign position.
// Index = houses from the contributing planet (1-based, 1 through 12).
// 1 = benefic dot cast into that house, 0 = no dot.

const CONTRIBUTION_TABLES: Record<string, number[]> = {
  // Houses from own position that receive a dot
  Sun:     [1,0,1,0,1,1,0,1,1,1,0,1],  // houses 1,3,5,6,8,9,10,11 (BPHS)
  Moon:    [0,1,0,1,1,1,0,1,1,0,1,1],
  Mars:    [0,0,1,0,1,1,1,0,0,1,0,1],
  Mercury: [0,0,1,1,0,1,1,0,0,1,1,1],
  Jupiter: [1,0,1,0,0,1,1,1,1,0,1,0],
  Venus:   [0,1,0,0,1,1,1,1,0,1,0,1],
  Saturn:  [0,0,1,1,0,1,0,0,1,1,1,0],
  Lagna:   [1,0,1,1,0,1,0,0,1,1,0,1],  // Ascendant contribution
}

// NOTE: The contribution tables above are the standard BPHS values.
// Verify against your BPHS PDF (chapter on Ashtakavarga) before launch.
// Different editions list slightly different sequences for some planets.
// DECISION NEEDED (minor): confirm table values against your canonical BPHS PDF.

/**
 * Compute which signs receive a benefic dot from one contributor planet.
 * contributorSign: 1-12, the sign the contributor is in (or Lagna sign).
 * Returns an array of 12 booleans indexed 0-11 (sign 1 = index 0).
 */
function getDotsBySign(
  contributorSign: SignNumber,
  table: number[]
): boolean[] {
  const dots = new Array(12).fill(false)
  for (let house = 1; house <= 12; house++) {
    if (table[house - 1] === 1) {
      // Advance (house-1) signs from contributor (inclusive counting)
      const targetSign = ((contributorSign - 1 + house - 1) % 12)
      dots[targetSign] = true
    }
  }
  return dots
}

/**
 * Compute Samudaya (combined) Ashtakavarga for a natal chart.
 * Returns Rekha count (0-56) per sign.
 */
export function computeSamudayaAshtakavarga(
  planets: PlanetPosition[],
  lagnaSignNumber: SignNumber
): SamudayaAshtakavarga {
  // Accumulate total Rekhas per sign
  const rekhas: number[] = new Array(12).fill(0)

  const contributors: Array<{ name: string; sign: SignNumber }> = [
    ...planets
      .filter(p => p.planet !== 'Ketu')  // Ketu excluded from Ashtakavarga
      .filter(p => CONTRIBUTION_TABLES[p.planet])
      .map(p => ({ name: p.planet, sign: p.signNumber })),
    { name: 'Lagna', sign: lagnaSignNumber },
  ]

  for (const contributor of contributors) {
    const table = CONTRIBUTION_TABLES[contributor.name]
    const dots = getDotsBySign(contributor.sign, table)
    dots.forEach((hasDot, signIndex) => {
      if (hasDot) rekhas[signIndex]++
    })
  }

  const rekhasBySign: Record<number, number> = {}
  for (let i = 0; i < 12; i++) {
    rekhasBySign[i + 1] = rekhas[i]
  }

  return { rekhasBySign: rekhasBySign as Record<SignNumber, number> }
}

/**
 * Get or compute Samudaya Ashtakavarga, with permanent KV cache.
 * Invalidated only when the birth profile changes (invalidateChartCache).
 */
export async function getOrCreateAshtakavarga(
  userId: string,
  planets: PlanetPosition[],
  lagnaSignNumber: SignNumber
): Promise<SamudayaAshtakavarga> {
  const cacheKey = kvKeys.ashtakavarga(userId)
  const cached = await kvGet<SamudayaAshtakavarga>(cacheKey)
  if (cached) return cached

  const result = computeSamudayaAshtakavarga(planets, lagnaSignNumber)
  await kvSet(cacheKey, result)  // permanent — no TTL
  return result
}
```

Update getMuhurtaWindows in muhurtaService.ts to use this:

```typescript
// Replace getAshtakavarga(request.userId) call with:
import { getOrCreateAshtakavarga } from './ashtakavargaCalculator'

const ashtakavarga = await getOrCreateAshtakavarga(
  request.userId,
  natalPlanets,
  lagnaSignNumber
)
```

Done when: computeSamudayaAshtakavarga returns totals per sign, getOrCreateAshtakavarga caches correctly, invalidation covers the new key.

---

### MH-E.9 — AI Reasoning Enrichment

Create /lib/astro/muhurta/muhurtaAiEnricher.ts:

```typescript
// STATUS: pending | Task MH-E.9
// Enriches top-scored Muhurta windows with Claude-generated reasoning.
// Only enriches windows with color = 'green' or 'amber' to control API cost.

import type { MuhurtaWindow, PlanetName, SignNumber } from '@/types'

const SIGN_NAMES: Record<number, string> = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
  5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
  9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces'
}

function buildMuhurtaReasoningPrompt(window: MuhurtaWindow): string {
  const breakdown = window.scoreBreakdown
  const signName = SIGN_NAMES[window.transitSignNumber]

  return `You are a Vedic astrology expert specializing in Muhurta (auspicious timing).

Provide a practical 2-3 sentence explanation of the following timing window.

Planet: ${window.planet}
Transit Sign: ${signName} (House ${window.houseFromLagna} from natal Lagna)
House Domain: ${window.houseDomain}
Avastha (planet readiness): ${breakdown.avasthaState}
Functional nature for this Lagna: ${breakdown.functionalNature}
Ashtakavarga strength in this sign: ${breakdown.ashtakavargaRekhas} Rekhas
Virtual conjunction damage: ${breakdown.virtualConjunctionDamage ? `Yes - ${window.warningLabel}` : 'None'}
Overall auspiciousness: ${window.color}

Rules:
- Never use prediction language ("you will", "this will cause")
- Use pattern-recognition framing ("this tends to", "historically this period")
- End with one concrete tactical action the user can take
- Plain language, no jargon without explanation
- Maximum 80 words`
}

/**
 * Enrich top windows with AI reasoning.
 * Calls the Anthropic API for each green/amber window.
 * Rate-limited: max 10 windows enriched per call to control cost.
 */
export async function enrichWindowsWithAiReasoning(
  windows: MuhurtaWindow[]
): Promise<MuhurtaWindow[]> {
  const enrichable = windows
    .filter(w => w.color === 'green' || w.color === 'amber')
    .slice(0, 10)

  const enrichmentPromises = enrichable.map(async (window) => {
    try {
      const response = await fetch('/api/muhurta/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowId: window.id, prompt: buildMuhurtaReasoningPrompt(window) }),
      })
      if (!response.ok) return window
      const { reasoning } = await response.json()
      return { ...window, aiReasoning: reasoning }
    } catch {
      return window  // fail gracefully - reasoning is non-critical
    }
  })

  const enriched = await Promise.all(enrichmentPromises)

  // Merge enriched windows back into the full list
  const enrichedMap = new Map(enriched.map(w => [w.id, w]))
  return windows.map(w => enrichedMap.get(w.id) ?? w)
}
```

Create /app/api/muhurta/enrich/route.ts:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  await getRequiredSession()

  const { prompt } = await req.json()
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const reasoning = message.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  return NextResponse.json({ reasoning })
}
```

Add ANTHROPIC_API_KEY to env.ts required vars if not already present.

Done when: route compiles and returns a reasoning string.

---

### MH-E.10 — API Route (Premium + Free Tiers)

Create /app/api/muhurta/windows/route.ts:

```typescript
// STATUS: pending | Task MH-E.10

import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { getOrCreateVedicChart } from '@/lib/astro/chartService'
import { getMuhurtaWindows } from '@/lib/astro/muhurta/muhurtaService'
import { enrichWindowsWithAiReasoning } from '@/lib/astro/muhurta/muhurtaAiEnricher'
import type { MuhurtaRequest, MuhurtaIntentCategory } from '@/types'
import { prisma } from '@/lib/db'

// RESOLVED (variables.md 2026-03-30):
// transit_json and per-planet fields (vedic_{planet}_sign, vedic_{planet}_degree)
// are confirmed. KvTransitProvider reads from the transit KV cache using these
// confirmed field names.
//
// REMAINING DECISION (non-blocking for today's data, blocking for multi-day):
//   The cron job (Task 9.3) currently pre-computes transits only for today.
//   For the full 30-day window range, extend the cron to cache daily transit
//   snapshots for the next 30 days. Until then, the provider throws on future
//   dates and the route returns a 202 with an explanatory message.
import { KvTransitProvider } from '@/lib/astro/muhurta/stubTransitProvider'

const MAX_RANGE_DAYS = 30

export async function GET(req: Request) {
  const session = await getRequiredSession()
  const url = new URL(req.url)

  const startParam = url.searchParams.get('start')
  const endParam   = url.searchParams.get('end')
  const intent     = (url.searchParams.get('intent') ?? 'all') as MuhurtaIntentCategory
  const enrichAi   = url.searchParams.get('ai') === 'true'

  const startDate = startParam ? new Date(startParam) : new Date()
  const endDate   = endParam   ? new Date(endParam)   : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // Enforce max range
  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > MAX_RANGE_DAYS) {
    return NextResponse.json(
      { error: `Maximum date range is ${MAX_RANGE_DAYS} days` },
      { status: 400 }
    )
  }

  // Fetch birth profile to get chart
  const birthProfile = await prisma.birthProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!birthProfile) {
    return NextResponse.json(
      { error: 'Birth profile not found. Complete onboarding first.' },
      { status: 404 }
    )
  }

  const vedicChart = await getOrCreateVedicChart(session.user.id, birthProfile)

  const muhurtaRequest: MuhurtaRequest = {
    userId: session.user.id,
    startDate,
    endDate,
    intentFilter: intent,
    includeAiReasoning: enrichAi,
  }

  let response: MuhurtaResponse
  try {
    response = await getMuhurtaWindows(
      muhurtaRequest,
      vedicChart,
      new KvTransitProvider(session.user.id)
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Transit data unavailable.'
    // If transit cache is missing for future dates, return 202 rather than 500
    if (msg.includes('KvTransitProvider')) {
      return NextResponse.json(
        {
          error: 'Transit data not yet pre-computed for the requested date range.',
          detail: 'The daily cron job pre-computes transit windows. Try again after it runs, or narrow your date range to today.',
        },
        { status: 202 }
      )
    }
    throw err
  }

  // Free tier: only return top 3 windows (glimpse pattern)
  const isFree = session.user.subscriptionTier === 'FREE'
  if (isFree) {
    const top3 = [...response.windows]
      .sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore)
      .slice(0, 3)
    response = { ...response, windows: top3 }
  }

  // AI enrichment (premium only, on request)
  if (enrichAi && !isFree && !response.cacheHit) {
    response.windows = await enrichWindowsWithAiReasoning(response.windows)
  }

  return NextResponse.json(response)
}
```

Create /lib/astro/muhurta/stubTransitProvider.ts:

```typescript
// STATUS: pending | Task MH-E.10
// RESOLVED (variables.md 2026-03-30):
// {{transit_json}} confirms that current transit data is available as a JSON
// object in the system. The per-planet fields are also confirmed:
//   vedic_{planet}_sign, vedic_{planet}_degree, vedic_{planet}_retro
// for planets: sun, moon, mars, mercury, jupiter, venus, saturn, rahu, ketu
//
// The TransitPositionProvider below reads from the transit KV cache
// (same data that populates transit_json). If the transit data is for
// today only, the provider returns today's positions for any timestamp
// within today. For multi-day window generation, the cron job must
// pre-compute transit snapshots per day — see TODO below.

import type { TransitPositionProvider } from './windowGenerator'
import type { PlanetName } from '@/types'
import { kvGet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'
import { longitudeToSignAndDegree } from '@/lib/astro/specialPoints'

// Map from PlanetName to the variable prefix used in the transit JSON
const PLANET_KEY_MAP: Record<PlanetName, string> = {
  Sun:     'sun',
  Moon:    'moon',
  Mars:    'mars',
  Mercury: 'mercury',
  Jupiter: 'jupiter',
  Venus:   'venus',
  Saturn:  'saturn',
  Rahu:    'rahu',
  Ketu:    'ketu',
}

export class KvTransitProvider implements TransitPositionProvider {
  constructor(private readonly userId: string) {}

  async getPlanetLongitudesAt(
    utcTimestamp: Date
  ): Promise<Record<PlanetName, number>> {
    const dateKey = utcTimestamp.toISOString().split('T')[0]
    // Transit KV key pattern confirmed from lib/kv/keys.ts
    const transitData = await kvGet<Record<string, unknown>>(
      kvKeys.transit(this.userId, dateKey)
    )

    if (!transitData) {
      // RESOLVED (2026-03-30): Extend the cron job (Task 9.3) to pre-compute
      // and cache transit snapshots for the next 30 days, not just today.
      // Each day's snapshot is stored at kvKeys.transit(userId, 'YYYY-MM-DD')
      // with TTL of 32 days (covers the window + a buffer day).
      // Until the cron is extended, this throws for future dates but works
      // for today. See Task MH-E.7b for the cron extension sub-task.
      throw new Error(
        `[KvTransitProvider] No transit data in KV for ${dateKey}. ` +
        'The cron job (Task 9.3) must be extended to pre-cache 30-day transits. ' +
        'See Task MH-E.7b.'
      )
    }

    const result: Partial<Record<PlanetName, number>> = {}

    for (const [planetName, prefix] of Object.entries(PLANET_KEY_MAP)) {
      // Field names follow the confirmed variables.md pattern:
      // vedic_{planet}_sign (sign name string) and vedic_{planet}_degree (number)
      const signName = transitData[`vedic_${prefix}_sign`] as string | undefined
      const degree   = transitData[`vedic_${prefix}_degree`] as number | undefined

      if (signName && degree !== undefined) {
        // Convert sign name back to sign number, then to absolute longitude
        const signNumber = SIGN_NAME_TO_NUMBER[signName.toLowerCase()]
        if (signNumber) {
          result[planetName as PlanetName] = (signNumber - 1) * 30 + degree
        }
      }
    }

    return result as Record<PlanetName, number>
  }
}

const SIGN_NAME_TO_NUMBER: Record<string, number> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4,
  leo: 5, virgo: 6, libra: 7, scorpio: 8,
  sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
}
```

Done when: route compiles. Stub error is acceptable during development.

---

### MH-E.11 — Frontend: Muhurta Finder Page

Create /app/(dashboard)/muhurta/page.tsx:

```tsx
// STATUS: pending | Task MH-E.11
// Muhurta Finder page — shows auspicious timing windows with color indicators,
// intent toggle, and Moksha/Artha labels.
// Follows the existing dashboard layout and cosmic design system.

'use client'

import { useState, useEffect } from 'react'
import type { MuhurtaWindow, MuhurtaIntentCategory } from '@/types'

// Intent filter options shown in UI
const INTENT_OPTIONS: { value: MuhurtaIntentCategory; label: string }[] = [
  { value: 'all',          label: 'All Windows' },
  { value: 'career',       label: 'Career' },
  { value: 'finance',      label: 'Finance' },
  { value: 'relationship', label: 'Relationships' },
  { value: 'health',       label: 'Health' },
  { value: 'spiritual',    label: 'Spiritual' },
  { value: 'travel',       label: 'Travel' },
]

const COLOR_STYLES: Record<string, string> = {
  green:   'border-l-4 border-green-400 bg-green-900/20',
  amber:   'border-l-4 border-amber-400 bg-amber-900/20',
  neutral: 'border-l-4 border-slate-500 bg-slate-800/20',
  red:     'border-l-4 border-red-400 bg-red-900/20 opacity-60',
}

const DOMAIN_BADGE: Record<string, { label: string; type: 'artha' | 'moksha' | 'dharma' | 'neutral' }> = {
  windfall:       { label: 'Financial Windfall',     type: 'artha'   },
  career:         { label: 'Career Action',          type: 'artha'   },
  wealth:         { label: 'Wealth Accumulation',    type: 'artha'   },
  transformation: { label: 'Deep Transformation',    type: 'moksha'  },
  spiritual:      { label: 'Spiritual Practice',     type: 'moksha'  },
  dharma:         { label: 'Dharma Alignment',       type: 'dharma'  },
  identity:       { label: 'Identity / New Cycle',   type: 'dharma'  },
  creativity:     { label: 'Creativity',             type: 'dharma'  },
  partnership:    { label: 'Partnership',            type: 'neutral' },
  communication:  { label: 'Communication',          type: 'neutral' },
  service:        { label: 'Service / Health',       type: 'neutral' },
  home:           { label: 'Home / Foundation',      type: 'neutral' },
}

const BADGE_TYPE_COLORS = {
  artha:   'bg-amber-500/20 text-amber-300',
  moksha:  'bg-purple-500/20 text-purple-300',
  dharma:  'bg-blue-500/20  text-blue-300',
  neutral: 'bg-slate-500/20 text-slate-300',
}

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return `${new Date(start).toLocaleString(undefined, opts)} – ${new Date(end).toLocaleString(undefined, opts)}`
}

export default function MuhurtaFinderPage() {
  const [intent, setIntent] = useState<MuhurtaIntentCategory>('all')
  const [windows, setWindows] = useState<MuhurtaWindow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMokshaOnly, setShowMokshaOnly] = useState(false)
  const [dashaInfo, setDashaInfo] = useState<{ lord: string; endDate: string } | null>(null)

  useEffect(() => {
    fetchWindows()
  }, [intent])

  async function fetchWindows() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ intent, ai: 'true' })
      const res = await fetch(`/api/muhurta/windows?${params}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to load timing windows.')
        return
      }
      const data = await res.json()
      setWindows(data.windows ?? [])
      if (data.dashaContext) {
        setDashaInfo({
          lord: data.dashaContext.mahadashaLord,
          endDate: new Date(data.dashaContext.mahadashaEndDate).toLocaleDateString(),
        })
      }
    } catch {
      setError('Could not load Muhurta windows. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const visibleWindows = showMokshaOnly
    ? windows.filter(w => {
        const badge = DOMAIN_BADGE[w.houseDomain]
        return badge?.type === 'moksha' || badge?.type === 'dharma'
      })
    : windows

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="font-cormorant text-4xl text-star mb-2">Muhurta Finder</h1>
      <p className="text-sky/70 text-sm mb-6">
        Auspicious timing windows personalised to your birth chart.
      </p>

      {dashaInfo && (
        <div className="mb-6 rounded-lg bg-earth/30 border border-amber/20 px-4 py-3 text-sm text-gold">
          Current Mahadasha: <strong>{dashaInfo.lord}</strong> — until {dashaInfo.endDate}.
          Windows are scored with this backdrop in mind.
        </div>
      )}

      {/* Intent filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {INTENT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setIntent(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-instrument transition-colors ${
              intent === opt.value
                ? 'bg-amber text-earth'
                : 'bg-earth/40 text-star/60 hover:bg-earth/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Moksha / Artha toggle */}
      <div className="flex items-center gap-2 mb-6 text-sm text-sky/70">
        <button
          onClick={() => setShowMokshaOnly(false)}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            !showMokshaOnly ? 'bg-amber/20 text-amber' : 'text-sky/50'
          }`}
        >
          Artha (All)
        </button>
        <span className="text-sky/30">/</span>
        <button
          onClick={() => setShowMokshaOnly(true)}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            showMokshaOnly ? 'bg-purple-500/20 text-purple-300' : 'text-sky/50'
          }`}
        >
          Moksha / Dharma
        </button>
      </div>

      {loading && (
        <p className="text-sky/50 text-sm animate-pulse">Calculating your windows...</p>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-400/20 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && visibleWindows.length === 0 && (
        <p className="text-sky/50 text-sm">No windows found for the selected filters.</p>
      )}

      <div className="space-y-4">
        {visibleWindows.map(window => {
          const badge = DOMAIN_BADGE[window.houseDomain]
          const badgeStyle = badge ? BADGE_TYPE_COLORS[badge.type] : BADGE_TYPE_COLORS.neutral

          return (
            <div
              key={window.id}
              className={`rounded-lg p-4 ${COLOR_STYLES[window.color]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-instrument font-semibold text-star text-sm">
                    {window.planet} in House {window.houseFromLagna}
                  </p>
                  <p className="text-sky/60 text-xs mt-0.5">
                    {formatDateRange(window.startTime, window.endTime)}
                  </p>
                </div>
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${badgeStyle}`}>
                    {badge.label}
                  </span>
                )}
              </div>

              {window.warningLabel && (
                <p className="mt-2 text-xs text-red-300 font-mono">
                  ⚠ {window.warningLabel}
                </p>
              )}

              <div className="mt-2 flex gap-4 text-xs text-sky/50">
                <span>Avastha: {window.scoreBreakdown.avasthaState}</span>
                <span>Rekhas: {window.scoreBreakdown.ashtakavargaRekhas}</span>
                <span>Score: {window.scoreBreakdown.totalScore}</span>
              </div>

              {window.aiReasoning && (
                <p className="mt-3 text-sm text-star/80 leading-relaxed">
                  {window.aiReasoning}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Add the page to the dashboard navigation in /app/(dashboard)/layout.tsx:
```
{ href: '/muhurta', label: 'Muhurta Finder' }
```

Done when: page renders in the browser without TypeScript errors.

---

## KV KEY ADDITIONS

Add to /lib/kv/keys.ts inside the kvKeys object:

```typescript
muhurta: (userId: string, startDate: string, endDate: string) =>
  `muhurta:${userId}:${startDate}:${endDate}`,
```

Add to KV_TTL:

```typescript
MUHURTA_SECONDS: 7 * 24 * 60 * 60,  // 7 days — deterministic for a given chart + range
```

---

## ENV VAR ADDITIONS

Add to /lib/env.ts required vars (if not already present):

```
ANTHROPIC_API_KEY
```

The AI enrichment route (MH-E.9) requires this. Install the Anthropic SDK
if not already installed:

```bash
npm install @anthropic-ai/sdk
```

---

## COMPLETION CHECKLIST

- [ ] MH-E.1   Types added to types/index.ts — all six new types present
- [ ] MH-E.2   functionalNature.ts — all 12 Lagna rows, no `any`
- [ ] MH-E.3   avastha.ts — full Awakened/Sleeping/Active including enemy-sign check; add `export` to 3 constants in specialPoints.ts
- [ ] MH-E.4   virtualConjunction.ts — 5° orb check, angular separation correct
- [ ] MH-E.5   windowScorer.ts — scoring algorithm matches spec, color thresholds correct
- [ ] MH-E.6   dashaContext.ts — openastrology-library Dasha fields mapped, fallback chain compiles
- [ ] MH-E.7   windowGenerator.ts — sign ingress detection, window open/close logic
- [ ] MH-E.7b  Cron extension — 30-day transit pre-cache loop added to generate-insights cron
- [ ] MH-E.8   muhurtaService.ts — calls getOrCreateAshtakavarga, KV cache correct
- [ ] MH-E.8b  ashtakavargaCalculator.ts — computeSamudayaAshtakavarga correct, KV key added, invalidation updated
- [ ] MH-E.9   muhurtaAiEnricher.ts + /api/muhurta/enrich/route.ts — AI enrichment compiles
- [ ] MH-E.10  /api/muhurta/windows/route.ts — free tier glimpse (top 3), KvTransitProvider wired
- [ ] MH-E.11  /app/(dashboard)/muhurta/page.tsx — renders, intent toggle works, Moksha/Artha toggle works
- [ ] KV keys  muhurta + ashtakavarga keys added, TTLs correct
- [ ] ENV      ANTHROPIC_API_KEY in env.ts

---

## OPEN DECISIONS

All four major decisions resolved. One narrow non-blocking item remains:

```
REMAINING NARROW DECISION
Task: MH-E.6
File: lib/astro/muhurta/dashaContext.ts
Question: Is the Dasha KV payload (from openastrology-library) keyed with
  camelCase (currentMahadasha) or snake_case (current_mahadasha)?
  The fallback chain in getDashaContext handles both cases.
  Remove the unused branch once you observe the actual KV payload at runtime.
Blocking: Nothing — feature works either way.
Raised: 2026-03-30

REMAINING DECISION (implementation stub only)
Task: MH-E.7b
File: app/api/cron/generate-insights/route.ts
Question: Which openastrology-library method returns planetary positions
  for an arbitrary future date (for transit pre-caching)?
  The stub in precomputeTransitsForUser shows exactly where the call goes.
  Replace the throw with the real library call once confirmed.
Blocking: Multi-day window generation. Today-only Muhurta works without this.
Raised: 2026-03-30

MINOR DECISION
Task: MH-E.8b
File: lib/astro/muhurta/ashtakavargaCalculator.ts
Question: Verify the CONTRIBUTION_TABLES values against your canonical BPHS PDF
  (chapter on Ashtakavarga). Different editions list slightly different
  sequences for some planets (Venus and Saturn in particular).
  The tables in the task use the standard commonly-cited BPHS values.
Blocking: Nothing — incorrect tables produce wrong Rekha scores but don't crash.
Raised: 2026-03-30
```

---

## SANITY CHECKS

Verify mentally before marking tasks done:

  Functional Benefics for Leo (sign 5) = Sun, Mars, Jupiter
  Avastha check: Jupiter in Sagittarius (own sign 9) = Awakened
  Avastha check: Mars in Cancer (debilitation = sign 4) = Sleeping
  Virtual conjunction: transit Venus at 120° absolute, natal Saturn at 117° = 3° sep = Damaged
  Virtual conjunction: transit Venus at 120° absolute, natal Saturn at 114° = 6° sep = Not damaged

  Score example (Leo Lagna, Saturn Mahadasha -1 modifier):
    Transit Mars (FB +2) enters Aries (40 Rekhas +2, strong) — Awakened (+2) — no conj — Dasha -1
    Score = 2 + 2 + 2 + 0 - 1 = 5 → Green

  Free tier glimpse: windows array truncated to top 3 by score before returning.
  Cache hit: response.cacheHit = true, AI enrichment skipped.

---

*Crossroads Compass — Muhurta Finder Task File | MH-E.1–MH-E.11 | March 2026*

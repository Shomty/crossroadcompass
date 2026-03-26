# Task: Vedic Special Points Calculator Service - Extended Set
# STATUS: reference (aligned with shipped code 2026-03)
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: task-vedic-special-points.md (SP.1-SP.13 must be complete first)
# Updated: 2026-03-26 — SP-EXT.3 narrative = BPHS Movable/Fixed/Dual; types/snippets; DMS longitudes for Sphutas/Bhrigu/Dhooma Sun

---

## CONTEXT

This file extends the existing special points service with additional
Jyotish calculation modules. All SP.1-SP.13 tasks must be complete
before starting here. The same architectural rules apply:

- All calculation functions are pure and side-effect-free
- No DB reads or KV reads inside calculation functions
- All data is passed in as arguments from chartService.ts
- New types are added to types/index.ts
- New functions live in /lib/astro/specialPoints.ts unless noted

Reference files you must read before starting:
- lib/astro/specialPoints.ts    existing special points module
- lib/astro/chartService.ts     orchestration layer
- types/index.ts                add all new types here
- lib/kv/keys.ts                add any new KV keys here

### Input data availability (confirmed)

All calculations below derive from data already available:

  vedicChart.lagnaSignNumber                         SignNumber 1-12
  vedicChart.planets                                 PlanetPosition[]
  vedicChart.sunriseData.sunAbsoluteLongitude        number 0-360
  vedicChart.sunriseData.minutesSinceSunrise         number

(*) Hora Lagna sign for Varnada — use `calculateHoraLagna` / cached
    `SpecialPointsResult.horaLagna.horaLagnaSignNumber`. The API may not
    expose `vedicChart.horaLagnaSignNumber`; do not rely on it.

(**) Gulika for Trisphuta: use **`gulika.referenceLongitude`** from
    `calculateKaalVelas` (Gulika = **start** of Saturn’s eighth). Fallback
    `midpointLongitude` only for legacy cached payloads.

(***) Moon / planet longitudes: shipped code uses **degree + arcMinutes +
    arcSeconds** for Beeja, Kshetra, Trisphuta (Moon), and Bhrigu Bindu
    (Moon + Rahu) where applicable; see `planetAbsoluteLongitude` in
    `specialPoints.ts`.

---

## WHAT YOU ARE BUILDING (EXTENDED SET)

New modules added in this task file:

  VL   Varnada Lagna       - longevity and lifespan of relatives
  PP   Pranapada Lagna     - birth auspiciousness indicator
  UL   Upapada Lagna       - marriage and nature of spouse
  SL   Sree Lagna          - wealth accumulation potential
  BS   Beeja Sphuta        - male procreative capacity (mathematical point)
  KS   Kshetra Sphuta      - female fertility (mathematical point)
  TS   Trisphuta           - timing of death (mathematical point)
  DH   Dhooma + chain      - five non-luminous malefic points
  KV   Kaal Velas          - Gulika, Maandi and five satellite points

Cross-reference against existing SP.1-SP.13:
  AL Arudha Lagna          DONE (SP.5)
  GL Ghati Lagna           DONE (SP.6)
  BL Bhava Lagna           DONE (SP.7)
  HL Hora Lagna            DONE (SP.8)
  CK Charakarakas (8)      DONE (SP.9)

---

## DOMAIN ASSUMPTIONS (NEW MATERIAL)

### Absolute longitude arithmetic

Several calculations below add planet longitudes together and wrap at 360.
The helper pattern is: ((sum % 360) + 360) % 360

### Odd / even sign classification

Odd signs (Visama):  Aries Gemini Leo Libra Sagittarius Aquarius  (1 3 5 7 9 11)
Even signs (Sama):   Taurus Cancer Virgo Scorpio Capricorn Pisces  (2 4 6 8 10 12)

This classification is needed for Varnada Lagna only.

### Ghati / Vighati time units (same as SP.1-SP.13)

1 Ghati = 24 minutes
1 Ghati = 60 Vighatikas
1 day (daytime) = 30 Ghatikas

### Kaal Vela weekday lord order

The seven lords of the Kaal Vela portions follow the weekday lord sequence
starting from that day's ruling planet:

  Sunday -> Sun  Monday -> Moon  Tuesday -> Mars  Wednesday -> Mercury
  Thursday -> Jupiter  Friday -> Venus  Saturday -> Saturn

The portions for a given day start from that day's ruler and proceed
through the sequence. The 8th portion has no lord (Lord-less).

DECISION NEEDED: confirm whether the Vedic API returns the day-of-week
at the birth location (needed for Kaal Vela), or whether the agent must
derive it from the birth timestamp in the BirthProfile.

---

## TASK SP-EXT.1 - New Types

Add to types/index.ts:

```typescript
export interface VarnadaLagnaResult {
  varnadaLagnaSignNumber: SignNumber
  lagnaIsOdd: boolean
  horaLagnaIsOdd: boolean
  countFromAries: number          // steps counted from Aries or Pisces
  countFromHoraLagna: number      // steps counted from Hora Lagna
}

export type PranapadaStartingRule = 'from_sun' | 'from_9th_from_sun' | 'from_5th_from_sun'

export interface PranapadalagnaResult {
  pranapadalagnaSignNumber: SignNumber
  pranapadalagnaDegree: number
  sunSignAtSunrise: SignNumber
  startingRule: PranapadaStartingRule
  startingSignNumber: SignNumber
  sunLongitudeAtSunrise: number
  vighatisSinceSunrise: number
  offsetDegrees: number
  baseOffsetDegrees?: number      // deprecated mirror of offsetDegrees for older KV payloads
}

export interface UpapadaLagnaResult {
  upapadaSignNumber: SignNumber
  twelfthHouseLord: PlanetName
  lordSignNumber: SignNumber
  stepsFromTwelfthToLord: number
  exceptionApplied: 'none' | 'use_10th_from_12th' | 'use_4th_from_12th'
}

export interface SreeLagnaResult {
  sreeLagnaSignNumber: SignNumber
  ninthLordFromLagnaKalas: number
  ninthLordFromMoonKalas: number
  totalKalas: number
  remainder: number               // totalKalas % 12, counted from Moon's sign
}

export interface BeejaSphutaResult {
  beejaSphutaLongitude: number   // 0-360, sum of Sun + Venus + Jupiter
  beejaSphutaSign: SignNumber
  beejaSphutaDegree: number
}

export interface KsheetraSphutaResult {
  kshetraSphutaLongitude: number // 0-360, sum of Mars + Moon + Jupiter
  kshetraSphutaSign: SignNumber
  kshetraSphutaDegree: number
}

export interface TriSphutaResult {
  triSphutaLongitude: number     // 0-360, sum of Lagna + Moon + Gulika
  triSphutaSign: SignNumber
  triSphutaDegree: number
  gulikaLongitudeUsed: number     // echoed for traceability
}

export interface DhoomaChainResult {
  dhooma: number                  // absolute longitude 0-360
  vyatipata: number
  parivesha: number
  indraChapa: number
  upaketu: number
  // All five as sign + degree for convenience
  dhoomaSign: SignNumber
  vyatipataSign: SignNumber
  pariveshaSign: SignNumber
  indraChapSign: SignNumber
  upaKetuSign: SignNumber
}

export type KaalVelaPlanet =
  | 'Gulika' | 'Maandi' | 'Kaala' | 'Mrityu' | 'Ardhaprahara' | 'Yamaghantaka'

export interface KaalVelaResult {
  planet: KaalVelaPlanet
  portionNumber: number           // 1-7 within the day/night arc
  startMinutesFromSunrise: number
  endMinutesFromSunrise: number
  referenceLongitude: number      // canonical: Gulika=start of portion, others=midpoint; Maandi=Saturn eighth midpoint
  midpointLongitude: number        // same as referenceLongitude (legacy / cache)
  signNumber: SignNumber
}

export interface KaalVelaSetResult {
  gulika: KaalVelaResult           // start of Saturn's portion
  maandi: KaalVelaResult           // midpoint of Saturn's portion (distinct from Gulika)
  kaala: KaalVelaResult
  mrityu: KaalVelaResult
  ardhaprahara: KaalVelaResult
  yamaghantaka: KaalVelaResult
}

export interface BhriguBinduResult {
  bhriguBinduLongitude: number     // (Moon + Rahu) / 2, wrapped 0-360
  bhriguBinduSign: SignNumber
  bhriguBinduDegree: number
  moonLongitudeUsed: number        // echoed for traceability
  rahuLongitudeUsed: number        // echoed for traceability
}

export interface ExtendedSpecialPointsResult {
  varnadaLagna: VarnadaLagnaResult
  pranapada: PranapadalagnaResult
  upapadaLagna: UpapadaLagnaResult
  sreeLagna: SreeLagnaResult
  bhriguBindu: BhriguBinduResult
  beejaSphuata: BeejaSphutaResult
  kshetraSphuata: KsheetraSphutaResult
  trisphuta: TriSphutaResult | null             // null when Gulika longitude unavailable
  dhoomaChain: DhoomaChainResult
  kaalVelas: KaalVelaSetResult | null           // null if weekday / daytime data unavailable
}
```

IMPORTANT: the type names above contain some spelling inconsistencies
from the source document (Sphuta vs Sphuata). Normalise all to
`Sphuta` in the final implementation. The canonical spellings are:

  BeejaSphutaResult   -> BeejaSphutaResult
  KsheetraSphutaResult -> KsheetraSphutaResult
  TriSphutaResult     -> TriSphutaResult

Fix these before committing. The task descriptions below use the
corrected spellings.

Done when: types/index.ts compiles with zero TypeScript errors.

---

## TASK SP-EXT.2 - Varnada Lagna Calculator

Varnada Lagna is used primarily for longevity analysis and the
lifespan of relatives. It requires both the natal Lagna sign and
the Hora Lagna sign (already calculated in SP.8).

Algorithm (Parashara):
1. Count the number of signs from Aries to the natal Lagna (inclusive).
   Call this A.
2. Count the number of signs from Aries to the Hora Lagna (inclusive).
   Call this B.
3. If both Lagna and Hora Lagna are in ODD signs, or both are in EVEN
   signs: add A + B. The Varnada Lagna is that many signs from Aries.
4. If one is odd and the other is even: subtract the smaller from the
   larger. The Varnada Lagna is that many signs from Aries.
5. In all cases, wrap modulo 12. If the result is 0, use 12.

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateVarnadaLagna(
  lagnaSignNumber: SignNumber,
  horaLagnaSignNumber: SignNumber
): VarnadaLagnaResult {
  const ODD_SIGNS = new Set<SignNumber>([1, 3, 5, 7, 9, 11])

  const lagnaIsOdd    = ODD_SIGNS.has(lagnaSignNumber)
  const horaLagnaIsOdd = ODD_SIGNS.has(horaLagnaSignNumber)

  // Count from Aries (sign 1) to each Lagna inclusive = the sign number itself
  const countA = lagnaSignNumber    // Aries to Lagna
  const countB = horaLagnaSignNumber  // Aries to Hora Lagna

  let rawCount: number

  if (lagnaIsOdd === horaLagnaIsOdd) {
    // Both odd or both even: add
    rawCount = countA + countB
  } else {
    // One odd, one even: subtract (larger minus smaller)
    rawCount = Math.abs(countA - countB)
  }

  // Wrap modulo 12; if result is 0, use 12
  const varnadaSignNumber = ((((rawCount - 1) % 12) + 12) % 12 + 1) as SignNumber

  return {
    varnadaLagnaSignNumber: varnadaSignNumber as SignNumber,
    lagnaIsOdd,
    horaLagnaIsOdd,
    countFromAries: countA,
    countFromHoraLagna: countB,
  }
}
```

DECISION NEEDED: Some traditions count Varnada from Pisces when both
Lagnas are even rather than from Aries. The implementation above
always counts from Aries (the most common Parashara interpretation).
If the Vedic API or canonical source specifies a different starting
point for even-sign cases, update the rawCount formula accordingly.

Done when: function compiles with correct return type.

---

## TASK SP-EXT.3 - Pranapada Lagna Calculator

Pranapada Lagna checks whether a birth is auspicious. A fortunate
Pranapada falls in the 2nd, 5th, 9th, 4th, 10th, or 11th house from
the natal Lagna.

**Canonical algorithm (shipped; matches BPHS / `task-vedic-special-points-master.md` DECISION [7], VSP-12):**

1. `vighatikas = minutesSinceSunrise * 2.5` (same as 1 Ghati = 60 Vighatikas in 24 min).
2. `offsetDegrees = vighatikas / 15` (1° per 15 Vighatis).
3. Derive Sun’s sign at sunrise from `sunAbsoluteLongitudeAtSunrise` (`longitudeToSignAndDegree`).
4. **Starting sign** (Movable / Fixed / Dual — *not* fire/earth/air/water):
   - **Movable** (1, 4, 7, 10): start from **Sun’s sign**.
   - **Fixed** (2, 5, 8, 11): start from **9th house from Sun’s sign**.
   - **Dual** (3, 6, 9, 12): start from **5th house from Sun’s sign**.
5. `startingLongitude = (startingSignNumber - 1) * 30` (cusp 0° of that sign).
6. `resultLongitude = startingLongitude + offsetDegrees`, wrap 0–360, convert to sign + degree.

**Obsolete / not implemented:** An older draft of this file described **element-based** rules (fire/air add offset to **full Sun longitude**, earth/water subtract). That text was **not** implemented; do not use it for cross-checks. If your reference software uses that variant, numbers will disagree with this app.

Full pseudocode is in **master VSP-12**; implementation: `calculatePranapada` in `/lib/astro/specialPoints.ts`.

Done when: Pranapada matches the Movable/Fixed/Dual rule above.

---

## TASK SP-EXT.4 - Upapada Lagna Calculator

Upapada Lagna is the Arudha Pada of the 12th house. It is crucial for
judging marriage and the nature of the spouse.

Algorithm: identical to Arudha Lagna (SP.5) except the starting house
is the 12th house, not the 1st.

1. Find the 12th house sign: advanceSigns(lagnaSignNumber, 12).
2. Find the lord of the 12th house sign.
3. Count signs from 12th house to lord (inclusive) = N.
4. Advance N signs from lord = raw Upapada.
5. Apply the same two exceptions as AL:
   - If raw UP = 12th house sign: use the 10th from the 12th house.
   - If raw UP = 7th from the 12th house: use the 4th from the 12th house.

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateUpapadaLagna(
  lagnaSignNumber: SignNumber,
  planets: PlanetPosition[]
): UpapadaLagnaResult {
  // The 12th house sign
  const twelfthHouseSign = advanceSigns(lagnaSignNumber, 12)

  // Find the 12th lord (resolve dual lords same as AL)
  const rawLord = SIGN_LORDS[twelfthHouseSign]
  const twelfthLord: PlanetName = Array.isArray(rawLord)
    ? getStrongerLord(rawLord[0], rawLord[1], planets)
    : rawLord

  const lordPosition = planets.find(p => p.planet === twelfthLord)
  if (!lordPosition) throw new Error(
    `[calculateUpapadaLagna] 12th lord "${twelfthLord}" not found in planets array`
  )

  const lordSignNumber = lordPosition.signNumber
  const steps = countSignsBetween(twelfthHouseSign, lordSignNumber)
  let rawUP   = advanceSigns(lordSignNumber, steps)

  // 7th from 12th house
  const seventhFromTwelfth = advanceSigns(twelfthHouseSign, 7)
  let exceptionApplied: UpapadaLagnaResult['exceptionApplied'] = 'none'

  if (rawUP === twelfthHouseSign) {
    rawUP = advanceSigns(twelfthHouseSign, 10)
    exceptionApplied = 'use_10th_from_12th'
  } else if (rawUP === seventhFromTwelfth) {
    rawUP = advanceSigns(twelfthHouseSign, 4)
    exceptionApplied = 'use_4th_from_12th'
  }

  return {
    upapadaSignNumber: rawUP,
    twelfthHouseLord: twelfthLord,
    lordSignNumber,
    stepsFromTwelfthToLord: steps,
    exceptionApplied,
  }
}
```

Done when: function compiles.

---

## TASK SP-EXT.5 - Sree Lagna Calculator

Sree Lagna indicates potential for great wealth. It combines the
9th lord's strength from both the Lagna and the Moon.

The calculation uses "Kalas" - the number of full signs from Aries
to each 9th lord's position (inclusive = the sign number itself).

Algorithm:
1. Find the 9th house from Lagna: advanceSigns(lagnaSignNumber, 9).
2. Find the lord of that sign. Call it the "9th lord from Lagna."
3. The Kala for this lord = its sign number (Aries=1, Taurus=2, etc.).
4. Find the 9th house from the Moon's sign.
5. Find the lord of that sign. Call it the "9th lord from Moon."
6. The Kala for this lord = its sign number.
7. Add both Kalas. Divide the sum by 12. The remainder is the count.
8. Count that many signs from the Moon's sign (inclusive). That is
   the Sree Lagna.
9. If remainder is 0, the Sree Lagna is the Moon's sign itself.

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateSreeLagna(
  lagnaSignNumber: SignNumber,
  planets: PlanetPosition[]
): SreeLagnaResult {
  // Derive Moon's sign number from the planets array
  const moonPosition = planets.find(p => p.planet === 'Moon')
  if (!moonPosition) throw new Error('[calculateSreeLagna] Moon not found in planets array')
  const moonSignNumber = moonPosition.signNumber

  // 9th house from Lagna
  const ninthFromLagna = advanceSigns(lagnaSignNumber, 9)
  const rawLordFromLagna = SIGN_LORDS[ninthFromLagna]
  const lordFromLagna: PlanetName = Array.isArray(rawLordFromLagna)
    ? getStrongerLord(rawLordFromLagna[0], rawLordFromLagna[1], planets)
    : rawLordFromLagna

  // Kala = sign number of the lord's position
  const lordFromLagnaPos = planets.find(p => p.planet === lordFromLagna)
  if (!lordFromLagnaPos) throw new Error(
    `[calculateSreeLagna] 9th lord from Lagna "${lordFromLagna}" not found`
  )
  const kalaFromLagna = lordFromLagnaPos.signNumber

  // 9th house from Moon
  const ninthFromMoon = advanceSigns(moonSignNumber, 9)
  const rawLordFromMoon = SIGN_LORDS[ninthFromMoon]
  const lordFromMoon: PlanetName = Array.isArray(rawLordFromMoon)
    ? getStrongerLord(rawLordFromMoon[0], rawLordFromMoon[1], planets)
    : rawLordFromMoon

  const lordFromMoonPos = planets.find(p => p.planet === lordFromMoon)
  if (!lordFromMoonPos) throw new Error(
    `[calculateSreeLagna] 9th lord from Moon "${lordFromMoon}" not found`
  )
  const kalaFromMoon = lordFromMoonPos.signNumber

  const totalKalas = kalaFromLagna + kalaFromMoon
  const remainder  = totalKalas % 12

  // Count remainder signs from Moon's sign; remainder 0 = Moon's sign itself
  const sreeLagnaSign = remainder === 0
    ? moonSignNumber
    : advanceSigns(moonSignNumber, remainder) as SignNumber

  return {
    sreeLagnaSignNumber:        sreeLagnaSign,
    ninthLordFromLagnaKalas:    kalaFromLagna,
    ninthLordFromMoonKalas:     kalaFromMoon,
    totalKalas,
    remainder,
  }
}
```

Done when: function compiles.

---

## TASK SP-EXT.6 - Mathematical Sphutas Calculator

Three mathematical sum-points calculated from absolute planet longitudes.

All three use the same pattern: add longitudes, wrap at 360, convert to
sign + degree.

Derive absolute longitude for any **planet** (shipped: includes arc minutes/seconds):
  planetAbsoluteLongitude(p) = (signNumber - 1) * 30 + degreeInSign + arcMinutes/60 + arcSeconds/3600

For sign-cusp-only helpers (e.g. Lagna in Trisphuta):
  toAbsoluteLongitude(signNumber, degreeInSign) = (signNumber - 1) * 30 + degreeInSign

For the Lagna (ascendant), Trisphuta uses the **start of the sign**:
  lagnaLongitude = (lagnaSignNumber - 1) * 30

DECISION NEEDED: the Trisphuta formula requires Gulika's absolute
longitude. See SP-EXT.7 for how Gulika is calculated. SP-EXT.6 must
receive gulikaLongitude as a parameter - it does not calculate it
internally. Run SP-EXT.7 first and pass its result here.

Add to /lib/astro/specialPoints.ts:

```typescript
function toAbsoluteLongitude(signNumber: SignNumber, degreeInSign: number): number {
  return (signNumber - 1) * 30 + degreeInSign
}

/** Full ecliptic longitude for a planet (DMS within sign). */
function planetAbsoluteLongitude(p: PlanetPosition): number {
  return toAbsoluteLongitude(p.signNumber, p.degreeInSign) + p.arcMinutes / 60 + p.arcSeconds / 3600
}

function wrapLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360
}

// Beeja / Kshetra: use planetAbsoluteLongitude for each planet in the sum.
// Trisphuta: Lagna cusp + planetAbsoluteLongitude(Moon) + gulikaLongitude (Gulika **start** from Kaal Vela).
```

Done when: all three functions compile with no `any` types.

---

## TASK SP-EXT.7 - Kaal Vela Calculator (Gulika + Five Satellites)

Kaal Velas are time-based satellite points derived by dividing the
daytime arc (sunrise to sunset) into 8 equal portions.

The 8 portions are ruled in weekday-lord order starting from the
current day's ruler. The 8th portion is lord-less. The 7 named
satellites correspond to the 7 ruled portions.

Lord assignments per portion (Parashara):
  Portion 1: Sun    -> Kaala
  Portion 2: Moon   -> (unnamed in source; skip)
  Portion 3: Mars   -> Mrityu
  Portion 4: Mercury -> Ardhaprahara
  Portion 5: Jupiter -> Yamaghantaka
  Portion 6: Venus   -> (unnamed; skip)
  Portion 7: Saturn  -> Gulika / Maandi

The position of each satellite is the midpoint of its portion,
converted to an absolute longitude using the Lagna's rate of movement.

Algorithm:
1. Determine the daytime duration in minutes:
   dayDurationMinutes = minutesFromSunriseToSunset (from sunriseData)
2. Divide into 8 equal portions:
   portionDurationMinutes = dayDurationMinutes / 8
3. Find the weekday lord (Sunday=Sun, Monday=Moon, etc.).
4. The portions are assigned starting from the weekday lord's position
   in the sequence [Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn].
5. Find which portion index each named satellite falls in based on its
   ruling planet's position in the current-day sequence.
6. The satellite's time = start of its portion + half the portion duration.
7. Convert time to an absolute longitude using the same approach as GL:
   longitude = sunAbsoluteLongitudeAtSunrise + (minutesElapsed / 24) * 30

DECISION NEEDED: confirm that vedicChart.sunriseData contains
minutesFromSunriseToSunset (or equivalent sunset time). If not available,
the daytime arc must be approximated from the birth location's latitude
and the date. Surface this to Milosh before implementing step 1.

DECISION NEEDED: confirm whether the birth weekday is available from
the Vedic API (e.g. as vedicChart.weekday: 0-6) or must be derived
from the birth timestamp in BirthProfile. The calculation is blocked
until this is resolved.

```typescript
// Weekday index: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
const WEEKDAY_LORDS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
]

// Maps each ruling planet to its satellite name
const PLANET_TO_SATELLITE: Partial<Record<PlanetName, KaalVelaPlanet>> = {
  Sun:     'Kaala',
  Mars:    'Mrityu',
  Mercury: 'Ardhaprahara',
  Jupiter: 'Yamaghantaka',
  Saturn:  'Gulika',   // Gulika and Maandi are the same portion in most traditions
}

/**
 * Calculate all Kaal Vela satellite positions.
 *
 * DECISION NEEDED blocks are marked inside - do not implement until
 * both open decisions above are resolved.
 *
 * @param sunAbsoluteLongitudeAtSunrise  Sun longitude at local sunrise
 * @param dayDurationMinutes             Total daytime arc in minutes
 * @param weekdayIndex                   0=Sunday through 6=Saturday
 */
export function calculateKaalVelas(
  sunAbsoluteLongitudeAtSunrise: number,
  dayDurationMinutes: number,
  weekdayIndex: number
): KaalVelaSetResult {
  const portionMinutes = dayDurationMinutes / 8

  // Build the portion sequence starting from the weekday lord
  const portionLords: PlanetName[] = []
  for (let i = 0; i < 7; i++) {
    portionLords.push(WEEKDAY_LORDS[(weekdayIndex + i) % 7])
  }
  // 8th portion is lord-less (not added)

  const results: Partial<Record<KaalVelaPlanet, KaalVelaResult>> = {}

  portionLords.forEach((lord, index) => {
    const satellite = PLANET_TO_SATELLITE[lord]
    if (!satellite) return  // this portion has no named satellite

    const portionNumber      = index + 1
    const startMinutes       = index * portionMinutes
    const endMinutes         = startMinutes + portionMinutes
    // Gulika uses START of its portion; Maandi uses MIDPOINT (handled separately below)
    // All other satellites use midpoint of their portion
    const referenceMinutes  = satellite === 'Gulika'
      ? startMinutes                       // Gulika = start of Saturn's portion
      : startMinutes + portionMinutes / 2  // all others = midpoint

    // Convert reference time to absolute longitude (same rate as Ghati Lagna)
    const degreesAdded = (referenceMinutes / 24) * 30
    const rawLongitude = sunAbsoluteLongitudeAtSunrise + degreesAdded
    const longitude    = ((rawLongitude % 360) + 360) % 360
    const signNumber   = (Math.floor(longitude / 30) + 1) as SignNumber

    const entry: KaalVelaResult = {
      planet: satellite,
      portionNumber,
      startMinutesFromSunrise: Math.round(startMinutes * 100) / 100,
      endMinutesFromSunrise:   Math.round(endMinutes * 100) / 100,
      midpointLongitude:       Math.round(longitude * 1000) / 1000,  // start for Gulika, midpoint for others
      signNumber,
    }

    results[satellite] = entry

    // Gulika = START of Saturn's portion; Maandi = MIDPOINT of Saturn's portion
    // They are calculated separately - do not copy one from the other
    if (satellite === 'Gulika') {
      // Gulika already added above as the start-of-portion point
      // Maandi uses the midpoint of the same Saturn portion
      const mrityu_mid_minutes = startMinutes + portionMinutes / 2
      const mrityu_degrees = (mrityu_mid_minutes / 24) * 30
      const mrityu_raw = sunAbsoluteLongitudeAtSunrise + mrityu_degrees
      const mrityu_long = ((mrityu_raw % 360) + 360) % 360
      const mrityu_sign = (Math.floor(mrityu_long / 30) + 1) as SignNumber
      results['Maandi'] = {
        planet: 'Maandi',
        portionNumber,
        startMinutesFromSunrise: Math.round(startMinutes * 100) / 100,
        endMinutesFromSunrise:   Math.round(endMinutes * 100) / 100,
        midpointLongitude:       Math.round(mrityu_long * 1000) / 1000,
        signNumber:              mrityu_sign,
      }
    }
  })

  // Type-safe assembly - throw if any required satellite was not assigned
  const required: KaalVelaPlanet[] = ['Gulika', 'Maandi', 'Kaala', 'Mrityu', 'Ardhaprahara', 'Yamaghantaka']
  for (const r of required) {
    if (!results[r]) throw new Error(`[calculateKaalVelas] ${r} not found in portion assignments`)
  }

  return results as KaalVelaSetResult
}
```

Done when: function compiles. Both DECISION NEEDED blocks must be
resolved before this function produces valid results.

---

## TASK SP-EXT.8 - Dhooma Chain Calculator

Five non-luminous malefic points derived from the Sun's longitude.
They afflict the houses they occupy.

Calculation chain (all in absolute longitude 0-360):
  Dhooma      = Sun + 133.333...  (133 degrees 20 minutes)
  Vyatipata   = 360 - Dhooma      (or: 12 Rasis - Dhooma)
  Parivesha   = Vyatipata + 180   (or: Vyatipata + 6 Rasis)
  Indra Chapa = 360 - Parivesha   (or: 12 Rasis - Parivesha)
  Upaketu     = Indra Chapa + 16.666... (16 degrees 40 minutes)

All results wrap at 360.

Note: 133 degrees 20 minutes = 133 + 20/60 = 133.3333... degrees
      16 degrees 40 minutes  = 16 + 40/60  = 16.6666... degrees

Add to /lib/astro/specialPoints.ts:

```typescript
export function calculateDhoomaChain(
  sunAbsoluteLongitude: number
): DhoomaChainResult {
  const wrap = (n: number) => ((n % 360) + 360) % 360
  const toSign = (n: number): SignNumber => (Math.floor(n / 30) + 1) as SignNumber

  const DHOOMA_OFFSET   = 133 + 20 / 60   // 133.3333...
  const UPAKETU_OFFSET  = 16  + 40 / 60   // 16.6666...

  const dhooma     = wrap(sunAbsoluteLongitude + DHOOMA_OFFSET)
  const vyatipata  = wrap(360 - dhooma)
  const parivesha  = wrap(vyatipata + 180)
  const indraChapa = wrap(360 - parivesha)
  const upaketu    = wrap(indraChapa + UPAKETU_OFFSET)

  return {
    dhooma,
    vyatipata,
    parivesha,
    indraChapa,
    upaketu,
    dhoomaSign:    toSign(dhooma),
    vyatipataSign: toSign(vyatipata),
    pariveshaSign: toSign(parivesha),
    indraChapSign: toSign(indraChapa),
    upaKetuSign:   toSign(upaketu),
  }
}
```

Note: the Sun's longitude used here is the natal Sun's position
(from vedicChart.planets where planet === 'Sun'), NOT the sunrise
longitude used for time-based Lagnas. These are different values.
Confirm at the call site in chartService.ts.

Done when: function compiles. Verify chain manually:
  If Sun is at 0 degrees Aries (longitude 0):
    Dhooma    = 133.333  (Gemini 13.333)
    Vyatipata = 226.666  (Scorpio 16.666)
    Parivesha = 46.666   (Taurus 16.666)
    Indra Chapa = 313.333 (Aquarius 13.333)
    Upaketu   = 330.000  (Pisces 0.000)

---

## TASK SP-EXT.9 - Extended Aggregator and Chart Service Integration

Edit /lib/astro/specialPoints.ts - add the extended aggregator:

```typescript
/**
 * Calculate all extended special points.
 *
 * @param lagnaSignNumber                Ascendant sign 1-12
 * @param horaLagnaSignNumber            From calculateHoraLagna result
 * @param planets                        Nine-planet positions
 * @param sunAbsoluteLongitudeAtSunrise  Sun longitude at local sunrise
 * @param sunNatalLongitude              Sun's natal longitude (for Dhooma chain)
 * @param minutesSinceSunrise            Elapsed minutes from sunrise
 * @param gulikaLongitude                From calculateKaalVelas (or null if blocked)
 * @param kaalVelaSetResult              From calculateKaalVelas (or null if blocked)
 */
export function calculateExtendedSpecialPoints(
  lagnaSignNumber: SignNumber,
  horaLagnaSignNumber: SignNumber,
  planets: PlanetPosition[],
  sunAbsoluteLongitudeAtSunrise: number,
  sunNatalLongitude: number,
  minutesSinceSunrise: number,
  gulikaLongitude: number | null,
  kaalVelaSetResult: KaalVelaSetResult | null
): ExtendedSpecialPointsResult {
  return {
    varnadaLagna: calculateVarnadaLagna(lagnaSignNumber, horaLagnaSignNumber),
    pranapada:    calculatePranapada(sunAbsoluteLongitudeAtSunrise, minutesSinceSunrise),
    upapadaLagna: calculateUpapadaLagna(lagnaSignNumber, planets),
    sreeLagna:    calculateSreeLagna(lagnaSignNumber, planets),
    bhriguBindu:  calculateBhriguBindu(planets),
    beejaSphuata:   calculateBeejaSphuata(planets),
    kshetraSphuata: calculateKshetraSphuata(planets),
    trisphuta:     gulikaLongitude !== null
      ? calculateTrisphuta(lagnaSignNumber, planets, gulikaLongitude)
      : null,
    dhoomaChain:  calculateDhoomaChain(sunNatalLongitude),
    kaalVelas:    kaalVelaSetResult,
  }
}
```

Edit /lib/astro/chartService.ts — **shipped** wiring (inputs from `extractSpecialPointsInputs`, not only top-level `VedicChartData`):

```typescript
export function deriveExtendedSpecialPoints(
  inputs: SpecialPointsInputs,
  horaLagnaSignNumber: SignNumber,
  kaalVelaSetResult: KaalVelaSetResult | null
): ExtendedSpecialPointsResult | null {
  const sunPlanet = inputs.planets.find((p) => p.planet === 'Sun')
  if (!sunPlanet) {
    console.warn('[deriveExtendedSpecialPoints] Sun not found in planets array')
    return null
  }
  const sunNatalLongitude =
    (sunPlanet.signNumber - 1) * 30 + sunPlanet.degreeInSign

  const gulikaLongitude =
    kaalVelaSetResult?.gulika?.referenceLongitude
    ?? kaalVelaSetResult?.gulika?.midpointLongitude
    ?? null

  return calculateExtendedSpecialPoints(
    inputs.lagnaSignNumber,
    horaLagnaSignNumber,
    inputs.planets,
    inputs.sunAbsoluteLongitudeAtSunrise,
    sunNatalLongitude,
    inputs.minutesSinceSunrise,
    gulikaLongitude,
    kaalVelaSetResult
  )
}
```

`getOrCreateExtendedSpecialPoints` loads raw chart JSON, calls `extractSpecialPointsInputs(...)` from `vedicChartMapper.ts` (supports `rawResponse.chartD1`), merges `calculateKaalVelas` when SunCalc day length succeeds, then calls `deriveExtendedSpecialPoints`.

Edit /lib/kv/keys.ts - add:
```typescript
extendedSpecialPoints: (userId: string) => `chart:specialpoints:ext:${userId}`,
```

Edit /lib/astro/chartService.ts — **shipped** `getOrCreateExtendedSpecialPoints`:
- Read KV `extendedSpecialPoints` → else load birth profile + `extractSpecialPointsInputs(vedicChartRaw, …)` (KV/DB chart).
- `horaLagnaSignNumber` from cached `getOrCreateSpecialPoints` / `SpecialPointsResult`.
- `kaalVelaSetResult` from `calculateKaalVelas(sunAtSunrise, dayDurationMinutes, weekdayIndex)` using SunCalc daytime length and local weekday (timezone-aware).
- `deriveExtendedSpecialPoints(inputs, horaLagnaSignNumber, kaalVelaSetResult)` as above.
- `kvSet` permanent cache; key listed in `invalidateChartCache`.

Update invalidateChartCache in chartService.ts to include the new key:
```typescript
kvKeys.extendedSpecialPoints(userId),
```

Done when: all functions compile and the KV cache wrapper returns
correctly structured results for a test user.

---

## TASK SP-EXT.10 - Extended API Route

Create /app/api/chart/special-points/extended/route.ts:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { getOrCreateExtendedSpecialPoints } from '@/lib/astro/chartService'

export async function GET() {
  const session = await getRequiredSession()
  const result  = await getOrCreateExtendedSpecialPoints(session.user.id)

  if (!result) {
    return NextResponse.json(
      {
        error: 'Extended special points not yet available.',
        detail: 'Base chart or Hora Lagna may still be generating. Retry after /api/chart/special-points returns 200.',
      },
      { status: 202 }
    )
  }

  return NextResponse.json(result)
}
```

Behaviour contract:
  - 401 if no session
  - 202 if base special points not yet computed (dependency not met)
  - 202 if Vedic chart absent from KV
  - 200 + ExtendedSpecialPointsResult when available

Note: Trisphuta and kaalVelas fields may be null inside a 200 response
when their open decisions are unresolved. This is not an error - the
client should handle null gracefully.

Done when: route compiles and returns 202 for users without base chart.

---

## TASK SP-EXT.11 - Bhrigu Bindu Calculator

Bhrigu Bindu is the Destiny Point. It marks the midpoint between the
Moon and Rahu, representing the confluence of the mind (Moon) and karmic
desire (Rahu). It is widely used in Nadi and Parashari traditions to
identify periods of destiny activation.

Formula (confirmed): (Moon longitude + Rahu longitude) / 2

Both longitudes are absolute (0-360). The result is wrapped at 360.

Note: Rahu's longitude used here is its actual sign position (the same
value as for Charakaraka ranking BEFORE the 30-degree inversion). Do not
apply the Charakaraka retrograde inversion here.

Moon and Rahu absolute longitudes use **`planetAbsoluteLongitude`** (see SP-EXT.6): full degree within sign including arc minutes and arc seconds.

Add to /lib/astro/specialPoints.ts:

```typescript
/**
 * Calculate the Bhrigu Bindu (Destiny Point).
 * Formula: (Moon absolute longitude + Rahu absolute longitude) / 2
 *
 * @param planets  Full planet position array. Must include Moon and Rahu.
 */
export function calculateBhriguBindu(
  planets: PlanetPosition[]
): BhriguBinduResult {
  const moon = planets.find(p => p.planet === 'Moon')
  const rahu = planets.find(p => p.planet === 'Rahu')

  if (!moon) throw new Error('[calculateBhriguBindu] Moon not found in planets array')
  if (!rahu) throw new Error('[calculateBhriguBindu] Rahu not found in planets array')

  const moonLongitude = planetAbsoluteLongitude(moon)
  const rahuLongitude = planetAbsoluteLongitude(rahu)

  const rawMidpoint   = (moonLongitude + rahuLongitude) / 2
  const longitude     = ((rawMidpoint % 360) + 360) % 360

  const sign   = (Math.floor(longitude / 30) + 1) as SignNumber
  const degree = longitude % 30

  return {
    bhriguBinduLongitude: Math.round(longitude * 1000) / 1000,
    bhriguBinduSign:      sign,
    bhriguBinduDegree:    Math.round(degree * 1000) / 1000,
    moonLongitudeUsed:    Math.round(moonLongitude * 1000) / 1000,
    rahuLongitudeUsed:    Math.round(rahuLongitude * 1000) / 1000,
  }
}
```

Update the extended aggregator in SP-EXT.9 to include Bhrigu Bindu:

```typescript
// Add to calculateExtendedSpecialPoints return object:
bhriguBindu: calculateBhriguBindu(planets),
```

Done when: function compiles. Verify with sanity check:
  Moon at 15 deg Aries (longitude 15) + Rahu at 15 deg Libra (longitude 195)
  Midpoint = (15 + 195) / 2 = 105 -> Cancer 15 degrees.

---

## COMPLETION CHECKLIST

- [ ] SP-EXT.1   Types in types/index.ts - all new result types present, spelling normalised to Sphuta
- [ ] SP-EXT.2   calculateVarnadaLagna - odd/even logic, wrap, DECISION NEEDED block visible
- [ ] SP-EXT.3   calculatePranapada - BPHS Movable/Fixed/Dual rule, three starting-point branches, sanity check passes
- [ ] SP-EXT.4   calculateUpapadaLagna - mirrors AL logic from 12th house
- [ ] SP-EXT.5   calculateSreeLagna - Kala counting from Moon's sign
- [ ] SP-EXT.6   calculateBeejaSphuata, calculateKshetraSphuata, calculateTrisphuta - all three compile
- [ ] SP-EXT.7   calculateKaalVelas - Gulika uses start of portion, Maandi uses midpoint, both DECISION NEEDED blocks present
- [ ] SP-EXT.8   calculateDhoomaChain - chain arithmetic correct, sanity check passes
- [ ] SP-EXT.9   Extended aggregator + chartService wiring + KV key + invalidation updated
- [ ] SP-EXT.10  API route /api/chart/special-points/extended - 202/200 contract correct
- [ ] SP-EXT.11  calculateBhriguBindu - formula correct, wired into aggregator

---

## OPEN DECISIONS (Surface to Milosh Before Proceeding)

```
DECISION NEEDED
Task: SP-EXT.2 (Varnada Lagna)
File: lib/astro/specialPoints.ts
Question: Some traditions count Varnada Lagna from Pisces when both
  Lagnas are in even signs. Current implementation always counts from
  Aries. Which interpretation should be used?
Blocking: Edge case. Does not block implementation.
Raised: 2026-03-25
Resolved: [fill in]
```

```
DECISION NEEDED
Task: SP-EXT.7 (Kaal Velas)
File: lib/astro/specialPoints.ts
Question 1: Does vedicChart.sunriseData contain sunset time or daytime
  duration in minutes? If not, how should the daytime arc be computed?
Question 2: Is the birth weekday (0=Sun through 6=Sat) available from
  the Vedic API, or must it be derived from BirthProfile timestamp?
Blocking: SP-EXT.7 cannot be implemented until both questions answered.
  Trisphuta (SP-EXT.6) is also blocked because it depends on Gulika.
Raised: 2026-03-25
Resolved: [fill in]
```

```
DECISION NEEDED
Task: SP-EXT.6 (Trisphuta)
File: lib/astro/specialPoints.ts
Question: Trisphuta uses the Lagna's longitude. Confirm whether this
  should be the degree of the Lagna lord's position within the Lagna
  sign, or always 0 degrees of the Lagna sign (i.e. the sign cusp).
  Current implementation uses the sign cusp (0 degrees).
Blocking: Edge case. Core calculation still works.
Raised: 2026-03-25
Resolved: [fill in]
```

// Bhrigu Bindu: RESOLVED 2026-03-26
// Formula confirmed: (Moon longitude + Rahu longitude) / 2
// Implemented in SP-EXT.11.

---

## SANITY CHECKS

Add at the bottom of specialPoints.ts:

```typescript
// Extended special points sanity checks:
//
// Dhooma chain (Sun at 0 degrees Aries = longitude 0):
//   Dhooma     = 133.333  -> Gemini 13.33 deg
//   Vyatipata  = 226.666  -> Scorpio 16.66 deg
//   Parivesha  = 46.666   -> Taurus 16.66 deg
//   Indra Chapa = 313.333 -> Aquarius 13.33 deg
//   Upaketu    = 330.000  -> Pisces 0.00 deg
//
// Varnada Lagna (Lagna = Aries=1 odd, Hora Lagna = Gemini=3 odd):
//   Both odd -> add: 1 + 3 = 4 -> Varnada = Cancer (sign 4)
//
// Varnada Lagna (Lagna = Aries=1 odd, Hora Lagna = Taurus=2 even):
//   One odd, one even -> subtract: |1 - 2| = 1 -> Varnada = Aries (sign 1)
//
// Beeja Sphuta (Sun=10 deg Aries, Venus=20 deg Taurus, Jupiter=5 deg Gemini):
//   Longitudes: 10 + 50 + 65 = 125 -> Leo 5 deg
//
// Bhrigu Bindu:
//   Moon at 15 Aries (long 15) + Rahu at 15 Libra (long 195)
//   Midpoint = (15 + 195) / 2 = 105 -> Cancer 15 deg
//
// Pranapada (BPHS): startingLongitude = (startingSignNumber - 1) * 30, + offsetDegrees
//   Movable Sun: startingSign = Sun's sign
//   Fixed Sun:   startingSign = 9th from Sun (e.g. Taurus -> Capricorn)
//   Dual Sun:    startingSign = 5th from Sun (e.g. Gemini -> Libra)
```

---

## STATUS COMMENT FORMAT

At the top of every file you create or modify, add:
// STATUS: done | Task SP-EXT.X

---

*Crossroads Compass - Extended Special Points Task File | SP-EXT.1-SP-EXT.10 | March 2026*

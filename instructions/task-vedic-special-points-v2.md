# Task: Vedic Special Points Calculator — Complete Rewrite (v2)
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Supersedes: task-vedic-special-points.md (SP.1–SP.13) and task-vedic-special-points-extended.md (SP-EXT.1–SP-EXT.11)
# Updated: 2026-03-29 — Full BPHS-aligned rewrite with old-vs-new diff per calculation

---

## PURPOSE OF THIS FILE

This file replaces both previous special points task files. It exists for
three reasons:

1. The previous implementations contained incorrect formulas that deviated
   from Brihat Parashara Hora Shastra (BPHS). The errors are documented
   below per point so the coding agent does not repeat them.

2. Scope has expanded to cover all five calculation groups from BPHS:
   time-based Lagnas, Arudha/relationship Lagnas, Charakarakas,
   mathematical Sphutas, non-luminous points (Dhooma chain), Kaal Velas.

3. A UI display spec for the Life Blueprint page is appended (Section 5)
   so the agent can implement both calculation and display in one pass.

The agent must read Section 1 (old vs new diff) before writing any code.
The errors documented there are exactly the mistakes a naive implementation
will reproduce.

---

## SECTION 1 — OLD vs NEW: WHAT WAS WRONG AND WHY

This section is an audit trail. Every previous calculation is compared
against BPHS. Correct ones are marked carry-forward. Wrong ones are
documented with the error, the impact, and the fix.

---

### 1.1 Pranapada Lagna — INCORRECT IN PREVIOUS VERSION

| Aspect | Old Implementation (WRONG) | New Implementation (BPHS-correct) |
|---|---|---|
| Starting longitude rule | Fire/air signs = add offset; earth/water signs = subtract | Based on Sun's sign MODALITY, not element. Always additive. |
| Movable signs (1,4,7,10) | Not distinguished separately | Start from Sun's own longitude |
| Fixed signs (2,5,8,11) | Not distinguished separately | Start from 9th house from Sun (+240 deg) |
| Dual signs (3,6,9,12) | Not distinguished separately | Start from 5th house from Sun (+120 deg) |
| Direction | Subtraction applied for earth/water | NO subtraction ever. Formula is strictly additive. |
| Vighati conversion (minutesSinceSunrise x 2.5) | Correct | Carry forward unchanged |
| Degree offset (vighatikas / 15) | Correct | Carry forward unchanged |

WHY IT MATTERS: For a birth with the Sun in Taurus (fixed sign), the old
code produced a result roughly 240 degrees off from the correct answer.
This is not a rounding error -- it is a structurally wrong formula.
The BPHS rule is: fixed-sign Sun births start the count from the 9th
house from the Sun, not from the Sun itself with a reversed direction.

---

### 1.2 Gulika and Maandi — INCORRECT IN PREVIOUS VERSION

| Aspect | Old Implementation (WRONG) | New Implementation (BPHS-correct) |
|---|---|---|
| Gulika | Treated as the same point as Maandi | Degree rising at the START of Saturn's Kaal Vela portion |
| Maandi | Treated as the same point as Gulika | Degree rising at the MIDPOINT of Saturn's Kaal Vela portion |
| Output | One combined point | Two distinct points, always separate |

WHY IT MATTERS: In a 12-hour birth day divided into 8 equal portions of
90 minutes each, Saturn's portion starts at minute 360 (for a Sunday birth)
and its midpoint is at minute 405. The two points are 45 minutes apart,
which corresponds to roughly 11 degrees of rising ascendant. Using one
point for both produces a ~11-degree error in Gulika's position and makes
Maandi completely absent from the chart. Trisphuta, which depends on
Gulika's longitude, is therefore also wrong in the old implementation.

---

### 1.3 Ghati Lagna and Hora Lagna — NIGHT BIRTH NOT HANDLED

| Aspect | Old Implementation (WRONG) | New Implementation (BPHS-correct) |
|---|---|---|
| Day birth base | Sun's longitude at sunrise | Same |
| Night birth base | Not implemented (day formula used) | Natal Lagna (Udaya Lagna) absolute longitude |
| Day/night flag | Not consumed | vedicChart.sunriseData.isDayBirth boolean |

WHY IT MATTERS: All night-birth charts calculated by the old code used
the Sun's sunrise longitude as the base for GL and HL. BPHS specifies
that night births use the Udaya Lagna longitude instead. Any user born
at night has structurally incorrect GL and HL in the old output.

---

### 1.4 Bhava Lagna and Hora Lagna Rates — FLAGGED FOR VERIFICATION

| Aspect | Old Implementation | Status |
|---|---|---|
| BL rate: 1 sign per 5 Ghatikas (120 min) | Retained | Flagged VERIFY [BL-1] |
| HL rate: 1 sign per 2.5 Ghatikas (60 min) | Retained | Flagged VERIFY [BL-1] |
| GL rate: 1 sign per 1 Ghati (24 min) | Confirmed correct | No change |

These rates match the most widely cited Parashara interpretation.
They are retained but marked for cross-check against a reference chart.

---

### 1.5 Arudha Lagna — CARRY FORWARD UNCHANGED

The AL implementation (inclusive sign counting, two exceptions at Lagna
and 7th house, dual-lord tiebreaker using five-step Parashara hierarchy)
is BPHS-compliant. No changes.

---

### 1.6 Charakarakas — CARRY FORWARD UNCHANGED

Three-level tiebreaking (degree, arc-minute, arc-second), Rahu inversion,
Sthira Karaka deficit handling, eight-planet pool excluding Ketu --
all BPHS-compliant. No changes.

---

### 1.7 Varnada Lagna — CARRY FORWARD (edge case confirmed resolved)

Core formula (odd+odd or even+even = add; mixed = subtract; wrap mod 12
with 0 mapped to 12) is correct. Open question from previous file is
now resolved: always count from Aries. The "from Pisces" variant is not
in primary BPHS. No changes.

---

### 1.8 Dhooma Chain — CARRY FORWARD UNCHANGED

The five-point chain (Dhooma +133d20m, Vyatipata = 360-Dhooma,
Parivesha = Vyatipata+180, Indra Chapa = 360-Parivesha,
Upaketu = Indra Chapa+16d40m) is correct. No changes.

---

### 1.9 Sree Lagna — CARRY FORWARD UNCHANGED

9th lord Kala counting from Moon's sign was correct. No changes.

---

### 1.10 Upapada Lagna — CARRY FORWARD UNCHANGED

Arudha of 12th house with identical exception logic to AL was correct.
No changes.

---

## SECTION 2 — CONFIRMED API FIELD NAMES

Use these exact field names. No `any` casts.

```
vedicChart.lagnaSignNumber                        SignNumber (1-12)
vedicChart.lagnaAbsoluteLongitude                 number (0-360)
vedicChart.planets                                PlanetPosition[]
vedicChart.sunriseData.sunAbsoluteLongitude       number (0-360)
vedicChart.sunriseData.minutesSinceSunrise        number
vedicChart.sunriseData.isDayBirth                 boolean        [confirm exists — see DECISION NEEDED GL-1]
vedicChart.sunriseData.daytimeDurationMinutes     number         [confirm exists — see DECISION NEEDED KV-1]
vedicChart.sunriseData.dayOfWeek                  number 0-6     [confirm exists — see DECISION NEEDED KV-2]
```

The last three fields are required by this rewrite but were not in the
original confirmed field list. Resolve all three DECISION NEEDEDs before
removing placeholder throws from the affected functions.

---

## SECTION 3 — CALCULATION TASKS

File to create/update: `/lib/astro/specialPoints.ts`

Pure, side-effect-free module. No DB reads. No KV reads.
All functions receive already-fetched data as arguments.

---

### Task V2-01 — Types (add to types/index.ts)

All types from SP.1 carry forward unchanged. Add only the following.

```typescript
// STATUS: pending | Task V2-01

export interface PranapadalagnaResult {
  pranapadalagnaSignNumber: SignNumber
  pranapadalagnaDegree: number
  sunSignNature: 'movable' | 'fixed' | 'dual'
  startingLongitude: number        // which longitude the offset was added to
  vighatisSinceSunrise: number
  baseOffsetDegrees: number
  isFortunate: boolean             // Pranapada in 2nd/4th/5th/9th/10th/11th from Lagna
  houseFromLagna: number           // 1-12
}

// Update GhatiLagnaResult — add isDayBirth and baseLongitudeUsed
export interface GhatiLagnaResult {
  ghatiLagnaSignNumber: SignNumber
  ghatiLagnaDegree: number
  fullGhatikasSinceSunrise: number
  vighatikasFraction: number
  sunLongitudeAtSunrise: number
  isDayBirth: boolean
  baseLongitudeUsed: number        // Sun long (day) or Lagna long (night)
}

// Update HoraLagnaResult — add isDayBirth and baseLongitudeUsed
export interface HoraLagnaResult {
  horaLagnaSignNumber: SignNumber
  horaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
  isDayBirth: boolean
  baseLongitudeUsed: number
}

export type KaalVelaPlanet =
  | 'Sun' | 'Venus' | 'Mercury' | 'Moon' | 'Saturn' | 'Jupiter' | 'Mars'

export interface KaalVelaSetResult {
  gulika:        { signNumber: SignNumber; longitude: number; portionStartMin: number }
  maandi:        { signNumber: SignNumber; longitude: number; portionMidpointMin: number }
  kaala:         { signNumber: SignNumber; longitude: number }
  mrityu:        { signNumber: SignNumber; longitude: number }
  ardhaprahara:  { signNumber: SignNumber; longitude: number }
  yamaghantaka:  { signNumber: SignNumber; longitude: number }
}

export interface BhriguBinduResult {
  signNumber: SignNumber
  degree: number
  absoluteLongitude: number
  moonLongitude: number
  rahuLongitude: number
}

// Full result — replaces SpecialPointsResult from SP.1
export interface SpecialPointsResultV2 {
  // Time-based Lagnas
  ghatiLagna:    GhatiLagnaResult
  bhavaLagna:    BhavaLagnaResult
  horaLagna:     HoraLagnaResult
  pranapada:     PranapadalagnaResult
  // Arudha / Relationship Lagnas
  arudhaLagna:   ArudhaLagnaResult
  upapadaLagna:  UpapadaLagnaResult
  varnadaLagna:  VarnadaLagnaResult
  sreeLagna:     SreeLagnaResult
  // Charakarakas
  charakarakas:  CharakarakaSetResult
  // Sphutas
  beejaSphuata:  BeejaSphutaResult
  kshetraSphuta: KsheetraSphutaResult
  triSphuta:     TriSphutaResult | null    // null until Gulika resolved
  bhriguBindu:   BhriguBinduResult
  // Dhooma chain
  dhoomaChain:   DhoomaChainResult
  // Kaal Velas
  kaalVelas:     KaalVelaSetResult | null  // null if dayOfWeek/daytime fields unavailable
}
```

Done when: types/index.ts compiles with zero errors.

---

### Task V2-02 — Pranapada Lagna (REWRITE — replaces SP-EXT.3)

OLD VERSION WAS WRONG. See Section 1.1. Implement the correct
BPHS Movable/Fixed/Dual starting longitude rule.

```typescript
// STATUS: pending | Task V2-02
// REPLACES: old calculatePranapada (SP-EXT.3) — old formula used element grouping (WRONG)
// CORRECT SOURCE: BPHS — sign modality determines starting longitude, always additive

const MOVABLE_SIGNS_PP = new Set<SignNumber>([1, 4, 7, 10])
const FIXED_SIGNS_PP   = new Set<SignNumber>([2, 5, 8, 11])
// Dual signs: 3, 6, 9, 12 (everything else)

export function calculatePranapada(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number,
  lagnaSignNumber: SignNumber
): PranapadalagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculatePranapada] minutesSinceSunrise must be >= 0')

  // Step 1: Vighati conversion — confirmed correct, carry forward
  const vighatikas    = minutesSinceSunrise * 2.5   // 1 min = 2.5 Vighatikas
  const offsetDegrees = vighatikas / 15

  // Step 2: Determine Sun's sign at sunrise
  const sunSign = longitudeToSignAndDegree(sunAbsoluteLongitudeAtSunrise).sign

  // Step 3: Select starting longitude based on Sun's sign modality (BPHS)
  // Movable: start from Sun's longitude
  // Fixed:   start from 9th house from Sun = Sun + 240 degrees (8 signs x 30)
  // Dual:    start from 5th house from Sun = Sun + 120 degrees (4 signs x 30)
  let startingLongitude: number
  let sunSignNature: 'movable' | 'fixed' | 'dual'

  if (MOVABLE_SIGNS_PP.has(sunSign)) {
    startingLongitude = sunAbsoluteLongitudeAtSunrise
    sunSignNature = 'movable'
  } else if (FIXED_SIGNS_PP.has(sunSign)) {
    startingLongitude = sunAbsoluteLongitudeAtSunrise + 240
    sunSignNature = 'fixed'
  } else {
    startingLongitude = sunAbsoluteLongitudeAtSunrise + 120
    sunSignNature = 'dual'
  }

  // Step 4: Add offset — always additive, no subtraction
  const rawLongitude        = startingLongitude + offsetDegrees
  const normalisedLongitude = ((rawLongitude % 360) + 360) % 360
  const { sign, degree }    = longitudeToSignAndDegree(normalisedLongitude)

  // Step 5: Check auspiciousness — fortunate if in 2nd/4th/5th/9th/10th/11th from Lagna
  const FORTUNATE_HOUSES = new Set([2, 4, 5, 9, 10, 11])
  const houseFromLagna   = countSignsBetween(lagnaSignNumber, sign)
  const isFortunate      = FORTUNATE_HOUSES.has(houseFromLagna)

  return {
    pranapadalagnaSignNumber: sign,
    pranapadalagnaDegree:     Math.round(degree * 1000) / 1000,
    sunSignNature,
    startingLongitude:        ((startingLongitude % 360) + 360) % 360,
    vighatisSinceSunrise:     Math.round(vighatikas * 100) / 100,
    baseOffsetDegrees:        Math.round(offsetDegrees * 1000) / 1000,
    isFortunate,
    houseFromLagna,
  }
}

// Sanity checks:
// Sun at 15 Aries (movable, long 15), minutesSinceSunrise=60:
//   vigh=150, offset=10, start=15, result=25 -> Aries 25 deg
// Sun at 15 Taurus (fixed, long 45), minutesSinceSunrise=60:
//   vigh=150, offset=10, start=45+240=285, result=295 -> Capricorn 25 deg
// Sun at 15 Gemini (dual, long 75), minutesSinceSunrise=60:
//   vigh=150, offset=10, start=75+120=195, result=205 -> Libra 25 deg
```

Done when: function compiles. Sanity checks verified mentally.

---

### Task V2-03 — Ghati Lagna (UPDATE — add night birth support)

The existing `calculateGhatiLagna` from SP.6 is correct for day births.
Add the `isDayBirth` branch and the `lagnaAbsoluteLongitude` parameter.

```typescript
// STATUS: pending | Task V2-03
// UPDATES: calculateGhatiLagna from SP.6 — adds night birth base longitude

export function calculateGhatiLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number,
  isDayBirth: boolean,
  // DECISION NEEDED [GL-1]: confirm vedicChart.sunriseData.isDayBirth exists.
  // If absent, derive: isDayBirth = minutesSinceSunrise <= daytimeDurationMinutes
  lagnaAbsoluteLongitude: number
): GhatiLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateGhatiLagna] minutesSinceSunrise must be >= 0')

  // BPHS: day birth uses Sun's sunrise longitude; night birth uses Udaya Lagna longitude
  const baseLongitude = isDayBirth
    ? sunAbsoluteLongitudeAtSunrise
    : lagnaAbsoluteLongitude

  const total   = minutesSinceSunrise / 24          // total Ghatikas
  const full    = Math.floor(total)
  const vigh    = (total - full) * 60               // remaining Vighatikas
  const degrees = (full * 30) + (vigh * 0.5)        // 1 Ghati = 30 deg; 1 Vighati = 0.5 deg

  const { sign, degree } = longitudeToSignAndDegree(baseLongitude + degrees)

  return {
    ghatiLagnaSignNumber:     sign,
    ghatiLagnaDegree:         Math.round(degree * 1000) / 1000,
    fullGhatikasSinceSunrise: full,
    vighatikasFraction:       Math.round(vigh * 100) / 100,
    sunLongitudeAtSunrise:    sunAbsoluteLongitudeAtSunrise,
    isDayBirth,
    baseLongitudeUsed:        baseLongitude,
  }
}
```

Done when: function compiles. DECISION NEEDED [GL-1] block present.

---

### Task V2-04 — Hora Lagna (UPDATE — add night birth support)

Same pattern as V2-03.

```typescript
// STATUS: pending | Task V2-04
// UPDATES: calculateHoraLagna from SP.8 — adds night birth base longitude

export function calculateHoraLagna(
  sunAbsoluteLongitudeAtSunrise: number,
  minutesSinceSunrise: number,
  isDayBirth: boolean,
  // DECISION NEEDED [HL-1]: same as GL-1 — confirm isDayBirth field
  lagnaAbsoluteLongitude: number
): HoraLagnaResult {
  if (minutesSinceSunrise < 0)
    throw new Error('[calculateHoraLagna] minutesSinceSunrise must be >= 0')

  const baseLongitude = isDayBirth
    ? sunAbsoluteLongitudeAtSunrise
    : lagnaAbsoluteLongitude

  // VERIFY [BL-1]: HL rate of 1 sign per 2.5 Ghatikas (60 min) is the standard
  // Parashara interpretation. Cross-check against a reference test chart before launch.
  const GHATIKAS_PER_SIGN  = 2.5
  const totalGhatikas      = minutesSinceSunrise / 24
  const signsTraversed     = totalGhatikas / GHATIKAS_PER_SIGN
  const degrees            = signsTraversed * 30

  const { sign, degree } = longitudeToSignAndDegree(baseLongitude + degrees)

  return {
    horaLagnaSignNumber:       sign,
    horaLagnaDegree:           Math.round(degree * 1000) / 1000,
    totalGhatikasSinceSunrise: Math.round(totalGhatikas * 1000) / 1000,
    sunLongitudeAtSunrise:     sunAbsoluteLongitudeAtSunrise,
    isDayBirth,
    baseLongitudeUsed:         baseLongitude,
  }
}

// Note: BhavaLagna uses GHATIKAS_PER_SIGN = 5 (1 sign per 120 min)
// Also flagged VERIFY [BL-1]. Carry forward BhavaLagna from SP.7 with that comment added.
```

Done when: function compiles. DECISION NEEDED and VERIFY blocks present.

---

### Task V2-05 — Kaal Velas with Gulika / Maandi Split (REWRITE — replaces SP-EXT.7)

OLD VERSION WAS WRONG. Gulika and Maandi are distinct. See Section 1.2.
Gulika = longitude at START of Saturn's portion.
Maandi = longitude at MIDPOINT of Saturn's portion.

```typescript
// STATUS: pending | Task V2-05
// REPLACES: calculateKaalVelas (SP-EXT.7) — old version treated Gulika = Maandi (WRONG)
// CORRECT SOURCE: BPHS — Gulika is start of Saturn's portion, Maandi is midpoint

// Weekday lord order — same for every weekday, index shifts based on day ruler
const WEEKDAY_LORD_ORDER: KaalVelaPlanet[] = [
  'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'
]

// Day ruler = first lord in the portion sequence for that weekday
const DAY_RULER: Record<number, KaalVelaPlanet> = {
  0: 'Sun', 1: 'Moon', 2: 'Mars', 3: 'Mercury',
  4: 'Jupiter', 5: 'Venus', 6: 'Saturn'
}

export function calculateKaalVelas(
  sunAbsoluteLongitudeAtSunrise: number,
  daytimeDurationMinutes: number,
  // DECISION NEEDED [KV-1]: confirm vedicChart.sunriseData.daytimeDurationMinutes exists.
  // Confirmed API provides sunset time or daytime duration — get exact field name.
  dayOfWeek: number,
  // DECISION NEEDED [KV-2]: confirm vedicChart.sunriseData.dayOfWeek (0=Sun..6=Sat) exists.
  // If absent, derive: new Date(birthProfile.birthDate).getDay()
  lagnaAbsoluteLongitude: number,
  minutesSinceSunrise: number
): KaalVelaSetResult | null {
  if (daytimeDurationMinutes <= 0) {
    console.warn('[calculateKaalVelas] Invalid daytimeDurationMinutes — returning null')
    return null
  }

  // 8 equal portions of the daytime arc; 8th portion is lord-less
  const portionDuration = daytimeDurationMinutes / 8

  // Build the 7 lord-assigned portions
  const startIndex = WEEKDAY_LORD_ORDER.indexOf(DAY_RULER[dayOfWeek])

  const portions = WEEKDAY_LORD_ORDER.map((_, i) => {
    const planet   = WEEKDAY_LORD_ORDER[(startIndex + i) % 7]
    const startMin = i * portionDuration
    const midMin   = startMin + portionDuration / 2
    return { planet, startMin, midMin }
  })

  // Rising ascendant moves at a mean rate of 0.25 deg/min (1 sign per 2 hours)
  // VERIFY [KV-3]: This is a mean approximation. Actual rate varies by birth latitude
  // and season. For precision, request a rising-rate field from the Vedic API.
  const MEAN_RISING_DEG_PER_MIN = 0.25

  function risingLongitudeAt(minutesFromSunrise: number): {
    longitude: number; signNumber: SignNumber
  } {
    const raw  = lagnaAbsoluteLongitude + minutesFromSunrise * MEAN_RISING_DEG_PER_MIN
    const long = ((raw % 360) + 360) % 360
    return { longitude: long, signNumber: longitudeToSignAndDegree(long).sign }
  }

  // Saturn's portion — source of both Gulika (start) and Maandi (midpoint)
  const saturnPortion = portions.find(p => p.planet === 'Saturn')!
  const gulikaPos     = risingLongitudeAt(saturnPortion.startMin)
  const maandiPos     = risingLongitudeAt(saturnPortion.midMin)

  function posFor(planet: KaalVelaPlanet) {
    return risingLongitudeAt(portions.find(p => p.planet === planet)!.startMin)
  }

  return {
    gulika: {
      signNumber:       gulikaPos.signNumber,
      longitude:        Math.round(gulikaPos.longitude * 1000) / 1000,
      portionStartMin:  Math.round(saturnPortion.startMin * 100) / 100,
    },
    maandi: {
      signNumber:          maandiPos.signNumber,
      longitude:           Math.round(maandiPos.longitude * 1000) / 1000,
      portionMidpointMin:  Math.round(saturnPortion.midMin * 100) / 100,
    },
    kaala:        { signNumber: posFor('Sun').signNumber,     longitude: Math.round(posFor('Sun').longitude * 1000) / 1000 },
    mrityu:       { signNumber: posFor('Mars').signNumber,    longitude: Math.round(posFor('Mars').longitude * 1000) / 1000 },
    ardhaprahara: { signNumber: posFor('Mercury').signNumber, longitude: Math.round(posFor('Mercury').longitude * 1000) / 1000 },
    yamaghantaka: { signNumber: posFor('Jupiter').signNumber, longitude: Math.round(posFor('Jupiter').longitude * 1000) / 1000 },
  }
}

// Sanity check — Sunday birth, 12-hour day (720 min), portionDuration = 90 min:
//   Portion order: Sun(0), Venus(90), Mercury(180), Moon(270), Saturn(360), Jupiter(450), Mars(540)
//   Saturn portion: start=360min, midpoint=405min
//   Gulika longitude = Lagna + (360 * 0.25) = Lagna + 90 degrees
//   Maandi longitude = Lagna + (405 * 0.25) = Lagna + 101.25 degrees
//   Gulika and Maandi differ by 11.25 degrees — distinct points, not the same
```

Done when: function compiles. Three DECISION NEEDED / VERIFY blocks present.
Returns null if daytimeDurationMinutes is invalid rather than throwing.

---

### Task V2-06 — Bhrigu Bindu (NEW)

Formula confirmed: midpoint of Moon and Rahu absolute longitudes.
Wrap-around handled for cases where the shorter arc crosses 0/360.

```typescript
// STATUS: pending | Task V2-06
// NEW: not in previous task files
// FORMULA: (Moon absolute longitude + Rahu absolute longitude) / 2, with wrap handling

export function calculateBhriguBindu(
  planets: PlanetPosition[]
): BhriguBinduResult {
  const moon = planets.find(p => p.planet === 'Moon')
  const rahu = planets.find(p => p.planet === 'Rahu')

  if (!moon) throw new Error('[calculateBhriguBindu] Moon not found in planets array')
  if (!rahu) throw new Error('[calculateBhriguBindu] Rahu not found in planets array')

  const moonLong = (moon.signNumber - 1) * 30 + moon.degreeInSign
  const rahuLong = (rahu.signNumber - 1) * 30 + rahu.degreeInSign

  // Midpoint must handle the case where the shorter arc crosses 0/360
  const diff = Math.abs(moonLong - rahuLong)
  let midpoint: number

  if (diff <= 180) {
    // Shorter arc does not cross 0/360 — simple average
    midpoint = (moonLong + rahuLong) / 2
  } else {
    // Shorter arc crosses 0/360 — add 180 to the average, then normalise
    midpoint = ((moonLong + rahuLong) / 2 + 180) % 360
  }

  midpoint = ((midpoint % 360) + 360) % 360
  const { sign, degree } = longitudeToSignAndDegree(midpoint)

  return {
    signNumber:        sign,
    degree:            Math.round(degree * 1000) / 1000,
    absoluteLongitude: Math.round(midpoint * 1000) / 1000,
    moonLongitude:     Math.round(moonLong * 1000) / 1000,
    rahuLongitude:     Math.round(rahuLong * 1000) / 1000,
  }
}

// Sanity checks:
//   Moon at 15 Aries (long=15) + Rahu at 15 Libra (long=195)
//   diff=180 -> simple: (15+195)/2 = 105 -> Cancer 15 deg  [correct]
//
//   Moon at 350 Pisces (long=350) + Rahu at 10 Aries (long=10)
//   diff=340 > 180 -> wrap: (350+10)/2 + 180 = 360 mod 360 = 0 -> Aries 0 deg  [correct]
```

Done when: function compiles. Both sanity checks verified mentally.

---

### Task V2-07 to V2-14 — Carry Forward Unchanged

The following functions from previous task files are BPHS-correct and
require no formula changes. Copy them into specialPoints.ts and update
the STATUS comment at the top of each to `// STATUS: done | Task V2-XX`.

| Task | Function | Source | Change |
|---|---|---|---|
| V2-07 | calculateArudhaLagna | SP.5 | None |
| V2-08 | calculateBhavaLagna | SP.7 | Add VERIFY [BL-1] comment to GHATIKAS_PER_SIGN |
| V2-09 | calculateVarnadaLagna | SP-EXT.2 | None (edge case confirmed: always count from Aries) |
| V2-10 | calculateUpapadaLagna | SP-EXT.4 | None |
| V2-11 | calculateSreeLagna | SP-EXT.5 | None |
| V2-12 | calculateDhoomaChain | SP-EXT.8 | None |
| V2-13 | calculateBeejaSphuata, calculateKshetraSphuta, calculateTriSphuta | SP-EXT.6 | None |
| V2-14 | calculateCharakarakas | SP.9 | None |

Done when: all eight functions compile with updated STATUS comments.
No formula changes to any of these.

---

### Task V2-15 — Main Aggregator (REPLACE)

Replace the existing `calculateSpecialPoints` function. This is the
single public entry point.

```typescript
// STATUS: pending | Task V2-15

export function calculateSpecialPoints(
  vedicChart: VedicChartData
): SpecialPointsResultV2 {
  const {
    lagnaSignNumber,
    lagnaAbsoluteLongitude,
    planets,
  } = vedicChart

  const {
    sunAbsoluteLongitude: sunLong,
    minutesSinceSunrise,
    isDayBirth,
    daytimeDurationMinutes,
    dayOfWeek,
  } = vedicChart.sunriseData

  // Time-based Lagnas
  const ghatiLagna = calculateGhatiLagna(sunLong, minutesSinceSunrise, isDayBirth, lagnaAbsoluteLongitude)
  const bhavaLagna = calculateBhavaLagna(sunLong, minutesSinceSunrise, isDayBirth, lagnaAbsoluteLongitude)
  const horaLagna  = calculateHoraLagna(sunLong, minutesSinceSunrise, isDayBirth, lagnaAbsoluteLongitude)
  const pranapada  = calculatePranapada(sunLong, minutesSinceSunrise, lagnaSignNumber)

  // Arudha / Relationship Lagnas
  const arudhaLagna  = calculateArudhaLagna(lagnaSignNumber, planets)
  const upapadaLagna = calculateUpapadaLagna(lagnaSignNumber, planets)
  const varnadaLagna = calculateVarnadaLagna(lagnaSignNumber, horaLagna.horaLagnaSignNumber)
  const sreeLagna    = calculateSreeLagna(lagnaSignNumber, planets)

  // Charakarakas
  const charakarakas = calculateCharakarakas(planets)

  // Sphutas
  const beejaSphuata  = calculateBeejaSphuata(planets)
  const kshetraSphuta = calculateKshetraSphuta(planets)

  // Kaal Velas — may be null if new API fields not yet confirmed
  const kaalVelas = (daytimeDurationMinutes != null && dayOfWeek != null)
    ? calculateKaalVelas(sunLong, daytimeDurationMinutes, dayOfWeek, lagnaAbsoluteLongitude, minutesSinceSunrise)
    : null

  // TriSphuta depends on Gulika's longitude — null if Kaal Velas unavailable
  const triSphuta = kaalVelas
    ? calculateTriSphuta(lagnaSignNumber, planets, kaalVelas.gulika.longitude)
    : null

  const bhriguBindu = calculateBhriguBindu(planets)
  const dhoomaChain = calculateDhoomaChain(planets)

  return {
    ghatiLagna, bhavaLagna, horaLagna, pranapada,
    arudhaLagna, upapadaLagna, varnadaLagna, sreeLagna,
    charakarakas,
    beejaSphuata, kshetraSphuta, triSphuta, bhriguBindu,
    dhoomaChain,
    kaalVelas,
  }
}
```

Done when: aggregator compiles. kaalVelas and triSphuta are null-safe.

---

### Task V2-16 — KV Cache Key Bump

The KV key must change to force cache invalidation for all existing users.
Old cached values used the wrong Pranapada formula and had no Gulika/Maandi
split. Any stale cache hit would return incorrect data.

Edit `/lib/kv/keys.ts`:

```typescript
// CHANGE FROM:
specialPoints: (userId: string) => `chart:specialpoints:${userId}`,
// CHANGE TO:
specialPoints: (userId: string) => `chart:specialpointsv2:${userId}`,
```

Edit `invalidateChartCache` in `/lib/astro/chartService.ts` to include
both keys during the transition period (remove old key after 30 days):

```typescript
await kvDeleteMany([
  kvKeys.vedicChart(userId),
  kvKeys.hdChart(userId),
  kvKeys.dashas(userId),
  kvKeys.specialPoints(userId),          // new v2 key
  `chart:specialpoints:${userId}`,       // old v1 key — delete after 2026-04-29
])
```

Done when: key updated, old key in invalidation sweep, TODO date set.

---

## SECTION 4 — OPEN DECISIONS

Resolve these before the marked functions will produce correct output.

```
DECISION NEEDED [GL-1]
Task: V2-03 (Ghati Lagna) and V2-04 (Hora Lagna)
File: lib/astro/specialPoints.ts
Question: Does vedicChart.sunriseData.isDayBirth exist as a boolean?
  If not, derive it: isDayBirth = minutesSinceSunrise <= daytimeDurationMinutes
Blocking: Night birth GL and HL use wrong base longitude without this.
Raised: 2026-03-29
Resolved: [fill in]
```

```
DECISION NEEDED [KV-1]
Task: V2-05 (Kaal Velas)
File: lib/astro/specialPoints.ts
Question: You confirmed the API provides sunset time or daytime duration.
  What is the exact field name in vedicChart.sunriseData?
  Options: daytimeDurationMinutes / sunsetMinutesFromSunrise / other?
Blocking: calculateKaalVelas returns null without this field.
Raised: 2026-03-29
Resolved: [fill in]
```

```
DECISION NEEDED [KV-2]
Task: V2-05 (Kaal Velas)
File: lib/astro/specialPoints.ts
Question: Does vedicChart.sunriseData.dayOfWeek exist (0=Sun..6=Sat)?
  If not, derive from BirthProfile.birthDate:
    const dayOfWeek = new Date(birthProfile.birthDate).getDay()
Blocking: calculateKaalVelas returns null without weekday info.
Raised: 2026-03-29
Resolved: [fill in]
```

```
VERIFY [BL-1]
Task: V2-08 (Bhava Lagna) and V2-04 (Hora Lagna)
File: lib/astro/specialPoints.ts
Question: Cross-check BL rate (1 sign per 120 min) and HL rate (1 sign per 60 min)
  against a reference chart with known Bhava Lagna and Hora Lagna values from a
  published Parashara source. If discrepancy found, update GHATIKAS_PER_SIGN.
Blocking: Non-blocking. Rates match standard interpretation.
Raised: 2026-03-29
Resolved: [fill in]
```

```
VERIFY [KV-3]
Task: V2-05 (Kaal Velas)
File: lib/astro/specialPoints.ts
Question: Kaal Vela longitudes use a mean rising rate of 0.25 deg/min.
  Actual rate varies by latitude and season. Is this approximation acceptable,
  or should a dedicated Kaal Vela endpoint be requested from the Vedic API?
Blocking: Non-blocking. Approximation is within ~2-3 degrees for most births.
Raised: 2026-03-29
Resolved: [fill in]
```

---

## SECTION 5 — LIFE BLUEPRINT PAGE DISPLAY SPEC

Target: the existing Life Blueprint page component.
The page uses collapsible sections with glassmorphism cards, amber/gold
accents, Cormorant Garamond for headings, Instrument Sans for body text,
DM Mono for data/labels. Match this language exactly.

---

### 5.1 Section: "Special Lagnas" (NEW)

Position: insert after the Charakarakas section, before the narrative
cards at the bottom.

Header style: match existing section headers — collapsible, amber left
border, section title in Cormorant Garamond 20px.

Layout: two-column responsive grid of point cards.

Each card:
- Point name (Cormorant Garamond 16px, amber #c8873a)
- Sign badge (colored pill, sign name, DM Mono 12px)
- Degree within sign (DM Mono 13px, star color #f0dca0)
- One-sentence meaning (Instrument Sans 12px, muted gray)
- GL and HL cards: small tag "Day birth" or "Night birth" from `isDayBirth`
- Pranapada card: "Fortunate" (green badge) or "Neutral" (muted badge)
  based on `isFortunate` boolean

Points to display in order:
1. Ghati Lagna — "Power and authority"
2. Hora Lagna — "Wealth potential"
3. Bhava Lagna — "Body and life circumstances"
4. Pranapada Lagna — "Auspiciousness of birth"
5. Varnada Lagna — "Longevity and lifespan rhythm"
6. Sree Lagna — "Potential for great wealth"
7. Bhrigu Bindu — "Karmic focal point (Moon-Rahu midpoint)"

---

### 5.2 Section: "Arudha Lagnas" (UPDATE)

If not already renamed, rename this section from "Special Points" or
"Arudhas" to "Arudha Lagnas".

Add Upapada Lagna as a new row below AL:
- Label: "Upapada Lagna (UL)"
- Sign badge + degree (same style as AL row)
- Meaning: "Marriage and spouse nature"

---

### 5.3 Section: "Kaal Velas / Upagrahas" (NEW or REPLACE)

If this section exists with approximated or combined Gulika/Maandi
values, add a replacement banner at the top:

> Banner (amber border, Instrument Sans 12px):
> "Kaal Velas recalculated with corrected BPHS formulas.
>  Gulika and Maandi are now distinct points."

If kaalVelas is null in the API response, show instead:
> "Kaal Velas pending API field confirmation."

When data is available, display as a table:

| Point | Sign | Longitude | Meaning |
|---|---|---|---|
| Gulika | [sign] | [deg] | Start of Saturn's portion. Obstructs house it occupies. |
| Maandi | [sign] | [deg] | Midpoint of Saturn's portion. Strongest Upagraha malefic. |
| Kaala | [sign] | [deg] | Sun's portion. Saturn-like obstruction. |
| Mrityu | [sign] | [deg] | Mars's portion. Death-inflicting point. |
| Ardhaprahara | [sign] | [deg] | Mercury's portion. Obstacles to communication. |
| Yamaghantaka | [sign] | [deg] | Jupiter's portion. Karmic judgment point. |

---

### 5.4 Section: "Sphutas" (UPDATE)

If an existing Sphutas section shows old values, add the recalculation
banner at the top:

> "These values have been recalculated using corrected Parashara formulas.
>  Previous Pranapada values may have differed significantly for births
>  with the Sun in fixed or dual signs."

Display Beeja Sphuta, Kshetra Sphuta as rows.
If triSphuta is null, show: "Trisphuta pending (requires Gulika)."

Add Dhooma chain as a sub-table:

| Point | Sign | Degree | Meaning |
|---|---|---|---|
| Dhooma | - | - | Smoke. Afflicts the house it occupies. |
| Vyatipata | - | - | Sudden calamity point. |
| Parivesha | - | - | Halo. Obstacles through other people. |
| Indra Chapa | - | - | Rainbow. Unreliable or sudden fortune. |
| Upaketu | - | - | Comet. Disruption to wisdom and clarity. |

---

### 5.5 Admin-Only: Old vs New Comparison Panel

Component name: `SpecialPointsComparisonPanel`
Location: `/components/chart/SpecialPointsComparisonPanel.tsx`
Visibility: render only when `session.user.isAdmin === true`

Position: collapsible panel at the bottom of the Special Lagnas section,
collapsed by default. Header: "V1 vs V2 Calculation Audit".

For each affected point (Pranapada, Gulika, Maandi, GL night births,
HL night births), display three columns:

| Column | Source | Color |
|---|---|---|
| Old value | KV key `chart:specialpoints:{userId}` if it exists | Muted red #ff6b6b |
| New value | KV key `chart:specialpointsv2:{userId}` | Amber #c8873a |
| Delta | Difference in degrees | DM Mono |
| Reason | One-line explanation from Section 1 audit | Instrument Sans 11px italic |

Example row (Pranapada, Sun in Taurus):
| Old: Capricorn 15° | New: Capricorn 25° | Delta: +10° | Fixed-sign Sun now starts from 9th house |

If old KV key does not exist for this user:
Show: "No V1 data found for this user — likely a new account."

If old and new values are identical for a point (e.g., day births where
GL was already correct):
Show: "No change — formula was already correct for this birth."

---

## COMPLETION CHECKLIST

- [ ] V2-01  Types — PranapadalagnaResult, updated GL/HL types, KaalVelaSetResult (split), BhriguBinduResult, SpecialPointsResultV2
- [ ] V2-02  calculatePranapada — Movable/Fixed/Dual starting longitude, always additive, sanity checks pass
- [ ] V2-03  calculateGhatiLagna — isDayBirth branch, DECISION NEEDED [GL-1] present
- [ ] V2-04  calculateHoraLagna — isDayBirth branch, VERIFY [BL-1] present
- [ ] V2-05  calculateKaalVelas — Gulika at START, Maandi at MIDPOINT, [KV-1][KV-2][KV-3] present, returns null safely
- [ ] V2-06  calculateBhriguBindu — wrap-around midpoint, both sanity checks pass
- [ ] V2-07 to V2-14  Carry-forward functions with updated STATUS comments, V2-08 has VERIFY [BL-1] on GHATIKAS_PER_SIGN
- [ ] V2-15  Aggregator compiles, kaalVelas and triSphuta null-safe
- [ ] V2-16  KV key bumped to v2, old key in invalidation sweep with TODO date
- [ ] UI 5.1  Special Lagnas section added — 7 cards, isDayBirth tag on GL/HL, isFortunate badge on Pranapada
- [ ] UI 5.2  Upapada Lagna row added to Arudha Lagnas section
- [ ] UI 5.3  Kaal Velas section — Gulika/Maandi as distinct rows, null fallback message
- [ ] UI 5.4  Sphutas section — recalculation banner, Dhooma chain sub-table, triSphuta null message
- [ ] UI 5.5  SpecialPointsComparisonPanel — admin-only, old/new/delta/reason columns, no-data message

---

## SANITY CHECK REFERENCE TABLE

Use this to verify key outputs mentally before marking tasks done.

| Calculation | Input | Expected Output | Notes |
|---|---|---|---|
| Pranapada — movable | Sun=15 Aries, minutesSinceSunrise=60 | Aries ~25 deg | start=Sun's long |
| Pranapada — fixed | Sun=45 Taurus, minutesSinceSunrise=60 | Capricorn ~25 deg | start=Sun+240 |
| Pranapada — dual | Sun=75 Gemini, minutesSinceSunrise=60 | Libra ~25 deg | start=Sun+120 |
| Bhrigu Bindu — no wrap | Moon=15 Aries (long=15), Rahu=15 Libra (long=195) | Cancer 15 deg | simple midpoint |
| Bhrigu Bindu — wrap | Moon=350 (Pisces), Rahu=10 (Aries) | Aries 0 deg | cross-zero arc |
| Gulika vs Maandi — Sunday | 12-hour day (720 min), Lagna=0 Aries | Gulika: 90 deg (Cancer); Maandi: 101.25 deg | differ by 11.25 deg |
| GL — day birth | Sun long=0, minutesSinceSunrise=48 | 2 Ghatikas = sign 3 (Gemini) | base=Sun |
| GL — night birth | Lagna long=90, minutesSinceSunrise=48 | 2 signs from Lagna = sign 6 (Virgo) | base=Lagna |
| HL — day birth | Sun long=0, minutesSinceSunrise=60 | 1 sign traversed = sign 2 (Taurus) | 1 HL-sign per 60 min |

---

*Crossroads Compass — Special Points V2 Task File | 2026-03-29 | Milosh*
*Supersedes SP.1–SP.13 and SP-EXT.1–SP-EXT.11*

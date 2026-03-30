# Task: Parashara Yoga Calculation Engine
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Updated: 2026-03-29
# BPHS source: Brihat Parashara Hora Shastra (262-page verified text, March 2026)

---

## CONTEXT

This task extends the existing Vedic engine with a complete Yoga detection
service covering all five major Yoga categories defined by Maharishi Parashara.

**What are Yogas?**
Yogas are planetary combinations (patterns of planets by sign, house, or aspect)
that create identifiable outcomes across wealth, authority, health, and purpose.
They are not predictions — they are structural tendencies baked into the birth
chart that express across a lifetime with varying intensity based on Dasha timing.

**Where this fits in the codebase:**
- Builds ON TOP of the existing `yogaEngine.ts` (VE.7-VE.9) which covers
  Raj/Dhana/Daridra Yogas partially. This task EXTENDS that file.
- Reads from `VedicChartData` already in KV cache — no API calls needed.
- Results are cached in KV under a new key and surfaced in the Life Blueprint
  page through a new API route and React component.

**Reference files you must read before starting:**
- `lib/astro/yogaEngine.ts`           existing Yoga engine (VE.7-VE.9)
- `types/index.ts`                    YogaResult, YogaCategory types
- `lib/astro/specialPoints.ts`        SP.1-SP.13 — sign arithmetic helpers
- `lib/astro/chartService.ts`         KV cache patterns, getOrCreate* pattern
- `lib/kv/keys.ts`                    KV key schema
- `lib/kv/helpers.ts`                 kvGet, kvSet, kvDelete
- `app/(dashboard)/life-blueprint/page.tsx`   target page for frontend

**BPHS chapters referenced in this file:**
- Ch. 34-35: Raj Yogas, Vipareeta Raj Yoga
- Ch. 36: Nabhasha Yogas (all 32)
- Ch. 37: Pancha Mahapurusha Yogas
- Ch. 38: Lunar Yogas (Sunapha, Anapha, Duradhara, Kemadruma, Adhi)
- Ch. 39: Solar Yogas (Vesi, Vosi, Ubhayachari)
- Ch. 40: Gaj Kesari, Amal, Parvat, Kahal, Lakshmi
- Ch. 41: Dhana Yogas
- Ch. 42: Daridra Yogas
- Ch. 43: Neechabhanga Raj Yoga

---

## DATA MODEL ASSUMPTIONS (READ CAREFULLY)

All functions in this file receive data already fetched from KV.
No function makes a DB read or API call.

Input shape available from `VedicChartData`:
```
vedicChart.lagnaSignNumber              SignNumber 1-12
vedicChart.planets                      PlanetPosition[]
vedicChart.houses                       HouseData[]  (if available from library)
vedicChart.sunriseData                  { sunAbsoluteLongitude, minutesSinceSunrise }
```

Each `PlanetPosition` has:
```
planet        PlanetName
signNumber    SignNumber     (1-12, where planet currently sits)
houseNumber   number         (1-12, derived from lagnaSignNumber offset)
degreeInSign  number         (0-29)
arcMinutes    number
arcSeconds    number
isRetrograde  boolean
isCombust     boolean        (within 6 degrees of Sun, pre-computed)
```

**DECISION NEEDED**
File: lib/astro/yogaEngine.ts
Question: Does the openastrology-library attach `houseNumber` directly
  to each PlanetPosition, or must it be derived from
  (planet.signNumber - lagnaSignNumber + 12) % 12 + 1 ?
Blocking: Every Yoga that references house numbers (all Raj Yogas, Nabhasha Yogas).
Raised: 2026-03-29
Resolved: [fill in — if no houseNumber field, add a helper function
           `signToHouse(signNumber, lagnaSignNumber): number` and use everywhere]

Helper to add if needed:
```typescript
function signToHouse(signNumber: SignNumber, lagnaSign: SignNumber): number {
  return ((signNumber - lagnaSign + 12) % 12) + 1
}
```

Helper reused from specialPoints.ts (re-export or import):
```typescript
// advanceSigns, countSignsBetween, longitudeToSignAndDegree already exist in specialPoints.ts
// Import them — do not re-implement.
import { advanceSigns, countSignsBetween } from './specialPoints'
```

Lagna lord lookup (already in specialPoints.ts as SIGN_LORDS):
```typescript
// Import SIGN_LORDS from specialPoints.ts — do not re-declare.
```

Benefic/malefic classification for Nabhasha Yogas:
```typescript
const NATURAL_BENEFICS: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon']
// Mercury is a conditional benefic — treat as benefic when alone or with benefics.
// For Nabhasha Maal/Sarpa: use natural classification only.
const NATURAL_MALEFICS: PlanetName[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']
// Sun is a mild malefic in Parashara's Nabhasha context.
```

Kendra / Trikona / Dusthana house sets:
```typescript
const KENDRA_HOUSES  = [1, 4, 7, 10] as const
const KONA_HOUSES    = [1, 5, 9]     as const   // Lagna is both Kendra and Kona
const TRIKA_HOUSES   = [6, 8, 12]    as const   // Dusthana
const UPACHAYA_HOUSES = [3, 6, 10, 11] as const
const APOKLIMA_HOUSES = [3, 6, 9, 12]  as const
const PANAPHAR_HOUSES = [2, 5, 8, 11]  as const
```

---

## YOGA CATEGORIES — PLAIN ENGLISH REFERENCE

Each Yoga produced by this engine includes a `plainDescription` field used
by the AI synthesis layer. The descriptions below are the authoritative
templates. Customize per chart in the description field.

### Nabhasha Yogas
Structural patterns formed by WHERE all planets fall (by sign nature or
house group). They reveal the overall shape of a life — how effort distributes
across areas, whether the chart is concentrated or dispersed.

### Pancha Mahapurusha Yogas
Five "great person" combinations. A planet in its own sign or exaltation
AND in a Kendra house. Each one produces a person of exceptional character
in the domain of that planet — Mars/courage, Mercury/intellect,
Jupiter/wisdom, Venus/beauty, Saturn/discipline.

### Raj Yogas
Combinations for authority and recognition. The classic form: lord of a
Kendra (angular house) and lord of a Kona (trinal house) connect by
conjunction, exchange, or mutual aspect. These don't guarantee fame —
they signal potential for public standing that Dasha periods can activate.

### Lunar and Solar Yogas
Patterns formed relative to the Moon or Sun. Sunapha/Anapha/Duradhara
relate to planetary support around the Moon (mental stability, resources).
Vesi/Vosi/Ubhayachari relate to solar support (vitality, ambition).
Kemadruma (isolation of Moon) is the most challenging — no planets near
Moon AND no planets in Kendras from Lagna.

### Gaj Kesari and Others
Individual combinations with wide-ranging effects. Gaj Kesari (Jupiter
in Kendra from Moon) is one of the most celebrated auspicious Yogas —
grants wisdom, fame, and material success when strong.

### Neechabhanga Raj Yoga
Cancellation of debilitation. A debilitated planet normally weakens its
house lordship. But if the lord of the sign where it is debilitated (or
the planet that is exalted there) is in a Kendra from Lagna or Moon,
the debilitation is cancelled — and the planet often overcompensates,
producing significant results in its Dasha period.

### Vipareeta Raj Yoga
An inversion pattern. Lords of the Dusthana houses (6th, 8th, 12th)
placed in OTHER Dusthana houses sometimes produce unexpected success —
the difficult energy turns inward and destroys obstacles rather than
the native. Requires careful qualification: the lord must not simultaneously
afflict good houses.

---

## TASK YG.1 — Extend Types

Add to `types/index.ts`:

```typescript
// Extend existing YogaCategory (VE.7) — add new categories
export type YogaCategory =
  | 'raj'
  | 'dhana'
  | 'daridra'
  | 'nabhasha'
  | 'pancha_mahapurusha'
  | 'lunar'
  | 'solar'
  | 'auspicious'
  | 'neechabhanga'
  | 'vipareeta_raj'
  | 'arishta'
  | 'other'

// Extend existing YogaResult (VE.7) — add display fields for frontend
export interface YogaResult {
  name:             string
  category:         YogaCategory
  strength:         YogaStrength    // 'strong' | 'moderate' | 'weak'
  bphsReference:    string          // e.g. "BPHS Ch.34 v.11"
  planetsInvolved:  PlanetName[]
  housesInvolved:   number[]
  plainDescription: string          // plain English for AI layer
  isActive:         boolean         // false if broken by combustion/debilitation
  // NEW fields for Life Blueprint frontend display:
  shortTitle:       string          // max 40 chars — for the Yoga card headline
  icon:             string          // single emoji representing the Yoga domain
  dashaActivated:   boolean         // true if current Dasha lord is involved
}

export interface YogaDetectionResult {
  yogas:            YogaResult[]
  activeCount:      number          // yogas where isActive = true
  strongCount:      number          // yogas where strength = 'strong'
  dominantCategory: YogaCategory    // category with most active yogas
  detectedAt:       string          // ISO timestamp
}
```

Done when: types/index.ts compiles with no errors.

---

## TASK YG.2 — Nabhasha Yoga Detection (BPHS Ch.35-36)

**File: `/lib/astro/yogaEngine.ts`** — add to existing file.

Nabhasha Yogas are structural. They depend on which house groups or sign
types ALL planets fall in. Use only the 7 classical planets (Sun through
Saturn) — exclude Rahu and Ketu for Nabhasha analysis per Parashara Ch.35 v.2.

```typescript
// BPHS Ch.35 v.2: Nabhasha Yogas use only Grahas Sun-Saturn (7 planets)
const NABHASHA_PLANETS: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
]

// Sign natures (reuse from specialPoints.ts SIGN_NATURE constant)
// Movable: 1,4,7,10 | Fixed: 2,5,8,11 | Dual: 3,6,9,12

export function detectNabhashaYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []

  // Filter to only the 7 classical planets
  const classical = planets.filter(p => NABHASHA_PLANETS.includes(p.planet))
  const signs = classical.map(p => p.signNumber)
  const houses = classical.map(p => signToHouse(p.signNumber, lagnaSign))

  // ------------------------------------------------------------------
  // ASRAYA YOGAS (BPHS Ch.35 v.3-5) — All planets in one sign nature
  // ------------------------------------------------------------------

  const allMovable = signs.every(s => [1,4,7,10].includes(s))
  const allFixed   = signs.every(s => [2,5,8,11].includes(s))
  const allDual    = signs.every(s => [3,6,9,12].includes(s))

  if (allMovable) yogas.push({
    name: 'Rajju Yoga',
    shortTitle: 'Rajju — The Rope',
    category: 'nabhasha',
    strength: 'strong',
    bphsReference: 'BPHS Ch.35 v.3',
    planetsInvolved: NABHASHA_PLANETS,
    housesInvolved: [...new Set(houses)],
    icon: '🌀',
    plainDescription: 'All planets occupy movable signs. Life is defined by movement, travel, change of residence, and a restless drive to initiate. Struggle to stay still produces great momentum but also difficulty with completion.',
    isActive: true,
    dashaActivated: false,
  })

  if (allFixed) yogas.push({
    name: 'Musala Yoga',
    shortTitle: 'Musala — The Pestle',
    category: 'nabhasha',
    strength: 'strong',
    bphsReference: 'BPHS Ch.35 v.4',
    planetsInvolved: NABHASHA_PLANETS,
    housesInvolved: [...new Set(houses)],
    icon: '🏛️',
    plainDescription: 'All planets occupy fixed signs. The nature is stable, determined, and resistant to change. Strong will and persistence. Can become rigid when flexibility is required. Wealth tends to accumulate and hold.',
    isActive: true,
    dashaActivated: false,
  })

  if (allDual) yogas.push({
    name: 'Nala Yoga',
    shortTitle: 'Nala — The Reed',
    category: 'nabhasha',
    strength: 'strong',
    bphsReference: 'BPHS Ch.35 v.5',
    planetsInvolved: NABHASHA_PLANETS,
    housesInvolved: [...new Set(houses)],
    icon: '⚖️',
    plainDescription: 'All planets occupy dual signs. A versatile, communicative nature with skill in multiple fields. Adaptable and intellectually agile. Tendency toward duality in career and relationships — doing two things at once.',
    isActive: true,
    dashaActivated: false,
  })

  // ------------------------------------------------------------------
  // DALA YOGAS (BPHS Ch.35 v.6-8) — Benefics or malefics in Kendras
  // ------------------------------------------------------------------

  const planetsInKendra = classical.filter(p => KENDRA_HOUSES.includes(signToHouse(p.signNumber, lagnaSign)))
  const beneficsInKendra = planetsInKendra.filter(p => NATURAL_BENEFICS.includes(p.planet))
  const maleficsInKendra = planetsInKendra.filter(p => NATURAL_MALEFICS.includes(p.planet))

  // Maal Yoga: Benefics in three or more Kendras, no malefics in Kendras
  const beneficKendraHouses = [...new Set(beneficsInKendra.map(p => signToHouse(p.signNumber, lagnaSign)))]
  if (beneficKendraHouses.length >= 3 && maleficsInKendra.length === 0) {
    yogas.push({
      name: 'Maal Yoga',
      shortTitle: 'Maal — The Garland',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.6',
      planetsInvolved: beneficsInKendra.map(p => p.planet),
      housesInvolved: beneficKendraHouses,
      icon: '🌸',
      plainDescription: 'Benefic planets dominate the angular houses with no malefic obstruction. Life flows with grace and support. Relationships, finances, and reputation tend to develop without major resistance. Natural magnetism.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // Sarpa Yoga: Malefics in three or more Kendras, no benefics in Kendras
  const maleficKendraHouses = [...new Set(maleficsInKendra.map(p => signToHouse(p.signNumber, lagnaSign)))]
  if (maleficKendraHouses.length >= 3 && beneficsInKendra.length === 0) {
    yogas.push({
      name: 'Sarpa Yoga',
      shortTitle: 'Sarpa — The Serpent',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.7',
      planetsInvolved: maleficsInKendra.map(p => p.planet),
      housesInvolved: maleficKendraHouses,
      icon: '🐍',
      plainDescription: 'Malefic planets dominate the angular houses. Obstacles and adversity shape the personality through challenge rather than support. The benefit: exceptional resilience. Life teaches through friction.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // ------------------------------------------------------------------
  // AKRITI YOGAS (BPHS Ch.35 v.9-30) — Geometric house patterns
  // ------------------------------------------------------------------

  const houseSet = new Set(houses)

  // Gada: All planets in two adjacent Kendras only (1+4, 4+7, 7+10, 10+1)
  const adjacentKendraPairs = [[1,4],[4,7],[7,10],[10,1]]
  for (const [a, b] of adjacentKendraPairs) {
    if (houses.every(h => h === a || h === b)) {
      yogas.push({
        name: 'Gada Yoga',
        shortTitle: 'Gada — The Mace',
        category: 'nabhasha',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.35 v.9',
        planetsInvolved: classical.map(p => p.planet),
        housesInvolved: [a, b],
        icon: '⚔️',
        plainDescription: `All planetary energy concentrates in two adjacent angular houses (${a}th and ${b}th). Life is powerfully focused in these two domains — a striking force in that area but relative dormancy elsewhere.`,
        isActive: true,
        dashaActivated: false,
      })
      break
    }
  }

  // Sakat: All planets in 1st and 7th only
  if (houses.every(h => h === 1 || h === 7)) {
    yogas.push({
      name: 'Sakat Yoga',
      shortTitle: 'Sakat — The Cart',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.10',
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [1, 7],
      icon: '🔄',
      plainDescription: 'All planets in the 1st and 7th axis — self and other, self-assertion and partnership. Life revolves entirely around identity through relationship. Can indicate a life where partnerships define everything.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // Vihag: All planets in 4th and 10th only
  if (houses.every(h => h === 4 || h === 10)) {
    yogas.push({
      name: 'Vihag Yoga',
      shortTitle: 'Vihag — The Bird',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.11',
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [4, 10],
      icon: '🦅',
      plainDescription: 'All planets in the 4th and 10th axis — home/roots and career/public life. Life is defined by the tension between private foundation and public achievement. Strong career ambition rooted in emotional needs.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // Shringatak: All planets in trinal houses (1st, 5th, 9th)
  if (houses.every(h => [1,5,9].includes(h))) {
    yogas.push({
      name: 'Shringatak Yoga',
      shortTitle: 'Shringatak — The Triangle',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.12',
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [1, 5, 9],
      icon: '🔺',
      plainDescription: 'All planets in the dharmic trinal houses (1st, 5th, 9th). A profoundly dharmic chart — life oriented around purpose, creativity, and higher learning. Often associated with teachers, advisors, and those with strong spiritual purpose.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // Hal: Planets in 2nd-6th-10th triangle
  if (houses.every(h => [2,6,10].includes(h))) {
    yogas.push({
      name: 'Hal Yoga',
      shortTitle: 'Hal — The Plough',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.13',
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [2, 6, 10],
      icon: '🌾',
      plainDescription: 'All planets in the 2nd, 6th, and 10th — the Artha (material) triangle. Life is fundamentally organized around resource acquisition, work, and career. Strong practical orientation. Wealth through persistent labor.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // Kamal: Planets in all four Kendras
  if ([1,4,7,10].every(h => houseSet.has(h))) {
    yogas.push({
      name: 'Kamal Yoga',
      shortTitle: 'Kamal — The Lotus',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.14',
      planetsInvolved: classical.filter(p => [1,4,7,10].includes(signToHouse(p.signNumber, lagnaSign))).map(p => p.planet),
      housesInvolved: [1, 4, 7, 10],
      icon: '🪷',
      plainDescription: 'Planets in all four angular houses — the rarest and most powerful Nabhasha pattern. Like a lotus rooted in all four directions. Associated with profound authority, fame, and a life that touches every major domain of experience.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // Vapi: Planets in all Apoklimas (3,6,9,12) OR all Panapharas (2,5,8,11)
  if ([3,6,9,12].every(h => houseSet.has(h)) && houses.every(h => [3,6,9,12].includes(h))) {
    yogas.push({
      name: 'Vapi Yoga (Apoklima)',
      shortTitle: 'Vapi — The Well',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.15',
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [3, 6, 9, 12],
      icon: '🌊',
      plainDescription: 'All planets in the Apoklima houses (3rd, 6th, 9th, 12th). Resources tend to accumulate quietly and be held. Like a well — deep reserves beneath the surface, not immediately visible. Late development of potential.',
      isActive: true,
      dashaActivated: false,
    })
  }
  if ([2,5,8,11].every(h => houseSet.has(h)) && houses.every(h => [2,5,8,11].includes(h))) {
    yogas.push({
      name: 'Vapi Yoga (Panaphar)',
      shortTitle: 'Vapi — The Well',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.15',
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [2, 5, 8, 11],
      icon: '🌊',
      plainDescription: 'All planets in the Panaphar houses (2nd, 5th, 8th, 11th). Steady accumulation of resources and gains. Supportive chart for sustained material growth. The Panaphar emphasis suggests effort that consistently converts to result.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // ------------------------------------------------------------------
  // SANKHYA YOGAS (BPHS Ch.36) — How many signs the 7 planets occupy
  // ------------------------------------------------------------------

  const uniqueSignCount = new Set(classical.map(p => p.signNumber)).size

  const sankhyaMap: Record<number, { name: string; shortTitle: string; desc: string; icon: string }> = {
    7: { name: 'Veena Yoga (Vallaki)', shortTitle: 'Veena — The Lute', icon: '🎸',
         desc: 'All 7 planets in 7 different signs. Maximum dispersal of planetary energy — a multifaceted personality with interests and capabilities across every life domain. Musical, artistic tendencies. Can struggle with focus.' },
    6: { name: 'Daam Yoga (Daamini)', shortTitle: 'Daam — The Cord', icon: '🔗',
         desc: '7 planets spread across 6 signs. Near-maximum dispersal. Broad interests with slight concentration in one sign. Generous nature, many connections, variable focus. Strong social network.' },
    5: { name: 'Paash Yoga', shortTitle: 'Paash — The Noose', icon: '🔒',
         desc: '7 planets in 5 signs. Moderate concentration. Capable across many areas but with clear emphasis. Relationships and obligations tend to bind the native to specific paths.' },
    4: { name: 'Kedara Yoga', shortTitle: 'Kedara — The Field', icon: '🌱',
         desc: '7 planets in 4 signs. Significant concentration. Life energy focused in specific areas like a cultivated field. What is planted here grows abundantly. Agricultural or developmental themes.' },
    3: { name: 'Sool Yoga', shortTitle: 'Sool — The Trident', icon: '🔱',
         desc: '7 planets in 3 signs. High concentration — three main life arenas dominate completely. Extremely focused, sometimes one-dimensional. Power in the dominant houses, relative neglect of others.' },
    2: { name: 'Yuga Yoga', shortTitle: 'Yuga — The Pair', icon: '☯️',
         desc: '7 planets in 2 signs. Near-total concentration. Life defined by a single axis — the two houses holding all planets become everything. Intense, singular focus. Can be one of the most powerful or most constrained charts.' },
    1: { name: 'Gola Yoga', shortTitle: 'Gola — The Ball', icon: '🔴',
         desc: '7 planets in 1 sign. All planetary energy in a single sign. The rarest Sankhya Yoga — extraordinary concentration of purpose in one house. Can indicate obsession, genius, or profound limitation depending on that house and its lord.' },
  }

  if (sankhyaMap[uniqueSignCount]) {
    const s = sankhyaMap[uniqueSignCount]
    yogas.push({
      name: s.name,
      shortTitle: s.shortTitle,
      category: 'nabhasha',
      strength: uniqueSignCount <= 2 ? 'strong' : uniqueSignCount <= 4 ? 'moderate' : 'weak',
      bphsReference: `BPHS Ch.36 v.${8 - uniqueSignCount + 1}`,
      planetsInvolved: classical.map(p => p.planet),
      housesInvolved: [...new Set(houses)],
      icon: s.icon,
      plainDescription: s.desc,
      isActive: true,
      dashaActivated: false,
    })
  }

  // ------------------------------------------------------------------
  // YUPA / SHAR / SHAKTI / DANDA (BPHS Ch.35 v.16-20)
  // 4 continuous houses starting from 1st, 4th, 7th, 10th
  // ------------------------------------------------------------------

  const continuousPatterns4: Array<{ start: number; name: string; title: string; icon: string; desc: string }> = [
    { start: 1,  name: 'Yupa Yoga',   title: 'Yupa — The Post',    icon: '🪵',
      desc: 'All planets in houses 1-4. Life force concentrates in the self, resources, communication, and home. Strong private life and personal foundations. Career and relationships are less emphasized.' },
    { start: 4,  name: 'Shar Yoga',   title: 'Shar — The Arrow',   icon: '🏹',
      desc: 'All planets in houses 4-7. Concentration in home, creativity, health, and relationships. Life orbits around domestic and relational themes. Public life (10th) and finance (2nd) are less prominent.' },
    { start: 7,  name: 'Shakti Yoga', title: 'Shakti — The Power',  icon: '⚡',
      desc: 'All planets in houses 7-10. Maximum emphasis on partnerships, transformation, higher purpose, and career. A life built through others and public achievement. Private life may feel underdeveloped.' },
    { start: 10, name: 'Danda Yoga',  title: 'Danda — The Staff',  icon: '🦯',
      desc: 'All planets in houses 10-1. Career, gains, loss/renunciation, and self converge. Life is dominated by public duty and its personal consequences. Strong association with authority and discipline.' },
  ]

  for (const pat of continuousPatterns4) {
    const targetHouses = [pat.start, pat.start+1, pat.start+2, pat.start+3].map(h => ((h-1)%12)+1)
    if (houses.every(h => targetHouses.includes(h)) && targetHouses.every(h => houseSet.has(h))) {
      yogas.push({
        name: pat.name,
        shortTitle: pat.title,
        category: 'nabhasha',
        strength: 'moderate',
        bphsReference: `BPHS Ch.35 v.${17 + continuousPatterns4.indexOf(pat)}`,
        planetsInvolved: classical.map(p => p.planet),
        housesInvolved: targetHouses,
        icon: pat.icon,
        plainDescription: pat.desc,
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  // ------------------------------------------------------------------
  // NAUKA / KOOT / CHATR / CHAP (BPHS Ch.35 v.21-24)
  // 7 continuous houses starting from 1st, 4th, 7th, 10th
  // ------------------------------------------------------------------

  const continuousPatterns7: Array<{ start: number; name: string; title: string; icon: string; desc: string }> = [
    { start: 1, name: 'Nauka Yoga', title: 'Nauka — The Boat', icon: '⛵',
      desc: 'All planets span houses 1-7. Life is a journey from self to partnership — the full arc of personal development is contained in these seven houses. Strong individual identity developing toward relationship mastery.' },
    { start: 4, name: 'Koot Yoga',  title: 'Koot — The Fort',  icon: '🏰',
      desc: 'All planets span houses 4-10. Rooted in home and unfolding toward career peak. Life moves from private security toward public authority. The domestic life is the foundation from which ambition launches.' },
    { start: 7, name: 'Chatr Yoga', title: 'Chatr — The Umbrella', icon: '☂️',
      desc: 'All planets span houses 7-1. Life unfolds through partnership, transformation, wisdom, and self-expression. Relationships catalyze the journey. Deep themes of regeneration and arriving at authentic selfhood.' },
    { start: 10, name: 'Chap Yoga', title: 'Chap — The Bow', icon: '🏹',
      desc: 'All planets span houses 10-4. Career and public life anchor everything, resolving in home and private foundation. Achievement is the launching point; the arc returns to roots.' },
  ]

  for (const pat of continuousPatterns7) {
    const targetHouses = Array.from({length: 7}, (_, i) => ((pat.start - 1 + i) % 12) + 1)
    if (houses.every(h => targetHouses.includes(h))) {
      yogas.push({
        name: pat.name,
        shortTitle: pat.title,
        category: 'nabhasha',
        strength: 'moderate',
        bphsReference: `BPHS Ch.35 v.${21 + continuousPatterns7.indexOf(pat)}`,
        planetsInvolved: classical.map(p => p.planet),
        housesInvolved: targetHouses,
        icon: pat.icon,
        plainDescription: pat.desc,
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  return yogas
}
```

Done when: `detectNabhashaYogas` compiles, returns correct Yogas for test charts.

---

## TASK YG.3 — Pancha Mahapurusha Yoga Detection (BPHS Ch.37)

**File: `/lib/astro/yogaEngine.ts`** — add to existing file.

Rule: Planet in its own sign OR exaltation sign, AND that sign is in a
Kendra house (1, 4, 7, 10) from Lagna.
Exclude: Sun and Moon (not Mahapurusha planets). Include: Mars, Mercury,
Jupiter, Venus, Saturn only.

Exaltation signs per Parashara:
```
Mars:    Capricorn (10)
Mercury: Virgo     (6)
Jupiter: Cancer    (4)
Venus:   Pisces    (12)
Saturn:  Libra     (7)
```

Own signs per Parashara (primary own sign only):
```
Mars:    Aries (1), Scorpio (8)    — primary: Aries
Mercury: Gemini (3), Virgo (6)
Jupiter: Sagittarius (9), Pisces (12) — primary: Sagittarius
Venus:   Taurus (2), Libra (7)
Saturn:  Capricorn (10), Aquarius (11)
```

```typescript
interface MahapurushaConfig {
  planet:      PlanetName
  yogaName:    string
  shortTitle:  string
  ownSigns:    SignNumber[]
  exaltSign:   SignNumber
  icon:        string
  desc:        string
  bphs:        string
}

const MAHAPURUSHA_CONFIGS: MahapurushaConfig[] = [
  {
    planet: 'Mars', yogaName: 'Ruchaka Yoga', shortTitle: 'Ruchaka — Mars Power',
    ownSigns: [1, 8], exaltSign: 10, icon: '🔴',
    desc: 'Mars in its own sign or exaltation in an angular house. Exceptional courage, physical vitality, leadership, and competitive drive. Natural commanders, athletes, surgeons, or military figures. Magnetic personal authority.',
    bphs: 'BPHS Ch.37 v.2',
  },
  {
    planet: 'Mercury', yogaName: 'Bhadra Yoga', shortTitle: 'Bhadra — Mercury Power',
    ownSigns: [3, 6], exaltSign: 6, icon: '💚',
    desc: 'Mercury in its own sign or exaltation in an angular house. Exceptional intellect, analytical skill, communication, and commercial acumen. Natural writers, traders, analysts, and advisors. Sharp and articulate.',
    bphs: 'BPHS Ch.37 v.3',
  },
  {
    planet: 'Jupiter', yogaName: 'Hamsa Yoga', shortTitle: 'Hamsa — Jupiter Grace',
    ownSigns: [9, 12], exaltSign: 4, icon: '🌟',
    desc: 'Jupiter in its own sign or exaltation in an angular house. Profound wisdom, spiritual grace, generosity, and natural authority. Associated with teachers, judges, priests, and those who guide others. Moral and expansive.',
    bphs: 'BPHS Ch.37 v.4',
  },
  {
    planet: 'Venus', yogaName: 'Malavya Yoga', shortTitle: 'Malavya — Venus Grace',
    ownSigns: [2, 7], exaltSign: 12, icon: '💎',
    desc: 'Venus in its own sign or exaltation in an angular house. Exceptional beauty, artistic talent, sensory refinement, and social grace. Natural creators, performers, diplomats, and aesthetes. Magnetic and cultured.',
    bphs: 'BPHS Ch.37 v.5',
  },
  {
    planet: 'Saturn', yogaName: 'Sasa Yoga', shortTitle: 'Sasa — Saturn Discipline',
    ownSigns: [10, 11], exaltSign: 7, icon: '⚫',
    desc: 'Saturn in its own sign or exaltation in an angular house. Exceptional discipline, endurance, administrative skill, and longevity of achievement. Rises slowly but commands lasting authority. Natural builders of institutions.',
    bphs: 'BPHS Ch.37 v.6',
  },
]

export function detectMahapurushaYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []

  for (const config of MAHAPURUSHA_CONFIGS) {
    const pos = planets.find(p => p.planet === config.planet)
    if (!pos) continue

    const inOwnSign   = config.ownSigns.includes(pos.signNumber)
    const inExaltSign = pos.signNumber === config.exaltSign
    const houseNum    = signToHouse(pos.signNumber, lagnaSign)
    const inKendra    = KENDRA_HOUSES.includes(houseNum)

    if ((inOwnSign || inExaltSign) && inKendra) {
      const isBroken = pos.isCombust || false   // combustion breaks Mahapurusha per Ch.37 v.8
      const sign = inExaltSign ? 'exaltation' : 'own sign'
      yogas.push({
        name: config.yogaName,
        shortTitle: config.shortTitle,
        category: 'pancha_mahapurusha',
        strength: inExaltSign ? 'strong' : 'moderate',
        bphsReference: config.bphs,
        planetsInvolved: [config.planet],
        housesInvolved: [houseNum],
        icon: config.icon,
        plainDescription: `${config.planet} in ${sign} in the ${houseNum}th house (Kendra). ${config.desc}`,
        isActive: !isBroken,
        dashaActivated: false,
      })
    }
  }

  return yogas
}
```

Done when: function compiles, detects Ruchaka/Bhadra/Hamsa/Malavya/Sasa correctly.

---

## TASK YG.4 — Lunar Yoga Detection (BPHS Ch.38)

**File: `/lib/astro/yogaEngine.ts`** — add to existing file.

These Yogas depend on which planets occupy the 2nd and 12th from the Moon.
Exclude: Sun from all lunar yoga planet checks (BPHS Ch.38 v.1).
Exclude Rahu and Ketu from benefic lists.

```typescript
export function detectLunarYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []

  const moon = planets.find(p => p.planet === 'Moon')
  if (!moon) return yogas

  const moonSign = moon.signNumber
  const secondFromMoon  = advanceSigns(moonSign, 2)
  const twelfthFromMoon = advanceSigns(moonSign, 12)

  // Planets in 2nd from Moon (exclude Sun)
  const planetsIn2nd  = planets.filter(p =>
    p.planet !== 'Sun' && p.signNumber === secondFromMoon
  )
  // Planets in 12th from Moon (exclude Sun)
  const planetsIn12th = planets.filter(p =>
    p.planet !== 'Sun' && p.signNumber === twelfthFromMoon
  )

  const has2nd  = planetsIn2nd.length > 0
  const has12th = planetsIn12th.length > 0

  // SUNAPHA YOGA (BPHS Ch.38 v.2): Planets (except Sun) in 2nd from Moon
  if (has2nd && !has12th) {
    yogas.push({
      name: 'Sunapha Yoga',
      shortTitle: 'Sunapha — Moon Ahead',
      category: 'lunar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.38 v.2',
      planetsInvolved: [moon.planet, ...planetsIn2nd.map(p => p.planet)],
      housesInvolved: [signToHouse(moonSign, lagnaSign), signToHouse(secondFromMoon, lagnaSign)],
      icon: '🌙',
      plainDescription: 'Planets support the Moon from the front (2nd from Moon). The mind is supported by substance and resources. Natural ability to earn and sustain. Confident in personal expression. The Moon moves toward support.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // ANAPHA YOGA (BPHS Ch.38 v.3): Planets (except Sun) in 12th from Moon
  if (has12th && !has2nd) {
    yogas.push({
      name: 'Anapha Yoga',
      shortTitle: 'Anapha — Moon Behind',
      category: 'lunar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.38 v.3',
      planetsInvolved: [moon.planet, ...planetsIn12th.map(p => p.planet)],
      housesInvolved: [signToHouse(moonSign, lagnaSign), signToHouse(twelfthFromMoon, lagnaSign)],
      icon: '🌛',
      plainDescription: 'Planets support the Moon from behind (12th from Moon). Strong foundations and past support underpin the mind. Natural dignity and self-respect. Less concerned with accumulation than with meaning. Often gifted in renunciation.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // DURADHARA YOGA (BPHS Ch.38 v.4): Planets in BOTH 2nd and 12th from Moon
  if (has2nd && has12th) {
    yogas.push({
      name: 'Duradhara Yoga',
      shortTitle: 'Duradhara — Moon Flanked',
      category: 'lunar',
      strength: 'strong',
      bphsReference: 'BPHS Ch.38 v.4',
      planetsInvolved: [moon.planet, ...planetsIn2nd.map(p => p.planet), ...planetsIn12th.map(p => p.planet)],
      housesInvolved: [
        signToHouse(moonSign, lagnaSign),
        signToHouse(secondFromMoon, lagnaSign),
        signToHouse(twelfthFromMoon, lagnaSign),
      ],
      icon: '🌕',
      plainDescription: 'Planets on both sides of the Moon (2nd and 12th from Moon). The mind is fully flanked by support. Well-resourced, emotionally stable, and able to both earn and enjoy. One of the stronger lunar Yoga configurations.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // KEMADRUMA YOGA (BPHS Ch.38 v.5): No planets in 2nd or 12th from Moon
  // AND no planets in Kendras from Lagna
  if (!has2nd && !has12th) {
    const planetsInKendra = planets.filter(p =>
      p.planet !== 'Moon' && KENDRA_HOUSES.includes(signToHouse(p.signNumber, lagnaSign))
    )
    if (planetsInKendra.length === 0) {
      yogas.push({
        name: 'Kemadruma Yoga',
        shortTitle: 'Kemadruma — Isolated Moon',
        category: 'lunar',
        strength: 'strong',     // strong in its challenging effect
        bphsReference: 'BPHS Ch.38 v.5',
        planetsInvolved: ['Moon'],
        housesInvolved: [signToHouse(moonSign, lagnaSign)],
        icon: '🌑',
        plainDescription: 'The Moon is isolated — no planets in adjacent signs AND no planets in angular houses. The mind lacks external support structures. Can indicate periods of self-reliance by necessity, emotional isolation, or having to build everything from scratch. Cancellation applies if Moon is in a Kendra or with a benefic.',
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  // ADHI YOGA (BPHS Ch.38 v.9): Jupiter, Venus, Mercury in 6th, 7th, 8th from Moon
  // All three must be present across these three houses (each in a different house)
  const sixthFromMoon   = advanceSigns(moonSign, 6)
  const seventhFromMoon = advanceSigns(moonSign, 7)
  const eighthFromMoon  = advanceSigns(moonSign, 8)

  const beneficPlanets = ['Jupiter', 'Venus', 'Mercury'] as PlanetName[]
  const adhiPositions = beneficPlanets.map(bp => {
    const pos = planets.find(p => p.planet === bp)
    if (!pos) return null
    const inTarget = [sixthFromMoon, seventhFromMoon, eighthFromMoon].includes(pos.signNumber)
    return inTarget ? pos : null
  }).filter(Boolean)

  if (adhiPositions.length >= 2) {   // Parashara: at least 2 of 3 benefics qualify
    const strength: YogaStrength = adhiPositions.length === 3 ? 'strong' : 'moderate'
    yogas.push({
      name: 'Adhi Yoga',
      shortTitle: 'Adhi — Benefic Support',
      category: 'lunar',
      strength,
      bphsReference: 'BPHS Ch.38 v.9',
      planetsInvolved: adhiPositions.map(p => p!.planet),
      housesInvolved: [signToHouse(sixthFromMoon, lagnaSign), signToHouse(seventhFromMoon, lagnaSign), signToHouse(eighthFromMoon, lagnaSign)],
      icon: '✨',
      plainDescription: `Benefic planets (${adhiPositions.map(p => p!.planet).join(', ')}) occupy the 6th-8th houses from the Moon. Adhi Yoga grants eminence, administrative capability, and a life of relative ease. One of the most celebrated auspicious Yogas — especially when all three benefics are present.`,
      isActive: true,
      dashaActivated: false,
    })
  }

  return yogas
}
```

Done when: all five lunar Yogas compile and detect correctly.

---

## TASK YG.5 — Solar Yoga Detection (BPHS Ch.39)

**File: `/lib/astro/yogaEngine.ts`** — add to existing file.

Solar Yogas check the 2nd and 12th from the Sun.
Exclude: Moon from all solar yoga checks (BPHS Ch.39 v.1).

```typescript
export function detectSolarYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []

  const sun = planets.find(p => p.planet === 'Sun')
  if (!sun) return yogas

  const sunSign = sun.signNumber
  const secondFromSun  = advanceSigns(sunSign, 2)
  const twelfthFromSun = advanceSigns(sunSign, 12)

  // Planets in 2nd from Sun (exclude Moon)
  const planetsIn2nd  = planets.filter(p => p.planet !== 'Moon' && p.signNumber === secondFromSun)
  // Planets in 12th from Sun (exclude Moon)
  const planetsIn12th = planets.filter(p => p.planet !== 'Moon' && p.signNumber === twelfthFromSun)

  const has2nd  = planetsIn2nd.length > 0
  const has12th = planetsIn12th.length > 0

  // VESI YOGA (BPHS Ch.39 v.2): Planets in 2nd from Sun
  if (has2nd && !has12th) {
    yogas.push({
      name: 'Vesi Yoga',
      shortTitle: 'Vesi — Solar Forward',
      category: 'solar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.39 v.2',
      planetsInvolved: [sun.planet, ...planetsIn2nd.map(p => p.planet)],
      housesInvolved: [signToHouse(sunSign, lagnaSign), signToHouse(secondFromSun, lagnaSign)],
      icon: '☀️',
      plainDescription: 'Planets support the Sun from the front (2nd from Sun). The solar principle — ego, vitality, purpose — is supported by resources and articulation. Strong voice and visible confidence. Tends toward success in public endeavors.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // VOSI YOGA (BPHS Ch.39 v.3): Planets in 12th from Sun
  if (has12th && !has2nd) {
    yogas.push({
      name: 'Vosi Yoga',
      shortTitle: 'Vosi — Solar Behind',
      category: 'solar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.39 v.3',
      planetsInvolved: [sun.planet, ...planetsIn12th.map(p => p.planet)],
      housesInvolved: [signToHouse(sunSign, lagnaSign), signToHouse(twelfthFromSun, lagnaSign)],
      icon: '🌤️',
      plainDescription: 'Planets support the Sun from behind (12th from Sun). The solar identity rests on deep foundations. Strong in spiritual, reclusive, or behind-the-scenes domains. Often indicates a person who works effectively out of the spotlight.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // UBHAYACHARI YOGA (BPHS Ch.39 v.4): Planets in BOTH 2nd and 12th from Sun
  if (has2nd && has12th) {
    yogas.push({
      name: 'Ubhayachari Yoga',
      shortTitle: 'Ubhayachari — Solar Flanked',
      category: 'solar',
      strength: 'strong',
      bphsReference: 'BPHS Ch.39 v.4',
      planetsInvolved: [sun.planet, ...planetsIn2nd.map(p => p.planet), ...planetsIn12th.map(p => p.planet)],
      housesInvolved: [
        signToHouse(sunSign, lagnaSign),
        signToHouse(secondFromSun, lagnaSign),
        signToHouse(twelfthFromSun, lagnaSign),
      ],
      icon: '🌞',
      plainDescription: 'Planets on both sides of the Sun (2nd and 12th from Sun). The solar principle is fully supported — past foundations and present resources both align. Strong royal or executive bearing. Associated with leadership, wealth, and recognition.',
      isActive: true,
      dashaActivated: false,
    })
  }

  return yogas
}
```

Done when: all three solar Yogas compile.

---

## TASK YG.6 — Raj Yoga Extensions + Neechabhanga + Vipareeta (BPHS Ch.34, 35, 43)

**File: `/lib/astro/yogaEngine.ts`** — extend the existing `detectRajYogas` function
or add as separate functions. Existing VE.8 already covers the core
Kendra-Kona conjunction/exchange/aspect rule. This task adds:

1. **Maha Raj Yoga** (BPHS Ch.34 v.14): Exchange between Lagna lord and 5th lord,
   OR Atmakaraka + Putra Karaka in 1st or 5th house.

2. **Yoga Karaka** (BPHS Ch.34 v.12): Single planet ruling BOTH a Kendra and a Kona
   house — the most powerful individual planet for that chart.

3. **Vipareeta Raj Yoga** (BPHS Ch.35 v.1-4): Lords of 6th, 8th, or 12th placed
   in OTHER Dusthana houses (not their own house). Qualification: the Dusthana lord
   must not simultaneously conjunct or aspect Kendra/Kona lords.

4. **Neechabhanga Raj Yoga** (BPHS Ch.43): Cancellation of a planet's debilitation.
   Two conditions for cancellation (either is sufficient):
   - The lord of the sign where the planet is debilitated is in a Kendra from Lagna
   - The planet exalted in that sign is in a Kendra from Lagna or Moon

```typescript
// DEBILITATION and EXALTATION tables (Parashara, BPHS Ch.3)
const PLANET_DEBIL_SIGN: Partial<Record<PlanetName, SignNumber>> = {
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12,
  Jupiter: 10, Venus: 6, Saturn: 1,
}
// Planet exalted in the same sign where another is debilitated:
// (Used for Neechabhanga — "the planet exalted there")
const EXALTED_IN_SIGN: Partial<Record<SignNumber, PlanetName>> = {
  7:  'Saturn',   // Libra — Sun debilitated here, Saturn exalted
  8:  'Jupiter',  // Scorpio — Moon debilitated, Jupiter exalted (at 5°)
  4:  'Jupiter',  // Cancer — Mars debilitated, Jupiter exalted
  12: 'Venus',    // Pisces — Mercury debilitated, Venus exalted
  10: 'Mars',     // Capricorn — Jupiter debilitated, Mars exalted
  6:  'Mercury',  // Virgo — Venus debilitated, Mercury exalted
  1:  'Sun',      // Aries — Saturn debilitated, Sun exalted
}

export function detectNeechabhangaRajYoga(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []

  for (const [planetName, debilSign] of Object.entries(PLANET_DEBIL_SIGN) as Array<[PlanetName, SignNumber]>) {
    const planetPos = planets.find(p => p.planet === planetName)
    if (!planetPos) continue
    if (planetPos.signNumber !== debilSign) continue  // not debilitated

    // Condition 1: Lord of the debilitation sign in Kendra from Lagna
    // (We need SIGN_LORDS — import or resolve inline)
    const debilSignLord = getPrimaryLord(debilSign)  // helper to get single lord
    const lordPos = planets.find(p => p.planet === debilSignLord)
    const lordInKendra = lordPos && KENDRA_HOUSES.includes(signToHouse(lordPos.signNumber, lagnaSign))

    // Condition 2: Planet exalted in that sign is in Kendra from Lagna or Moon
    const exaltedPlanetName = EXALTED_IN_SIGN[debilSign]
    const exaltedPlanetPos  = exaltedPlanetName ? planets.find(p => p.planet === exaltedPlanetName) : undefined
    const moonPos = planets.find(p => p.planet === 'Moon')

    const exaltedInKendraFromLagna = exaltedPlanetPos &&
      KENDRA_HOUSES.includes(signToHouse(exaltedPlanetPos.signNumber, lagnaSign))
    const exaltedInKendraFromMoon  = exaltedPlanetPos && moonPos &&
      KENDRA_HOUSES.includes(signToHouse(exaltedPlanetPos.signNumber, moonPos.signNumber as SignNumber))

    const cancelled = lordInKendra || exaltedInKendraFromLagna || exaltedInKendraFromMoon

    if (cancelled) {
      yogas.push({
        name: `Neechabhanga Raj Yoga (${planetName})`,
        shortTitle: `Neechabhanga — ${planetName} Redeemed`,
        category: 'neechabhanga',
        strength: lordInKendra && (exaltedInKendraFromLagna || exaltedInKendraFromMoon) ? 'strong' : 'moderate',
        bphsReference: 'BPHS Ch.43 v.5-8',
        planetsInvolved: [planetName as PlanetName, ...(lordPos ? [debilSignLord] : [])],
        housesInvolved: [signToHouse(debilSign, lagnaSign)],
        icon: '♻️',
        plainDescription: `${planetName} is debilitated in ${getSignName(debilSign)}, but the debilitation is cancelled. In its Dasha period, ${planetName} can produce strong results that overcompensate for the debilitation — often producing more notable outcomes than a simply dignified planet would. The struggle becomes the source of strength.`,
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  return yogas
}

export function detectViparitaRajYoga(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []
  const dusthanaHouses = [6, 8, 12]

  // BPHS Ch.35 v.1: Lord of 6th, 8th, or 12th placed in another Dusthana
  // Must NOT aspect or conjunct Kendra/Kona lords
  for (const sourceHouse of dusthanaHouses) {
    const houseSign = advanceSigns(lagnaSign, sourceHouse) as SignNumber
    const houseLord = getPrimaryLord(houseSign)
    const lordPos   = planets.find(p => p.planet === houseLord)
    if (!lordPos) continue

    const lordCurrentHouse = signToHouse(lordPos.signNumber, lagnaSign)
    // Lord must be in a different Dusthana than its own house
    if (dusthanaHouses.includes(lordCurrentHouse) && lordCurrentHouse !== sourceHouse) {
      const viparitaNames: Record<number, string> = {
        6: 'Harsha Yoga',
        8: 'Sarala Yoga',
        12: 'Vimala Yoga',
      }
      const viparitaDescs: Record<number, string> = {
        6: 'The 6th lord in another Dusthana. Harsha Yoga brings health, happiness, and victory over enemies. Obstacles tend to defeat themselves. The 6th house\'s adversarial energy turns inward on itself.',
        8: 'The 8th lord in another Dusthana. Sarala Yoga brings fearlessness, longevity, and protection from sudden reversal. Transformation becomes a superpower rather than a vulnerability.',
        12: 'The 12th lord in another Dusthana. Vimala Yoga brings virtuous character, financial prudence, and spiritual depth. The isolating energy of the 12th is channeled productively.',
      }
      yogas.push({
        name: viparitaNames[sourceHouse] ?? `Vipareeta Raj Yoga (${sourceHouse}th)`,
        shortTitle: `${viparitaNames[sourceHouse]} — Reversal Power`,
        category: 'vipareeta_raj',
        strength: 'moderate',
        bphsReference: `BPHS Ch.35 v.${sourceHouse === 6 ? 1 : sourceHouse === 8 ? 2 : 3}`,
        planetsInvolved: [houseLord],
        housesInvolved: [sourceHouse, lordCurrentHouse],
        icon: '🔃',
        plainDescription: viparitaDescs[sourceHouse],
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  return yogas
}
```

**Helper needed — add to file:**
```typescript
// Get the primary single lord for a sign (for Neechabhanga and Vipareeta)
// For dual-lord signs, returns the traditional Parashara primary lord:
// Scorpio -> Mars (primary), Aquarius -> Saturn (primary)
function getPrimaryLord(sign: SignNumber): PlanetName {
  const primary: Record<SignNumber, PlanetName> = {
    1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun',
    6: 'Mercury', 7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn',
    11: 'Saturn', 12: 'Jupiter',
  }
  return primary[sign]
}

// Sign names for plain descriptions
function getSignName(sign: SignNumber): string {
  const names: Record<SignNumber, string> = {
    1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer', 5: 'Leo',
    6: 'Virgo', 7: 'Libra', 8: 'Scorpio', 9: 'Sagittarius',
    10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces',
  }
  return names[sign]
}
```

Done when: all three functions compile with no `any` casts.

---

## TASK YG.7 — Auspicious Individual Yogas (BPHS Ch.40)

**File: `/lib/astro/yogaEngine.ts`** — add to existing file.

```typescript
export function detectAuspiciousYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber,
  allDrishtis: GrahaDrishti[]
): YogaResult[] {
  const yogas: YogaResult[] = []
  const houseOf = (p: PlanetName) => {
    const pos = planets.find(x => x.planet === p)
    return pos ? signToHouse(pos.signNumber, lagnaSign) : null
  }

  // -------------------------------------------------------------------
  // GAJ KESARI YOGA (BPHS Ch.40 v.1)
  // Jupiter in Kendra from Moon, not debilitated, not combust
  // -------------------------------------------------------------------
  const moon    = planets.find(p => p.planet === 'Moon')
  const jupiter = planets.find(p => p.planet === 'Jupiter')

  if (moon && jupiter) {
    const jupHouseFromMoon = countSignsBetween(moon.signNumber, jupiter.signNumber)
    // "Kendra from Moon" = 1, 4, 7, or 10 signs from Moon
    const isKendraFromMoon = [1, 4, 7, 10].includes(jupHouseFromMoon)
    const isDebil = jupiter.signNumber === 10  // Capricorn — Jupiter's debilitation
    const isCombust = jupiter.isCombust ?? false

    if (isKendraFromMoon && !isDebil && !isCombust) {
      yogas.push({
        name: 'Gaj Kesari Yoga',
        shortTitle: 'Gaj Kesari — Elephant-Lion',
        category: 'auspicious',
        strength: 'strong',
        bphsReference: 'BPHS Ch.40 v.1',
        planetsInvolved: ['Jupiter', 'Moon'],
        housesInvolved: [signToHouse(moon.signNumber, lagnaSign), signToHouse(jupiter.signNumber, lagnaSign)],
        icon: '🦁',
        plainDescription: 'Jupiter in an angular house from the Moon, neither debilitated nor combust. Gaj Kesari is one of Parashara\'s most celebrated Yogas — wisdom, fame, and generosity that outlasts the native. Grants the strength of an elephant (Gaj) and the courage of a lion (Kesari) in intellectual and social pursuits.',
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  // -------------------------------------------------------------------
  // AMAL YOGA (BPHS Ch.40 v.3)
  // Only benefics in the 10th house from Lagna or Moon — no malefics
  // -------------------------------------------------------------------
  const planetsIn10thLagna = planets.filter(p => houseOf(p.planet) === 10)
  const planetsIn10thMoon  = moon
    ? planets.filter(p => countSignsBetween(moon.signNumber, p.signNumber) === 10)
    : []

  const checkAmal = (tenthPlanets: PlanetPosition[], from: 'Lagna' | 'Moon') => {
    if (tenthPlanets.length === 0) return
    const allBenefics = tenthPlanets.every(p => NATURAL_BENEFICS.includes(p.planet))
    if (allBenefics) {
      yogas.push({
        name: `Amal Yoga (from ${from})`,
        shortTitle: `Amal — Pure Tenth`,
        category: 'auspicious',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.40 v.3',
        planetsInvolved: tenthPlanets.map(p => p.planet),
        housesInvolved: [10],
        icon: '🌿',
        plainDescription: `Only benefics occupy the 10th house from ${from}. Amal Yoga grants a spotless reputation and lasting fame. Career achievements are built through virtue and sincerity rather than ambition alone. The work leaves a positive legacy.`,
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  checkAmal(planetsIn10thLagna, 'Lagna')
  if (planetsIn10thMoon !== planetsIn10thLagna) checkAmal(planetsIn10thMoon, 'Moon')

  // -------------------------------------------------------------------
  // LAKSHMI YOGA (BPHS Ch.40 v.5)
  // 9th lord in Kendra in own or exaltation sign, AND Lagna lord is strong
  // "Strong Lagna lord" = in own sign, exaltation, or Kendra/Kona
  // -------------------------------------------------------------------
  const ninthHouseSign = advanceSigns(lagnaSign, 9) as SignNumber
  const ninthLord = getPrimaryLord(ninthHouseSign)
  const ninthLordPos = planets.find(p => p.planet === ninthLord)
  const lagnaLord = getPrimaryLord(lagnaSign)
  const lagnaLordPos = planets.find(p => p.planet === lagnaLord)

  if (ninthLordPos && lagnaLordPos) {
    const ninthLordHouse = signToHouse(ninthLordPos.signNumber, lagnaSign)
    const ninthLordInKendra = KENDRA_HOUSES.includes(ninthLordHouse)
    // Own or exaltation for 9th lord at its current position
    const ninthLordOwnOrExalt = isOwnSign(ninthLord, ninthLordPos.signNumber) ||
      isExaltationSign(ninthLord, ninthLordPos.signNumber)
    // Lagna lord "strong" = in Kendra, Kona, own sign, or exaltation
    const lagnaLordHouse = signToHouse(lagnaLordPos.signNumber, lagnaSign)
    const lagnaLordStrong = KENDRA_HOUSES.includes(lagnaLordHouse) ||
      KONA_HOUSES.includes(lagnaLordHouse) ||
      isOwnSign(lagnaLord, lagnaLordPos.signNumber) ||
      isExaltationSign(lagnaLord, lagnaLordPos.signNumber)

    if (ninthLordInKendra && ninthLordOwnOrExalt && lagnaLordStrong) {
      yogas.push({
        name: 'Lakshmi Yoga',
        shortTitle: 'Lakshmi — Goddess of Wealth',
        category: 'auspicious',
        strength: 'strong',
        bphsReference: 'BPHS Ch.40 v.5',
        planetsInvolved: [ninthLord, lagnaLord],
        housesInvolved: [ninthLordHouse, lagnaLordHouse],
        icon: '💰',
        plainDescription: `The 9th lord (${ninthLord}) is in a Kendra house in strength, and the Lagna lord (${lagnaLord}) is also strong. Lakshmi Yoga confers material prosperity, royal favor, and a fortunate life aligned with dharma. Wealth comes through righteous and fortunate means.`,
        isActive: !ninthLordPos.isCombust,
        dashaActivated: false,
      })
    }
  }

  // -------------------------------------------------------------------
  // PARVAT YOGA (BPHS Ch.40 v.7)
  // Benefics in Kendras, and 7th + 8th houses vacant or with benefics only
  // -------------------------------------------------------------------
  const beneficsInKendra = planets.filter(
    p => NATURAL_BENEFICS.includes(p.planet) && KENDRA_HOUSES.includes(houseOf(p.planet)!)
  )
  const planetsIn7th = planets.filter(p => houseOf(p.planet) === 7)
  const planetsIn8th = planets.filter(p => houseOf(p.planet) === 8)
  const seventhClear = planetsIn7th.every(p => NATURAL_BENEFICS.includes(p.planet))
  const eighthClear  = planetsIn8th.every(p => NATURAL_BENEFICS.includes(p.planet))

  if (beneficsInKendra.length >= 2 && seventhClear && eighthClear) {
    yogas.push({
      name: 'Parvat Yoga',
      shortTitle: 'Parvat — The Mountain',
      category: 'auspicious',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.40 v.7',
      planetsInvolved: beneficsInKendra.map(p => p.planet),
      housesInvolved: [...new Set(beneficsInKendra.map(p => houseOf(p.planet)!))],
      icon: '⛰️',
      plainDescription: 'Benefics in angular houses with clear 7th and 8th. Parvat Yoga produces enduring prosperity and a peaceful life. Like a mountain — stable, elevated, and providing a commanding view. Financial security and social standing tend to be solid.',
      isActive: true,
      dashaActivated: false,
    })
  }

  // -------------------------------------------------------------------
  // KAHAL YOGA (BPHS Ch.40 v.9)
  // 4th lord and Jupiter in mutual Kendras (Kendra from each other)
  // -------------------------------------------------------------------
  const fourthHouseSign = advanceSigns(lagnaSign, 4) as SignNumber
  const fourthLord = getPrimaryLord(fourthHouseSign)
  const fourthLordPos = planets.find(p => p.planet === fourthLord)

  if (fourthLordPos && jupiter) {
    const signsBetween = countSignsBetween(fourthLordPos.signNumber, jupiter.signNumber)
    const isMutualKendra = [1, 4, 7, 10].includes(signsBetween)
    if (isMutualKendra) {
      yogas.push({
        name: 'Kahal Yoga',
        shortTitle: 'Kahal — The Drum',
        category: 'auspicious',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.40 v.9',
        planetsInvolved: [fourthLord, 'Jupiter'],
        housesInvolved: [houseOf(fourthLord)!, houseOf('Jupiter')!],
        icon: '🥁',
        plainDescription: `The 4th lord (${fourthLord}) and Jupiter are in Kendra from each other. Kahal Yoga grants determination, authority, and command. The person strikes with force when needed and builds lasting foundations. Often associated with landed property and vehicles.`,
        isActive: !(jupiter.isCombust ?? false),
        dashaActivated: false,
      })
    }
  }

  return yogas
}
```

**Additional helpers needed:**
```typescript
function isOwnSign(planet: PlanetName, sign: SignNumber): boolean {
  const ownSigns: Partial<Record<PlanetName, SignNumber[]>> = {
    Sun: [5], Moon: [4], Mars: [1, 8], Mercury: [3, 6],
    Jupiter: [9, 12], Venus: [2, 7], Saturn: [10, 11],
  }
  return ownSigns[planet]?.includes(sign) ?? false
}

function isExaltationSign(planet: PlanetName, sign: SignNumber): boolean {
  const exaltSigns: Partial<Record<PlanetName, SignNumber>> = {
    Sun: 1, Moon: 2, Mars: 10, Mercury: 6,
    Jupiter: 4, Venus: 12, Saturn: 7, Rahu: 3, Ketu: 9,
  }
  return exaltSigns[planet] === sign
}
```

Done when: all five auspicious Yoga functions compile.

---

## TASK YG.8 — Main Aggregator + Dasha Activation

**File: `/lib/astro/yogaEngine.ts`** — extend main export function.

```typescript
import type { YogaDetectionResult, YogaResult } from '@/types'

/**
 * Run all Yoga detection categories and return a unified result.
 * Also marks yogas as dashaActivated if the current Mahadasha or
 * Antardasha lord is one of the planets involved.
 *
 * @param vedicChart      Full natal chart from KV
 * @param currentMahadasha  PlanetName of current Mahadasha lord (from Dasha KV)
 * @param currentAntardasha PlanetName of current Antardasha lord (optional)
 */
export function detectAllYogas(
  vedicChart: VedicChartData,
  currentMahadasha?: PlanetName,
  currentAntardasha?: PlanetName
): YogaDetectionResult {
  const { lagnaSignNumber: lagnaSign, planets } = vedicChart

  if (!lagnaSign || !planets) {
    console.warn('[detectAllYogas] Missing lagnaSignNumber or planets in VedicChartData')
    return { yogas: [], activeCount: 0, strongCount: 0, dominantCategory: 'other', detectedAt: new Date().toISOString() }
  }

  // Compute all Drishtis (aspects) — reuse existing function from yogaEngine.ts (VE.5)
  const allDrishtis = calculateAllGrahaDrishtis(planets)

  const allYogas: YogaResult[] = [
    ...detectNabhashaYogas(planets, lagnaSign),
    ...detectMahapurushaYogas(planets, lagnaSign),
    ...detectLunarYogas(planets, lagnaSign),
    ...detectSolarYogas(planets, lagnaSign),
    ...detectRajYogas(planets, lagnaSign, allDrishtis),     // existing VE.8
    ...detectDhanaYogas(planets, lagnaSign),                // existing VE.9
    ...detectDaridraYogas(planets, lagnaSign),              // existing VE.9
    ...detectNeechabhangaRajYoga(planets, lagnaSign),
    ...detectViparitaRajYoga(planets, lagnaSign),
    ...detectAuspiciousYogas(planets, lagnaSign, allDrishtis),
  ]

  // Mark Dasha-activated: is the current Mahadasha or Antardasha lord involved?
  const dashaLords = [currentMahadasha, currentAntardasha].filter(Boolean) as PlanetName[]
  const taggedYogas = allYogas.map(y => ({
    ...y,
    dashaActivated: dashaLords.some(lord => y.planetsInvolved.includes(lord)),
  }))

  // Deduplicate by name (same Yoga can appear from multiple detection paths)
  const seen = new Set<string>()
  const unique = taggedYogas.filter(y => {
    if (seen.has(y.name)) return false
    seen.add(y.name)
    return true
  })

  const activeYogas = unique.filter(y => y.isActive)
  const strongYogas = unique.filter(y => y.strength === 'strong')

  // Dominant category: most frequent among active yogas
  const catCount = activeYogas.reduce<Record<string, number>>((acc, y) => {
    acc[y.category] = (acc[y.category] ?? 0) + 1
    return acc
  }, {})
  const dominantCategory = (
    Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'other'
  ) as YogaCategory

  return {
    yogas: unique,
    activeCount: activeYogas.length,
    strongCount: strongYogas.length,
    dominantCategory,
    detectedAt: new Date().toISOString(),
  }
}
```

Done when: `detectAllYogas` compiles with all sub-detectors integrated.

---

## TASK YG.9 — KV Caching for Yoga Results

**File: `/lib/kv/keys.ts`** — add to `kvKeys`:
```typescript
yogas: (userId: string) => `chart:yogas:${userId}`,
```

**File: `/lib/astro/chartService.ts`** — add:
```typescript
export async function getOrCreateYogas(
  userId: string,
  currentMahadasha?: PlanetName,
  currentAntardasha?: PlanetName
): Promise<YogaDetectionResult | null> {
  const cacheKey = kvKeys.yogas(userId)

  // Yoga cache is per Dasha period — include dasha lords in cache key if provided
  const dashaKey = currentMahadasha ? `${cacheKey}:${currentMahadasha}` : cacheKey
  const cached = await kvGet<YogaDetectionResult>(dashaKey)
  if (cached !== null) return cached

  const vedicChart = await kvGet<VedicChartData>(kvKeys.vedicChart(userId))
  if (!vedicChart) {
    console.warn(`[getOrCreateYogas] No Vedic chart in KV for user ${userId}`)
    return null
  }

  const result = detectAllYogas(vedicChart, currentMahadasha, currentAntardasha)
  await kvSet(dashaKey, result)   // no TTL — invalidate when chart or dasha changes
  return result
}
```

**Update `invalidateChartCache`** to include yoga key:
```typescript
await kvDeleteMany([
  kvKeys.vedicChart(userId),
  kvKeys.hdChart(userId),
  kvKeys.dashas(userId),
  kvKeys.specialPoints(userId),
  kvKeys.yogas(userId),       // add this line
])
```

Done when: KV key added, wrapper compiles, invalidation covers yogas.

---

## TASK YG.10 — API Route

Create `/app/api/chart/yogas/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { getOrCreateYogas } from '@/lib/astro/chartService'
import { kvGet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'
import type { VedicDashaData } from '@/types'

export async function GET() {
  const session = await getRequiredSession()
  const userId  = session.user.id

  // Pull current Dasha lords from KV for Dasha-activation tagging
  const dashaData = await kvGet<VedicDashaData>(kvKeys.dashas(userId))
  const currentMahadasha  = dashaData?.currentMahadasha?.planet  ?? undefined
  const currentAntardasha = dashaData?.currentAntardasha?.planet ?? undefined

  const result = await getOrCreateYogas(userId, currentMahadasha, currentAntardasha)

  if (!result) {
    return NextResponse.json(
      {
        error: 'Yoga data not yet available.',
        detail: 'Vedic chart may still be generating. Retry after chart generation completes.',
      },
      { status: 202 }
    )
  }

  return NextResponse.json(result)
}
```

Behaviour contract:
- 401 / redirect to /login if no session
- 202 if Vedic chart absent from KV
- 200 + YogaDetectionResult JSON when available
- Filters: caller can append `?category=raj` or `?active=true` as optional URL params
  (add query param filtering inside the route — not in the engine)

Done when: route compiles and returns 202 for users without Vedic chart data.

---

## TASK YG.11 — Life Blueprint Frontend Component

**File: `/app/(dashboard)/life-blueprint/page.tsx`** — add Yoga section.
**New component: `/components/chart/YogaGrid.tsx`**

Design system tokens (use exclusively — no new colors):
```
--cosmos:  #0d1220    background
--amber:   #c8873a    primary accent
--gold:    #e8b96a    secondary accent / highlights
--surface: rgba(255,255,255,0.04)   card base
--border:  rgba(255,255,255,0.08)
--text-primary:  #f0e8d8
--text-muted:    rgba(240,232,216,0.55)
```

Typography:
```
Cormorant Garamond  — Yoga names, section heading
DM Mono             — category labels, BPHS reference, strength badge
Instrument Sans     — plain description text
```

**Build `/components/chart/YogaGrid.tsx`:**

```tsx
'use client'

import { useState } from 'react'
import type { YogaDetectionResult, YogaResult, YogaCategory } from '@/types'

interface YogaGridProps {
  data: YogaDetectionResult
}

const CATEGORY_LABELS: Record<YogaCategory, string> = {
  raj:                'Raj — Authority',
  dhana:              'Dhana — Wealth',
  daridra:            'Daridra — Adversity',
  nabhasha:           'Nabhasha — Chart Pattern',
  pancha_mahapurusha: 'Pancha Mahapurusha — Great Person',
  lunar:              'Lunar — Mind',
  solar:              'Solar — Purpose',
  auspicious:         'Auspicious — Blessings',
  neechabhanga:       'Neechabhanga — Redeemed',
  vipareeta_raj:      'Vipareeta — Reversal',
  arishta:            'Arishta — Challenge',
  other:              'Other',
}

const STRENGTH_STYLES: Record<string, string> = {
  strong:   'text-amber-400 border border-amber-400/40 bg-amber-400/10',
  moderate: 'text-yellow-300/70 border border-yellow-300/20 bg-yellow-300/5',
  weak:     'text-slate-400 border border-slate-400/20 bg-slate-400/5',
}

export function YogaGrid({ data }: YogaGridProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | YogaCategory>('active')
  const [expanded, setExpanded] = useState<string | null>(null)

  const categories = [...new Set(data.yogas.map(y => y.category))] as YogaCategory[]

  const filtered = data.yogas.filter(y => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'active') return y.isActive
    return y.category === activeFilter
  })

  return (
    <section className="mt-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-amber-500/60 uppercase mb-1">
            Planetary Combinations
          </p>
          <h2 className="font-serif text-3xl text-[#f0e8d8] tracking-wide">
            Active Yogas
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-[rgba(240,232,216,0.55)]">
            {data.activeCount} active · {data.strongCount} strong
          </p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total Detected', value: data.yogas.length, icon: '◈' },
          { label: 'Active Now',     value: data.activeCount,  icon: '⬡' },
          { label: 'Dasha Powered',  value: data.yogas.filter(y => y.dashaActivated).length, icon: '◎' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 backdrop-blur-sm"
          >
            <p className="font-mono text-xs text-[rgba(240,232,216,0.55)] mb-1">{stat.icon} {stat.label}</p>
            <p className="font-serif text-2xl text-[#e8b96a]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'active'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`font-mono text-xs px-3 py-1 rounded-full border transition-all ${
              activeFilter === f
                ? 'border-amber-500/60 bg-amber-500/15 text-amber-400'
                : 'border-[rgba(255,255,255,0.08)] text-[rgba(240,232,216,0.45)] hover:border-amber-500/30'
            }`}
          >
            {f === 'all' ? 'All Yogas' : 'Active Only'}
          </button>
        ))}
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`font-mono text-xs px-3 py-1 rounded-full border transition-all ${
              activeFilter === cat
                ? 'border-amber-500/60 bg-amber-500/15 text-amber-400'
                : 'border-[rgba(255,255,255,0.08)] text-[rgba(240,232,216,0.45)] hover:border-amber-500/30'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Yoga Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(yoga => (
          <YogaCard
            key={yoga.name}
            yoga={yoga}
            isExpanded={expanded === yoga.name}
            onToggle={() => setExpanded(expanded === yoga.name ? null : yoga.name)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center font-sans text-sm text-[rgba(240,232,216,0.4)] py-12">
          No Yogas match the selected filter.
        </p>
      )}
    </section>
  )
}

function YogaCard({ yoga, isExpanded, onToggle }: {
  yoga: YogaResult
  isExpanded: boolean
  onToggle: () => void
}) {
  const isInactive = !yoga.isActive

  return (
    <button
      onClick={onToggle}
      className={`
        text-left w-full rounded-2xl border p-5 transition-all duration-300 backdrop-blur-sm
        ${isInactive
          ? 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] opacity-50'
          : yoga.dashaActivated
            ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-[rgba(255,255,255,0.04)] shadow-lg shadow-amber-500/5'
            : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:border-amber-500/25 hover:bg-[rgba(255,255,255,0.06)]'
        }
      `}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{yoga.icon}</span>
          <div>
            <p className="font-serif text-lg text-[#f0e8d8] leading-tight">
              {yoga.shortTitle}
            </p>
            {yoga.dashaActivated && (
              <span className="inline-block font-mono text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-2 py-0.5 mt-1">
                ◎ Dasha Active
              </span>
            )}
          </div>
        </div>
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full shrink-0 ${STRENGTH_STYLES[yoga.strength]}`}>
          {yoga.strength}
        </span>
      </div>

      {/* Category label */}
      <p className="font-mono text-[10px] tracking-widest text-[rgba(240,232,216,0.35)] uppercase mb-3">
        {CATEGORY_LABELS[yoga.category]}
      </p>

      {/* Preview description — first sentence */}
      <p className="font-sans text-sm text-[rgba(240,232,216,0.65)] leading-relaxed line-clamp-2">
        {yoga.plainDescription}
      </p>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
          <p className="font-sans text-sm text-[rgba(240,232,216,0.75)] leading-relaxed">
            {yoga.plainDescription}
          </p>

          <div className="flex flex-wrap gap-2">
            {yoga.planetsInvolved.map(p => (
              <span key={p} className="font-mono text-[11px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[rgba(240,232,216,0.55)]">
                {p}
              </span>
            ))}
            {yoga.housesInvolved.map(h => (
              <span key={h} className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/8 text-amber-500/60">
                House {h}
              </span>
            ))}
          </div>

          <p className="font-mono text-[10px] text-[rgba(240,232,216,0.25)]">
            {yoga.bphsReference}
          </p>

          {isInactive && (
            <p className="font-mono text-[11px] text-orange-400/60 bg-orange-400/8 border border-orange-400/20 rounded px-3 py-2">
              Currently inactive — planet may be combust or debilitated without cancellation.
            </p>
          )}
        </div>
      )}

      <p className="font-mono text-[10px] text-[rgba(240,232,216,0.2)] mt-3 text-right">
        {isExpanded ? '▲ less' : '▼ more'}
      </p>
    </button>
  )
}
```

**Wire into Life Blueprint page:**

In `/app/(dashboard)/life-blueprint/page.tsx`, add after the existing
chart sections:

```tsx
import { YogaGrid } from '@/components/chart/YogaGrid'

// In the server component:
const yogaData = await getOrCreateYogas(session.user.id, currentMahadasha, currentAntardasha)

// In the JSX:
{yogaData && <YogaGrid data={yogaData} />}
{!yogaData && (
  <div className="mt-12 text-center">
    <p className="font-mono text-xs text-[rgba(240,232,216,0.4)]">
      Yoga analysis will appear once your Vedic chart is ready.
    </p>
  </div>
)}
```

Done when: YogaGrid renders in Life Blueprint page with real or mock data.
Verify: filter pills work, cards expand/collapse, Dasha-active cards have amber glow.

---

## COMPLETION CHECKLIST

- [ ] YG.1   Types extended — YogaCategory, YogaResult, YogaDetectionResult in types/index.ts
- [ ] YG.2   detectNabhashaYogas — all 32 patterns: Asraya (3), Dala (2), Akriti (9+), Sankhya (7), continuous (8)
- [ ] YG.3   detectMahapurushaYogas — Ruchaka, Bhadra, Hamsa, Malavya, Sasa
- [ ] YG.4   detectLunarYogas — Sunapha, Anapha, Duradhara, Kemadruma, Adhi
- [ ] YG.5   detectSolarYogas — Vesi, Vosi, Ubhayachari
- [ ] YG.6   detectNeechabhangaRajYoga + detectViparitaRajYoga — helpers getPrimaryLord, getSignName
- [ ] YG.7   detectAuspiciousYogas — Gaj Kesari, Amal, Lakshmi, Parvat, Kahal + helpers
- [ ] YG.8   detectAllYogas aggregator — Dasha activation tagging, deduplication
- [ ] YG.9   KV key `chart:yogas`, getOrCreateYogas, invalidation updated
- [ ] YG.10  API route /api/chart/yogas — 202/200 contract, optional query params
- [ ] YG.11  YogaGrid component + Life Blueprint page integration

---

## OPEN DECISIONS

```
DECISION NEEDED
Task: YG.2 + all Yoga tasks
File: lib/astro/yogaEngine.ts
Question: Does openastrology-library attach houseNumber directly to each
  PlanetPosition, or must it be derived as ((sign - lagnaSign + 12) % 12) + 1?
Blocking: Every Yoga function that references house numbers.
Raised: 2026-03-29
Resolved: [fill in]
```

```
DECISION NEEDED
Task: YG.4 (Kemadruma)
File: lib/astro/yogaEngine.ts
Question: Should Kemadruma Yoga be shown as an active warning in the UI,
  or suppressed when the user's Moon is otherwise strong (e.g. in own sign)?
  Parashara lists several cancellation conditions beyond the two encoded here.
Blocking: UI display only — detection logic is not blocked.
Raised: 2026-03-29
Resolved: [fill in — recommend: show with clear "may be cancelled" caveat]
```

```
DECISION NEEDED
Task: YG.9
File: lib/astro/chartService.ts
Question: Yoga results are cached per Dasha period. When Dasha changes,
  the cache key changes automatically (includes mahadasha name). But the
  old key remains in KV. Should a cleanup job remove stale yoga keys,
  or is KV storage cost not a concern at current scale?
Blocking: Operational only — not a build blocker.
Raised: 2026-03-29
Resolved: [fill in]
```

---

## SANITY CHECKS

Add these as comments at the bottom of yogaEngine.ts:

```typescript
// Sanity checks — verify mentally before marking tasks done:
//
// NABHASHA:
// All planets in Aries, Cancer, Libra, Capricorn -> Rajju Yoga
// All planets in houses 1,4,7,10 -> Kamal Yoga
// 7 planets in 7 different signs -> Veena Yoga
// 7 planets in 1 sign -> Gola Yoga (rarest)
// All planets in houses 1-7 -> Nauka Yoga
//
// MAHAPURUSHA:
// Jupiter in Cancer in 1st house -> Hamsa Yoga (Jupiter exalted, Kendra) ✓
// Jupiter in Cancer in 3rd house -> NOT Hamsa (not Kendra) ✗
// Mars in Capricorn in 4th house -> Ruchaka Yoga ✓
// Mars in Capricorn in 8th house -> NOT Ruchaka (not Kendra) ✗
//
// LUNAR:
// Planets in 2nd and 12th from Moon, no Sun -> Duradhara ✓
// No planets in 2nd or 12th from Moon, no planets in Kendras -> Kemadruma ✓
// Jupiter, Venus, Mercury all in 6th/7th/8th from Moon -> Adhi Yoga (full strength) ✓
//
// SOLAR:
// Venus in 2nd from Sun, Mars in 12th from Sun -> Ubhayachari ✓
// Only Saturn in 12th from Sun (no Moon) -> Vosi ✓
//
// NEECHABHANGA:
// Sun debilitated in Libra (sign 7), Saturn (lord of Libra) in Kendra from Lagna -> Neechabhanga ✓
// Moon debilitated in Scorpio (sign 8), Mars (lord of Scorpio) NOT in Kendra -> NOT cancelled ✗
//
// GAJ KESARI:
// Jupiter in Kendra from Moon, not debilitated, not combust -> active ✓
// Jupiter in Capricorn (debilitated) in Kendra from Moon -> inactive ✗
//
// VIPAREETA:
// 8th lord in 12th house -> Sarala Yoga ✓
// 8th lord in own 8th house -> NOT Vipareeta (must be different Dusthana) ✗
```

---

## STATUS COMMENT FORMAT

At the top of every file you create or modify:
```
// STATUS: done | Task YG.X
```

---

*Crossroads Compass — Parashara Yoga Engine Task File | YG.1-YG.11 | March 2026*
*Source authority: Brihat Parashara Hora Shastra (BPHS), verified March 2026*
*Yoga rules cross-referenced against BPHS Ch.34-43*

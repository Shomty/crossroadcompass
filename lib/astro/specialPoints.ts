// STATUS: done | Task SP.2 SP.3 SP.4 SP.5 SP.6 SP.7 SP.8 SP.9 SP.10
/**
 * lib/astro/specialPoints.ts
 * Pure calculation service for Vedic special Lagnas and Charakarakas.
 * No DB reads. No KV reads. All functions receive already-fetched data
 * as arguments and return typed results.
 */

import type {
  SignNumber, PlanetName, PlanetPosition,
  ArudhaLagnaResult, GhatiLagnaResult,
  BhavaLagnaResult, HoraLagnaResult,
  CharakarakaResult, Charakaraka, CharakarakaSetResult,
  SthiraKarakaDeficit, SpecialPointsResult,
} from '@/types'

// ─── SP.2 Constants ───────────────────────────────────────────────────────

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

// ─── SP.3 Sign Arithmetic Helpers ─────────────────────────────────────────

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

// ─── SP.4 Dual-Lord Tiebreaker ────────────────────────────────────────────

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

  // Step 1: planet count in sign
  const cA = countIn(sA), cB = countIn(sB)
  if (cA !== cB) return cA > cB ? lordA : lordB

  // Step 2: own-sign
  const ownA = getOwnSigns(lordA).includes(sA)
  const ownB = getOwnSigns(lordB).includes(sB)
  if (ownA !== ownB) return ownA ? lordA : lordB

  // Step 3: exaltation vs debilitation
  const exA = EXALTATION_SIGN[lordA] === sA
  const exB = EXALTATION_SIGN[lordB] === sB
  const dbA = DEBILITATION_SIGN[lordA] === sA
  const dbB = DEBILITATION_SIGN[lordB] === sB
  if (exA !== exB) return exA ? lordA : lordB
  if (dbA !== dbB) return dbA ? lordB : lordA   // debilitated = weaker

  // Step 4: sign nature — Dual > Fixed > Movable
  const order: Record<SignNature, number> = { movable: 0, fixed: 1, dual: 2 }
  const nA = order[SIGN_NATURE[sA]], nB = order[SIGN_NATURE[sB]]
  if (nA !== nB) return nA > nB ? lordA : lordB

  // Step 5: higher sign number wins
  return sA >= sB ? lordA : lordB
}

// ─── SP.5 Arudha Lagna Calculator ─────────────────────────────────────────

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

// ─── SP.6 Ghati Lagna Calculator ──────────────────────────────────────────

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

// ─── SP.7 Bhava Lagna Calculator ──────────────────────────────────────────

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

// ─── SP.8 Hora Lagna Calculator ───────────────────────────────────────────

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

// ─── SP.9 Charakaraka Calculator ──────────────────────────────────────────

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

// ─── SP.10 Main Aggregator ────────────────────────────────────────────────

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
    charakarakas: calculateCharakarakas(planets),
  }
}

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

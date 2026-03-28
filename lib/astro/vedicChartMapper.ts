// STATUS: done | Task SP.15 (Mapper), OA.8
/**
 * lib/astro/vedicChartMapper.ts
 * Maps raw VedicChart (legacy rawResponse format) OR VedicChartCalculations
 * (new library format) → the typed inputs that calculateSpecialPoints() needs.
 *
 * Path 1: confirmed top-level fields (lagnaSignNumber, planets, sunriseData)
 * Path 2: rawResponse.chartD1 (old VedicChart wrapper format)
 * Path 3: VedicChartCalculations (new library format — planets as object dict)
 */

import SunCalc from 'suncalc'
import type { VedicChart, VedicPlanet } from '@/lib/astro/types'
import type { NatalLagnaInfo, SignNumber, PlanetName, PlanetPosition } from '@/types'

// ─── Lookup tables ────────────────────────────────────────────────────────

const SIGN_NUMBER: Record<string, SignNumber> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4, leo: 5, virgo: 6,
  libra: 7, scorpio: 8, sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
}

const PLANET_NAME_MAP: Record<string, PlanetName> = {
  sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury',
  jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn',
  rahu: 'Rahu', ketu: 'Ketu',
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Parse "DD:MM:SS" or "D:MM:SS" DMS string → { deg, min, sec } */
function parseDMS(dms: string): { deg: number; min: number; sec: number } {
  const parts = dms.split(':').map(s => parseInt(s, 10))
  return { deg: parts[0] ?? 0, min: parts[1] ?? 0, sec: parts[2] ?? 0 }
}

/** Map a VedicPlanet to PlanetPosition. Returns null for unknown names/signs. */
export function mapVedicPlanet(p: VedicPlanet): PlanetPosition | null {
  const planet = PLANET_NAME_MAP[p.name.toLowerCase()]
  const signNumber = SIGN_NUMBER[p.sign.toLowerCase()]
  if (!planet || !signNumber) return null

  const { min, sec } = parseDMS(p.degreeDMSFormatted)
  return {
    planet,
    signNumber,
    degreeInSign: Math.floor(p.degree),
    arcMinutes:   min,
    arcSeconds:   sec,
  }
}

// ─── Sunrise calculator (OA.8 — suncalc) ─────────────────────────────────

/**
 * Accurate sunrise time (UTC decimal hours) using the suncalc library.
 * Falls back to 6.0 for polar dates where sunrise is undefined.
 *
 * @param year / month / day  — birth date components in UTC
 * @param latDeg              — birth latitude (positive = North)
 * @param lonDeg              — birth longitude (positive = East)
 * @returns sunrise hour in UTC (decimal); 6.0 as fallback for polar extremes
 */
export function calcSunriseUTC(
  year: number,
  month: number,
  day: number,
  latDeg: number,
  lonDeg: number
): number {
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const times = SunCalc.getTimes(date, latDeg, lonDeg)
  const sunrise = times.sunrise
  if (isNaN(sunrise.getTime())) return 6.0 // polar fallback
  return sunrise.getUTCHours() + sunrise.getUTCMinutes() / 60 + sunrise.getUTCSeconds() / 3600
}

// ─── Library format mapper (Path 3) ──────────────────────────────────────

/** Map a single planet from VedicChartCalculations.planets dict to PlanetPosition. */
function mapVedicPlanetFromLibrary(
  key: string,
  p: import('openastrology-library').PlanetPosition
): PlanetPosition | null {
  const planet = PLANET_NAME_MAP[key.toLowerCase()]
  if (!planet) return null
  const signNumber = SIGN_NUMBER[(p.sign ?? '').toLowerCase()]
  if (!signNumber) return null
  const { min, sec } = parseDMS(p.degreeDMSFormatted ?? '0:0:0')
  return {
    planet,
    signNumber,
    degreeInSign: Math.floor(p.degree ?? 0),
    arcMinutes:   min,
    arcSeconds:   sec,
  }
}

// ─── Main mapper ──────────────────────────────────────────────────────────

export interface SpecialPointsInputs {
  lagnaSignNumber:              SignNumber
  planets:                      PlanetPosition[]
  sunAbsoluteLongitudeAtSunrise: number
  minutesSinceSunrise:          number
}

/**
 * Extract the four inputs required by calculateSpecialPoints() from a stored
 * VedicChart + birth profile fields.
 *
 * Strategy:
 *   1. If the top-level confirmed fields exist (lagnaSignNumber, planets,
 *      sunriseData) on the chart object, use them directly.
 *   2. Otherwise, map from rawResponse.chartD1 and compute sunrise from
 *      birth coordinates + UTC birth time.
 *
 * Returns null if essential data (ascendant, ≥8 planets) is absent.
 */
export function extractSpecialPointsInputs(
  vedicChartRaw: unknown,
  birthYear:  number,
  birthMonth: number,   // 1-12
  birthDay:   number,
  birthHourUTC:  number,  // 0-23
  birthMinuteUTC: number, // 0-59
  birthLatDeg:  number,
  birthLonDeg:  number
): SpecialPointsInputs | null {
  const raw = vedicChartRaw as Record<string, unknown>

  // ── Path 1: confirmed top-level fields ────────────────────────────────
  if (
    raw.lagnaSignNumber != null &&
    Array.isArray(raw.planets) &&
    raw.sunriseData != null
  ) {
    const sd = raw.sunriseData as Record<string, unknown>
    return {
      lagnaSignNumber:              raw.lagnaSignNumber as SignNumber,
      planets:                      raw.planets as PlanetPosition[],
      sunAbsoluteLongitudeAtSunrise: sd.sunAbsoluteLongitude as number,
      minutesSinceSunrise:          sd.minutesSinceSunrise   as number,
    }
  }

  // ── Path 3: VedicChartCalculations (new library format) ──────────────
  // Detect by: ascendant.sign is string AND planets is an object (not array) with no rawResponse
  if (
    typeof (raw.ascendant as Record<string, unknown>)?.sign === 'string' &&
    raw.planets !== null &&
    typeof raw.planets === 'object' &&
    !Array.isArray(raw.planets) &&
    raw.rawResponse == null
  ) {
    const chart = vedicChartRaw as import('openastrology-library').VedicChartCalculations
    const lagnaSignNumber = SIGN_NUMBER[(chart.ascendant.sign ?? '').toLowerCase()]
    if (!lagnaSignNumber) return null

    const planets = Object.entries(chart.planets)
      .map(([key, p]) => mapVedicPlanetFromLibrary(key, p))
      .filter((p): p is PlanetPosition => p !== null)

    const ckNames = new Set(['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu'])
    const ckPlanets = planets.filter(p => ckNames.has(p.planet))
    if (ckPlanets.length < 8) {
      console.warn('[extractSpecialPointsInputs] Fewer than 8 CK planets found:', ckPlanets.length)
      return null
    }

    const sunLongitude = chart.planets.sun?.longitude ?? 0
    const sunriseUTC = calcSunriseUTC(birthYear, birthMonth, birthDay, birthLatDeg, birthLonDeg)
    const birthTotalMin = birthHourUTC * 60 + birthMinuteUTC
    const sunriseTotalMin = sunriseUTC * 60
    const minutesSinceSunrise = Math.max(0, birthTotalMin - sunriseTotalMin)
    const sunLonAtSunrise = sunLongitude - minutesSinceSunrise * 0.000694

    return {
      lagnaSignNumber,
      planets,
      sunAbsoluteLongitudeAtSunrise: ((sunLonAtSunrise % 360) + 360) % 360,
      minutesSinceSunrise,
    }
  }

  // ── Path 2: map from rawResponse.chartD1 ──────────────────────────────
  const vedicChart = vedicChartRaw as VedicChart
  const d1 = vedicChart?.rawResponse?.chartD1
  if (!d1) return null

  // Lagna sign number
  const lagnaSignNumber = SIGN_NUMBER[d1.ascendant?.sign?.toLowerCase() ?? '']
  if (!lagnaSignNumber) return null

  // Planet positions
  const planets = d1.planets
    .map(mapVedicPlanet)
    .filter((p): p is PlanetPosition => p !== null)

  // Need at minimum Sun + 7 other CK planets (8 total for Charakarakas)
  const ckNames = new Set(['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu'])
  const ckPlanets = planets.filter(p => ckNames.has(p.planet))
  if (ckPlanets.length < 8) {
    console.warn('[extractSpecialPointsInputs] Fewer than 8 CK planets found:', ckPlanets.length)
    return null
  }

  // Sun's absolute longitude at birth (used to derive sunrise position)
  const sunPlanet = d1.planets.find(p => p.name.toLowerCase() === 'sun')
  if (!sunPlanet) return null
  const sunLongitudeAtBirth = sunPlanet.longitude

  // Sunrise time (UTC decimal hours)
  const sunriseUTC = calcSunriseUTC(birthYear, birthMonth, birthDay, birthLatDeg, birthLonDeg)

  // Minutes since sunrise
  const birthTotalMin = birthHourUTC * 60 + birthMinuteUTC
  const sunriseTotalMin = sunriseUTC * 60
  const minutesSinceSunrise = Math.max(0, birthTotalMin - sunriseTotalMin)

  // Sun's longitude at sunrise (approximate): back-adjust from birth position
  // Sun moves ~1°/day = 0.000694°/min
  const sunLonAtSunrise = sunLongitudeAtBirth - minutesSinceSunrise * 0.000694

  return {
    lagnaSignNumber,
    planets,
    sunAbsoluteLongitudeAtSunrise: ((sunLonAtSunrise % 360) + 360) % 360,
    minutesSinceSunrise,
  }
}

/**
 * Extract D1 ascendant sign and degree from stored chart (rawResponse.chartD1.ascendant
 * or top-level chartD1). Returns null if ascendant cannot be read; caller may fall back
 * to lagnaSignNumber from extractSpecialPointsInputs.
 */
export function extractNatalLagnaInfo(vedicChartRaw: unknown): NatalLagnaInfo | null {
  const raw = vedicChartRaw as Record<string, unknown>

  // Path 3: VedicChartCalculations format (ascendant at top level with .sign and .degree)
  if (
    typeof (raw.ascendant as Record<string, unknown>)?.sign === 'string' &&
    typeof (raw.ascendant as Record<string, unknown>)?.degree === 'number' &&
    raw.rawResponse == null
  ) {
    const asc = raw.ascendant as { sign: string; degree: number; degreeDMSFormatted?: string }
    const signNumber = SIGN_NUMBER[asc.sign.toLowerCase()]
    if (!signNumber) return null
    const { min, sec } = parseDMS(asc.degreeDMSFormatted ?? '0:0:0')
    return {
      signNumber,
      degreeInSign: Math.floor(asc.degree),
      arcMinutes:   min,
      arcSeconds:   sec,
    }
  }

  // Path 1/2: rawResponse.chartD1 or top-level chartD1
  const rawResp = raw.rawResponse as Record<string, unknown> | undefined
  const d1 = (rawResp?.chartD1 ?? raw.chartD1) as { ascendant?: { sign: string; degree: number; degreeDMSFormatted: string } } | undefined
  const asc = d1?.ascendant
  if (!asc?.sign) return null
  const signNumber = SIGN_NUMBER[asc.sign.toLowerCase()]
  if (!signNumber) return null
  const { min, sec } = parseDMS(asc.degreeDMSFormatted ?? '0:0:0')
  return {
    signNumber,
    degreeInSign: Math.floor(asc.degree),
    arcMinutes:   min,
    arcSeconds:   sec,
  }
}

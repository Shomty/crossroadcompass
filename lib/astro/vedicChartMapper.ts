// STATUS: done | Task SP.15 (Mapper)
/**
 * lib/astro/vedicChartMapper.ts
 * Maps raw VedicChart (from Jyotish REST API) → the typed inputs that
 * calculateSpecialPoints() needs.
 *
 * The API stores data as VedicChart.rawResponse (VedicBirthChartResponse).
 * Planet fields: name (lowercase), longitude (0-360), degree (0-30),
 *   degreeDMSFormatted ("DD:MM:SS"), sign (lowercase).
 * Ascendant: sign (lowercase).
 *
 * The "confirmed field names" in VedicChartData (lagnaSignNumber, planets,
 * sunriseData) may be present on charts that already have them set; this
 * mapper falls back to rawResponse when they are absent.
 */

import type { VedicChart, VedicPlanet } from '@/lib/astro/types'
import type { SignNumber, PlanetName, PlanetPosition } from '@/types'

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

// ─── Sunrise calculator ───────────────────────────────────────────────────

/**
 * Approximate sunrise time (UTC decimal hours) using:
 *   - Spencer equation-of-time correction
 *   - Standard solar declination formula
 *   - Standard refraction horizon: -0.8333°
 *
 * Accurate to ~5 minutes for mid-latitudes.
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
  // Day of year (1-365)
  const daysInPrevMonths = [0,0,31,59,90,120,151,181,212,243,273,304,334]
  const leapExtra = (month > 2 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 1 : 0
  const N = daysInPrevMonths[month]! + day + leapExtra

  // Solar declination (degrees)
  const declDeg = -23.45 * Math.cos((2 * Math.PI / 365) * (N + 10))
  const declRad  = declDeg * Math.PI / 180
  const latRad   = latDeg  * Math.PI / 180

  // Hour angle at sunrise (horizon at -0.8333° for atmospheric refraction)
  const cosHA = (Math.sin(-0.8333 * Math.PI / 180) - Math.sin(latRad) * Math.sin(declRad))
              / (Math.cos(latRad) * Math.cos(declRad))

  const HA_deg = (cosHA >= -1 && cosHA <= 1)
    ? Math.acos(cosHA) * 180 / Math.PI
    : 90   // polar fallback

  // Equation of time correction (minutes, Spencer formula)
  const B      = (2 * Math.PI / 365) * (N - 81)
  const EoT    = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)

  // Solar noon in UTC (hours): noon = 12 - lon/15 - EoT/60
  const solarNoonUTC = 12.0 - (lonDeg / 15) - (EoT / 60)

  // Sunrise = solar noon − hour angle / 15
  return solarNoonUTC - (HA_deg / 15)
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

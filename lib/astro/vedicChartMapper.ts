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
import type { NatalLagnaInfo, SignNumber, PlanetName, PlanetPosition, YogaChartInput } from '@/types'
import { planetAbsoluteLongitude } from '@/lib/astro/specialPoints'
import { computeBirthSolarContext } from '@/lib/astro/birthSolarContext'

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
export function mapVedicPlanetFromLibrary(
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
    isCombust:    typeof p.isCombust === 'boolean' ? p.isCombust : undefined,
    isRetrograde: typeof p.isRetrograde === 'boolean' ? p.isRetrograde : undefined,
  }
}

// ─── Main mapper ──────────────────────────────────────────────────────────

export interface ExtractSpecialPointsContext {
  /** IANA zone from BirthProfile — enables [GL-1] isDayBirth + consistent minutesSinceSunrise */
  timezoneIana?: string | null
}

export interface SpecialPointsInputs {
  lagnaSignNumber:               SignNumber
  planets:                       PlanetPosition[]
  sunAbsoluteLongitudeAtSunrise: number
  minutesSinceSunrise:           number
  /** Full D1 ascendant ecliptic longitude (0–360°). */
  lagnaAbsoluteLongitude:        number
  /** True when birth instant falls between sunrise and sunset on local civil date ([GL-1]). */
  isDayBirth:                    boolean
  /** (sunset − sunrise) / 60000 — for Kaal Velas validity. */
  daytimeDurationMinutes:        number
  /** 0 = Sunday … 6 = Saturday in profile timezone when available. */
  dayOfWeek:                     number
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

type PartialSpecialPointsInputs = Pick<
  SpecialPointsInputs,
  'lagnaSignNumber' | 'planets' | 'sunAbsoluteLongitudeAtSunrise' | 'minutesSinceSunrise'
>

function enrichSpecialPointsInputs(
  vedicChartRaw: unknown,
  partial: PartialSpecialPointsInputs,
  birthLatDeg: number,
  birthLonDeg: number,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  birthMinute: number,
  ctx?: ExtractSpecialPointsContext
): SpecialPointsInputs {
  const natal = extractNatalLagnaInfo(vedicChartRaw)
  const lagnaSyn: PlanetPosition = {
    planet: 'Sun',
    signNumber: natal?.signNumber ?? partial.lagnaSignNumber,
    degreeInSign: natal?.degreeInSign ?? 0,
    arcMinutes:   natal?.arcMinutes ?? 0,
    arcSeconds:   natal?.arcSeconds ?? 0,
  }
  const lagnaAbsoluteLongitude = planetAbsoluteLongitude(lagnaSyn)

  let isDayBirth = true
  let daytimeDurationMinutes = 12 * 60
  let dayOfWeek = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay, 12, 0, 0)).getUTCDay()
  let minutesSinceSunrise = partial.minutesSinceSunrise

  const tz = ctx?.timezoneIana
  if (tz) {
    const solar = computeBirthSolarContext(
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute,
      birthLatDeg,
      birthLonDeg,
      tz
    )
    if (solar) {
      isDayBirth = solar.isDayBirth
      daytimeDurationMinutes = solar.daytimeDurationMinutes
      dayOfWeek = solar.dayOfWeek
      minutesSinceSunrise = Math.max(
        0,
        (solar.birthUtc.getTime() - solar.sunriseUtc.getTime()) / 60000
      )
    }
  }

  return {
    ...partial,
    lagnaAbsoluteLongitude,
    isDayBirth,
    daytimeDurationMinutes,
    dayOfWeek,
    minutesSinceSunrise,
  }
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
 *
 * @param birthHourUTC / birthMinuteUTC — wall time as stored on the profile (same as HD/Vedic libs);
 *   when `ctx.timezoneIana` is set, combined with date for true zoned instant vs SunCalc.
 */
export function extractSpecialPointsInputs(
  vedicChartRaw: unknown,
  birthYear:  number,
  birthMonth: number,   // 1-12
  birthDay:   number,
  birthHourUTC:  number,  // 0-23
  birthMinuteUTC: number, // 0-59
  birthLatDeg:  number,
  birthLonDeg:  number,
  ctx?: ExtractSpecialPointsContext
): SpecialPointsInputs | null {
  const raw = vedicChartRaw as Record<string, unknown>

  type PartialInputs = Pick<
    SpecialPointsInputs,
    'lagnaSignNumber' | 'planets' | 'sunAbsoluteLongitudeAtSunrise' | 'minutesSinceSunrise'
  >
  let partial: PartialInputs | null = null

  // ── Path 1: confirmed top-level fields ────────────────────────────────
  if (
    raw.lagnaSignNumber != null &&
    Array.isArray(raw.planets) &&
    raw.sunriseData != null
  ) {
    const sd = raw.sunriseData as Record<string, unknown>
    partial = {
      lagnaSignNumber:               raw.lagnaSignNumber as SignNumber,
      planets:                       raw.planets as PlanetPosition[],
      sunAbsoluteLongitudeAtSunrise: sd.sunAbsoluteLongitude as number,
      minutesSinceSunrise:           sd.minutesSinceSunrise as number,
    }
  }

  // ── Path 3: VedicChartCalculations (new library format) ──────────────
  if (
    partial === null &&
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

    partial = {
      lagnaSignNumber,
      planets,
      sunAbsoluteLongitudeAtSunrise: ((sunLonAtSunrise % 360) + 360) % 360,
      minutesSinceSunrise,
    }
  }

  // ── Path 2: map from rawResponse.chartD1 ──────────────────────────────
  if (partial === null) {
    const vedicChart = vedicChartRaw as VedicChart
    const d1 = vedicChart?.rawResponse?.chartD1
    if (!d1) return null

    const lagnaSignNumber = SIGN_NUMBER[d1.ascendant?.sign?.toLowerCase() ?? '']
    if (!lagnaSignNumber) return null

    const planets = d1.planets
      .map(mapVedicPlanet)
      .filter((p): p is PlanetPosition => p !== null)

    const ckNames = new Set(['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu'])
    const ckPlanets = planets.filter(p => ckNames.has(p.planet))
    if (ckPlanets.length < 8) {
      console.warn('[extractSpecialPointsInputs] Fewer than 8 CK planets found:', ckPlanets.length)
      return null
    }

    const sunPlanet = d1.planets.find(p => p.name.toLowerCase() === 'sun')
    if (!sunPlanet) return null
    const sunLongitudeAtBirth = sunPlanet.longitude

    const sunriseUTC = calcSunriseUTC(birthYear, birthMonth, birthDay, birthLatDeg, birthLonDeg)
    const birthTotalMin = birthHourUTC * 60 + birthMinuteUTC
    const sunriseTotalMin = sunriseUTC * 60
    const minutesSinceSunrise = Math.max(0, birthTotalMin - sunriseTotalMin)
    const sunLonAtSunrise = sunLongitudeAtBirth - minutesSinceSunrise * 0.000694

    partial = {
      lagnaSignNumber,
      planets,
      sunAbsoluteLongitudeAtSunrise: ((sunLonAtSunrise % 360) + 360) % 360,
      minutesSinceSunrise,
    }
  }

  if (!partial) return null

  return enrichSpecialPointsInputs(
    vedicChartRaw,
    partial,
    birthLatDeg,
    birthLonDeg,
    birthYear,
    birthMonth,
    birthDay,
    birthHourUTC,
    birthMinuteUTC,
    ctx
  )
}

const CK_EIGHT = new Set<PlanetName>([
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
])

/**
 * Lagna + planet rows for Parashara yoga detection (no sunrise / special-points fields).
 * Paths mirror extractSpecialPointsInputs; requires ≥8 charakaraka grahas when mappable.
 */
export function extractYogaChartInput(vedicChartRaw: unknown): YogaChartInput | null {
  const raw = vedicChartRaw as Record<string, unknown>

  // Path 1: confirmed top-level
  if (raw.lagnaSignNumber != null && Array.isArray(raw.planets)) {
    const planets = raw.planets as PlanetPosition[]
    const ck = planets.filter((p) => CK_EIGHT.has(p.planet))
    if (ck.length < 8) {
      console.warn('[extractYogaChartInput] Path 1: fewer than 8 CK planets:', ck.length)
      return null
    }
    return {
      lagnaSignNumber: raw.lagnaSignNumber as SignNumber,
      planets,
    }
  }

  // Path 3: VedicChartCalculations
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
    const ck = planets.filter((p) => CK_EIGHT.has(p.planet))
    if (ck.length < 8) {
      console.warn('[extractYogaChartInput] Path 3: fewer than 8 CK planets:', ck.length)
      return null
    }
    return { lagnaSignNumber, planets }
  }

  // Path 2: rawResponse.chartD1
  const vedicChart = vedicChartRaw as VedicChart
  const d1 = vedicChart?.rawResponse?.chartD1
  if (!d1) return null
  const lagnaSignNumber = SIGN_NUMBER[d1.ascendant?.sign?.toLowerCase() ?? '']
  if (!lagnaSignNumber) return null
  const planets = d1.planets
    .map(mapVedicPlanet)
    .filter((p): p is PlanetPosition => p !== null)
  const ck = planets.filter((p) => CK_EIGHT.has(p.planet))
  if (ck.length < 8) {
    console.warn('[extractYogaChartInput] Path 2: fewer than 8 CK planets:', ck.length)
    return null
  }
  return { lagnaSignNumber, planets }
}

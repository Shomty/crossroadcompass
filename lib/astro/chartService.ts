// STATUS: done | Tasks 3.3, 3.4, 3.5, SP.11, SP.12, OA.3, OA.4
/**
 * lib/astro/chartService.ts
 * Orchestrator: KV cache-check → calculate/fetch → store in KV → return.
 * All callers use the public functions below.
 * Nothing else calls the HD library or Vedic calculators directly.
 *
 * Caching:
 *   HD chart    — KV, no TTL, invalidated when birth data changes (3.3)
 *   Vedic chart — KV, no TTL, invalidated when birth data changes (3.3)
 *   Transits    — KV, 24h TTL (OA transit)
 */

import { InsightType, type BirthProfile } from "@prisma/client";
import { calculateHDChart } from "@/lib/astro/hdCalculator";
import { getVedicCalculator, getWesternCalculator } from "@/lib/astro/calculatorService";
import { prismaProfileToBirthInfo } from "@/lib/astro/birthInfoMapper";
import { storeDashasFromChart } from "@/lib/astro/dashaService";
import { kvGet, kvSet, kvDeleteMany } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { db } from "@/lib/db";
import type { BirthInfo, HDChartData, SpecialPointsResult, ExtendedSpecialPointsResult, KaalVelaSetResult, SignNumber, YogaDetectionResult, PlanetName } from "@/types";
import type { VedicChartCalculations, WesternChartCalculations, PlanetDasha } from "openastrology-library";
import {
  calculateSpecialPoints,
  calculateExtendedSpecialPoints,
  calculateKaalVelas,
  planetAbsoluteLongitude,
} from "@/lib/astro/specialPoints";
import {
  extractSpecialPointsInputs,
  extractNatalLagnaInfo,
  type SpecialPointsInputs,
} from "@/lib/astro/vedicChartMapper";
import {
  attachExtendedPlacements,
  attachFoundationPlacements,
} from "@/lib/astro/vedicPointPlacement";
import { extractYogaChartInput } from "@/lib/astro/vedicChartMapper";
import { detectAllYogas, normalizeDashaLord } from "@/lib/astro/yoga/aggregate";

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Convert a Prisma BirthProfile to the BirthInfo shape the HD library expects (UTC). */
function profileToBirthInfo(profile: BirthProfile): BirthInfo {
  const d = new Date(profile.birthDate);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    // Use noon (12:00) when birth time is unknown — partial profile per OB-04
    hour: profile.birthTimeKnown ? (profile.birthHour ?? 12) : 12,
    minute: profile.birthTimeKnown ? (profile.birthMinute ?? 0) : 0,
    second: 0,
    latitude: profile.latitude,
    longitude: profile.longitude,
  };
}

/** Export PlanetDasha type for consumers */
export type { PlanetDasha };

// ─── Task 3.3 — Cache invalidation ───────────────────────────────────────

/**
 * Delete all KV cache keys for a user.
 * Call this whenever birth data changes — stale charts are a content
 * correctness bug. See copilot-instructions section 19.
 * Does NOT touch transit keys — those expire automatically (24h TTL).
 */
export async function invalidateChartCache(userId: string): Promise<void> {
  await Promise.all([
    kvDeleteMany([
      kvKeys.vedicChart(userId),
      kvKeys.hdChart(userId),
      kvKeys.dashas(userId),
      kvKeys.specialPoints(userId),
      kvKeys.specialPointsLegacy(userId),
      kvKeys.specialPointsInsights(userId),
      kvKeys.extendedSpecialPoints(userId),
      kvKeys.extendedSpecialPointsLegacy(userId),
      kvKeys.divisionalCharts(userId),
      kvKeys.currentDasha(userId),
      kvKeys.yogas(userId),
      kvKeys.ashtakavarga(userId),
      kvKeys.westernNatalChart(userId),
    ]),
    db.insight.deleteMany({
      where: { userId, type: InsightType.SPECIAL_POINTS },
    }),
  ]);
}

// ─── Task 3.4 — HD chart: get or calculate ───────────────────────────────

/**
 * Returns the HD chart for a user, using KV cache when available.
 * Calculates and caches on miss. birthProfile is passed in — this
 * function does NOT query the DB itself.
 */
export async function getOrCreateHDChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<HDChartData> {
  // ── Layer 1: KV hot cache ────────────────────────────────────────────────
  const cached = await kvGet<HDChartData>(kvKeys.hdChart(userId));
  if (cached !== null) return cached;

  // ── Layer 2: DB durable store ────────────────────────────────────────────
  const dbProfile = await db.birthProfile.findUnique({
    where: { userId },
    select: { chartDataHumanDesign: true, hdProfileVersion: true, profileVersion: true },
  });

  if (
    dbProfile?.chartDataHumanDesign != null &&
    dbProfile.hdProfileVersion === dbProfile.profileVersion
  ) {
    const chartData = dbProfile.chartDataHumanDesign as unknown as HDChartData;
    await kvSet(kvKeys.hdChart(userId), chartData, KV_TTL.NATAL_CHART);
    return chartData;
  }

  // ── Layer 3: Calculate (local, no external API cost) ────────────────────
  const birthInfo = profileToBirthInfo(birthProfile);
  const chart = calculateHDChart(birthInfo);

  // Persist to DB — survives KV eviction; only re-calculated when profileVersion changes
  await db.birthProfile.update({
    where: { userId },
    data: {
      chartDataHumanDesign: chart as object,
      hdProfileVersion: birthProfile.profileVersion,
    },
  });

  await kvSet(kvKeys.hdChart(userId), chart, KV_TTL.NATAL_CHART);

  return chart;
}

// ─── Task 3.5 / OA.3 — Vedic natal chart: get or calculate ──────────────

/**
 * Guard: returns true only when `data` looks like a fresh openastrology-library
 * VedicChartCalculations (has `planets`). Rejects old rawResponse-based format
 * stored before the library migration.
 */
function isValidVedicChart(data: unknown): data is VedicChartCalculations {
  if (data == null || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return 'planets' in d && d.planets != null;
}

/**
 * Returns the Vedic natal chart for a user, using KV cache when available.
 * Calculates locally via openastrology-library on cache miss.
 * birthProfile is passed in — this function does NOT query the DB itself.
 */
export async function getOrCreateVedicChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<VedicChartCalculations> {
  // ── Layer 1: KV hot cache ────────────────────────────────────────────────
  const cached = await kvGet<VedicChartCalculations>(kvKeys.vedicChart(userId));

  if (cached !== null && isValidVedicChart(cached)) {
    // Chart is cached — but dashas may not have been stored yet.
    const dashaCount = await db.dasha.count({ where: { userId } });
    if (dashaCount === 0) {
      await storeDashasFromChart(userId, cached);
    }
    return cached;
  }

  // ── Layer 2: DB durable store ────────────────────────────────────────────
  const dbProfile = await db.birthProfile.findUnique({
    where: { userId },
    select: { chartDataVedic: true, vedicProfileVersion: true, profileVersion: true },
  });

  if (
    dbProfile?.chartDataVedic != null &&
    dbProfile.vedicProfileVersion === dbProfile.profileVersion &&
    isValidVedicChart(dbProfile.chartDataVedic)
  ) {
    const chartData = dbProfile.chartDataVedic as unknown as VedicChartCalculations;
    await kvSet(kvKeys.vedicChart(userId), chartData, KV_TTL.NATAL_CHART);
    const dashaCount = await db.dasha.count({ where: { userId } });
    if (dashaCount === 0) {
      await storeDashasFromChart(userId, chartData);
    }
    return chartData;
  }

  // ── Layer 3: Calculate fresh using library ───────────────────────────────
  const birthInfo = prismaProfileToBirthInfo(birthProfile);
  const calculator = getVedicCalculator();
  const chart = await calculator.calculateChart(birthInfo);

  // Await dasha storage — must complete before caller queries the dasha table
  await storeDashasFromChart(userId, chart);

  // Persist to DB — survives KV eviction; only re-calculated when profileVersion changes
  await db.birthProfile.update({
    where: { userId },
    data: {
      chartDataVedic: chart as unknown as object,
      vedicProfileVersion: birthProfile.profileVersion,
      vedicAscendantSign: chart.ascendant?.sign ?? null,
      vedicSunSign: chart.planets.sun?.sign ?? null,
      vedicMoonSign: chart.planets.moon?.sign ?? null,
      vedicMahaDasha: null, // populated separately from dasha table
    },
  });

  await kvSet(kvKeys.vedicChart(userId), chart, KV_TTL.NATAL_CHART);
  return chart;
}

// ─── OA transit — Today's transit chart ─────────────────────────────────

/**
 * Western natal chart for a user, using KV cache.
 * Calculated using WesternAstrologyCalculator with birth date/time/location.
 * Cached permanently — invalidated only when birth data changes.
 */
export async function getOrCreateWesternNatalChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<WesternChartCalculations> {
  const cached = await kvGet<WesternChartCalculations>(kvKeys.westernNatalChart(userId));
  if (cached !== null) return cached;

  const birthInfo = prismaProfileToBirthInfo(birthProfile);
  const calculator = getWesternCalculator();
  const chart = await calculator.calculateChart({
    dateOfBirth: birthInfo.dateOfBirth,
    timeOfBirth: birthInfo.timeOfBirth ?? '12:00',
    latitude: birthInfo.latitude,
    longitude: birthInfo.longitude,
    timezone: birthInfo.timezone ?? 'UTC',
  } as Parameters<typeof calculator.calculateChart>[0]);

  await kvSet(kvKeys.westernNatalChart(userId), chart, KV_TTL.NATAL_CHART);
  return chart;
}

export type TransitCacheOptions = {
  latOverride?: number
  lngOverride?: number
  tzOverride?: string
  /** When set, overrides default 24h TTL (used by cron lookahead pre-cache). */
  ttlSeconds?: number
}

/**
 * Sidereal transit chart for a civil calendar date in the user's timezone
 * (`localDateYmd` = YYYY-MM-DD). Uses noon local wall time via `timeOfBirth: 12:00`
 * and observation coordinates — same contract as today's transits.
 *
 * API: `VedicAstrologyCalculator.calculateChart` from openastrology-library.
 */
export async function getOrCreateTransitsForLocalCalendarDate(
  userId: string,
  profile: BirthProfile,
  localDateYmd: string,
  options?: TransitCacheOptions
): Promise<VedicChartCalculations> {
  const cacheKey = kvKeys.transit(userId, localDateYmd)
  const cached = await kvGet<VedicChartCalculations>(cacheKey)
  if (cached !== null) return cached

  const latitude =
    options?.latOverride ?? (profile.observationLatitude ?? profile.latitude)
  const longitude =
    options?.lngOverride ?? (profile.observationLongitude ?? profile.longitude)

  const transitBirthInfo = {
    ...prismaProfileToBirthInfo(profile),
    dateOfBirth: localDateYmd,
    timeOfBirth: '12:00',
    latitude,
    longitude,
  }

  const calculator = getVedicCalculator()
  const transitChart = await calculator.calculateChart(transitBirthInfo)
  const ttl = options?.ttlSeconds ?? KV_TTL.TRANSIT_SECONDS
  await kvSet(cacheKey, transitChart, ttl)
  return transitChart
}

/**
 * Returns today's transit chart for a user, using KV cache when available.
 * "Today" is resolved in the user's timezone.
 */
export async function getOrCreateTodayTransits(
  userId: string,
  profile: BirthProfile,
  latOverride?: number,
  lngOverride?: number,
  tzOverride?: string
): Promise<VedicChartCalculations> {
  const timezone = tzOverride ?? profile.timezone
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())

  return getOrCreateTransitsForLocalCalendarDate(userId, profile, today, {
    latOverride,
    lngOverride,
    tzOverride,
  })
}

// ─── OA.5 — Divisional charts ────────────────────────────────────────────

/**
 * Returns all divisional charts (D2–D60) for a user, derived from the natal D1 chart.
 */
export async function getOrCreateDivisionalCharts(
  userId: string,
  birthProfile: BirthProfile
): Promise<Record<string, VedicChartCalculations>> {
  const cacheKey = kvKeys.divisionalCharts(userId)
  const cached = await kvGet<Record<string, VedicChartCalculations>>(cacheKey)
  if (cached !== null) return cached

  const natalChart = await getOrCreateVedicChart(userId, birthProfile)
  const calculator = getVedicCalculator()
  const divisionalCharts = calculator.calculateAllDivisionalCharts(natalChart)
  await kvSet(cacheKey, divisionalCharts, KV_TTL.NATAL_CHART)
  return divisionalCharts
}

// ─── OA.6 — Current dasha helper ─────────────────────────────────────────

/**
 * Returns the currently active Maha and Antardasha from a VedicChartCalculations.
 */
export function getChartCurrentDasha(chart: VedicChartCalculations): {
  mahaDasha?: PlanetDasha
  antarDasha?: PlanetDasha
} {
  return getVedicCalculator().getCurrentDasha(chart.dashas.vimshottari, new Date())
}

// ─── SP.11 — Derive special points from stored chart + birth profile ──────

/**
 * Derive special points from a VedicChart and birth profile data.
 * Uses vedicChartMapper to handle both confirmed-field and rawResponse formats.
 * Returns null with a warning if essential data is missing.
 */
export function deriveSpecialPoints(
  vedicChartRaw: unknown,
  birthYear:      number,
  birthMonth:     number,
  birthDay:       number,
  birthHourUTC:   number,
  birthMinuteUTC: number,
  birthLatDeg:    number,
  birthLonDeg:    number,
  timezoneIana?:  string | null
): SpecialPointsResult | null {
  const inputs = extractSpecialPointsInputs(
    vedicChartRaw,
    birthYear, birthMonth, birthDay,
    birthHourUTC, birthMinuteUTC,
    birthLatDeg, birthLonDeg,
    { timezoneIana: timezoneIana ?? undefined }
  )

  if (!inputs) {
    console.warn('[deriveSpecialPoints] Could not extract inputs from chart data')
    return null
  }

  try {
    const result = calculateSpecialPoints(
      inputs.lagnaSignNumber,
      inputs.planets,
      inputs.sunAbsoluteLongitudeAtSunrise,
      inputs.minutesSinceSunrise,
      {
        isDayBirth: inputs.isDayBirth,
        udayaLagnaLongitude: inputs.lagnaAbsoluteLongitude,
      }
    )
    const natalFromChart = extractNatalLagnaInfo(vedicChartRaw)
    const natalLagna = natalFromChart ?? { signNumber: inputs.lagnaSignNumber }
    const withNatal = { ...result, natalLagna }
    return attachFoundationPlacements(withNatal, inputs)
  } catch (err) {
    console.error('[deriveSpecialPoints] Calculation error:', err)
    return null
  }
}

// ─── SP.12 — KV-cached special points ────────────────────────────────────

/**
 * Returns special points for a user, with three fallback layers:
 *   1. KV cache (SpecialPointsResult)
 *   2. KV Vedic chart → derive
 *   3. DB chartDataVedic → derive
 * No TTL on the cached result — invalidated when birth profile changes.
 */
export async function getOrCreateSpecialPoints(
  userId: string
): Promise<SpecialPointsResult | null> {
  const cacheKey = kvKeys.specialPoints(userId)

  // Layer 1: cached result
  const cached = await kvGet<SpecialPointsResult>(cacheKey)
  if (cached !== null) return cached

  // Need birth profile for sunrise calculation
  const birthProfile = await db.birthProfile.findUnique({
    where: { userId },
    select: {
      birthDate:      true,
      birthHour:      true,
      birthMinute:    true,
      birthTimeKnown: true,
      latitude:       true,
      longitude:      true,
      timezone:       true,
    },
  })
  if (!birthProfile) return null

  const d = new Date(birthProfile.birthDate)
  const hour   = birthProfile.birthTimeKnown ? (birthProfile.birthHour   ?? 12) : 12
  const minute = birthProfile.birthTimeKnown ? (birthProfile.birthMinute ?? 0)  : 0

  // Layer 2: Vedic chart from KV (only if it's valid new-library format)
  const kvChart = await kvGet<unknown>(kvKeys.vedicChart(userId))
  let vedicChartRaw: unknown = isValidVedicChart(kvChart) ? kvChart : null

  // Layer 3: Vedic chart from DB (only if it's valid new-library format)
  if (!vedicChartRaw) {
    const dbProfile = await db.birthProfile.findUnique({
      where: { userId },
      select: { chartDataVedic: true },
    })
    if (!dbProfile?.chartDataVedic || !isValidVedicChart(dbProfile.chartDataVedic)) {
      console.warn(`[getOrCreateSpecialPoints] No valid Vedic chart for user ${userId}`)
      return null
    }
    vedicChartRaw = dbProfile.chartDataVedic
  }

  const result = deriveSpecialPoints(
    vedicChartRaw,
    d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
    hour, minute,
    birthProfile.latitude, birthProfile.longitude,
    birthProfile.timezone
  )

  if (result) {
    await kvSet(cacheKey, result)
  }
  return result
}

function retagYogaDashaFromChart(
  result: YogaDetectionResult,
  chart: VedicChartCalculations
): YogaDetectionResult {
  const cur = getChartCurrentDasha(chart)
  const maha = normalizeDashaLord(String(cur.mahaDasha?.planet ?? ""))
  const antar = normalizeDashaLord(String(cur.antarDasha?.planet ?? ""))
  const lords = [maha, antar].filter(Boolean) as PlanetName[]
  return {
    ...result,
    yogas: result.yogas.map((y) => ({
      ...y,
      dashaActivated: lords.some((l) => y.planetsInvolved.includes(l)),
    })),
  }
}

/**
 * KV-cached Parashara yoga bundle. `dashaActivated` is refreshed from the current
 * Vimshottari period on every read; base yogas invalidate with chart cache.
 */
export async function getOrCreateYogas(userId: string): Promise<YogaDetectionResult | null> {
  const kvChart = await kvGet<unknown>(kvKeys.vedicChart(userId))
  let vedicChartRaw: unknown = isValidVedicChart(kvChart) ? kvChart : null
  if (!vedicChartRaw) {
    const dbProfile = await db.birthProfile.findUnique({
      where: { userId },
      select: { chartDataVedic: true },
    })
    if (!dbProfile?.chartDataVedic || !isValidVedicChart(dbProfile.chartDataVedic)) {
      console.warn(`[getOrCreateYogas] No valid Vedic chart for user ${userId}`)
      return null
    }
    vedicChartRaw = dbProfile.chartDataVedic
  }

  const chart = vedicChartRaw as VedicChartCalculations
  const cacheKey = kvKeys.yogas(userId)
  const cached = await kvGet<YogaDetectionResult>(cacheKey)
  if (cached !== null) {
    return retagYogaDashaFromChart(cached, chart)
  }

  const input = extractYogaChartInput(vedicChartRaw)
  if (!input) return null

  const cur = getChartCurrentDasha(chart)
  const maha = normalizeDashaLord(String(cur.mahaDasha?.planet ?? ""))
  const antar = normalizeDashaLord(String(cur.antarDasha?.planet ?? ""))
  const result = detectAllYogas(input, maha, antar)
  await kvSet(cacheKey, result)
  return result
}

// ─── SP-EXT.9 — Extended special points ──────────────────────────────────

/**
 * Extended points from the same `SpecialPointsInputs` as foundation special points
 * (supports rawResponse.chartD1 when top-level normalized fields are absent).
 */
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
  const sunNatalLongitude = planetAbsoluteLongitude(sunPlanet)
  const gulikaLongitude =
    kaalVelaSetResult?.gulika?.referenceLongitude
    ?? kaalVelaSetResult?.gulika?.midpointLongitude
    ?? null

  try {
    const extended = calculateExtendedSpecialPoints(
      inputs.lagnaSignNumber,
      horaLagnaSignNumber,
      inputs.planets,
      inputs.sunAbsoluteLongitudeAtSunrise,
      sunNatalLongitude,
      inputs.minutesSinceSunrise,
      gulikaLongitude,
      kaalVelaSetResult
    )
    return attachExtendedPlacements(extended, inputs)
  } catch (err) {
    console.error('[deriveExtendedSpecialPoints] Calculation error:', err)
    return null
  }
}

export async function getOrCreateExtendedSpecialPoints(
  userId: string
): Promise<ExtendedSpecialPointsResult | null> {
  const cacheKey = kvKeys.extendedSpecialPoints(userId)
  const cached   = await kvGet<ExtendedSpecialPointsResult>(cacheKey)
  if (cached !== null) return cached

  const basePoints = await getOrCreateSpecialPoints(userId)
  if (!basePoints) {
    console.warn('[getOrCreateExtendedSpecialPoints] Base special points unavailable')
    return null
  }
  const horaLagnaSignNumber = basePoints.horaLagna.horaLagnaSignNumber

  let vedicChartRaw: unknown = await kvGet<unknown>(kvKeys.vedicChart(userId))
  if (!vedicChartRaw) {
    const dbProfile = await db.birthProfile.findUnique({
      where: { userId },
      select: { chartDataVedic: true },
    })
    if (!dbProfile?.chartDataVedic) {
      console.warn(`[getOrCreateExtendedSpecialPoints] No Vedic chart for user ${userId}`)
      return null
    }
    vedicChartRaw = dbProfile.chartDataVedic
  }

  const birthProfile = await db.birthProfile.findUnique({
    where: { userId },
    select: {
      birthDate: true,
      birthHour: true,
      birthMinute: true,
      birthTimeKnown: true,
      latitude: true,
      longitude: true,
      timezone: true,
    },
  })
  if (!birthProfile) {
    console.warn(`[getOrCreateExtendedSpecialPoints] No birth profile for user ${userId}`)
    return null
  }

  const d = new Date(birthProfile.birthDate)
  const hour   = birthProfile.birthTimeKnown ? (birthProfile.birthHour   ?? 12) : 12
  const minute = birthProfile.birthTimeKnown ? (birthProfile.birthMinute ?? 0)  : 0

  const inputs = extractSpecialPointsInputs(
    vedicChartRaw,
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    hour,
    minute,
    birthProfile.latitude,
    birthProfile.longitude,
    { timezoneIana: birthProfile.timezone }
  )
  if (!inputs) {
    console.warn(
      '[getOrCreateExtendedSpecialPoints] Could not extract chart inputs for extended points (check rawResponse / chartD1)'
    )
    return null
  }

  let kaalVelaSetResult: KaalVelaSetResult | null = null
  try {
    if (inputs.daytimeDurationMinutes > 0) {
      kaalVelaSetResult = calculateKaalVelas(
        inputs.lagnaAbsoluteLongitude,
        inputs.daytimeDurationMinutes,
        inputs.dayOfWeek
      )
    }
  } catch (err) {
    console.warn('[getOrCreateExtendedSpecialPoints] Kaal Vela calculation failed:', err)
  }

  const result = deriveExtendedSpecialPoints(inputs, horaLagnaSignNumber, kaalVelaSetResult)
  if (result) {
    await kvSet(cacheKey, result)
  }
  return result
}

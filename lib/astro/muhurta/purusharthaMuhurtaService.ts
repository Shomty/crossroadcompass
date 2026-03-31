/**
 * Puruṣārtha Muhūrta scan: Swiss Ephemeris (via openastrology-library) at each slot,
 * Pañcāṅga + Pañcaka śuddhi + Gaṇḍānta + Lagna lord house filter.
 */

import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { BirthInfo, VedicChartCalculations } from "openastrology-library";
import type { PlanetName, SignNumber } from "@/types";
import { getVedicCalculator } from "@/lib/astro/calculatorService";
import { getPrimaryLord } from "@/lib/astro/specialPoints";
import { siderealLongitudesFromOpenAstrologyChart } from "@/lib/astro/muhurta/planetLongitudesFromVedicChart";
import { computePanchanga } from "@/lib/astro/muhurta/panchanga";
import { scorePanchakaShuddhi } from "@/lib/astro/muhurta/panchakaShuddhi";
import { isMoonGandanta } from "@/lib/astro/muhurta/gandanta";
import type {
  PurusharthaMuhurtaDetailResponse,
  PurusharthaMuhurtaSlotSummary,
} from "@/types";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { extractMuhurtaChartInput } from "@/lib/astro/muhurta/chartInput";
import { computeSamudayaAshtakavarga } from "@/lib/astro/muhurta/ashtakavargaCalculator";
import { getNakshatra } from "@/lib/astro/muhurta/panchanga";
import { planetAbsoluteLongitude } from "@/lib/astro/specialPoints";
import { computeWeightedPurusharthaScore } from "@/lib/astro/muhurta/purusharthaWeightedScore";

const OA_PLANET: Record<PlanetName, string> = {
  Sun: "sun",
  Moon: "moon",
  Mars: "mars",
  Mercury: "mercury",
  Jupiter: "jupiter",
  Venus: "venus",
  Saturn: "saturn",
  Rahu: "rahu",
  Ketu: "ketu",
};

const SIGN_NUMBER: Record<string, SignNumber> = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
};

/** Preferred step when the window is short enough to stay within {@link PURUSHARTHA_MAX_CHART_CALLS}. */
export const PURUSHARTHA_INTERVAL_MIN = 5;
export const PURUSHARTHA_MAX_HOURS = 24;
/** Keeps one scan under typical serverless CPU limits (each slot = one `calculateChart`). */
export const PURUSHARTHA_MAX_CHART_CALLS = 72;

const STEP_CANDIDATES_MIN = [5, 10, 15, 20, 30] as const;

/**
 * Pick a slot size (minutes) so the number of chart calculations stays bounded.
 */
export function resolveScanIntervalMinutes(windowHours: number): number {
  const hours = Math.min(
    PURUSHARTHA_MAX_HOURS,
    Math.max(1, Math.floor(windowHours))
  );
  const totalMinutes = hours * 60;
  const minStep = Math.ceil(totalMinutes / PURUSHARTHA_MAX_CHART_CALLS);
  const step = STEP_CANDIDATES_MIN.find((s) => s >= minStep);
  return step ?? 30;
}

function birthInfoForInstant(
  d: Date,
  latitude: number,
  longitude: number,
  timeZone: string
): BirthInfo {
  return {
    name: "Muhūrta",
    dateOfBirth: formatInTimeZone(d, timeZone, "yyyy-MM-dd"),
    timeOfBirth: formatInTimeZone(d, timeZone, "HH:mm"),
    latitude,
    longitude,
    timezone: timeZone,
    gender: "male",
  };
}

function weekdayIndexSunday0(d: Date, timeZone: string): number {
  const z = toZonedTime(d, timeZone);
  return z.getDay();
}

function lagnaLordHouseFromChart(
  chart: VedicChartCalculations,
  lagnaSign: SignNumber
): { lord: PlanetName; house: number | null } {
  const lord = getPrimaryLord(lagnaSign);
  const key = OA_PLANET[lord];
  const pos = chart.planets[key as keyof typeof chart.planets];
  const house = pos?.house ?? null;
  return { lord, house };
}

function lagnaLordAvoidsDusthana(house: number | null): boolean {
  if (house === null) return false;
  return house !== 6 && house !== 8 && house !== 12;
}

export interface ScanPurusharthaParams {
  startUtc: Date;
  timeZone: string;
  latitude: number;
  longitude: number;
  windowHours: number;
  /** Logged-in user: loads natal chart for Tara / SAV / dusthana / Sade Sati. */
  userId: string;
  /** Minutes between slots; default from {@link resolveScanIntervalMinutes}. */
  intervalMinutes?: number;
}

/**
 * Natal snapshot + Samudaya Aṣṭakavarga for Puruṣārtha personalization.
 * Returns null if no profile or chart cannot be built.
 */
export async function loadPurusharthaPersonalContext(
  userId: string
): Promise<
  import("@/lib/astro/muhurta/purusharthaPersonalFilters").PurusharthaPersonalContextLoaded | null
> {
  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) return null;
  try {
    const chart = await getOrCreateVedicChart(userId, profile);
    const extracted = extractMuhurtaChartInput(chart);
    if (!extracted) return null;
    const moon = extracted.planets.find((p) => p.planet === "Moon");
    if (!moon) return null;
    const sav = computeSamudayaAshtakavarga(
      extracted.planets,
      extracted.lagnaSignNumber
    );
    const janmaLon = planetAbsoluteLongitude(moon);
    const { index0to26 } = getNakshatra(janmaLon);
    return {
      janmaNakshatraIndex0to26: index0to26,
      natalLagnaSign: extracted.lagnaSignNumber,
      natalMoonSign: moon.signNumber,
      rekhasBySign: sav.rekhasBySign,
    };
  } catch {
    return null;
  }
}

export interface ScanPurusharthaResult {
  slots: PurusharthaMuhurtaSlotSummary[];
  intervalMinutes: number;
}

export async function scanPurusharthaWindows(
  params: ScanPurusharthaParams
): Promise<ScanPurusharthaResult> {
  const hours = Math.min(
    PURUSHARTHA_MAX_HOURS,
    Math.max(1, Math.floor(params.windowHours))
  );
  const intervalMinutes =
    params.intervalMinutes ?? resolveScanIntervalMinutes(hours);
  const personalContext = await loadPurusharthaPersonalContext(params.userId);
  const calc = getVedicCalculator();
  const slots: PurusharthaMuhurtaSlotSummary[] = [];
  const startMs = params.startUtc.getTime();
  const stepMs = intervalMinutes * 60 * 1000;
  const endMs = startMs + hours * 60 * 60 * 1000;

  for (let t = startMs; t < endMs; t += stepMs) {
    const d = new Date(t);
    const birthInfo = birthInfoForInstant(
      d,
      params.latitude,
      params.longitude,
      params.timeZone
    );
    const chart = await calc.calculateChart(birthInfo);
    const longitudes = siderealLongitudesFromOpenAstrologyChart(chart);
    const sun = longitudes.Sun;
    const moon = longitudes.Moon;
    const jupiter = longitudes.Jupiter;
    const venus = longitudes.Venus;
    const mars = longitudes.Mars;
    const saturn = longitudes.Saturn;
    if (
      sun === undefined ||
      moon === undefined ||
      jupiter === undefined ||
      venus === undefined ||
      mars === undefined ||
      saturn === undefined
    ) {
      continue;
    }

    const ascSignStr = chart.ascendant?.sign?.toLowerCase();
    const lagnaSign = ascSignStr ? SIGN_NUMBER[ascSignStr] : null;
    if (!lagnaSign) continue;

    const wd = weekdayIndexSunday0(d, params.timeZone);
    const limbs = computePanchanga(sun, moon, wd);
    const panchaka = scorePanchakaShuddhi(limbs);
    const gandanta = isMoonGandanta(moon);
    const { lord: lagnaLord, house: lordHouse } = lagnaLordHouseFromChart(chart, lagnaSign);
    const lagnaStrong = lagnaLordAvoidsDusthana(lordHouse);
    const w = computeWeightedPurusharthaScore({
      limbs,
      transitMoonLongitude: moon,
      jupiterLongitude: jupiter,
      venusLongitude: venus,
      marsLongitude: mars,
      saturnLongitude: saturn,
      gandanta: gandanta.active,
      panchakaScore: panchaka.score,
      context: personalContext,
    });

    slots.push({
      startIso: d.toISOString(),
      score: w.score,
      heatTier: w.heatTier,
      electionScore: w.panchakaReferenceScore,
      personalization: w.personalization,
      savMoonSignPoints: w.savMoonSignPoints,
      savBand: w.savBand,
      greenEligible: w.greenEligible,
      taraFault: w.taraFault,
      taraNaidhana: w.taraNaidhana,
      taraNumber: w.taraNumber,
      mantraRequired: w.mantraRequired,
      mantraWarning: w.mantraWarning,
      remedyHint: w.remedyHint,
      sadeSatiHeavy: w.sadeSatiHeavy,
      tithiLabel: `${limbs.tithi.sanskritName} (${limbs.tithi.paksha}, ${limbs.tithi.indexInPaksha1to15}/15)`,
      nakshatraLabel: `${limbs.nakshatra.sanskritName} · pāda ${limbs.nakshatra.pada1to4}`,
      yogaLabel: limbs.yoga.sanskritName,
      karanaLabel: limbs.karana.name,
      vaaraLabel: limbs.vaara.sanskritName,
      lagnaSignNumber: lagnaSign,
      lagnaLord,
      lagnaLordHouse: lordHouse,
      lagnaLordStrong: lagnaStrong,
      gandanta: gandanta.active,
      gandantaReason: gandanta.reason,
      panchakaDeductions: panchaka.deductions,
    });
  }

  return { slots, intervalMinutes };
}

export async function computePurusharthaDetail(
  instantUtc: Date,
  timeZone: string,
  latitude: number,
  longitude: number,
  userId: string
): Promise<PurusharthaMuhurtaDetailResponse> {
  const personalContext = await loadPurusharthaPersonalContext(userId);
  const calc = getVedicCalculator();
  const birthInfo = birthInfoForInstant(instantUtc, latitude, longitude, timeZone);
  const chart = await calc.calculateChart(birthInfo);
  const longitudes = siderealLongitudesFromOpenAstrologyChart(chart);
  const sun = longitudes.Sun ?? 0;
  const moon = longitudes.Moon ?? 0;
  const jupiter = longitudes.Jupiter ?? 0;
  const venus = longitudes.Venus ?? 0;
  const mars = longitudes.Mars ?? 0;
  const saturn = longitudes.Saturn ?? 0;

  const ascSignStr = chart.ascendant?.sign?.toLowerCase();
  const lagnaSign = ascSignStr ? SIGN_NUMBER[ascSignStr] : (1 as SignNumber);

  const wd = weekdayIndexSunday0(instantUtc, timeZone);
  const limbs = computePanchanga(sun, moon, wd);
  const panchaka = scorePanchakaShuddhi(limbs);
  const gandanta = isMoonGandanta(moon);
  const { lord: lagnaLord, house: lordHouse } = lagnaLordHouseFromChart(chart, lagnaSign);
  const lagnaStrong = lagnaLordAvoidsDusthana(lordHouse);
  const w = computeWeightedPurusharthaScore({
    limbs,
    transitMoonLongitude: moon,
    jupiterLongitude: jupiter,
    venusLongitude: venus,
    marsLongitude: mars,
    saturnLongitude: saturn,
    gandanta: gandanta.active,
    panchakaScore: panchaka.score,
    context: personalContext,
  });

  return {
    instantIso: instantUtc.toISOString(),
    score: w.score,
    heatTier: w.heatTier,
    electionScore: w.panchakaReferenceScore,
    personalization: w.personalization,
    savMoonSignPoints: w.savMoonSignPoints,
    savBand: w.savBand,
    greenEligible: w.greenEligible,
    taraFault: w.taraFault,
    taraNaidhana: w.taraNaidhana,
    taraNumber: w.taraNumber,
    mantraRequired: w.mantraRequired,
    mantraWarning: w.mantraWarning,
    remedyHint: w.remedyHint,
    sadeSatiHeavy: w.sadeSatiHeavy,
    weightedBreakdown: w.breakdown,
    chart,
    limbs: {
      tithi: {
        label: `${limbs.tithi.sanskritName} (${limbs.tithi.paksha})`,
        index1to30: limbs.tithi.index1to30,
        indexInPaksha: limbs.tithi.indexInPaksha1to15,
      },
      nakshatra: {
        label: `${limbs.nakshatra.sanskritName} · pāda ${limbs.nakshatra.pada1to4}`,
        index0to26: limbs.nakshatra.index0to26,
      },
      yoga: limbs.yoga.sanskritName,
      karana: limbs.karana.name,
      vaara: limbs.vaara.sanskritName,
    },
    lagnaSignNumber: lagnaSign,
    lagnaLord,
    lagnaLordHouse: lordHouse,
    lagnaLordStrong: lagnaStrong,
    gandanta: gandanta.active,
    gandantaReason: gandanta.reason,
    panchakaScore: panchaka.score,
    panchakaDeductions: panchaka.deductions,
  };
}

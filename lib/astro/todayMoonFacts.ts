/**
 * Structured Jyotish facts for "Today's Moon" AI interpretation.
 * Pure functions — no KV, no Gemini.
 */

import type { VedicChartCalculations } from "openastrology-library";
import {
  buildDailyMoonJudgment,
  formatLocalCalendarDateYmd,
  type LunarPhaseEnergy,
} from "@/lib/astro/dailyMoonJudgment";
import { computePanchanga } from "@/lib/astro/muhurta/panchanga";
import { resolveSafeTimeZone } from "@/lib/astro/muhurta/safeTime";
import { siderealLongitudesFromOpenAstrologyChart } from "@/lib/astro/muhurta/planetLongitudesFromVedicChart";
import { formatVedicTransitSummary } from "@/lib/astro/vedicTransitPrompt";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/** Sunday = 0 … Saturday = 6 for `ymd` as a calendar day in `timeZone`. */
export function weekdayIndex0SunForYmd(ymd: string, timeZone: string): number {
  const tz = resolveSafeTimeZone(timeZone);
  const utcInstant = fromZonedTime(`${ymd} 12:00:00`, tz);
  const isoDow = parseInt(formatInTimeZone(utcInstant, tz, "i"), 10);
  if (!Number.isFinite(isoDow) || isoDow < 1 || isoDow > 7) return 0;
  return isoDow % 7;
}

export interface TodayMoonFacts {
  localCalendarDate: string;
  timezone: string;
  /** Flat text block for the model */
  panchangaBlock: string;
  transitGrahaBlock: string;
  natalMoonSign: string;
  natalMoonNakshatra: string;
  natalMoonPada: number | null;
  natalMoonHouseFromLagna: number | null;
  transitMoonSign: string;
  transitMoonNakshatra: string;
  transitMoonPada: number | null;
  houseFromChandra: number;
  lunarPhaseEnergy: LunarPhaseEnergy;
  dashaMahadasha: string | null;
  dashaAntardasha: string | null;
  samudayaRekhasInTransitMoonRasi: number | null;
}

export interface BuildTodayMoonFactsOptions {
  dashaMahadasha?: string | null;
  dashaAntardasha?: string | null;
  samudayaRekhasInTransitMoonRasi?: number | null;
}

/**
 * Assembles panchāṅga, gochara summary, Chandra-bhāva, phase, optional dasha / Aṣṭakavarga.
 */
export function buildTodayMoonFacts(
  natal: VedicChartCalculations,
  transit: VedicChartCalculations,
  timeZone: string,
  localYmd?: string,
  options?: BuildTodayMoonFactsOptions
): TodayMoonFacts | null {
  const ymd = localYmd ?? formatLocalCalendarDateYmd(timeZone);
  const lon = siderealLongitudesFromOpenAstrologyChart(transit);
  const sunLon = lon.Sun;
  const moonLon = lon.Moon;
  if (sunLon == null || moonLon == null) return null;

  const judgment = buildDailyMoonJudgment(natal, transit);
  if (!judgment) return null;

  const limbs = computePanchanga(sunLon, moonLon, weekdayIndex0SunForYmd(ymd, timeZone));

  const panchangaBlock = [
    `Vāra: ${limbs.vaara.sanskritName}`,
    `Tithi: ${limbs.tithi.sanskritName} (${limbs.tithi.paksha}, ${limbs.tithi.indexInPaksha1to15}/15; index 1–30: ${limbs.tithi.index1to30})`,
    `Nakṣatra (Chandra): ${limbs.nakshatra.sanskritName} · pāda ${limbs.nakshatra.pada1to4}`,
    `Yoga: ${limbs.yoga.sanskritName} (${limbs.yoga.index1to27}/27)`,
    `Karaṇa: ${limbs.karana.name}${limbs.karana.isVishti ? " (Viṣṭi/Bhadra)" : ""}`,
  ].join("\n");

  const nm = natal.planets?.moon;
  const tm = transit.planets?.moon;
  const natalPada = nm?.nakshatraPada ?? nm?.pada ?? null;
  const transitPada = tm?.nakshatraPada ?? tm?.pada ?? null;

  return {
    localCalendarDate: ymd,
    timezone: timeZone,
    panchangaBlock,
    transitGrahaBlock: formatVedicTransitSummary(transit),
    natalMoonSign: nm?.sign ?? "unknown",
    natalMoonNakshatra: nm?.nakshatra ?? "",
    natalMoonPada: typeof natalPada === "number" ? natalPada : null,
    natalMoonHouseFromLagna:
      typeof nm?.house === "number" && nm.house >= 1 && nm.house <= 12 ? nm.house : null,
    transitMoonSign: tm?.sign ?? "unknown",
    transitMoonNakshatra: tm?.nakshatra ?? "",
    transitMoonPada: typeof transitPada === "number" ? transitPada : null,
    houseFromChandra: judgment.houseFromMoon,
    lunarPhaseEnergy: judgment.phaseEnergy,
    dashaMahadasha: options?.dashaMahadasha ?? null,
    dashaAntardasha: options?.dashaAntardasha ?? null,
    samudayaRekhasInTransitMoonRasi: options?.samudayaRekhasInTransitMoonRasi ?? null,
  };
}

/** Compact JSON string for Gemini user prompt. */
export function todayMoonFactsToPromptJson(facts: TodayMoonFacts): string {
  return JSON.stringify(facts, null, 2);
}

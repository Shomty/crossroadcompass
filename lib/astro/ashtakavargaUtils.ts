import type { HouseInfo, HouseNumber, VedicChartCalculations, ZodiacSign } from "openastrology-library";

const SIGNS: ZodiacSign[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

const SARVA_PLANETS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"] as const;

/** Same normalization as NatalChartGrid — JSON may omit houses or use string keys. */
function getHouseSign(chart: VedicChartCalculations, h: HouseNumber): ZodiacSign | undefined {
  const raw = chart.houses as unknown;
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    return (raw as HouseInfo[])[h - 1]?.sign;
  }
  const o = raw as Record<string | number, HouseInfo | undefined>;
  return o[h]?.sign ?? o[String(h)]?.sign;
}

/** Sum per-house Sarva bindus (library stores per-planet arrays indexed by sign). */
export function sarvaByHouse(chart: VedicChartCalculations): Record<number, number> {
  const result: Record<number, number> = {};
  const sarvaRoot = chart.ashtakavarga?.sarva;
  for (let h = 1; h <= 12; h++) {
    const sign = getHouseSign(chart, h as HouseNumber);
    const idx = sign != null ? SIGNS.indexOf(sign) : -1;
    if (idx < 0 || !sarvaRoot) {
      result[h] = 0;
      continue;
    }
    let sum = 0;
    for (const pk of SARVA_PLANETS) {
      const arr = sarvaRoot[pk];
      if (Array.isArray(arr)) sum += arr[idx] ?? 0;
    }
    result[h] = sum;
  }
  return result;
}

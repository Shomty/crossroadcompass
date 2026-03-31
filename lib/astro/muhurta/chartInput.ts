/**
 * Lagna + natal planets for personalized Muhurta (no Charakaraka count gate).
 */

import type { Planet as OaPlanet, VedicChartCalculations } from "openastrology-library";
import type { PlanetPosition, SignNumber } from "@/types";
import { mapVedicPlanetFromLibrary } from "@/lib/astro/vedicChartMapper";

const SIGN_NUMBER: Record<string, SignNumber> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4, leo: 5, virgo: 6,
  libra: 7, scorpio: 8, sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
};

const OA_PLANET_KEYS: OaPlanet[] = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
  "rahu",
  "ketu",
];

export function extractMuhurtaChartInput(
  chart: VedicChartCalculations
): { lagnaSignNumber: SignNumber; planets: PlanetPosition[] } | null {
  const asc = chart.ascendant;
  if (!asc || typeof asc.sign !== "string") return null;

  const lagnaSignNumber = SIGN_NUMBER[asc.sign.toLowerCase()];
  if (!lagnaSignNumber) return null;

  if (!chart.planets || typeof chart.planets !== "object") return null;

  const planets: PlanetPosition[] = [];
  for (const key of OA_PLANET_KEYS) {
    const pos = chart.planets[key];
    if (!pos) continue;
    const mapped = mapVedicPlanetFromLibrary(key, pos);
    if (mapped) planets.push(mapped);
  }

  if (planets.length < 9) return null;

  return { lagnaSignNumber, planets };
}

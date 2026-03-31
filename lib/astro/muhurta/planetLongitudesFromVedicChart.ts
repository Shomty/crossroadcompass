// STATUS: done | Shared helpers for future Muhurta Finder engine (MH-E)
/**
 * Bridges openastrology-library transit charts (KV / `VedicChartCalculations`)
 * to app `PlanetName` keys and sidereal ecliptic longitudes (0–360).
 *
 * Template variables such as `vedic_sun_sign` are derived separately in
 * `reportTemplateVars`; consumers that already hold a full chart should use
 * `longitude` from `chart.planets` directly.
 */

import type { Planet as OaPlanet, VedicChartCalculations } from "openastrology-library";
import type { PlanetName } from "@/types";

const OA_PLANETS: OaPlanet[] = [
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

const OA_TO_APP: Record<OaPlanet, PlanetName> = {
  sun: "Sun",
  moon: "Moon",
  mars: "Mars",
  mercury: "Mercury",
  jupiter: "Jupiter",
  venus: "Venus",
  saturn: "Saturn",
  rahu: "Rahu",
  ketu: "Ketu",
};

/** Absolute sidereal longitudes for grahas present in the transit (or natal) chart. */
export function siderealLongitudesFromOpenAstrologyChart(
  chart: VedicChartCalculations
): Partial<Record<PlanetName, number>> {
  const out: Partial<Record<PlanetName, number>> = {};
  for (const key of OA_PLANETS) {
    const lon = chart.planets[key]?.longitude;
    if (typeof lon === "number" && Number.isFinite(lon)) {
      out[OA_TO_APP[key]] = lon;
    }
  }
  return out;
}

import type { Planet, VedicChartCalculations } from "openastrology-library";
import type { PlanetPosition } from "@node-jhora/core";
import type { JhoraUiChartProps } from "@/lib/chart/mapJhoraChartToUiReact";

/** Swiss-style ids expected by @node-jhora/ui-react tooling (Ketu synthetic). */
const JHORA_IDS: Record<Planet, number> = {
  sun: 0,
  moon: 1,
  mercury: 2,
  venus: 3,
  mars: 4,
  jupiter: 5,
  saturn: 6,
  rahu: 11,
  ketu: 99,
};

const DISPLAY_NAMES: Record<Planet, string> = {
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

const GRAHAS: Planet[] = [
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

function norm360(lon: number): number {
  const x = lon % 360;
  return x < 0 ? x + 360 : x;
}

/**
 * Feed @node-jhora/ui-react charts from the same engine as NatalChartGrid
 * (openastrology-library + Swiss Ephemeris), so positions match the planet table.
 */
export function mapVedicChartToJhoraUi(
  chart: VedicChartCalculations
): JhoraUiChartProps | null {
  if (!chart.planets || chart.ascendant == null) return null;

  const planets: PlanetPosition[] = [];

  for (const key of GRAHAS) {
    const p = chart.planets[key];
    if (!p) return null;
    const rawSpeed = p.speed ?? 0;
    let speed = rawSpeed;
    if (p.isRetrograde) {
      speed = rawSpeed > 0 ? -rawSpeed : rawSpeed === 0 ? -1e-9 : rawSpeed;
    } else if (rawSpeed === 0) {
      speed = 1e-9;
    }

    planets.push({
      id: JHORA_IDS[key],
      name: DISPLAY_NAMES[key],
      longitude: norm360(p.longitude),
      latitude: p.latitude ?? 0,
      distance: 0,
      speed,
      declination: 0,
    });
  }

  return {
    planets,
    ascendant: norm360(chart.ascendant.longitude),
  };
}

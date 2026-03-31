import { describe, it, expect } from "vitest";
import type { VedicChartCalculations } from "openastrology-library";
import { siderealLongitudesFromOpenAstrologyChart } from "@/lib/astro/muhurta/planetLongitudesFromVedicChart";

function minimalChart(
  longitudes: Partial<Record<string, number>>
): VedicChartCalculations {
  const base = {
    sun: { longitude: 0 },
    moon: { longitude: 0 },
    mars: { longitude: 0 },
    mercury: { longitude: 0 },
    jupiter: { longitude: 0 },
    venus: { longitude: 0 },
    saturn: { longitude: 0 },
    rahu: { longitude: 0 },
    ketu: { longitude: 0 },
  };
  for (const [k, v] of Object.entries(longitudes)) {
    if (k in base) {
      (base as Record<string, { longitude: number }>)[k] = { longitude: v };
    }
  }
  return {
    planets: base,
  } as unknown as VedicChartCalculations;
}

describe("siderealLongitudesFromOpenAstrologyChart", () => {
  it("maps OA lowercase grahas to app PlanetName and copies longitude", () => {
    const chart = minimalChart({ sun: 123.45, moon: 200, ketu: 20 });
    const out = siderealLongitudesFromOpenAstrologyChart(chart);
    expect(out.Sun).toBe(123.45);
    expect(out.Moon).toBe(200);
    expect(out.Ketu).toBe(20);
    expect(out.Mars).toBe(0);
  });
});

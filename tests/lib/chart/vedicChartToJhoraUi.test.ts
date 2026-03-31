import { describe, it, expect } from "vitest";
import type { Planet, VedicChartCalculations } from "openastrology-library";
import { mapVedicChartToJhoraUi } from "@/lib/chart/vedicChartToJhoraUi";

function stubPlanet(
  longitude: number,
  isRetrograde: boolean,
  speed: number
): VedicChartCalculations["planets"]["sun"] {
  return {
    name: "Sun",
    longitude,
    latitude: 0,
    sign: "aries",
    degree: longitude % 30,
    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
    degreeDMSFormatted: "",
    nakshatra: "ashwini",
    nakshatraPada: 1,
    pada: 1,
    house: 1,
    isRetrograde,
    isCombust: false,
    speed,
    dignity: "",
    aspects: [],
  };
}

const KEYS: Planet[] = [
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

describe("mapVedicChartToJhoraUi", () => {
  it("maps nine grahas and ascendant; normalizes negative longitude", () => {
    const planets = {} as VedicChartCalculations["planets"];
    KEYS.forEach((k, i) => {
      planets[k] = stubPlanet(i * 10, false, 1);
    });
    const chart = {
      planets,
      ascendant: {
        sign: "leo" as const,
        degree: 5,
        degreeDMSFormatted: "",
        nakshatra: "magha",
        longitude: -10,
        nakshatraPada: 1,
      },
    } as unknown as VedicChartCalculations;

    const out = mapVedicChartToJhoraUi(chart);
    expect(out).not.toBeNull();
    expect(out!.planets).toHaveLength(9);
    expect(out!.ascendant).toBeCloseTo(350, 5);
    expect(out!.planets[0]!.longitude).toBe(0);
  });

  it("returns null when a graha is missing", () => {
    const planets = { sun: stubPlanet(0, false, 1) } as unknown as VedicChartCalculations["planets"];
    const chart = {
      planets,
      ascendant: { longitude: 10 },
    } as unknown as VedicChartCalculations;
    expect(mapVedicChartToJhoraUi(chart)).toBeNull();
  });

  it("maps divisional-style longitudes (not D1-specific)", () => {
    const planets = {} as VedicChartCalculations["planets"];
    KEYS.forEach((k, i) => {
      planets[k] = stubPlanet(100 + i * 3, false, 1);
    });
    const chart = {
      planets,
      ascendant: {
        sign: "cancer" as const,
        degree: 15,
        degreeDMSFormatted: "",
        nakshatra: "pushya",
        longitude: 255,
        nakshatraPada: 2,
      },
    } as unknown as VedicChartCalculations;

    const out = mapVedicChartToJhoraUi(chart);
    expect(out).not.toBeNull();
    expect(out!.ascendant).toBeCloseTo(255, 5);
    expect(out!.planets[0]!.longitude).toBeCloseTo(100, 5);
    expect(out!.planets[8]!.longitude).toBeCloseTo(124, 5);
  });

  it("forces negative speed when retrograde and speed was positive", () => {
    const planets = {} as VedicChartCalculations["planets"];
    KEYS.forEach((k, i) => {
      const retro = k === "saturn";
      planets[k] = stubPlanet(i * 10, retro, retro ? 0.05 : 1);
    });
    const chart = {
      planets,
      ascendant: { longitude: 100 },
    } as unknown as VedicChartCalculations;

    const out = mapVedicChartToJhoraUi(chart);
    const saturn = out!.planets.find((p) => p.name === "Saturn");
    expect(saturn!.speed).toBeLessThan(0);
  });
});

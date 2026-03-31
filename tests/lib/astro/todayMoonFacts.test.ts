import { describe, it, expect } from "vitest";
import type { VedicChartCalculations } from "openastrology-library";
import {
  buildTodayMoonFacts,
  weekdayIndex0SunForYmd,
} from "@/lib/astro/todayMoonFacts";

function minimalCharts(): { natal: VedicChartCalculations; transit: VedicChartCalculations } {
  const baseMoon = (sign: string, lon: number, nak: string) => ({
    name: "moon" as const,
    longitude: lon,
    latitude: 0,
    sign: sign as "aries",
    degree: lon % 30,
    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
    degreeDMSFormatted: "0:0:0",
    nakshatra: nak as "ashwini",
    nakshatraPada: 1,
    pada: 1,
    house: 4,
    isRetrograde: false,
    isCombust: false,
    speed: 13,
    dignity: "",
    aspects: [],
  });
  const baseSun = (lon: number) => ({
    name: "sun" as const,
    longitude: lon,
    latitude: 0,
    sign: "aries" as const,
    degree: lon % 30,
    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
    degreeDMSFormatted: "0:0:0",
    nakshatra: "ashwini" as const,
    nakshatraPada: 1,
    pada: 1,
    house: 1,
    isRetrograde: false,
    isCombust: false,
    speed: 1,
    dignity: "",
    aspects: [],
  });
  const empty = {} as VedicChartCalculations["planets"]["mars"];
  const mk = (moonSign: string, moonLon: number, moonNak: string, sunLon: number) =>
    ({
      birthDateUtc: new Date(),
      planets: {
        sun: baseSun(sunLon),
        moon: baseMoon(moonSign, moonLon, moonNak),
        mars: empty,
        mercury: empty,
        jupiter: empty,
        venus: empty,
        saturn: empty,
        rahu: empty,
        ketu: empty,
      },
      houses: {} as VedicChartCalculations["houses"],
      yogas: [],
      ayanamsa: 24,
      ascendant: {
        sign: "aries",
        degree: 0,
        degreeDMSFormatted: "0:0:0",
        nakshatra: "ashwini",
        longitude: 0,
        nakshatraPada: 1,
      },
      ashtakavarga: {} as VedicChartCalculations["ashtakavarga"],
      dashas: {} as VedicChartCalculations["dashas"],
    }) as VedicChartCalculations;

  return {
    natal: mk("cancer", 94, "pushya", 30),
    transit: mk("virgo", 165, "hasta", 35),
  };
}

describe("weekdayIndex0SunForYmd", () => {
  it("returns 0-6 for a known calendar day in UTC", () => {
    const w = weekdayIndex0SunForYmd("2026-03-31", "UTC");
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(6);
  });
});

describe("buildTodayMoonFacts", () => {
  it("includes panchanga, Chandra house, phase, and optional rekhas", () => {
    const { natal, transit } = minimalCharts();
    const f = buildTodayMoonFacts(natal, transit, "UTC", "2026-03-15", {
      dashaMahadasha: "Saturn",
      dashaAntardasha: "Mercury",
      samudayaRekhasInTransitMoonRasi: 28,
    });
    expect(f).not.toBeNull();
    if (!f) return;
    expect(f.panchangaBlock).toContain("Tithi:");
    expect(f.panchangaBlock).toContain("Yoga:");
    expect(f.transitGrahaBlock).toContain("Today's sidereal snapshot");
    expect(f.houseFromChandra).toBeGreaterThanOrEqual(1);
    expect(f.houseFromChandra).toBeLessThanOrEqual(12);
    expect(["new", "waxing", "full", "waning"]).toContain(f.lunarPhaseEnergy);
    expect(f.dashaMahadasha).toBe("Saturn");
    expect(f.samudayaRekhasInTransitMoonRasi).toBe(28);
    expect(f.natalMoonHouseFromLagna).toBe(4);
  });

  it("returns null when transit longitudes are missing", () => {
    const { natal, transit } = minimalCharts();
    const broken = {
      ...transit,
      planets: {
        ...transit.planets,
        moon: { ...transit.planets.moon, longitude: NaN },
      },
    } as VedicChartCalculations;
    expect(buildTodayMoonFacts(natal, broken, "UTC")).toBeNull();
  });
});

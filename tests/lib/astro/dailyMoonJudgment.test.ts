import { describe, it, expect } from "vitest";
import type { VedicChartCalculations } from "openastrology-library";
import {
  buildDailyMoonJudgment,
  formatLocalCalendarDateYmd,
  formatMoonContextLine,
  lunarPhaseEnergyFromAngle,
} from "@/lib/astro/dailyMoonJudgment";

function moonSunChart(
  moon: { sign: string; longitude: number; nakshatra?: string; nakshatraPada?: number },
  sunLon: number
): VedicChartCalculations {
  return {
    birthDateUtc: new Date(),
    planets: {
      sun: {
        name: "sun",
        longitude: sunLon,
        latitude: 0,
        sign: "aries",
        degree: 0,
        degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
        degreeDMSFormatted: "0:0:0",
        nakshatra: "ashwini",
        nakshatraPada: 1,
        pada: 1,
        house: 1,
        isRetrograde: false,
        isCombust: false,
        speed: 1,
        dignity: "",
        aspects: [],
      },
      moon: {
        name: "moon",
        longitude: moon.longitude,
        latitude: 0,
        sign: moon.sign as "aries",
        degree: moon.longitude % 30,
        degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
        degreeDMSFormatted: "0:0:0",
        nakshatra: (moon.nakshatra ?? "ashwini") as "ashwini",
        nakshatraPada: moon.nakshatraPada ?? 1,
        pada: moon.nakshatraPada ?? 1,
        house: 1,
        isRetrograde: false,
        isCombust: false,
        speed: 13,
        dignity: "",
        aspects: [],
      },
      mars: {} as VedicChartCalculations["planets"]["mars"],
      mercury: {} as VedicChartCalculations["planets"]["mercury"],
      jupiter: {} as VedicChartCalculations["planets"]["jupiter"],
      venus: {} as VedicChartCalculations["planets"]["venus"],
      saturn: {} as VedicChartCalculations["planets"]["saturn"],
      rahu: {} as VedicChartCalculations["planets"]["rahu"],
      ketu: {} as VedicChartCalculations["planets"]["ketu"],
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
  };
}

describe("lunarPhaseEnergyFromAngle", () => {
  it("classifies new, waxing, full, waning", () => {
    expect(lunarPhaseEnergyFromAngle(0)).toBe("new");
    expect(lunarPhaseEnergyFromAngle(90)).toBe("waxing");
    expect(lunarPhaseEnergyFromAngle(180)).toBe("full");
    expect(lunarPhaseEnergyFromAngle(270)).toBe("waning");
  });
});

describe("formatMoonContextLine", () => {
  it("formats sign, nakshatra, pada", () => {
    expect(
      formatMoonContextLine({
        sign: "cancer",
        nakshatra: "pushya",
        nakshatraPada: 3,
      })
    ).toBe("Cancer · Pushya P3");
  });
});

describe("buildDailyMoonJudgment", () => {
  it("returns house 1 when transit Moon shares natal Moon sign", () => {
    const natal = moonSunChart(
      { sign: "cancer", longitude: 100, nakshatra: "pushya", nakshatraPada: 2 },
      40
    );
    const transit = moonSunChart(
      { sign: "cancer", longitude: 105, nakshatra: "pushya", nakshatraPada: 3 },
      45
    );
    const j = buildDailyMoonJudgment(natal, transit);
    expect(j).not.toBeNull();
    expect(j!.houseFromMoon).toBe(1);
    expect(j!.headline).toContain("1st");
    expect(j!.body.length).toBeGreaterThan(40);
    expect(j!.body).toMatch(/echoes your natal Moon field/i);
  });

  it("counts house from Chandra for different signs", () => {
    const natal = moonSunChart({ sign: "aries", longitude: 5, nakshatra: "ashwini" }, 0);
    const transit = moonSunChart({ sign: "gemini", longitude: 65, nakshatra: "mrigashira" }, 60);
    const j = buildDailyMoonJudgment(natal, transit);
    expect(j).not.toBeNull();
    expect(j!.houseFromMoon).toBe(3);
    expect(j!.headline).toContain("3rd");
  });

  it("returns null without transit sun", () => {
    const natal = moonSunChart({ sign: "aries", longitude: 5 }, 0);
    const transit = moonSunChart({ sign: "aries", longitude: 10 }, 5);
    const { sun: _omit, ...restPlanets } = transit.planets;
    const broken = { ...transit, planets: restPlanets } as VedicChartCalculations;
    expect(buildDailyMoonJudgment(natal, broken)).toBeNull();
  });
});

describe("formatLocalCalendarDateYmd", () => {
  it("formats UTC calendar date for UTC timezone", () => {
    const d = new Date("2026-03-30T15:00:00.000Z");
    expect(formatLocalCalendarDateYmd("UTC", d)).toBe("2026-03-30");
  });
});

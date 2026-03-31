import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";

const kvGet = vi.fn();
const kvSet = vi.fn();
const generateContent = vi.fn();

vi.mock("@/lib/env", () => ({
  env: {
    GEMINI_API_KEY: "test-key",
    GEMINI_MODEL: "gemini-2.5-flash",
  },
}));

vi.mock("@/lib/kv/helpers", () => ({
  kvGet: (...a: unknown[]) => kvGet(...a),
  kvSet: (...a: unknown[]) => kvSet(...a),
}));

vi.mock("@/lib/astro/chartService", () => ({
  getChartCurrentDasha: vi.fn(() => ({
    mahaDasha: { planet: "Saturn", startDate: new Date(), endDate: new Date() },
    antarDasha: undefined,
  })),
}));

vi.mock("@/lib/astro/muhurta/ashtakavargaCalculator", () => ({
  getOrCreateAshtakavarga: vi.fn().mockResolvedValue({
    rekhasBySign: { 1: 20, 2: 22, 3: 24, 4: 26, 5: 28, 6: 25, 7: 27, 8: 23, 9: 29, 10: 21, 11: 24, 12: 26 },
  }),
}));

vi.mock("@/lib/content/promptBuilder", () => ({
  buildTodayMoonPrompt: vi.fn(async (_vars: Record<string, string>, fallbackFn: () => string) =>
    fallbackFn()
  ),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: (...a: unknown[]) => generateContent(...a),
    };
  },
}));

function charts(): { natal: VedicChartCalculations; transit: VedicChartCalculations } {
  const empty = {} as VedicChartCalculations["planets"]["mars"];
  const moon = (sign: string, lon: number, nak: string) => ({
    name: "moon" as const,
    longitude: lon,
    latitude: 0,
    sign: sign as "cancer",
    degree: lon % 30,
    degreeDMS: { degrees: 0, minutes: 0, seconds: 0 },
    degreeDMSFormatted: "0:0:0",
    nakshatra: nak as "pushya",
    nakshatraPada: 1,
    pada: 1,
    house: 4,
    isRetrograde: false,
    isCombust: false,
    speed: 13,
    dignity: "",
    aspects: [],
  });
  const sun = (lon: number) => ({
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
  const mk = (mLon: number, mSign: string, mNak: string, sLon: number) =>
    ({
      birthDateUtc: new Date(),
      planets: {
        sun: sun(sLon),
        moon: moon(mSign, mLon, mNak),
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
      dashas: {
        vimshottari: [],
      } as VedicChartCalculations["dashas"],
    }) as VedicChartCalculations;

  return {
    natal: mk(94, "cancer", "pushya", 30),
    transit: mk(165, "virgo", "hasta", 35),
  };
}

describe("getOrGenerateTodayMoonInterpretation", () => {
  beforeEach(() => {
    kvGet.mockReset();
    kvSet.mockReset();
    generateContent.mockReset();
  });

  it("returns cached AI payload with source ai", async () => {
    kvGet.mockResolvedValueOnce({
      headline: "Cached",
      body: "Body",
      daytimeFocus: "",
      caution: "",
      toneTags: [],
      generatedAt: "2020-01-01",
      phaseEnergy: "waxing",
      houseFromChandra: 3,
    });
    const { getOrGenerateTodayMoonInterpretation } = await import(
      "@/lib/ai/todayMoonInterpretationService"
    );
    const { natal, transit } = charts();
    const r = await getOrGenerateTodayMoonInterpretation(
      "u1",
      { timezone: "UTC" } as BirthProfile,
      natal,
      transit,
      "Test"
    );
    expect(r?.source).toBe("ai");
    expect(r?.headline).toBe("Cached");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("calls Gemini on miss and caches JSON result", async () => {
    kvGet.mockResolvedValue(null);
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        headline: "AI Title",
        body: "AI body text.",
        daytimeFocus: "Focus here",
        caution: "",
        toneTags: ["Calm"],
      }),
    });

    const { getOrGenerateTodayMoonInterpretation } = await import(
      "@/lib/ai/todayMoonInterpretationService"
    );
    const { natal, transit } = charts();
    const r = await getOrGenerateTodayMoonInterpretation(
      "u1",
      { timezone: "UTC" } as BirthProfile,
      natal,
      transit,
      "Test"
    );
    expect(r?.source).toBe("ai");
    expect(r?.headline).toBe("AI Title");
    expect(r?.body).toContain("AI body");
    expect(generateContent).toHaveBeenCalled();
    expect(kvSet).toHaveBeenCalled();
  });
});

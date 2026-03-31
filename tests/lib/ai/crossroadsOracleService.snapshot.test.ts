import { describe, it, expect } from "vitest";
import type { VedicChartCalculations } from "openastrology-library";
import {
  buildOracleTransitSnapshot,
  oracleReadingTtlSeconds,
} from "@/lib/ai/crossroadsOracleService";

describe("oracleReadingTtlSeconds", () => {
  it("caps at ORACLE max and is at least 60", () => {
    const far = new Date(Date.now() + 365 * 86400_000);
    const t = oracleReadingTtlSeconds(far);
    expect(t).toBeGreaterThanOrEqual(60);
    expect(t).toBeLessThanOrEqual(30 * 86400);
  });
});

describe("buildOracleTransitSnapshot", () => {
  it("collects retrogrades and signs", () => {
    const transit = {
      planets: {
        sun: { sign: "aries", isRetrograde: false },
        moon: { sign: "cancer", isRetrograde: false },
        mars: {},
        mercury: { sign: "taurus", isRetrograde: true },
        jupiter: { sign: "gemini", isRetrograde: true },
        venus: {},
        saturn: { sign: "pisces", isRetrograde: false },
        rahu: {},
        ketu: {},
      },
    } as unknown as VedicChartCalculations;
    const s = buildOracleTransitSnapshot(transit);
    expect(s.moonSign).toBe("Cancer");
    expect(s.sunSign).toBe("Aries");
    expect(s.retrogradePlanets).toContain("Mercury");
    expect(s.retrogradePlanets).toContain("Jupiter");
    expect(s.notableTransit).toBeTruthy();
  });
});

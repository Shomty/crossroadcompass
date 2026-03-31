import { describe, it, expect } from "vitest";
import {
  formatLocalYmd,
  resolveSafeTimeZone,
  toIsoStringSafe,
} from "@/lib/astro/muhurta/safeTime";

describe("safeTime", () => {
  it("resolveSafeTimeZone falls back for invalid IANA", () => {
    expect(resolveSafeTimeZone("Not/AZone")).toBe("UTC");
    expect(resolveSafeTimeZone("")).toBe("UTC");
    expect(resolveSafeTimeZone(null)).toBe("UTC");
  });

  it("toIsoStringSafe never throws", () => {
    expect(toIsoStringSafe(new Date("invalid"))).toBe(new Date(0).toISOString());
    expect(toIsoStringSafe(new Date(2024, 0, 15))).toContain("2024");
  });

  it("formatLocalYmd uses UTC fallback", () => {
    const d = new Date("2026-03-15T12:00:00.000Z");
    const ymd = formatLocalYmd(d, "Not/AZone");
    expect(ymd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

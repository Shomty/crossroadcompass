import { describe, expect, it } from "vitest";
import { wallTimeToUtc } from "@/lib/astro/muhurta/wallTimeToUtc";

describe("wallTimeToUtc", () => {
  it("parses wall time in a named zone independent of host TZ", () => {
    const utc = wallTimeToUtc("2026-06-15T12:00", "UTC");
    expect(utc.toISOString()).toBe("2026-06-15T12:00:00.000Z");
  });

  it("accepts T or space separator", () => {
    const a = wallTimeToUtc("2026-01-01T06:30", "UTC");
    const b = wallTimeToUtc("2026-01-01 06:30", "UTC");
    expect(a.getTime()).toBe(b.getTime());
  });

  it("throws on bad zone", () => {
    expect(() => wallTimeToUtc("2026-01-01T00:00", "Not/AZone")).toThrow();
  });
});

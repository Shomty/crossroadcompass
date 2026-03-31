import { describe, it, expect } from "vitest";
import { monthsRemaining, yearsRemaining } from "@/lib/astro/dashaService";

describe("monthsRemaining", () => {
  it("returns 0 for past end date", () => {
    expect(monthsRemaining(new Date(Date.now() - 86400_000))).toBe(0);
  });

  it("returns positive for future end date", () => {
    const end = new Date(Date.now() + 120 * 86400_000);
    expect(monthsRemaining(end)).toBeGreaterThanOrEqual(3);
  });
});

describe("yearsRemaining", () => {
  it("returns 0 for past end date", () => {
    expect(yearsRemaining(new Date(Date.now() - 86400_000))).toBe(0);
  });
});

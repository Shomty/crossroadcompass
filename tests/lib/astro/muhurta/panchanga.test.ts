import { describe, expect, it } from "vitest";
import {
  getTithi,
  getNakshatra,
  getYoga,
  getKarana,
  wrapLongitude,
} from "@/lib/astro/muhurta/panchanga";
import { isMoonGandanta } from "@/lib/astro/muhurta/gandanta";
import { scorePanchakaShuddhi } from "@/lib/astro/muhurta/panchakaShuddhi";
import { computePanchanga } from "@/lib/astro/muhurta/panchanga";

describe("panchanga", () => {
  it("getTithi: elongation / 12 → 1–30, śukla pakṣa", () => {
    const t = getTithi(0, 0);
    expect(t.index1to30).toBe(1);
    expect(t.paksha).toBe("śukla");
    const t2 = getTithi(10, 22);
    expect(t2.index1to30).toBe(2);
  });

  it("getTithi: negative elongation wraps", () => {
    const t = getTithi(350, 10);
    expect(t.elongationDeg).toBeGreaterThan(0);
    expect(t.index1to30).toBeGreaterThanOrEqual(1);
  });

  it("getNakshatra: Moon 0° → Aśvinī pāda 1", () => {
    const n = getNakshatra(0);
    expect(n.index0to26).toBe(0);
    expect(n.sanskritName).toBe("Aśvinī");
    expect(n.pada1to4).toBe(1);
  });

  it("getYoga sums longitudes mod 360", () => {
    const y = getYoga(100, 100);
    expect(y.index1to27).toBeGreaterThanOrEqual(1);
    expect(y.index1to27).toBeLessThanOrEqual(27);
  });

  it("getKarana marks Viṣṭi when segment mod 11 is 6", () => {
    const k = getKarana(0, 6 * 6);
    expect(k.isVishti).toBe(true);
  });

  it("computePanchanga bundles limbs", () => {
    const p = computePanchanga(15, 45, 3);
    expect(p.vaara.index0to6).toBe(3);
    expect(p.tithi.index1to30).toBeGreaterThanOrEqual(1);
  });
});

describe("gandanta", () => {
  it("flags last 3°20′ of Karka (water)", () => {
    const lon = 90 + 27; // 27° within Karka — inside final 3°20′ band
    expect(isMoonGandanta(lon).active).toBe(true);
  });

  it("flags first 3°20′ of Meṣa (fire)", () => {
    const lon = 2;
    expect(isMoonGandanta(lon).active).toBe(true);
  });

  it("clear mid-sign", () => {
    expect(isMoonGandanta(45).active).toBe(false);
  });
});

describe("panchakaShuddhi", () => {
  it("deducts for configured malefic tithi in pakṣa", () => {
    const limbs = computePanchanga(0, 12 * 3 + 1, 0); // ~śukla caturthī region
    const r = scorePanchakaShuddhi(limbs);
    expect(r.deductions.length).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(100);
  });
});

describe("wrapLongitude", () => {
  it("normalizes negative", () => {
    expect(wrapLongitude(-10)).toBe(350);
  });
});

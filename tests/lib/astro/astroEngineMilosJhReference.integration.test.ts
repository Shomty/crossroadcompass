/**
 * Integration: VedicAstrologyCalculator (openastrology-library + Swiss Ephemeris)
 * vs Jagannatha Hora export for Milos (shomty@hotmail.com).
 *
 * Birth: 1985-03-18 16:09:13, +1 East of GMT, 44°50′N 20°23′E (Zemun).
 * Library BirthInfo only supports HH:MM — we use 16:09 (sub-minute delta folded into tolerances).
 *
 * Not computed by this engine (JH table only): Maandi, Gulika, Bhava/Hora/Ghati/Vighati Lagna,
 * Varnada, Sree Lagna, lunar day metadata.
 *
 * Rahu/Ketu: JH lists positions that do not match Swiss SE_TRUE_NODE at this JD (~1.5° on Rahu);
 * we lock regression expectations to the engine output so upgrades are visible.
 */

import { describe, it, expect, beforeAll } from "vitest";
import type { BirthInfo, Planet, ZodiacSign } from "openastrology-library";
import { getVedicCalculator } from "@/lib/astro/calculatorService";

function dmsToDegrees(deg: number, min: number, sec: number): number {
  return deg + min / 60 + sec / 3600;
}

/** ~5′ band: HH:MM vs :13s, Lahiri rounding, JH vs Swiss */
const DEG_TOL = 0.09;

function expectCloseDeg(actual: number, expected: number, msg: string, tol = DEG_TOL): void {
  expect(Math.abs(actual - expected), msg).toBeLessThanOrEqual(tol);
}

const MILOS_BIRTH: BirthInfo = {
  name: "Milos JH cross-check",
  dateOfBirth: "1985-03-18",
  timeOfBirth: "16:09",
  latitude: 44 + 50 / 60,
  longitude: 20 + 23 / 60,
  timezone: "Europe/Belgrade",
};

/** Jagannatha Hora — grahas that align with Swiss sidereal at this time */
const JH_LAGNA = {
  sign: "leo" as const,
  nakshatra: "purva_phalguni" as const,
  pada: 1,
  degInSign: dmsToDegrees(16, 26, 28.41),
};

const JH_PLANETS: Array<{
  key: Planet;
  sign: ZodiacSign;
  nakshatra: string;
  pada: number;
  degInSign: number;
  retro?: boolean;
}> = [
  {
    key: "sun",
    sign: "pisces",
    nakshatra: "uttara_bhadrapada",
    pada: 1,
    degInSign: dmsToDegrees(4, 19, 33.24),
  },
  {
    key: "moon",
    sign: "aquarius",
    nakshatra: "dhanishta",
    pada: 3,
    degInSign: dmsToDegrees(2, 24, 56.13),
  },
  {
    key: "mars",
    sign: "aries",
    nakshatra: "ashwini",
    pada: 3,
    degInSign: dmsToDegrees(8, 50, 36.98),
  },
  {
    key: "mercury",
    sign: "pisces",
    nakshatra: "revati",
    pada: 2,
    degInSign: dmsToDegrees(22, 30, 53.19),
  },
  {
    key: "jupiter",
    sign: "capricorn",
    nakshatra: "shravana",
    pada: 2,
    degInSign: dmsToDegrees(14, 53, 15.53),
  },
  {
    key: "venus",
    sign: "pisces",
    nakshatra: "revati",
    pada: 4,
    degInSign: dmsToDegrees(28, 9, 47.22),
    retro: true,
  },
  {
    key: "saturn",
    sign: "scorpio",
    nakshatra: "anuradha",
    pada: 1,
    degInSign: dmsToDegrees(4, 22, 28.2),
    retro: true,
  },
];

/** D9 from JH (same as engine for these bodies) */
const JH_NAVAMSA: Partial<Record<Planet | "lagna", ZodiacSign>> = {
  lagna: "leo",
  sun: "leo",
  moon: "libra",
  mars: "gemini",
  mercury: "capricorn",
  jupiter: "taurus",
  venus: "pisces",
  saturn: "leo",
};

describe("Astro engine vs Jagannatha Hora (Milos 1985-03-18 Zemun)", () => {
  let d1: Awaited<ReturnType<ReturnType<typeof getVedicCalculator>["calculateChart"]>>;
  let d9: ReturnType<ReturnType<typeof getVedicCalculator>["calculateDivisionalChart"]>;

  beforeAll(async () => {
    const calc = getVedicCalculator();
    d1 = await calc.calculateChart(MILOS_BIRTH);
    d9 = calc.calculateDivisionalChart(d1, "D9");
  }, 30_000);

  it("Moon is in Aquarius (Dhanishta) — not Capricorn", () => {
    const m = d1.planets.moon;
    expect(m.sign, "Moon rāśi").toBe("aquarius");
    expect(m.nakshatra).toBe("dhanishta");
    expect(m.nakshatraPada).toBe(3);
  });

  it("Lagna matches JH (sign, nakṣatra, pada, degree within tolerance)", () => {
    const a = d1.ascendant;
    expect(a.sign).toBe(JH_LAGNA.sign);
    expect(a.nakshatra).toBe(JH_LAGNA.nakshatra);
    expect(a.nakshatraPada).toBe(JH_LAGNA.pada);
    expectCloseDeg(a.degree, JH_LAGNA.degInSign, "Lagna degree in sign");
  });

  it.each(JH_PLANETS)(
    "$key matches JH rāśi / nakṣatra / pada / longitude (tolerance ±0.09°)",
    (row) => {
      const p = d1.planets[row.key];
      expect(p.sign, `${row.key} rāśi`).toBe(row.sign);
      expect(p.nakshatra).toBe(row.nakshatra);
      expect(p.nakshatraPada).toBe(row.pada);
      expectCloseDeg(p.degree, row.degInSign, `${row.key} degree in sign`);
      if (row.retro !== undefined) {
        expect(p.isRetrograde, `${row.key} retrograde`).toBe(row.retro);
      }
    },
  );

  it("Navāṃśa (D9) signs match JH for Lagna and seven classical grahas", () => {
    expect(d9.ascendant.sign).toBe(JH_NAVAMSA.lagna);
    for (const k of ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as const) {
      expect(d9.planets[k].sign, `D9 ${k}`).toBe(JH_NAVAMSA[k]);
    }
  });

  it("Rahu / Ketu: Swiss Ephemeris true-node regression (JH row differs ~1.5° on Rahu)", () => {
    const r = d1.planets.rahu;
    const k = d1.planets.ketu;
    expect(r.sign).toBe("aries");
    expect(k.sign).toBe("libra");
    expect((r.longitude + 180) % 360).toBeCloseTo(k.longitude % 360, 4);
    // Golden values — update only if ephemeris/ayanāṃśa intentionally changes
    expect(r.longitude).toBeCloseTo(25.92452651569885, 5);
    expect(k.longitude).toBeCloseTo(205.92452651569886, 5);
    expect(r.nakshatra).toBe("bharani");
    expect(r.nakshatraPada).toBe(4);
    expect(k.nakshatra).toBe("vishakha");
    expect(k.nakshatraPada).toBe(2);
    expect(d9.planets.rahu.sign).toBe("scorpio");
    expect(d9.planets.ketu.sign).toBe("taurus");
  });
});

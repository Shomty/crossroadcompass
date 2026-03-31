import { describe, expect, it } from "vitest";
import {
  computeWeightedPurusharthaScore,
  drishtiScoreDelta,
  savScoreDelta,
  signsAspectedByJupiter,
  signsAspectedByMars,
  signsAspectedBySaturn,
  signsAspectedByVenus,
  taraScoreDelta,
  tithiVaraScoreDelta,
} from "@/lib/astro/muhurta/purusharthaWeightedScore";
import { taraNumberFromNakshatras } from "@/lib/astro/muhurta/purusharthaPersonalFilters";
import type { PurusharthaPersonalContextLoaded } from "@/lib/astro/muhurta/purusharthaPersonalFilters";
import { computePanchanga } from "@/lib/astro/muhurta/panchanga";

const fullRekhas = (): Record<number, number> =>
  Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 30])) as Record<
    import("@/types").SignNumber,
    number
  >;

const baseContext = (overrides?: Partial<PurusharthaPersonalContextLoaded>): PurusharthaPersonalContextLoaded => ({
  janmaNakshatraIndex0to26: 0,
  natalLagnaSign: 1,
  natalMoonSign: 5,
  rekhasBySign: fullRekhas(),
  ...overrides,
});

describe("taraScoreDelta", () => {
  it("matches spec for each Tara 1–9", () => {
    expect(taraScoreDelta(1)).toBe(-5);
    expect(taraScoreDelta(2)).toBe(15);
    expect(taraScoreDelta(3)).toBe(-20);
    expect(taraScoreDelta(4)).toBe(15);
    expect(taraScoreDelta(5)).toBe(-15);
    expect(taraScoreDelta(6)).toBe(15);
    expect(taraScoreDelta(7)).toBe(-30);
    expect(taraScoreDelta(8)).toBe(15);
    expect(taraScoreDelta(9)).toBe(15);
  });
});

describe("savScoreDelta", () => {
  it("applies thresholds", () => {
    expect(savScoreDelta(19)).toBe(-20);
    expect(savScoreDelta(24)).toBe(0);
    expect(savScoreDelta(25)).toBe(5);
    expect(savScoreDelta(30)).toBe(5);
    expect(savScoreDelta(31)).toBe(20);
  });
});

describe("tithiVaraScoreDelta", () => {
  it("Siddha Friday + Nanda", () => {
    const r = tithiVaraScoreDelta(5, 1);
    expect(r.delta).toBe(10);
    expect(r.siddha).toBe(true);
  });

  it("Siddha Wednesday + Bhadra", () => {
    const r = tithiVaraScoreDelta(3, 2);
    expect(r.delta).toBe(10);
    expect(r.siddha).toBe(true);
  });

  it("Dagdha Sunday + 12", () => {
    const r = tithiVaraScoreDelta(0, 12);
    expect(r.delta).toBe(-15);
    expect(r.dagdha).toBe(true);
  });
});

describe("drishtiScoreDelta", () => {
  it("Jupiter in Aries aspects Leo: Moon in Leo gets +10", () => {
    const moonLon = 120;
    const juLon = 5;
    const vLon = 60;
    const maLon = 200;
    const saLon = 50;
    expect(drishtiScoreDelta(moonLon, juLon, vLon, maLon, saLon)).toBe(10);
  });

  it("Mars aspect cancels benefic", () => {
    const moonLon = 125;
    const juLon = 5;
    const vLon = 60;
    const maLon = 280;
    const saLon = 50;
    expect(drishtiScoreDelta(moonLon, juLon, vLon, maLon, saLon)).toBe(0);
  });
});

describe("sign aspect helpers", () => {
  it("Jupiter aspects 5th 7th 9th from sign", () => {
    expect(signsAspectedByJupiter(1)).toEqual([5, 7, 9]);
  });

  it("Venus 7th only", () => {
    expect(signsAspectedByVenus(1)).toEqual([7]);
  });

  it("Mars 4 7 8", () => {
    const m = signsAspectedByMars(1);
    expect(m).toContain(4);
    expect(m).toContain(7);
    expect(m).toContain(8);
  });

  it("Saturn 3 7 10", () => {
    const s = signsAspectedBySaturn(1);
    expect(s).toContain(3);
    expect(s).toContain(7);
    expect(s).toContain(10);
  });
});

describe("computeWeightedPurusharthaScore", () => {
  it("starts at 50 with neutral personal + no gandanta", () => {
    const sun = 0;
    const moon = 35;
    const wd = 2;
    const limbs = computePanchanga(sun, moon, wd);
    const ctx = baseContext({
      janmaNakshatraIndex0to26: limbs.nakshatra.index0to26,
      rekhasBySign: { ...fullRekhas(), 2: 28 },
    });
    const r = computeWeightedPurusharthaScore({
      limbs,
      transitMoonLongitude: moon,
      jupiterLongitude: 200,
      venusLongitude: 50,
      marsLongitude: 100,
      saturnLongitude: 280,
      gandanta: false,
      panchakaScore: 80,
      context: ctx,
    });
    expect(r.breakdown.base).toBe(50);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("without context Tara and SAV are zero", () => {
    const limbs = computePanchanga(0, 35, 2);
    const r = computeWeightedPurusharthaScore({
      limbs,
      transitMoonLongitude: 35,
      jupiterLongitude: 200,
      venusLongitude: 50,
      marsLongitude: 100,
      saturnLongitude: 280,
      gandanta: false,
      panchakaScore: 70,
      context: null,
    });
    expect(r.breakdown.taraDelta).toBe(0);
    expect(r.breakdown.savDelta).toBe(0);
    expect(r.personalization).toBe("unavailable");
  });

  it("Tara 7 applies -30", () => {
    const limbs = computePanchanga(0, 35, 2);
    const transitNak = limbs.nakshatra.index0to26;
    const janma = (transitNak - 6 + 27) % 27;
    expect(taraNumberFromNakshatras(janma, transitNak)).toBe(7);
    const r = computeWeightedPurusharthaScore({
      limbs,
      transitMoonLongitude: 35,
      jupiterLongitude: 200,
      venusLongitude: 50,
      marsLongitude: 100,
      saturnLongitude: 280,
      gandanta: false,
      panchakaScore: 70,
      context: baseContext({ janmaNakshatraIndex0to26: janma }),
    });
    expect(r.breakdown.taraDelta).toBe(-30);
    expect(r.taraNaidhana).toBe(true);
  });
});

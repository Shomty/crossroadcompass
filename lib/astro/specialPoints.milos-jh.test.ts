/**
 * Cross-check: Jagannatha Hora PDF (Milos) vs pure calculators + extractSpecialPointsInputs pipeline.
 * @see tests/fixtures/milos-jh-golden.ts
 */

import { describe, it, expect } from "vitest";
import {
  calculateBhriguBindu,
  calculateKaalVelas,
  planetAbsoluteLongitude,
  calculatePranapada,
  calculateSpecialPoints,
} from "@/lib/astro/specialPoints";
import { extractSpecialPointsInputs } from "@/lib/astro/vedicChartMapper";
import {
  MILOS_BIRTH_UTC,
  MILOS_JH_ABSOLUTE_LONGITUDE,
  MILOS_LAT_DEG,
  MILOS_LON_DEG,
  milosMockVedicChartRaw,
  milosPdfPlanetPositions,
} from "../../tests/fixtures/milos-jh-golden";

function horaLagnaAbsoluteLongitude(result: {
  horaLagnaSignNumber: number;
  horaLagnaDegree: number;
}): number {
  return ((result.horaLagnaSignNumber - 1) * 30 + result.horaLagnaDegree + 360) % 360;
}

function ghatiLagnaAbsoluteLongitude(result: {
  ghatiLagnaSignNumber: number;
  ghatiLagnaDegree: number;
}): number {
  return ((result.ghatiLagnaSignNumber - 1) * 30 + result.ghatiLagnaDegree + 360) % 360;
}

function bhavaLagnaAbsoluteLongitude(result: {
  bhavaLagnaSignNumber: number;
  bhavaLagnaDegree: number;
}): number {
  return ((result.bhavaLagnaSignNumber - 1) * 30 + result.bhavaLagnaDegree + 360) % 360;
}

function shortArcMidpointDeg(lam: number, lar: number): number {
  const a = ((lam % 360) + 360) % 360;
  const b = ((lar % 360) + 360) % 360;
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return ((a + d / 2) % 360 + 360) % 360;
}

describe("Milos / Jagannatha Hora PDF — Bhrigu Bindu (pure)", () => {
  it("calculateBhriguBindu — short-arc midpoint with DMS", () => {
    const planets = milosPdfPlanetPositions();
    const bb = calculateBhriguBindu(planets);
    const moon = planets.find((p) => p.planet === "Moon")!;
    const rahu = planets.find((p) => p.planet === "Rahu")!;
    const lam = planetAbsoluteLongitude(moon);
    const lar = planetAbsoluteLongitude(rahu);
    expect(lam).toBeCloseTo(MILOS_JH_ABSOLUTE_LONGITUDE.moon, 2);
    expect(lar).toBeCloseTo(MILOS_JH_ABSOLUTE_LONGITUDE.rahu, 2);
    const expected = shortArcMidpointDeg(lam, lar);
    expect(bb.bhriguBinduLongitude).toBeCloseTo(expected, 4);
    expect(bb.moonLongitudeUsed).toBeCloseTo(lam, 4);
    expect(bb.rahuLongitudeUsed).toBeCloseTo(lar, 4);
    expect(bb.bhriguBinduSign).toBe(Math.floor(expected / 30) + 1);
  });
});

describe("Milos — time-based lagnas vs JH (pipeline tolerance)", () => {
  it("extractSpecialPointsInputs + calculateSpecialPoints: approximate sunrise vs JH", () => {
    const raw = milosMockVedicChartRaw();
    const inputs = extractSpecialPointsInputs(
      raw,
      MILOS_BIRTH_UTC.year,
      MILOS_BIRTH_UTC.month,
      MILOS_BIRTH_UTC.day,
      MILOS_BIRTH_UTC.hourUTC,
      MILOS_BIRTH_UTC.minuteUTC,
      MILOS_LAT_DEG,
      MILOS_LON_DEG
    );
    expect(inputs).not.toBeNull();

    const sp = calculateSpecialPoints(
      inputs!.lagnaSignNumber,
      inputs!.planets,
      inputs!.sunAbsoluteLongitudeAtSunrise,
      inputs!.minutesSinceSunrise,
      {
        isDayBirth: inputs!.isDayBirth,
        udayaLagnaLongitude: inputs!.lagnaAbsoluteLongitude,
      }
    );

    const jh = MILOS_JH_ABSOLUTE_LONGITUDE;
    const hl = horaLagnaAbsoluteLongitude(sp.horaLagna);
    const gl = ghatiLagnaAbsoluteLongitude(sp.ghatiLagna);
    const bl = bhavaLagnaAbsoluteLongitude(sp.bhavaLagna);

    // Path 2 uses calcSunriseUTC + linear Sun motion; JH uses precise ephemeris — expect degree-level drift.
    expect(Math.abs(hl - jh.horaLagna)).toBeLessThan(6);
    expect(Math.abs(gl - jh.ghatiLagna)).toBeLessThan(6);
    expect(Math.abs(bl - jh.bhavaLagna)).toBeLessThan(6);
  });
});

describe("Kaal Vela — V2 (Lagna + 0.25°/min)", () => {
  it("Gulika uses Saturn eighth start, Maandi uses that eighth midpoint", () => {
    const dayMinutes = 12 * 60;
    const lagna = 15;
    const r = calculateKaalVelas(lagna, dayMinutes, 0);
    expect(r).not.toBeNull();
    const portion = dayMinutes / 8;
    const startM = 6 * portion;
    const midM = startM + portion / 2;
    const wrap = (n: number) => ((n % 360) + 360) % 360;
    const gul = wrap(lagna + startM * 0.25);
    const man = wrap(lagna + midM * 0.25);
    expect(r!.gulika.referenceLongitude).toBeCloseTo(gul, 3);
    expect(r!.maandi.referenceLongitude).toBeCloseTo(man, 3);
    expect(r!.gulika.referenceLongitude).not.toBeCloseTo(r!.maandi.referenceLongitude, 2);
  });
});

describe("Pranapada — V2 (Sun λ + modality)", () => {
  it("movable Sun: base = Sun longitude + time offset", () => {
    const sunLon = 15;
    const pp = calculatePranapada(sunLon, 0, 1);
    expect(pp.sunSignNature).toBe("movable");
    expect(pp.startingLongitude).toBeCloseTo(15, 4);
    expect(pp.sunSignAtSunrise).toBe(1);
    expect(pp.pranapadalagnaSignNumber).toBe(1);
    expect(pp.pranapadalagnaDegree).toBeCloseTo(15, 3);
  });
});

/**
 * Special Points V2 sanity checks (Prāṇapada, Bhrigu short-arc, Kaal Velas, Ghati day/night).
 */

import { describe, it, expect } from "vitest";
import type { PlanetPosition } from "@/types";
import {
  calculateBhriguBindu,
  calculateGhatiLagna,
  calculateKaalVelas,
  calculatePranapada,
  planetAbsoluteLongitude,
} from "@/lib/astro/specialPoints";

describe("V2 Bhrigu Bindu — short arc when |Moon−Rahu| > 180°", () => {
  it("uses shorter ecliptic arc, not arithmetic mean", () => {
    const moon: PlanetPosition = {
      planet: "Moon",
      signNumber: 12,
      degreeInSign: 10,
      arcMinutes: 0,
      arcSeconds: 0,
    };
    const rahu: PlanetPosition = {
      planet: "Rahu",
      signNumber: 1,
      degreeInSign: 10,
      arcMinutes: 0,
      arcSeconds: 0,
    };
    const lam = planetAbsoluteLongitude(moon);
    const lar = planetAbsoluteLongitude(rahu);
    const bb = calculateBhriguBindu([moon, rahu]);
    const naiveMean = ((lam + lar) / 2 + 360) % 360;
    expect(bb.bhriguBinduLongitude).not.toBeCloseTo(naiveMean, 1);
    expect(bb.bhriguBinduLongitude).toBeGreaterThanOrEqual(0);
    expect(bb.bhriguBinduLongitude).toBeLessThan(360);
  });
});

describe("V2 Prāṇapada — modality offsets on Sun λ", () => {
  it("fixed sign adds 240° to Sun longitude before time offset", () => {
    const sunLon = 45;
    const pp = calculatePranapada(sunLon, 0, 1);
    expect(pp.sunSignNature).toBe("fixed");
    expect(pp.startingLongitude).toBeCloseTo(((45 + 240) % 360 + 360) % 360, 4);
  });

  it("dual sign adds 120°", () => {
    const sunLon = 75;
    const pp = calculatePranapada(sunLon, 0, 1);
    expect(pp.sunSignNature).toBe("dual");
    expect(pp.startingLongitude).toBeCloseTo(((75 + 120) % 360 + 360) % 360, 4);
  });
});

describe("V2 Kaal Velas", () => {
  it("returns null when daytime length is non-positive", () => {
    expect(calculateKaalVelas(100, 0, 0)).toBeNull();
    expect(calculateKaalVelas(100, -10, 0)).toBeNull();
  });
});

describe("V2 Ghati Lagna — day vs night base", () => {
  it("day birth uses Sun @ sunrise as base", () => {
    const sun = 90;
    const lagna = 120;
    const gl = calculateGhatiLagna(sun, 0, null, lagna, true);
    expect(gl.isDayBirth).toBe(true);
    expect(gl.baseLongitudeUsed).toBe(sun);
  });

  it("night birth uses Udaya Lagna when provided", () => {
    const sun = 90;
    const lagna = 120;
    const gl = calculateGhatiLagna(sun, 24, null, lagna, false);
    expect(gl.isDayBirth).toBe(false);
    expect(gl.baseLongitudeUsed).toBe(lagna);
  });
});

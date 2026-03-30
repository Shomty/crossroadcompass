/**
 * Parashara yoga engine — whole-sign house + Nabhasha + aggregate smoke.
 */

import { describe, it, expect } from "vitest";
import type { PlanetName, PlanetPosition, SignNumber } from "@/types";
import { signToHouse } from "@/lib/astro/yoga/signToHouse";
import { detectNabhashaYogas } from "@/lib/astro/yoga/nabhasha";
import { detectMahapurushaYogas } from "@/lib/astro/yoga/mahapurusha";
import { detectAllYogas } from "@/lib/astro/yoga/aggregate";

function pos(
  planet: PlanetName,
  signNumber: SignNumber,
  extras?: Partial<Pick<PlanetPosition, "isCombust">>
): PlanetPosition {
  return {
    planet,
    signNumber,
    degreeInSign: 10,
    arcMinutes: 0,
    arcSeconds: 0,
    ...extras,
  };
}

const NINE: PlanetName[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
];

const NABHASHA: PlanetName[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

describe("signToHouse", () => {
  it("returns 1 when planet shares lagna sign", () => {
    expect(signToHouse(5, 5)).toBe(1);
  });

  it("counts forward whole signs from lagna", () => {
    expect(signToHouse(7, 5)).toBe(3);
    expect(signToHouse(4, 5)).toBe(12);
  });
});

describe("detectNabhashaYogas", () => {
  it("detects Rajju when all seven grahas occupy movable signs", () => {
    const movable: SignNumber[] = [1, 4, 7, 10, 1, 4, 7];
    const planets: PlanetPosition[] = [
      ...NABHASHA.map((p, i) => pos(p, movable[i]!)),
      pos("Rahu", 3),
      pos("Ketu", 9),
    ];
    const yogas = detectNabhashaYogas(planets, 1);
    expect(yogas.some((y) => y.name === "Rajju Yoga")).toBe(true);
  });
});

describe("detectMahapurushaYogas", () => {
  it("forms Hamsa when Jupiter exalted in Kendra from Lagna", () => {
    const planets = NINE.map((p) => {
      if (p === "Jupiter") return pos("Jupiter", 4);
      return pos(p, 3);
    });
    const yogas = detectMahapurushaYogas(planets, 1);
    expect(yogas.some((y) => y.name === "Hamsa Yoga")).toBe(true);
  });
});

describe("detectAllYogas", () => {
  it("dedupes by name and sets dashaActivated when lord matches", () => {
    const planets = NINE.map((p) => pos(p, 1));
    const input = { lagnaSignNumber: 1 as SignNumber, planets };
    const r = detectAllYogas(input, "Sun", undefined);
    expect(r.yogas.length).toBeGreaterThan(0);
    const names = new Set(r.yogas.map((y) => y.name));
    expect(names.size).toBe(r.yogas.length);
    const sunOnes = r.yogas.filter((y) => y.planetsInvolved.includes("Sun"));
    expect(sunOnes.every((y) => y.dashaActivated)).toBe(true);
  });
});

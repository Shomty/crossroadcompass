/**
 * Vedic special-point placements: whole-sign house, rāśi, equal-division nakṣatra/pada.
 */

import { describe, it, expect } from "vitest";
import type { PlanetPosition, SignNumber } from "@/types";
import type { SpecialPointsInputs } from "@/lib/astro/vedicChartMapper";
import { calculateSpecialPoints, planetAbsoluteLongitude } from "@/lib/astro/specialPoints";
import {
  attachFoundationPlacements,
  formatNakshatraLabel,
  formatPlacementLine,
  placementForNatalLagna,
  placementFromLongitude,
} from "@/lib/astro/vedicPointPlacement";

function pos(
  planet: PlanetPosition["planet"],
  signNumber: SignNumber,
  degreeInSign: number
): PlanetPosition {
  return { planet, signNumber, degreeInSign, arcMinutes: 0, arcSeconds: 0 };
}

describe("placementFromLongitude", () => {
  it("maps λ=0° to Aries, house 1 when Lagna is Aries, pada 1–4", () => {
    const p = placementFromLongitude(1, 0);
    expect(p.rasiSignNumber).toBe(1);
    expect(p.rasiName).toBe("Aries");
    expect(p.houseFromLagna).toBe(1);
    expect(p.nakshatra).toBe("Ashwini");
    expect(p.pada).toBeGreaterThanOrEqual(1);
    expect(p.pada).toBeLessThanOrEqual(4);
  });

  it("uses whole-sign house 1 when point shares Lagna sign (Leo / Leo)", () => {
    const λ = 125; // mid-Leo
    const p = placementFromLongitude(5, λ);
    expect(p.rasiSignNumber).toBe(5);
    expect(p.houseFromLagna).toBe(1);
    expect(formatPlacementLine(p)).toMatch(/^H1 · Leo ·/);
  });

  it("steps house forward by whole signs (Cancer Lagna → Leo = H2)", () => {
    const λ = 125;
    const p = placementFromLongitude(4, λ);
    expect(p.houseFromLagna).toBe(2);
    expect(p.rasiSignNumber).toBe(5);
  });

  it("handles nakṣatra boundary near end of first nakṣatra (13°20′ Aries)", () => {
    const justBefore = 13 + 19 / 60 + 59 / 3600 - 0.01;
    const justAfter = 13 + 20 / 60 + 0.01;
    const before = placementFromLongitude(1, justBefore);
    const after = placementFromLongitude(1, justAfter);
    expect(before.nakshatra).toBe("Ashwini");
    expect(after.nakshatra).not.toBe(before.nakshatra);
  });
});

describe("formatNakshatraLabel", () => {
  it("title-cases underscored enum keys", () => {
    expect(formatNakshatraLabel("purva_phalguni")).toBe("Purva Phalguni");
  });
});

describe("placementForNatalLagna", () => {
  it("uses 0° of sign when degree is unknown (sign-only)", () => {
    const p = placementForNatalLagna(3, { signNumber: 3 });
    expect(p).toEqual(placementFromLongitude(3, 60));
  });
});

describe("attachFoundationPlacements", () => {
  it("fills charakaraka placements from chart longitudes", () => {
    // Degrees chosen so Rahu's inverted ranking (30° − deg) never ties another planet's deg
    // (e.g. Mercury 13° vs Rahu 17° → both rank as 13′ — shared rank / duplicate map keys).
    const planets: PlanetPosition[] = [
      pos("Sun", 1, 10),
      pos("Moon", 2, 11),
      pos("Mars", 3, 12),
      pos("Mercury", 4, 13),
      pos("Jupiter", 5, 14),
      pos("Venus", 6, 15),
      pos("Saturn", 7, 16),
      pos("Rahu", 8, 10),
    ];
    const L = 1 as SignNumber;
    const base = calculateSpecialPoints(L, planets, 0, 0, {
      isDayBirth: true,
      udayaLagnaLongitude: 0,
    });
    const inputs: SpecialPointsInputs = {
      lagnaSignNumber: L,
      planets,
      sunAbsoluteLongitudeAtSunrise: 0,
      minutesSinceSunrise: 0,
      lagnaAbsoluteLongitude: 0,
      isDayBirth: true,
      daytimeDurationMinutes: 600,
      dayOfWeek: 0,
    };
    const withNatal = { ...base, natalLagna: { signNumber: L, degreeInSign: 5 } as const };
    const out = attachFoundationPlacements(withNatal, inputs);
    for (const k of base.charakarakas.karakas) {
      const planetRow = planets.find((p) => p.planet === k.planet);
      expect(planetRow).toBeDefined();
      const expected = placementFromLongitude(L, planetAbsoluteLongitude(planetRow!));
      expect(out.placements?.charakarakas[k.rank]).toEqual(expected);
    }
  });
});

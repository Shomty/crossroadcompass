/**
 * Build UserAstroSnapshot upsert payload from a computed Vedic chart + birth profile.
 */
import type { BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";

const PLANETS = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
  "rahu",
  "ketu",
] as const;

export function buildPlanetSnapshotFeJson(chart: VedicChartCalculations): Record<string, unknown> {
  const p = chart.planets;
  const out: Record<string, unknown> = {};
  for (const key of PLANETS) {
    const pl = p[key];
    const cap = key.charAt(0).toUpperCase() + key.slice(1);
    out[`${key}Sign`] = pl.sign;
    out[`${key}House`] = pl.house;
    out[`${key}Nakshatra`] = pl.nakshatra;
    if (key === "moon") {
      out.moonNakshatraPada = pl.nakshatraPada;
    }
    out[`${key}Dignity`] = pl.dignity;
    out[`${key}Retrograde`] = pl.isRetrograde;
    out[`${key}Combust`] = pl.isCombust;
  }
  out.retrogradeCount = PLANETS.filter((k) => p[k].isRetrograde).length;
  out.combustCount = PLANETS.filter((k) => p[k].isCombust).length;
  return out;
}

export function buildSnapshotUpsertData(
  chart: VedicChartCalculations,
  profile: BirthProfile,
  existingFeJson: Record<string, unknown> | null
) {
  const asc = chart.ascendant;
  const planetFe = buildPlanetSnapshotFeJson(chart);
  const mergedFe = {
    ...(existingFeJson ?? {}),
    planetSnapshot: planetFe,
  };

  return {
    lagnaSign: asc.sign,
    lagnaDegree: asc.degree,
    lagnaNakshatra: asc.nakshatra,
    lagnaNakshatraPada: asc.nakshatraPada,
    ayanamsa: chart.ayanamsa,
    birthTimeKnown: profile.birthTimeKnown,
    vedicChartCachedAt: new Date(),
    birthDateSnapshot: profile.birthDate,
    birthCitySnapshot: profile.birthCity,
    birthCountrySnapshot: profile.birthCountry,
    birthLatitude: profile.latitude,
    birthLongitude: profile.longitude,
    birthTimezone: profile.timezone,
    profileUpdatedAt: profile.updatedAt,
    feJson: mergedFe as object,
  };
}

export function buildProfileOnlySnapshot(profile: BirthProfile, invalidate: boolean) {
  return {
    birthDateSnapshot: profile.birthDate,
    birthCitySnapshot: profile.birthCity,
    birthCountrySnapshot: profile.birthCountry,
    birthLatitude: profile.latitude,
    birthLongitude: profile.longitude,
    birthTimezone: profile.timezone,
    birthTimeKnown: profile.birthTimeKnown,
    profileUpdatedAt: profile.updatedAt,
    ...(invalidate ? { cacheInvalidatedAt: new Date() } : {}),
  };
}

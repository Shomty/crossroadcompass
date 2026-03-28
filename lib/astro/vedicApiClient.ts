/**
 * lib/astro/vedicApiClient.ts
 * Vedic chart calculation via openastrology-library (self-hosted, in-process).
 * All Vedic chart data is computed locally using Swiss Ephemeris — no external API.
 *
 * THIS IS THE ONLY FILE THAT MAY INSTANTIATE VedicAstrologyCalculator.
 * No other file in the codebase may import or call it directly.
 *
 * Caching rule: callers (chartService) must check DB/KV before calling here.
 * This file has no caching logic.
 */

import path from "path";
import { createRequire } from "module";
import { env } from "@/lib/env";

// Force CJS load — the ESM build (index.mjs) uses `import * as swisseph` which
// returns a namespace object where native Node bindings are inaccessible.
// createRequire ensures the CJS build (index.js) is loaded regardless of
// how Turbopack/webpack resolves the package's "exports" field.
const _require = createRequire(import.meta.url);
const {
  VedicAstrologyCalculator,
} = _require("openastrology-library") as typeof import("openastrology-library");

import type {
  VedicChartCalculations,
  PlanetPosition,
  HouseInfo,
  PlanetDasha,
} from "openastrology-library";
import type {
  VedicChart,
  VedicBirthChartResponse,
  VedicDivisionalChart,
  VedicPlanet,
  VedicHouse,
  VedicAscendant,
  VedicDashaPeriod,
  VedicDashas,
  VedicYoga,
} from "@/lib/astro/types";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Convert library PlanetaryPositions dict → VedicPlanet[] array */
function mapPlanets(positions: VedicChartCalculations["planets"]): VedicPlanet[] {
  return Object.values(positions).map((p: PlanetPosition) => ({
    name: p.name,
    longitude: p.longitude,
    latitude: p.latitude,
    speed: p.speed,
    house: p.house,
    sign: p.sign,
    nakshatra: p.nakshatra,
    pada: p.pada,
    degree: p.degree,
    degreeDMSFormatted: p.degreeDMSFormatted,
    isRetrograde: p.isRetrograde,
    dignity: p.dignity,
    nakshatraPada: p.nakshatraPada,
    aspects: p.aspects.map((a) => ({
      house: a.house,
      aspect: a.aspect,
      planets: a.planets,
    })),
  }));
}

/** Convert library HousePositions dict → VedicHouse[] array */
function mapHouses(positions: VedicChartCalculations["houses"]): VedicHouse[] {
  return Object.values(positions).map((h: HouseInfo) => ({
    number: h.number,
    sign: h.sign,
    cusp: h.cusp,
    lord: h.lord,
    planets: h.planets,
    planetsInHouse: h.planets, // kept for backward compat
    strength: h.strength,
    significance: h.significance,
  }));
}

/** Convert library VimshottariDasha (Date objects) → VedicDashas (ISO strings) */
function mapDashas(dashas: VedicChartCalculations["dashas"]): VedicDashas {
  const mapPeriod = (d: PlanetDasha): VedicDashaPeriod => ({
    planet: d.planet,
    startDate: d.startDate instanceof Date ? d.startDate.toISOString() : String(d.startDate),
    endDate: d.endDate instanceof Date ? d.endDate.toISOString() : String(d.endDate),
    subPeriods: (d.subPeriods ?? []).map(mapPeriod),
  });

  return {
    vimshottari: {
      type: "vimshottari",
      dashaPeriods: dashas.vimshottari.dashaPeriods.map(mapPeriod),
    },
  };
}

/** Convert library ascendant → VedicAscendant */
function mapAscendant(asc: VedicChartCalculations["ascendant"]): VedicAscendant {
  return {
    sign: asc.sign,
    degree: asc.degree,
    degreeDMSFormatted: asc.degreeDMSFormatted,
    nakshatra: asc.nakshatra,
    nakshatraPada: asc.nakshatraPada,
  };
}

/** Convert a VedicChartCalculations to VedicDivisionalChart. */
function toVedicDivisional(
  calc: VedicChartCalculations,
  includeAshtakavarga = false
): VedicDivisionalChart {
  return {
    planets: mapPlanets(calc.planets),
    houses: mapHouses(calc.houses),
    yogas: (calc.yogas ?? []).map(
      (y): VedicYoga => ({
        name: y.name,
        type: y.type,
        description: y.description,
        planets: y.planets,
        houses: y.houses,
        strength: y.strength,
      })
    ),
    ashtakavarga:
      includeAshtakavarga && calc.ashtakavarga
        ? {
            bhinna: calc.ashtakavarga.bhinna as Record<string, Record<string, number[]>>,
            sarva: calc.ashtakavarga.sarva as Record<string, number[]>,
          }
        : undefined,
    dashas: mapDashas(calc.dashas),
    ascendant: mapAscendant(calc.ascendant),
    ayanamsa: calc.ayanamsa,
  };
}

// ─── Module-level singleton — reuse across requests ───────────────────────

let _calculator: InstanceType<typeof VedicAstrologyCalculator> | null = null;

function getCalculator(): InstanceType<typeof VedicAstrologyCalculator> {
  if (!_calculator) {
    const ephePath = path.resolve(process.cwd(), env.EPHE_PATH);
    _calculator = new VedicAstrologyCalculator({
      ayanamsa: "lahiri",
      houseSystem: "wholehouse",
      ephePath,
    });
  }
  return _calculator;
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Calculate the Vedic natal chart for a birth profile.
 * Replaces the previous external HTTP call — now runs in-process.
 * Returns the same VedicChart shape so no consumer code needs to change.
 */
export async function fetchVedicNatalChart(params: {
  dateOfBirth: string;    // "YYYY-MM-DD"
  timeOfBirth: string;    // "HH:MM"
  latitude: number;
  longitude: number;
  timezone: string;       // IANA e.g. "Europe/Belgrade"
  gender: "male" | "female" | "other";
  name: string;
}): Promise<VedicChart> {
  const calc = getCalculator();

  // Library BirthInfo.gender only accepts 'male' | 'female' | undefined
  const libraryGender: "male" | "female" | undefined =
    params.gender === "male" || params.gender === "female" ? params.gender : undefined;

  const d1 = await calc.calculateChart({
    name: params.name,
    dateOfBirth: params.dateOfBirth,
    timeOfBirth: params.timeOfBirth,
    latitude: params.latitude,
    longitude: params.longitude,
    timezone: params.timezone,
    gender: libraryGender,
  });

  // Calculate all divisional charts (D2–D60) in one pass
  const allDivisional = calc.calculateAllDivisionalCharts(d1);

  const response: VedicBirthChartResponse = {
    birthInfo: {
      name: params.name,
      dateOfBirth: params.dateOfBirth,
      timeOfBirth: params.timeOfBirth,
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone,
      gender: params.gender,
    },
    chartD1: toVedicDivisional(d1, true),
    chartD2: allDivisional["D2"] ? toVedicDivisional(allDivisional["D2"]) : undefined,
    chartD3: allDivisional["D3"] ? toVedicDivisional(allDivisional["D3"]) : undefined,
    chartD4: allDivisional["D4"] ? toVedicDivisional(allDivisional["D4"]) : undefined,
    chartD5: allDivisional["D5"] ? toVedicDivisional(allDivisional["D5"]) : undefined,
    chartD6: allDivisional["D6"] ? toVedicDivisional(allDivisional["D6"]) : undefined,
    chartD7: allDivisional["D7"] ? toVedicDivisional(allDivisional["D7"]) : undefined,
    chartD8: allDivisional["D8"] ? toVedicDivisional(allDivisional["D8"]) : undefined,
    chartD9: allDivisional["D9"] ? toVedicDivisional(allDivisional["D9"]) : undefined,
    chartD10: allDivisional["D10"] ? toVedicDivisional(allDivisional["D10"]) : undefined,
    chartD12: allDivisional["D12"] ? toVedicDivisional(allDivisional["D12"]) : undefined,
    chartD16: allDivisional["D16"] ? toVedicDivisional(allDivisional["D16"]) : undefined,
    chartD20: allDivisional["D20"] ? toVedicDivisional(allDivisional["D20"]) : undefined,
    chartD24: allDivisional["D24"] ? toVedicDivisional(allDivisional["D24"]) : undefined,
    chartD27: allDivisional["D27"] ? toVedicDivisional(allDivisional["D27"]) : undefined,
    chartD30: allDivisional["D30"] ? toVedicDivisional(allDivisional["D30"]) : undefined,
    chartD40: allDivisional["D40"] ? toVedicDivisional(allDivisional["D40"]) : undefined,
    chartD45: allDivisional["D45"] ? toVedicDivisional(allDivisional["D45"]) : undefined,
    chartD60: allDivisional["D60"] ? toVedicDivisional(allDivisional["D60"]) : undefined,
    ayanamsa: "lahiri",
    houseSystem: "wholehouse",
  };

  const d1Chart = response.chartD1;
  const sunPlanet = d1Chart.planets.find((p) => p.name === "sun");
  const moonPlanet = d1Chart.planets.find((p) => p.name === "moon");
  const now = new Date();
  const currentDasha = d1Chart.dashas.vimshottari.dashaPeriods.find(
    (p) => new Date(p.startDate) <= now && new Date(p.endDate) >= now
  );

  return {
    rawResponse: response,
    ascendant: d1Chart.ascendant,
    sunSign: sunPlanet?.sign,
    moonSign: moonPlanet?.sign,
    currentDasha,
  };
}

/**
 * Dispose the singleton calculator (call on process exit or test teardown).
 * Frees the underlying Swiss Ephemeris native resources.
 */
export function disposeCalculator(): void {
  if (_calculator) {
    _calculator.dispose();
    _calculator = null;
  }
}

import type {
  PersonalizedMuhurtaRequest,
  PersonalizedMuhurtaWindow,
  PlanetName,
  PlanetPosition,
  SamudayaAshtakavarga,
  SignNumber,
  MuhurtaDashaContext,
} from "@/types";
import { longitudeToSignAndDegree, wrapLongitude } from "@/lib/astro/specialPoints";
import type { BirthProfile } from "@prisma/client";
import { calculateAvastha } from "@/lib/astro/muhurta/avastha";
import { checkVirtualConjunction } from "@/lib/astro/muhurta/virtualConjunction";
import {
  colorFromScore,
  getHouseFromLagna,
  getHouseDomain,
  intentCategoriesForHouseDomain,
  scoreMuhurtaWindow,
} from "@/lib/astro/muhurta/windowScorer";
import { computeDashaModifier } from "@/lib/astro/muhurta/dashaContext";
import { getTransitSiderealLongitudes } from "@/lib/astro/muhurta/transitLongitudes";

const TRANSIT_PLANETS: PlanetName[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

const SCAN_INTERVAL_HOURS = 4;

function newWindowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mw-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function generatePersonalizedMuhurtaWindows(
  request: PersonalizedMuhurtaRequest,
  birthProfile: BirthProfile,
  natalPlanets: PlanetPosition[],
  lagnaSignNumber: SignNumber,
  ashtakavarga: SamudayaAshtakavarga,
  dashaContext: MuhurtaDashaContext | null
): Promise<PersonalizedMuhurtaWindow[]> {
  const dashaModifier = computeDashaModifier(dashaContext, lagnaSignNumber);
  const windows: PersonalizedMuhurtaWindow[] = [];

  const currentSigns: Partial<Record<PlanetName, SignNumber>> = {};
  const activeWindows: Partial<Record<PlanetName, PersonalizedMuhurtaWindow>> = {};

  let cursor = new Date(request.startDate);
  const end = new Date(request.endDate);

  while (cursor <= end) {
    const longitudes = await getTransitSiderealLongitudes(
      request.userId,
      birthProfile,
      cursor
    );

    for (const planet of TRANSIT_PLANETS) {
      const longitude = longitudes[planet];
      if (longitude === undefined) continue;

      const wrapped = wrapLongitude(longitude);
      const { sign: transitSign } = longitudeToSignAndDegree(wrapped);

      const previousSign = currentSigns[planet];
      currentSigns[planet] = transitSign;

      if (previousSign !== undefined && previousSign !== transitSign) {
        const closing = activeWindows[planet];
        if (closing) {
          closing.endTime = cursor.toISOString();
          windows.push(closing);
          delete activeWindows[planet];
        }
      }

      if (previousSign === undefined || previousSign !== transitSign) {
        const avastha = calculateAvastha(planet, transitSign);
        const conjunction = checkVirtualConjunction(
          planet,
          wrapped,
          natalPlanets,
          lagnaSignNumber
        );
        const rekhas = ashtakavarga.rekhasBySign[transitSign] ?? 0;
        const scoreBreakdown = scoreMuhurtaWindow({
          planet,
          transitSignNumber: transitSign,
          ashtakavargaRekhas: rekhas,
          avasthaState: avastha,
          virtualConjunction: conjunction,
          dashaModifier,
          lagnaSignNumber,
        });

        const houseFromLagna = getHouseFromLagna(transitSign, lagnaSignNumber);
        const houseDomain = getHouseDomain(houseFromLagna);
        const intentCategories = intentCategoriesForHouseDomain(houseDomain);

        const newWindow: PersonalizedMuhurtaWindow = {
          id: newWindowId(),
          startTime: cursor.toISOString(),
          endTime: end.toISOString(),
          planet,
          transitSignNumber: transitSign,
          houseFromLagna,
          houseDomain,
          color: colorFromScore(scoreBreakdown.totalScore),
          scoreBreakdown,
          intentCategories,
          warningLabel: conjunction.warningLabel,
        };

        activeWindows[planet] = newWindow;
      }
    }

    cursor = new Date(cursor.getTime() + SCAN_INTERVAL_HOURS * 60 * 60 * 1000);
  }

  for (const planet of TRANSIT_PLANETS) {
    const open = activeWindows[planet];
    if (open) {
      open.endTime = end.toISOString();
      windows.push(open);
    }
  }

  if (request.intentFilter !== "all") {
    return windows.filter((w) => w.intentCategories.includes(request.intentFilter));
  }

  return windows;
}

import type { PlanetName, SignNumber } from "@/types";
import type { MuhurtaDashaContext } from "@/types";
import { db } from "@/lib/db";
import { getFunctionalNature } from "@/lib/astro/muhurta/functionalNature";

const OA_PLANET: Record<string, PlanetName> = {
  sun: "Sun",
  moon: "Moon",
  mars: "Mars",
  mercury: "Mercury",
  jupiter: "Jupiter",
  venus: "Venus",
  saturn: "Saturn",
  rahu: "Rahu",
  ketu: "Ketu",
};

function normalizePlanetToken(raw: string): PlanetName | null {
  const k = raw.trim().toLowerCase();
  return OA_PLANET[k] ?? null;
}

/**
 * Current Vimshottari Maha + Antara from Prisma dasha rows (see dashaService).
 */
export async function getMuhurtaDashaContextFromDb(
  userId: string
): Promise<MuhurtaDashaContext | null> {
  const now = new Date();

  const maha = await db.dasha.findFirst({
    where: {
      userId,
      level: "MAHADASHA",
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  const antara = await db.dasha.findFirst({
    where: {
      userId,
      level: "ANTARDASHA",
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!maha || !antara) return null;

  const mahaLord = normalizePlanetToken(maha.planetName);
  const antaraParts = antara.planetName.split("/");
  const antaraLord =
    normalizePlanetToken(antaraParts[1] ?? "") ??
    normalizePlanetToken(antaraParts[0] ?? "");

  if (!mahaLord || !antaraLord) return null;

  return {
    mahadashaLord: mahaLord,
    antardashaLord: antaraLord,
    mahadashaEndDate: maha.endDate,
    antardashaEndDate: antara.endDate,
  };
}

export function computeDashaModifier(
  dashaContext: MuhurtaDashaContext | null,
  lagnaSignNumber: SignNumber
): number {
  if (!dashaContext) return 0;

  const mahaClass = getFunctionalNature(dashaContext.mahadashaLord, lagnaSignNumber);
  const antaraClass = getFunctionalNature(dashaContext.antardashaLord, lagnaSignNumber);

  let modifier = 0;
  if (mahaClass === "benefic") modifier += 1;
  if (mahaClass === "malefic") modifier -= 1;
  if (antaraClass === "benefic") modifier += 0.5;
  if (antaraClass === "malefic") modifier -= 0.5;

  return modifier;
}

/**
 * Samudaya (combined) Ashtakavarga — BPHS-style contribution tables.
 */

import type { PlanetName, SignNumber, PlanetPosition } from "@/types";
import type { SamudayaAshtakavarga } from "@/types";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys } from "@/lib/kv/keys";

const CONTRIBUTION_TABLES: Record<string, number[]> = {
  Sun:     [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
  Moon:    [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1],
  Mars:    [0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1],
  Mercury: [0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1],
  Jupiter: [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0],
  Venus:   [0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  Saturn:  [0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
  Lagna:   [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1],
};

function getDotsBySign(contributorSign: SignNumber, table: number[]): boolean[] {
  const dots = new Array(12).fill(false);
  for (let house = 1; house <= 12; house++) {
    if (table[house - 1] === 1) {
      const targetIdx = (contributorSign - 1 + house - 1) % 12;
      dots[targetIdx] = true;
    }
  }
  return dots;
}

export function computeSamudayaAshtakavarga(
  planets: PlanetPosition[],
  lagnaSignNumber: SignNumber
): SamudayaAshtakavarga {
  const rekhas = new Array(12).fill(0);

  const contributors: Array<{ name: string; sign: SignNumber }> = [
    ...planets
      .filter((p) => p.planet !== "Ketu")
      .filter((p) => CONTRIBUTION_TABLES[p.planet])
      .map((p) => ({ name: p.planet, sign: p.signNumber })),
    { name: "Lagna", sign: lagnaSignNumber },
  ];

  for (const contributor of contributors) {
    const table = CONTRIBUTION_TABLES[contributor.name];
    if (!table) continue;
    const dots = getDotsBySign(contributor.sign, table);
    dots.forEach((hasDot, signIndex) => {
      if (hasDot) rekhas[signIndex]++;
    });
  }

  const rekhasBySign: Record<number, number> = {};
  for (let i = 0; i < 12; i++) {
    rekhasBySign[i + 1] = rekhas[i];
  }

  return { rekhasBySign: rekhasBySign as Record<SignNumber, number> };
}

export async function getOrCreateAshtakavarga(
  userId: string,
  planets: PlanetPosition[],
  lagnaSignNumber: SignNumber
): Promise<SamudayaAshtakavarga> {
  const cacheKey = kvKeys.ashtakavarga(userId);
  const cached = await kvGet<SamudayaAshtakavarga>(cacheKey);
  if (cached) return cached;

  const result = computeSamudayaAshtakavarga(planets, lagnaSignNumber);
  await kvSet(cacheKey, result);
  return result;
}

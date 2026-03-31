import type { BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";
import type {
  PersonalizedMuhurtaRequest,
  PersonalizedMuhurtaResponse,
} from "@/types";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { extractMuhurtaChartInput } from "@/lib/astro/muhurta/chartInput";
import { getOrCreateAshtakavarga } from "@/lib/astro/muhurta/ashtakavargaCalculator";
import { getMuhurtaDashaContextFromDb, computeDashaModifier } from "@/lib/astro/muhurta/dashaContext";
import { generatePersonalizedMuhurtaWindows } from "@/lib/astro/muhurta/windowGenerator";
import { toIsoStringSafe } from "@/lib/astro/muhurta/safeTime";

function cacheKeyFor(request: PersonalizedMuhurtaRequest): string {
  const s = request.startDate.toISOString().split("T")[0];
  const e = request.endDate.toISOString().split("T")[0];
  return kvKeys.muhurtaPersonalized(request.userId, s, e, request.intentFilter);
}

export async function getPersonalizedMuhurtaResponse(
  request: PersonalizedMuhurtaRequest,
  birthProfile: BirthProfile,
  vedicChart: VedicChartCalculations,
  options?: { useCache?: boolean }
): Promise<PersonalizedMuhurtaResponse> {
  const useCache = options?.useCache !== false;
  const key = cacheKeyFor(request);

  if (useCache) {
    const cached = await kvGet<PersonalizedMuhurtaResponse>(key);
    if (cached) {
      return { ...cached, cacheHit: true };
    }
  }

  const input = extractMuhurtaChartInput(vedicChart);
  if (!input) {
    return {
      windows: [],
      dashaContext: null,
      generatedAt: new Date().toISOString(),
      cacheHit: false,
    };
  }

  const [ashtakavarga, dashaContext] = await Promise.all([
    getOrCreateAshtakavarga(request.userId, input.planets, input.lagnaSignNumber),
    getMuhurtaDashaContextFromDb(request.userId),
  ]);

  let windows: Awaited<ReturnType<typeof generatePersonalizedMuhurtaWindows>>;
  try {
    windows = await generatePersonalizedMuhurtaWindows(
      request,
      birthProfile,
      input.planets,
      input.lagnaSignNumber,
      ashtakavarga,
      dashaContext
    );
  } catch (err) {
    console.error("[personalizedMuhurta] window generation failed:", err);
    windows = [];
  }

  const modifierApplied = computeDashaModifier(dashaContext, input.lagnaSignNumber);

  const response: PersonalizedMuhurtaResponse = {
    windows,
    dashaContext: dashaContext
      ? {
          mahadashaLord: dashaContext.mahadashaLord,
          antardashaLord: dashaContext.antardashaLord,
          mahadashaEndDate: toIsoStringSafe(dashaContext.mahadashaEndDate),
          modifierApplied,
        }
      : null,
    generatedAt: new Date().toISOString(),
    cacheHit: false,
  };

  if (useCache) {
    await kvSet(key, response, KV_TTL.MUHURTA_PERSONALIZED_SECONDS);
  }
  return response;
}

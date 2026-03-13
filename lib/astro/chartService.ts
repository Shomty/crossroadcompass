// STATUS: done | Tasks 3.3, 3.4, 3.5
/**
 * lib/astro/chartService.ts
 * Orchestrator: KV cache-check → calculate/fetch → store in KV → return.
 * All callers use the public functions below.
 * Nothing else calls the HD library or Vedic API directly.
 *
 * Caching:
 *   HD chart    — KV, no TTL, invalidated when birth data changes (3.3)
 *   Vedic chart — KV, no TTL, invalidated when birth data changes (3.3)
 *   Transits    — see transitService.ts (3.6)
 */

import type { BirthProfile } from "@prisma/client";
import { calculateHDChart } from "@/lib/astro/hdCalculator";
import { fetchVedicNatalChart } from "@/lib/astro/vedicApiClient";
import { storeDashasFromChart } from "@/lib/astro/dashaService";
import { kvGet, kvSet, kvDeleteMany } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { db } from "@/lib/db";
import type { BirthInfo, HDChartData, VedicChartData } from "@/types";
import type { VedicChart } from "@/lib/astro/types";

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Convert a Prisma BirthProfile to the BirthInfo shape the HD library expects (UTC). */
function profileToBirthInfo(profile: BirthProfile): BirthInfo {
  const d = new Date(profile.birthDate);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    // Use noon (12:00) when birth time is unknown — partial profile per OB-04
    hour: profile.birthTimeKnown ? (profile.birthHour ?? 12) : 12,
    minute: profile.birthTimeKnown ? (profile.birthMinute ?? 0) : 0,
    second: 0,
    latitude: profile.latitude,
    longitude: profile.longitude,
  };
}

// ─── Task 3.3 — Cache invalidation ───────────────────────────────────────

/**
 * Delete all KV cache keys for a user.
 * Call this whenever birth data changes — stale charts are a content
 * correctness bug. See copilot-instructions section 19.
 * Does NOT touch transit keys — those expire automatically (24h TTL).
 */
export async function invalidateChartCache(userId: string): Promise<void> {
  await kvDeleteMany([
    kvKeys.vedicChart(userId),
    kvKeys.hdChart(userId),
    kvKeys.dashas(userId),
  ]);
}

// ─── Task 3.4 — HD chart: get or calculate ───────────────────────────────

/**
 * Returns the HD chart for a user, using KV cache when available.
 * Calculates and caches on miss. birthProfile is passed in — this
 * function does NOT query the DB itself.
 */
export async function getOrCreateHDChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<HDChartData> {
  const cached = await kvGet<HDChartData>(kvKeys.hdChart(userId));
  if (cached !== null) return cached;

  const birthInfo = profileToBirthInfo(birthProfile);
  const chart = calculateHDChart(birthInfo);

  await kvSet(kvKeys.hdChart(userId), chart, KV_TTL.NATAL_CHART);

  return chart;
}

// ─── Task 3.5 — Vedic natal chart: get or fetch ──────────────────────────

/**
 * Returns the Vedic natal chart for a user, using KV cache when available.
 * Fetches from the paid external API on cache miss.
 * birthProfile is passed in — this function does NOT query the DB itself.
 */
export async function getOrCreateVedicChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<VedicChartData> {
  // ── Layer 1: KV hot cache ────────────────────────────────────────────────
  const cached = await kvGet<VedicChartData>(kvKeys.vedicChart(userId));

  if (cached !== null) {
    // Chart is cached — but dashas may not have been stored yet (e.g. if a previous
    // fire-and-forget store raced or failed). Check and backfill if needed.
    const dashaCount = await db.dasha.count({ where: { userId } });
    if (dashaCount === 0) {
      const rawResponse = (cached as unknown as VedicChart).rawResponse;
      if (rawResponse) {
        await storeDashasFromChart(userId, rawResponse);
      }
    }
    return cached;
  }

  // ── Layer 2: DB durable store ────────────────────────────────────────────
  // Survives KV eviction; only re-fetched from the paid API when profileVersion changes.
  const dbProfile = await db.birthProfile.findUnique({
    where: { userId },
    select: { chartDataVedic: true, vedicProfileVersion: true, profileVersion: true },
  });

  if (
    dbProfile?.chartDataVedic != null &&
    dbProfile.vedicProfileVersion === dbProfile.profileVersion
  ) {
    const chartData = dbProfile.chartDataVedic as unknown as VedicChartData;
    await kvSet(kvKeys.vedicChart(userId), chartData, KV_TTL.NATAL_CHART);
    const dashaCount = await db.dasha.count({ where: { userId } });
    if (dashaCount === 0) {
      const rawResponse = (chartData as unknown as VedicChart).rawResponse;
      if (rawResponse) await storeDashasFromChart(userId, rawResponse);
    }
    return chartData;
  }

  // ── Layer 3: Vedic API (paid — only on true cache miss) ──────────────────
  // Build payload matching VedicBirthChartRequest (types.ts)
  const d = new Date(birthProfile.birthDate);
  const dateOfBirth = [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
  const hour = birthProfile.birthTimeKnown ? (birthProfile.birthHour ?? 12) : 12;
  const minute = birthProfile.birthTimeKnown ? (birthProfile.birthMinute ?? 0) : 0;
  const timeOfBirth = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const location = [birthProfile.birthCity, birthProfile.birthCountry].filter(Boolean).join(", ");
  const genderMap: Record<string, "male" | "female" | "other"> = {
    male: "male", female: "female", other: "other", prefer_not_to_say: "other",
  };
  const gender: "male" | "female" | "other" = genderMap[birthProfile.gender ?? ""] ?? "other";

  const chart = await fetchVedicNatalChart({
    dateOfBirth,
    timeOfBirth,
    location,
    isTimeApproximate: !birthProfile.birthTimeKnown,
    gender,
    name: birthProfile.birthName,
  });

  // Await dasha storage — must complete before caller queries the dasha table
  await storeDashasFromChart(userId, (chart as VedicChart).rawResponse);

  const chartData = chart as unknown as VedicChartData;

  // Persist to DB — survives KV eviction; only re-fetched when profileVersion changes
  await db.birthProfile.update({
    where: { userId },
    data: {
      chartDataVedic: chartData as object,
      vedicProfileVersion: birthProfile.profileVersion,
    },
  });

  await kvSet(kvKeys.vedicChart(userId), chartData, KV_TTL.NATAL_CHART);
  return chartData;
}

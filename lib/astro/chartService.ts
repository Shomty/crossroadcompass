// STATUS: done | Tasks 3.3, 3.4, 3.5
/**
 * lib/astro/chartService.ts
 * Orchestrator: KV cache-check → DB cache-check → calculate/fetch → store → return.
 * All callers use the public functions below.
 * Nothing else calls the HD library or Vedic API directly.
 *
 * Cache hierarchy:
 *   1. KV (Upstash Redis) — fastest; no-op stub when not configured
 *   2. DB  (BirthProfile.chartDataHumanDesign / chartDataVedic) — persistent fallback
 *   3. Recalculate / re-fetch — last resort
 *
 *   HD chart    — KV + DB, invalidated when birth data changes (3.3)
 *   Vedic chart — KV + DB, invalidated when birth data changes (3.3)
 *   Transits    — see transitService.ts (3.6)
 */

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { BirthProfile } from "@prisma/client";
import { calculateHDChart } from "@/lib/astro/hdCalculator";
import { fetchVedicNatalChart } from "@/lib/astro/vedicApiClient";
import { storeDashasFromChart } from "@/lib/astro/dashaService";
import { kvGet, kvSet, kvDeleteMany } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import type { BirthInfo, HDChartData, VedicChartData } from "@/types";
import type { VedicBirthChartRequest } from "@/lib/astro/types";

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
 * Delete all KV cache keys and null the DB chart columns for a user.
 * Call this whenever birth data changes — stale charts are a content
 * correctness bug. See copilot-instructions section 19.
 * Note: the PATCH /api/birth-profile handler already nulls chartDataHumanDesign
 * and chartDataVedic in DB via the transaction — this covers the KV side.
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
 * Returns the HD chart for a user.
 * Cache hierarchy: KV → BirthProfile.chartDataHumanDesign → recalculate.
 * Writes back to KV + DB on a cache miss so future calls skip recalculation.
 */
export async function getOrCreateHDChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<HDChartData> {
  // 1. KV hit
  const cached = await kvGet<HDChartData>(kvKeys.hdChart(userId));
  if (cached !== null) return cached;

  // 2. DB hit — chartDataHumanDesign set on previous calculation
  if (birthProfile.chartDataHumanDesign) {
    const dbChart = birthProfile.chartDataHumanDesign as unknown as HDChartData;
    // Repopulate KV so the next call is fast
    await kvSet(kvKeys.hdChart(userId), dbChart, KV_TTL.NATAL_CHART);
    return dbChart;
  }

  // 3. Calculate fresh
  const birthInfo = profileToBirthInfo(birthProfile);
  const chart = calculateHDChart(birthInfo);

  // Persist to KV + DB in parallel (fire-and-forget — don't block the caller)
  void Promise.all([
    kvSet(kvKeys.hdChart(userId), chart, KV_TTL.NATAL_CHART),
    db.birthProfile.update({
      where: { userId },
      data: {
        chartDataHumanDesign: chart as unknown as Prisma.InputJsonValue,
        hdProfileVersion: birthProfile.profileVersion,
      },
    }),
  ]).catch((err) => console.error("[chartService] HD persist failed:", err));

  return chart;
}

// ─── Task 3.5 — Vedic natal chart: get or fetch ──────────────────────────

/**
 * Returns the Vedic natal chart for a user.
 * Cache hierarchy: KV → BirthProfile.chartDataVedic → call external API.
 * Writes back to KV + DB on a cache miss to avoid repeat API charges.
 */
export async function getOrCreateVedicChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<VedicChartData> {
  // 1. KV hit
  const cached = await kvGet<VedicChartData>(kvKeys.vedicChart(userId));
  if (cached !== null) return cached;

  // 2. DB hit — chartDataVedic set on previous API call
  if (birthProfile.chartDataVedic) {
    const dbChart = birthProfile.chartDataVedic as unknown as VedicChartData;
    await kvSet(kvKeys.vedicChart(userId), dbChart, KV_TTL.NATAL_CHART);
    return dbChart;
  }

  // 3. Fetch from external Vedic API
  const d = new Date(birthProfile.birthDate);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hour = birthProfile.birthTimeKnown ? (birthProfile.birthHour ?? 12) : 12;
  const minute = birthProfile.birthTimeKnown ? (birthProfile.birthMinute ?? 0) : 0;

  const params: VedicBirthChartRequest = {
    dateOfBirth: `${d.getUTCFullYear()}-${month}-${day}`,
    timeOfBirth: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    location: `${birthProfile.birthCity}, ${birthProfile.birthCountry}`,
    isTimeApproximate: !birthProfile.birthTimeKnown,
    gender: (birthProfile.gender as "male" | "female" | "other") ?? "other",
    name: birthProfile.birthName,
  };

  const chart = await fetchVedicNatalChart(params);

  // Persist dashas to DB — embedded in chartD1, no separate API call needed
  if (chart.rawResponse) {
    await storeDashasFromChart(userId, chart.rawResponse);
  }

  // Persist chart to KV + DB in parallel
  void Promise.all([
    kvSet(kvKeys.vedicChart(userId), chart, KV_TTL.NATAL_CHART),
    db.birthProfile.update({
      where: { userId },
      data: {
        chartDataVedic: chart as unknown as Prisma.InputJsonValue,
        vedicProfileVersion: birthProfile.profileVersion,
      },
    }),
  ]).catch((err) => console.error("[chartService] Vedic persist failed:", err));

  return chart as unknown as VedicChartData;
}

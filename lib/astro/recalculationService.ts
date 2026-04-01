// STATUS: done | Synthesis Engine Phase 3.1
/**
 * lib/astro/recalculationService.ts
 * Orchestrates recalculation when birth profile changes.
 *
 * Triggered by PATCH /api/birth-profile when birth data changes.
 * Flow:
 * 1. Parallel execution: Vedic chart + Western transits
 * 2. Synthesis aggregation (merges both)
 * 3. Status update in KV (completion notification)
 * 4. Return immediately to user (async)
 *
 * Status tracking via KV:
 *   - recalc_status:{userId} = { status: 'pending'|'running'|'done', progress: %, timestamp }
 */

import type { BirthProfile } from "@prisma/client";
import { kvGet, kvSet, kvDelete } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { getOrCreateVedicChart, invalidateChartCache } from "@/lib/astro/chartService";
import { getWesternTransitTimeline, identifyLifeStageMilestones } from "@/lib/astro/transitService";
import { getOrBuildDashaTimeline } from "@/lib/astro/dashaTimelineService";
import { synthesizeCharts } from "@/lib/astro/synthesisService";

/**
 * Recalculation status tracking in KV.
 */
export interface RecalcStatus {
  status: 'pending' | 'running' | 'done' | 'error';
  progress: number;        // 0-100
  timestamp: string;       // ISO date
  errorMessage?: string;
}

/**
 * Start background recalculation job.
 * Returns immediately; actual work happens async.
 *
 * @param userId     - User ID
 * @param profile    - Updated birth profile
 * @returns Promise that resolves when status KV is set
 */
export async function triggerRecalculation(
  userId: string,
  profile: BirthProfile
): Promise<void> {
  // Set initial status
  const statusKey = `recalc_status:${userId}`;
  await kvSet(statusKey, {
    status: 'pending',
    progress: 0,
    timestamp: new Date().toISOString(),
  } as RecalcStatus, 24 * 60 * 60); // 24h TTL

  // Queue background job (using Promise.resolve to defer execution)
  // In production, use a proper job queue (Bull, RabbitMQ, AWS SQS, etc.)
  Promise.resolve()
    .then(() => runRecalculation(userId, profile))
    .catch((error) => {
      console.error('[recalculation] Error in background job:', error);
      // Mark as failed in KV
      updateRecalcStatus(userId, {
        status: 'error',
        progress: 0,
        timestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      }).catch(() => {});
    });
}

/**
 * Get current recalculation status.
 * Returns null if not recalculating or status expired.
 */
export async function getRecalcStatus(userId: string): Promise<RecalcStatus | null> {
  const statusKey = `recalc_status:${userId}`;
  return kvGet<RecalcStatus>(statusKey);
}

/**
 * Update recalculation status in KV.
 */
async function updateRecalcStatus(userId: string, status: RecalcStatus): Promise<void> {
  const statusKey = `recalc_status:${userId}`;
  await kvSet(statusKey, status, 24 * 60 * 60);
}

/**
 * Run full recalculation in background.
 * 1. Vedic chart recalculation
 * 2. Western transits recalculation
 * 3. Synthesis merging
 * 4. Status update
 *
 * This function runs async and doesn't block the HTTP response.
 */
async function runRecalculation(userId: string, profile: BirthProfile): Promise<void> {
  try {
    // Mark as running
    await updateRecalcStatus(userId, {
      status: 'running',
      progress: 10,
      timestamp: new Date().toISOString(),
    });

    // 1. Recalculate Vedic chart (invalidateChartCache called in PATCH, but we recalc anyway)
    await updateRecalcStatus(userId, {
      status: 'running',
      progress: 30,
      timestamp: new Date().toISOString(),
    });

    const vedicChart = await getOrCreateVedicChart(userId, profile);

    // 2. Recalculate Western transits
    await updateRecalcStatus(userId, {
      status: 'running',
      progress: 50,
      timestamp: new Date().toISOString(),
    });

    const today = new Date().toISOString().split('T')[0];
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const end30Days = in30Days.toISOString().split('T')[0];

    await getWesternTransitTimeline(userId, profile, today, end30Days);

    // 3. Recalculate Dasha timeline
    await updateRecalcStatus(userId, {
      status: 'running',
      progress: 70,
      timestamp: new Date().toISOString(),
    });

    await getOrBuildDashaTimeline(userId, profile, vedicChart);

    // 4. Synthesize both
    await updateRecalcStatus(userId, {
      status: 'running',
      progress: 85,
      timestamp: new Date().toISOString(),
    });

    await synthesizeCharts(
      userId,
      profile,
      vedicChart,
      { start: today, end: end30Days }
    );

    // Mark as complete
    await updateRecalcStatus(userId, {
      status: 'done',
      progress: 100,
      timestamp: new Date().toISOString(),
    });

    console.log(`[recalculation] Completed for user ${userId}`);
  } catch (error) {
    console.error(`[recalculation] Failed for user ${userId}:`, error);
    await updateRecalcStatus(userId, {
      status: 'error',
      progress: 0,
      timestamp: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Recalculation failed',
    });
  }
}

/**
 * Clear recalculation status (call after user acknowledges or after timeout).
 */
export async function clearRecalcStatus(userId: string): Promise<void> {
  const statusKey = `recalc_status:${userId}`;
  await kvDelete(statusKey);
}

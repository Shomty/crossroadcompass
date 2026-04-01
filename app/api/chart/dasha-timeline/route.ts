// STATUS: done | Synthesis Engine Phase 2.3
/**
 * GET /api/chart/dasha-timeline
 * Returns full 120-year Vedic Dasha timeline with activation scoring.
 * Maha Dasha periods with Antar Dasha sub-periods (0-100 strength scale).
 *
 * No query params required (user context from session).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { getOrBuildDashaTimeline } from "@/lib/astro/dashaTimelineService";
import type { VedicDashaTimeline } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "No birth profile" }, { status: 404 });
  }

  try {
    // Get natal chart (cached)
    const chart = await getOrCreateVedicChart(session.user.id, profile);

    // Build/fetch Dasha timeline
    const timeline: VedicDashaTimeline = await getOrBuildDashaTimeline(
      session.user.id,
      profile,
      chart
    );

    return NextResponse.json(timeline);
  } catch (e) {
    console.error("[GET /api/chart/dasha-timeline]", e);
    const message = e instanceof Error ? e.message : "Dasha timeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

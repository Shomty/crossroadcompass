// STATUS: done | Synthesis Engine Phase 2.1
/**
 * GET /api/chart/synthesis
 * Main orchestrator: Combines Western transits + Vedic Dasha into unified timeline.
 * Returns convergence events, critical dates, matched If-Then rules.
 *
 * Query params:
 *   - start: YYYY-MM-DD (optional, default: today)
 *   - end: YYYY-MM-DD (optional, default: today + 30 days)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { synthesizeCharts } from "@/lib/astro/synthesisService";
import type { SynthesisResult } from "@/types";

export async function GET(request: NextRequest) {
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
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const dateRange = start && end ? { start, end } : undefined;

    // Get natal chart (cached)
    const chart = await getOrCreateVedicChart(session.user.id, profile);

    // Synthesize
    const result: SynthesisResult = await synthesizeCharts(
      session.user.id,
      profile,
      chart,
      dateRange
    );

    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/chart/synthesis]", e);
    const message = e instanceof Error ? e.message : "Synthesis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

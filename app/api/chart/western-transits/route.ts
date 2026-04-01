// STATUS: done | Synthesis Engine Phase 2.2
/**
 * GET /api/chart/western-transits
 * Returns Western tropical transits for a date range.
 * All planets (not just slow planets) with aspects calculated.
 *
 * Query params:
 *   - start: YYYY-MM-DD (required)
 *   - end: YYYY-MM-DD (required)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWesternTransitTimeline, identifyLifeStageMilestones } from "@/lib/astro/transitService";
import { prismaProfileToBirthInfo } from "@/lib/astro/birthInfoMapper";
import type { TransitTimeline } from "@/types";

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

    if (!start || !end) {
      return NextResponse.json(
        { error: "Missing required params: start, end (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      return NextResponse.json({ error: "Invalid date format (YYYY-MM-DD)" }, { status: 400 });
    }

    // Get transits
    const timeline: TransitTimeline = await getWesternTransitTimeline(
      session.user.id,
      profile,
      start,
      end
    );

    // Add life stage milestones
    const milestones = identifyLifeStageMilestones(
      new Date(profile.birthDate),
      new Date()
    );

    const keyEvents = timeline.keyEvents.concat(
      milestones
        .filter(m => m.date.toISOString().split('T')[0] >= start && m.date.toISOString().split('T')[0] <= end)
        .map(m => ({
          date: m.date.toISOString().split('T')[0],
        planet: 'saturn' as const,
          type: m.type as any,
          description: m.description,
          strength: m.strength,
        }))
    );

    return NextResponse.json({
      ...timeline,
      keyEvents,
    });
  } catch (e) {
    console.error("[GET /api/chart/western-transits]", e);
    const message = e instanceof Error ? e.message : "Transit calculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

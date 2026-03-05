/**
 * app/api/insights/generate/route.ts
 * POST /api/insights/generate
 * Generates today's daily insight for the authenticated user.
 * Idempotent — returns existing insight if already generated today.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { generateDailyInsight, getTodaysDailyInsight } from "@/lib/ai/dailyInsightService";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json(
      { error: "No birth profile found. Complete onboarding first." },
      { status: 404 }
    );
  }

  try {
    // Return existing insight if already generated today
    const existing = await getTodaysDailyInsight(userId);
    if (existing) {
      return NextResponse.json({ insight: existing, cached: true });
    }

    const chart = await getOrCreateHDChart(userId, profile);
    const insight = await generateDailyInsight(userId, chart, profile.birthName);

    return NextResponse.json({ insight, cached: false });
  } catch (err) {
    console.error("[insights/generate] failed:", err);
    return NextResponse.json(
      { error: "Insight generation failed. Please try again." },
      { status: 500 }
    );
  }
}

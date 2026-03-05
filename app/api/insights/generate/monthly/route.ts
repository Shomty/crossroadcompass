/**
 * app/api/insights/generate/monthly/route.ts
 * POST /api/insights/generate/monthly
 * Generates this month's forecast for the authenticated user.
 * Idempotent — returns cached forecast if already generated this month.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { generateMonthlyForecast, getThisMonthsForecast } from "@/lib/ai/forecastService";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "No birth profile found." }, { status: 404 });

  try {
    const existing = await getThisMonthsForecast(userId);
    if (existing) return NextResponse.json({ forecast: existing, cached: true });

    const chart = await getOrCreateHDChart(userId, profile);
    const forecast = await generateMonthlyForecast(userId, chart, profile.birthName);
    return NextResponse.json({ forecast, cached: false });
  } catch (err) {
    console.error("[insights/generate/monthly] failed:", err);
    return NextResponse.json({ error: "Forecast generation failed. Please try again." }, { status: 500 });
  }
}

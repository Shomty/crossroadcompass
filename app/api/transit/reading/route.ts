/**
 * app/api/transit/reading/route.ts
 * GET /api/transit/reading
 *
 * Returns today's transit reading for the authenticated user:
 *   1. Loads user's natal Vedic chart (from cache/DB)
 *   2. Fetches/caches today's transit chart (birth-charts API with today's date)
 *   3. Generates and caches a Gemini AI reading based on Parasara Hora
 *
 * Cached in KV — Gemini is called at most once per user per day.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { getTodayTransitChart } from "@/lib/astro/transitChartService";
import { generateTransitReading, getCachedTransitReading } from "@/lib/ai/transitReadingService";
import type { VedicChart } from "@/lib/astro/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Check for a cached reading first (avoid all downstream calls)
  const cached = await getCachedTransitReading(userId);
  if (cached) {
    return NextResponse.json({ reading: cached, source: "cache" });
  }

  // Load birth profile
  const profile = await db.birthProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "No birth profile found. Complete onboarding first." },
      { status: 404 }
    );
  }

  // Load natal chart
  let natalChart: VedicChart;
  try {
    const raw = await getOrCreateVedicChart(userId, profile);
    natalChart = raw as unknown as VedicChart;
  } catch {
    return NextResponse.json(
      { error: "Could not load your natal chart. Please try again." },
      { status: 502 }
    );
  }

  // Fetch today's transit chart (KV-cached per day)
  const transitChart = await getTodayTransitChart(userId, profile);
  if (!transitChart) {
    console.error("[transit/reading] Transit chart unavailable for userId:", userId);
    return NextResponse.json(
      { error: "Transit chart unavailable. Please try again later." },
      { status: 503 }
    );
  }

  // Get active dasha lord for context
  const now = new Date();
  const activeMaha = await db.dasha.findFirst({
    where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } },
    select: { planetName: true },
  });
  const dashaLord = activeMaha?.planetName ?? null;

  // Generate AI reading
  const userName = session.user.name ?? session.user.email?.split("@")[0] ?? "the native";
  const location = [profile.birthCity, profile.birthCountry].filter(Boolean).join(", ") || "Unknown location";
  try {
    const reading = await generateTransitReading(
      userId,
      natalChart,
      transitChart,
      dashaLord,
      userName,
      location
    );
    return NextResponse.json({ reading, source: "generated" });
  } catch (err) {
    console.error("[transit/reading] Gemini error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Could not generate transit reading. Please try again." },
      { status: 502 }
    );
  }
}

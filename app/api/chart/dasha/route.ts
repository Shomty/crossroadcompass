/**
 * GET /api/chart/dasha — Vimshottari periods + current Maha/Antar (FE-05).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart, getChartCurrentDasha } from "@/lib/astro/chartService";
import { getVedicCalculator } from "@/lib/astro/calculatorService";

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
    const chart = await getOrCreateVedicChart(session.user.id, profile);
    const current = getChartCurrentDasha(chart);
    const calc = getVedicCalculator();
    const remaining = current.mahaDasha
      ? calc.getRemainingDashaTime(current.mahaDasha, new Date())
      : null;

    const periods = JSON.parse(
      JSON.stringify(chart.dashas.vimshottari, (_k, v) => (v instanceof Date ? (v as Date).toISOString() : v))
    );

    const currentSerialized = JSON.parse(
      JSON.stringify(current, (_k, v) => (v instanceof Date ? (v as Date).toISOString() : v))
    );

    return NextResponse.json({
      periods,
      current: currentSerialized,
      remaining,
    });
  } catch (e) {
    console.error("[GET /api/chart/dasha]", e);
    return NextResponse.json({ error: "Dasha calculation failed" }, { status: 500 });
  }
}

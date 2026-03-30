/**
 * GET /api/chart — natal Vedic chart JSON for UI + background pre-warm.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { serializeVedicChart } from "@/lib/astro/serializeVedicChart";

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
    const chartJson = serializeVedicChart(chart);
    return NextResponse.json({
      chart: chartJson,
      birthTimeKnown: profile.birthTimeKnown,
    });
  } catch (e) {
    console.error("[GET /api/chart]", e);
    return NextResponse.json({ error: "Chart calculation failed" }, { status: 500 });
  }
}

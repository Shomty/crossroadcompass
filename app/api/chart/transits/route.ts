/**
 * GET /api/chart/transits — today's sidereal transit chart (FE-09).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateTodayTransits } from "@/lib/astro/chartService";
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

  const timezone = profile.timezone;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  try {
    const transitChart = await getOrCreateTodayTransits(session.user.id, profile);
    return NextResponse.json({
      transitChart: serializeVedicChart(transitChart),
      date: today,
    });
  } catch (e) {
    console.error("[GET /api/chart/transits]", e);
    return NextResponse.json({ error: "Transit calculation failed" }, { status: 500 });
  }
}

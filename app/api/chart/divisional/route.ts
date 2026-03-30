/**
 * GET /api/chart/divisional — all divisional charts (FE-08).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateDivisionalCharts } from "@/lib/astro/chartService";
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
    const divisional = await getOrCreateDivisionalCharts(session.user.id, profile);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(divisional)) {
      out[k] = serializeVedicChart(v);
    }
    return NextResponse.json({ divisional: out });
  } catch (e) {
    console.error("[GET /api/chart/divisional]", e);
    return NextResponse.json({ error: "Divisional charts failed" }, { status: 500 });
  }
}

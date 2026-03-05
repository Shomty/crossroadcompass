/**
 * app/api/hd-chart/route.ts
 * GET /api/hd-chart
 * Returns the HD chart for the authenticated user.
 * Uses KV cache + recalculates on cache miss.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "No birth profile found. Complete onboarding first." },
      { status: 404 }
    );
  }

  try {
    const chart = await getOrCreateHDChart(session.user.id, profile);
    return NextResponse.json({ chart });
  } catch (err) {
    console.error("[hd-chart] calculation failed:", err);
    return NextResponse.json(
      { error: "Chart calculation failed. Please check your birth data." },
      { status: 500 }
    );
  }
}

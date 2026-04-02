/**
 * GET /api/chart/sudarshana-chakra
 *
 * Returns the three-layered Sudarshana Chakra computed from the user's
 * cached natal Vedic chart. No new DB writes — reuses the KV/DB chart cache.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { computeSudarshanChakra } from "@/lib/astro/sudarshanaChakraService";

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
    const chakra = computeSudarshanChakra(chart);
    return NextResponse.json({ chakra });
  } catch (e) {
    console.error("[GET /api/chart/sudarshana-chakra]", e);
    return NextResponse.json(
      { error: "Sudarshana Chakra calculation failed" },
      { status: 500 }
    );
  }
}

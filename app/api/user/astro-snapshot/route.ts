/**
 * PATCH /api/user/astro-snapshot — upsert UserAstroSnapshot from computed chart (client first load).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { buildSnapshotUpsertData } from "@/lib/astro/snapshotFromChart";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "No birth profile" }, { status: 404 });
  }

  try {
    const chart = await getOrCreateVedicChart(userId, profile);
    const existing = await db.userAstroSnapshot.findUnique({
      where: { userId },
      select: { feJson: true },
    });
    const existingFe =
      existing?.feJson && typeof existing.feJson === "object" && !Array.isArray(existing.feJson)
        ? (existing.feJson as Record<string, unknown>)
        : null;

    const data = buildSnapshotUpsertData(chart, profile, existingFe);

    await db.userAstroSnapshot.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[PATCH /api/user/astro-snapshot]", e);
    return NextResponse.json({ error: "Snapshot update failed" }, { status: 500 });
  }
}

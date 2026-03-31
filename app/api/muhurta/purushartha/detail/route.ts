/**
 * POST /api/muhurta/purushartha/detail
 * Single-instant D1 + Pañcāṅga summary for a selected heatmap cell.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { computePurusharthaDetail } from "@/lib/astro/muhurta/purusharthaMuhurtaService";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  instant: z.string().min(10),
  timeZone: z.string().min(2).max(80),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const instantUtc = new Date(parsed.data.instant);
    if (!Number.isFinite(instantUtc.getTime())) {
      return NextResponse.json({ error: "Invalid instant" }, { status: 400 });
    }

    const detail = await computePurusharthaDetail(
      instantUtc,
      parsed.data.timeZone,
      parsed.data.latitude,
      parsed.data.longitude,
      session.user.id
    );

    return NextResponse.json(detail);
  } catch (e) {
    console.error("[purushartha detail]", e);
    const detail =
      e instanceof Error ? e.message.slice(0, 600) : String(e).slice(0, 600);
    return NextResponse.json({ error: "Detail failed", detail }, { status: 500 });
  }
}

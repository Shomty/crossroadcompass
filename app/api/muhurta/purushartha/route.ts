/**
 * POST /api/muhurta/purushartha
 * Scan Muhūrta slots (Swiss Ephemeris) with Pañcāṅga + Pañcaka + Gaṇḍānta + Lagna lord filter.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  PURUSHARTHA_MAX_HOURS,
  scanPurusharthaWindows,
} from "@/lib/astro/muhurta/purusharthaMuhurtaService";
import { wallTimeToUtc } from "@/lib/astro/muhurta/wallTimeToUtc";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  /** Civil wall time at `timeZone`: `yyyy-MM-ddTHH:mm` */
  startLocal: z.string().min(16).max(48),
  timeZone: z.string().min(2).max(80),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  windowHours: z.number().int().min(1).max(PURUSHARTHA_MAX_HOURS).optional(),
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

    const { startLocal, timeZone, latitude, longitude, windowHours } = parsed.data;
    let startUtc: Date;
    try {
      startUtc = wallTimeToUtc(startLocal, timeZone);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid start time or timezone — use yyyy-MM-ddTHH:mm and a valid IANA zone (e.g. Europe/Belgrade).",
        },
        { status: 400 }
      );
    }
    if (!Number.isFinite(startUtc.getTime())) {
      return NextResponse.json({ error: "Invalid start datetime" }, { status: 400 });
    }

    const hours = windowHours ?? PURUSHARTHA_MAX_HOURS;
    const { slots, intervalMinutes } = await scanPurusharthaWindows({
      startUtc,
      timeZone,
      latitude,
      longitude,
      windowHours: hours,
      userId: session.user.id,
    });

    return NextResponse.json({
      slots,
      intervalMinutes,
      windowHours: hours,
      timeZone,
      latitude,
      longitude,
    });
  } catch (e) {
    console.error("[purushartha scan]", e);
    const detail =
      e instanceof Error ? e.message.slice(0, 600) : String(e).slice(0, 600);
    return NextResponse.json(
      {
        error: "Scan failed",
        detail,
      },
      { status: 500 }
    );
  }
}

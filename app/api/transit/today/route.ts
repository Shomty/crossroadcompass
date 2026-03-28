/**
 * app/api/transit/today/route.ts
 * POST /api/transit/today
 *
 * Generates a Vedic chart for the current date/time and the user's
 * observation location. Date and time are resolved server-side at request time.
 *
 * Body: { latitude: number, longitude: number, timezone: string }
 * Auth: session required.
 *
 * Caching: KV key `transit:chart:<lat>:<lng>:<YYYY-MM-DD>`, TTL 6h.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { fetchVedicNatalChart } from "@/lib/astro/vedicApiClient";
import { kvGet, kvSet } from "@/lib/kv/helpers";

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

const bodySchema = z.object({
  latitude:  z.number(),
  longitude: z.number(),
  timezone:  z.string().min(1),
});

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { latitude, longitude, timezone } = parsed.data;
  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "User";

  // Resolve current date and time server-side at moment of request
  const now = new Date();
  const dateOfBirth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const timeOfBirth = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  // Cache keyed by coords (rounded to 2dp) + date — positions are location-specific
  const latKey = latitude.toFixed(2);
  const lngKey = longitude.toFixed(2);
  const cacheKey = `transit:chart:${latKey}:${lngKey}:${dateOfBirth}`;

  type ChartResponse = {
    chart: { planets: unknown[]; ascendant: unknown; sunSign: string | null; moonSign: string | null; currentDasha: null };
    meta: { name: string; dateOfBirth: string; timeOfBirth: string; generatedAt: string };
  };

  const cached = await kvGet<ChartResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, meta: { ...cached.meta, name, timeOfBirth } });
  }

  try {
    const chart = await fetchVedicNatalChart({
      dateOfBirth,
      timeOfBirth,
      latitude,
      longitude,
      timezone,
      gender: "male",
      name,
    });

    const d1 = chart.rawResponse.chartD1;
    const sunPlanet  = d1.planets.find((p: { name: string }) => p.name === "sun");
    const moonPlanet = d1.planets.find((p: { name: string }) => p.name === "moon");

    const payload: ChartResponse = {
      chart: {
        planets:      d1.planets,
        ascendant:    d1.ascendant,
        sunSign:      sunPlanet?.sign  ?? null,
        moonSign:     moonPlanet?.sign ?? null,
        currentDasha: null,
      },
      meta: {
        name,
        dateOfBirth,
        timeOfBirth,
        generatedAt: now.toISOString(),
      },
    };

    await kvSet(cacheKey, payload, CACHE_TTL_SECONDS);
    return NextResponse.json(payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[transit/today] chart generation error:", msg, err);
    return NextResponse.json(
      { error: "Chart generation failed. Please try again.", detail: msg },
      { status: 500 }
    );
  }
}

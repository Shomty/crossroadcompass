/**
 * app/api/transit/today/route.ts
 * POST /api/transit/today
 *
 * Generates a Vedic birth chart for the current date/time and the user's
 * supplied location. Date and time are resolved server-side at request time.
 *
 * Body: { location: string }  — e.g. "Skopje, North Macedonia"
 * Auth: session required.
 *
 * Caching: KV key `transit:chart:<location>:<YYYY-MM-DD>`, TTL 6h.
 * Prevents redundant Vedic API calls when the same location is requested
 * multiple times on the same day.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { fetchVedicNatalChart } from "@/lib/astro/vedicApiClient";
import { kvGet, kvSet } from "@/lib/kv/helpers";

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours — positions change slowly intra-day

const bodySchema = z.object({
  location: z.string().min(1, "Location is required"),
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

  const { location } = parsed.data;
  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "User";

  // Resolve current date and time server-side at moment of request
  const now = new Date();
  const dateOfBirth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const timeOfBirth = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  // Check KV cache — keyed by location + date (not userId, positions are location-specific)
  // Prefix "transit:chart:" is distinct from "transit:<userId>:<date>" (reading cache)
  const cacheKey = `transit:chart:${location}:${dateOfBirth}`;

  type ChartResponse = {
    chart: { planets: unknown[]; ascendant: unknown; sunSign: string | null; moonSign: string | null; currentDasha: null };
    meta: { name: string; dateOfBirth: string; timeOfBirth: string; location: string; generatedAt: string };
  };

  const cached = await kvGet<ChartResponse>(cacheKey);
  if (cached) {
    // Update name in cached response so it shows the requesting user's name
    return NextResponse.json({ ...cached, meta: { ...cached.meta, name, timeOfBirth } });
  }

  try {
    const chart = await fetchVedicNatalChart({
      dateOfBirth,
      timeOfBirth,
      location,
      isTimeApproximate: false,
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
        location,
        generatedAt: now.toISOString(),
      },
    };

    // Cache without user-specific fields (name/timeOfBirth are patched on cache hit above)
    await kvSet(cacheKey, payload, CACHE_TTL_SECONDS);

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[transit/today] Vedic API error:", err);
    return NextResponse.json(
      { error: "Chart generation failed. Please try again." },
      { status: 502 }
    );
  }
}

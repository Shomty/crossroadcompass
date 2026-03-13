/**
 * TEMPORARY DEV TOOL — DELETE AFTER USE
 * GET /api/dev-probe-vedic
 * Probes the Vedic API to discover valid endpoint paths.
 * Only works in development.
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  const BASE = process.env.VEDIC_API_URL;
  const KEY  = process.env.VEDIC_API_KEY;

  if (!BASE || !KEY) {
    return NextResponse.json({ error: "VEDIC_API_URL or VEDIC_API_KEY not set" }, { status: 500 });
  }

  const PATHS = [
    "birth-chart", "birth_chart", "natal-chart", "natal_chart",
    "birthchart",  "chart",       "natal",        "horoscope",
    "birth-charts","planets",     "planetary-positions",
    "astro",       "kundali",     "rasi",          "lagna",
    "divisional",  "chartData",   "calculate",      "generate",
  ];

  const BODY = JSON.stringify({
    year: 1990, month: 5, day: 15, hour: 12, minute: 0,
    latitude: 41.9981, longitude: 21.4254,
  });

  const results: Record<string, { status: number; body: string }> = {};

  for (const p of PATHS) {
    try {
      const r = await fetch(`${BASE}/${p}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": KEY },
        body: BODY,
        signal: AbortSignal.timeout(5000),
      });
      const text = await r.text();
      results[p] = { status: r.status, body: text.slice(0, 200) };
    } catch (e: unknown) {
      results[p] = { status: 0, body: String(e) };
    }
  }

  // Summarise: anything that isn't 404 is interesting
  const found = Object.entries(results).filter(([, v]) => v.status !== 404);
  return NextResponse.json({ base: BASE, found, all: results });
}

/**
 * GET /api/dev-probe-vedic
 * Development-only: verifies openastrology-library + Swiss Ephemeris can initialise.
 * Replaces the old REST API probe (VEDIC_API_URL / VEDIC_API_KEY).
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getVedicCalculator } from "@/lib/astro/calculatorService";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  try {
    getVedicCalculator();
    return NextResponse.json({
      ok: true,
      source: "openastrology-library",
      message: "VedicAstrologyCalculator initialised (singleton)",
      ephePath: process.env.EPHE_PATH ?? "./ephe",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: "Calculator init failed — check EPHE_PATH and .se1 files",
        detail: message,
      },
      { status: 500 }
    );
  }
}

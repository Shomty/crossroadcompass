/**
 * POST /api/oracle/reading
 * Crossroads Oracle™ — theme + optional force → structured reading (KV-cached).
 */

import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/helpers";
import { getCrossroadsOracleReading } from "@/lib/ai/crossroadsOracleService";
import { isOracleTheme } from "@/types/oracle";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequiredSession();
    const userId = session.user.id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
    }

    const theme = (body as { theme?: unknown }).theme;
    const force = Boolean((body as { force?: unknown }).force);

    if (!isOracleTheme(theme)) {
      return NextResponse.json(
        { error: "Missing or invalid theme (IDENTITY | CAREER | LOVE | FEAR | LOSS)" },
        { status: 400 }
      );
    }

    const reading = await getCrossroadsOracleReading(userId, theme, force);
    return NextResponse.json({ reading });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (msg === "DASHA_NOT_READY") {
      return NextResponse.json(
        { error: "Dasha periods are not ready yet. Open your chart or try again shortly." },
        { status: 412 }
      );
    }
    if (msg === "BIRTH_PROFILE_INCOMPLETE") {
      return NextResponse.json(
        { error: "Complete your birth profile to receive a reading." },
        { status: 422 }
      );
    }
    console.error("[api/oracle/reading]", err);
    return NextResponse.json({ error: "Reading could not be generated." }, { status: 500 });
  }
}

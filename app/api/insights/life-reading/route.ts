/**
 * POST /api/insights/life-reading
 * Body: { type: "career" | "love" | "health", force?: boolean }
 *
 * VIP-only endpoint. Returns cached reading or generates a new one.
 * Pass force: true to bypass cache and regenerate from Gemini.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLifeReading, generateLifeReading } from "@/lib/ai/lifeReadingService";

const VALID_TYPES = ["career", "love", "health", "jyotish"] as const;
type ReadingType = typeof VALID_TYPES[number];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: { type?: unknown; force?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, force } = body;
  if (!VALID_TYPES.includes(type as ReadingType)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // ── VIP gate (server-side) ────────────────────────────────────────────────
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const isVip = isAdmin || sub?.tier === "VIP";

  if (!isVip) {
    return NextResponse.json({ error: "VIP membership required" }, { status: 403 });
  }

  // ── Birth profile ─────────────────────────────────────────────────────────
  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Birth profile not found" }, { status: 404 });
  }

  // ── Return cache unless force=true ────────────────────────────────────────
  const readingType = type as ReadingType;

  if (!force) {
    const cached = await getLifeReading(userId, readingType);
    if (cached) {
      return NextResponse.json({ reading: cached, cached: true });
    }
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  try {
    const reading = await generateLifeReading(userId, readingType, profile);
    return NextResponse.json({ reading, cached: false });
  } catch (err) {
    console.error(`[life-reading] generation failed for ${readingType}:`, err);
    return NextResponse.json(
      { error: "Reading generation failed. Please try again." },
      { status: 500 }
    );
  }
}

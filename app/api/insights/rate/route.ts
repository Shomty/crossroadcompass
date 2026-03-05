// STATUS: done | Task 8.0
/**
 * app/api/insights/rate/route.ts
 * GET  — rates via email link, redirects to /dashboard (no JS required)
 * POST — rates from dashboard UI with optimistic update, returns { ok: true }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    // Redirect to login, then back here after auth.
    const returnUrl = encodeURIComponent(req.nextUrl.toString());
    return NextResponse.redirect(new URL(`/login?callbackUrl=${returnUrl}`, req.url));
  }

  const { searchParams } = req.nextUrl;
  const insightId = searchParams.get("insightId");
  const ratingStr = searchParams.get("rating");
  const rating = ratingStr ? parseInt(ratingStr, 10) : NaN;

  if (!insightId || isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  try {
    // Only allow rating insights that belong to this user.
    await db.insight.updateMany({
      where: { id: insightId, userId: session.user.id },
      data: { accuracyRating: rating },
    });
  } catch (err) {
    console.error("[insights/rate] failed:", err);
  }

  return NextResponse.redirect(new URL("/dashboard?rated=true", req.url));
}

// ─── POST — dashboard UI (JSON body, optimistic update) ─────────────────────

const rateSchema = z.object({
  insightId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = rateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
  }

  const { insightId, rating } = parsed.data;

  try {
    await db.insight.updateMany({
      where: { id: insightId, userId: session.user.id },
      data: { accuracyRating: rating },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[insights/rate POST] failed:", err);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}

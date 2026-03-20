/**
 * app/api/subscribe/route.ts
 * Deprecated subscription endpoint.
 *
 * POST /api/subscribe
 *
 * Card collection has been removed from the app. All upgrades must go through
 * Stripe Checkout via /api/stripe/checkout.
 */

import { NextResponse } from "next/server";

// ─── POST ──────────────────────────────────────────────────────────────────

export async function POST(_request: Request) {
  return NextResponse.json(
    {
      error: "Deprecated endpoint. Use /api/stripe/checkout for subscription upgrades.",
    },
    { status: 410 }
  );
}

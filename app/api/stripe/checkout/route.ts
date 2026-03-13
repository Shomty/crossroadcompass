/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for CORE or VIP tier.
 * Returns { url } — the client redirects the browser to this URL.
 *
 * Body: { tier: "CORE" | "VIP" }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe, STRIPE_PRICES } from "@/lib/payments/stripeClient";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = (await req.json()) as { tier?: string };
  if (tier !== "CORE" && tier !== "VIP") {
    return NextResponse.json({ error: "Invalid tier. Must be CORE or VIP." }, { status: 400 });
  }

  const priceId = STRIPE_PRICES[tier];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID for ${tier} is not configured. Set STRIPE_PRICE_${tier === "CORE" ? "CORE_MONTHLY" : "VIP_QUARTERLY"} in your environment.` },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const appUrl = (env.APP_URL ?? env.NEXTAUTH_URL).replace(/\/$/, "");

  // Re-use existing Stripe customer if present, otherwise Stripe creates one from email
  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true },
  });
  const customerParam = sub?.stripeCustomerId
    ? { customer: sub.stripeCustomerId }
    : { customer_email: session.user.email };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...customerParam,
    metadata: { userId: session.user.id, tier },
    success_url: `${appUrl}/dashboard?subscribed=true`,
    cancel_url: `${appUrl}/subscribe`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId: session.user.id, tier },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

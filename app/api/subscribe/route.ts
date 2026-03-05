/**
 * app/api/subscribe/route.ts
 * Purchase or upgrade a subscription tier.
 *
 * POST /api/subscribe
 *
 * Uses mockPaymentService in development.
 * TODO (task #11): swap mockCharge() for real Stripe checkout.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  mockCharge,
  TIER_PRICES,
} from "@/lib/payments/mockPaymentService";
import { SubscriptionTier } from "@prisma/client";

// ─── Validation ────────────────────────────────────────────────────────────

const subscribeSchema = z.object({
  tier: z.enum(["CORE", "VIP"]),
  card: z.object({
    number: z.string().min(1),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Use MM/YY format"),
    cvc: z.string().min(1),
    name: z.string().min(1),
  }),
});

// ─── POST ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { tier, card } = parsed.data;
  const price = TIER_PRICES[tier as Exclude<SubscriptionTier, "FREE">];

  // Run mock charge
  const result = await mockCharge(card, price.amountCents, tier as SubscriptionTier);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 402 });
  }

  // Upsert subscription record
  const now = new Date();
  const periodEnd = new Date(now);
  if (tier === "CORE") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 3);
  }

  await db.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      tier: tier as SubscriptionTier,
      status: "ACTIVE",
      // TODO (task #11): populate stripeCustomerId + stripeSubscriptionId
      stripeCustomerId: `mock_customer_${session.user.id}`,
      stripeSubscriptionId: result.transactionId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      tier: tier as SubscriptionTier,
      status: "ACTIVE",
      stripeSubscriptionId: result.transactionId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  return NextResponse.json({
    success: true,
    tier,
    transactionId: result.transactionId,
    currentPeriodEnd: periodEnd.toISOString(),
  });
}

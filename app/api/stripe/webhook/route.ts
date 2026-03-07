/**
 * POST /api/stripe/webhook
 * Receives Stripe events and keeps the DB subscription in sync.
 *
 * Events handled:
 *   checkout.session.completed       — activate subscription after first payment
 *   customer.subscription.updated    — tier/status changes, renewals
 *   customer.subscription.deleted    — downgrade to FREE on cancellation
 *   invoice.payment_failed           — mark subscription PAST_DUE
 *
 * Stripe sends the raw body — must NOT parse as JSON before verifying signature.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/payments/stripeClient";
import { SubscriptionTier } from "@prisma/client";

export const runtime = "nodejs";

// Map Stripe price IDs → our SubscriptionTier
function tierFromPriceId(priceId: string | null): SubscriptionTier {
  if (!priceId) return "FREE";
  const corePriceId = process.env.STRIPE_PRICE_CORE_MONTHLY ?? "__none__";
  const vipPriceId = process.env.STRIPE_PRICE_VIP_QUARTERLY ?? "__none__";
  if (priceId === corePriceId) return "CORE";
  if (priceId === vipPriceId) return "VIP";
  return "CORE"; // fallback for unknown prices — assume paid
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.mode !== "subscription") break;
        await handleCheckoutComplete(cs);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(inv);
        break;
      }
      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleCheckoutComplete(cs: Stripe.Checkout.Session) {
  const userId = cs.metadata?.userId;
  if (!userId) return;

  // Retrieve full subscription from Stripe to get price + period info
  const stripeSub = await getStripe().subscriptions.retrieve(cs.subscription as string);
  const item = stripeSub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const tier = tierFromPriceId(priceId);
  const periodStart = item?.current_period_start ? new Date(item.current_period_start * 1000) : null;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status: "ACTIVE",
      stripeCustomerId: cs.customer as string,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    update: {
      tier,
      status: "ACTIVE",
      stripeCustomerId: cs.customer as string,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionUpdate(stripeSub: Stripe.Subscription) {
  const existing = await db.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSub.id },
  });
  if (!existing) return;

  const item = stripeSub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const tier = tierFromPriceId(priceId);
  const periodStart = item?.current_period_start ? new Date(item.current_period_start * 1000) : null;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;
  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "ACTIVE",
    trialing: "ACTIVE",
  };

  await db.subscription.update({
    where: { stripeSubscriptionId: stripeSub.id },
    data: {
      tier,
      status: (statusMap[stripeSub.status] ?? "ACTIVE") as "ACTIVE" | "PAST_DUE" | "CANCELLED",
      stripePriceId: priceId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSub.id },
    data: { tier: "FREE", status: "CANCELLED", cancelAtPeriodEnd: false },
  });
}

async function handlePaymentFailed(inv: Stripe.Invoice) {
  const subId =
    inv.parent?.type === "subscription_details"
      ? (inv.parent.subscription_details?.subscription as string | undefined)
      : undefined;
  if (!subId) return;
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subId },
    data: { status: "PAST_DUE" },
  });
}

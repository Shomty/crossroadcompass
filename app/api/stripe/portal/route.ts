/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session so users can manage/cancel their subscription.
 * Returns { url } — client redirects to Stripe's hosted portal.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/payments/stripeClient";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!sub?.stripeCustomerId || sub.stripeCustomerId.startsWith("mock_")) {
    return NextResponse.json({ error: "No active Stripe subscription found." }, { status: 404 });
  }

  const appUrl = (env.APP_URL ?? env.NEXTAUTH_URL).replace(/\/$/, "");
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  });

  return Response.redirect(portalSession.url, 302);
}

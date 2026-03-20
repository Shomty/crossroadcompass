// STATUS: done | Premium Features - Purpose Decoder
/**
 * app/api/purpose/analyze/route.ts
 * API endpoint for generating purpose insights.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getOrGeneratePurposeInsight,
  generateGlimpsePurposeInsight,
} from "@/lib/ai/purposeInsightService";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const forceRegenerate = body.force === true;

    const birthProfile = await db.birthProfile.findUnique({
      where: { userId },
    });

    if (!birthProfile) {
      return NextResponse.json(
        { error: "Birth profile not found" },
        { status: 404 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { tier: true },
    });

    const tier = subscription?.tier ?? "FREE";
    const isAdmin = session.user?.email === "shomty@hotmail.com";
    const isPremium = isAdmin || tier === "CORE" || tier === "VIP";

    if (isPremium) {
      const insight = await getOrGeneratePurposeInsight(
        userId,
        birthProfile,
        forceRegenerate
      );
      return NextResponse.json({ insight, tier: "premium" });
    } else {
      const glimpse = await generateGlimpsePurposeInsight(userId, birthProfile);
      return NextResponse.json({ insight: glimpse, tier: "glimpse" });
    }
  } catch (error) {
    console.error("[purpose/analyze] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze purpose" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const birthProfile = await db.birthProfile.findUnique({
      where: { userId },
    });

    if (!birthProfile) {
      return NextResponse.json(
        { error: "Birth profile not found" },
        { status: 404 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { tier: true },
    });

    const tier = subscription?.tier ?? "FREE";
    const isAdmin = session.user?.email === "shomty@hotmail.com";
    const isPremium = isAdmin || tier === "CORE" || tier === "VIP";

    if (isPremium) {
      const insight = await getOrGeneratePurposeInsight(userId, birthProfile);
      return NextResponse.json({ insight, tier: "premium" });
    } else {
      const glimpse = await generateGlimpsePurposeInsight(userId, birthProfile);
      return NextResponse.json({ insight: glimpse, tier: "glimpse" });
    }
  } catch (error) {
    console.error("[purpose/analyze] Error:", error);
    return NextResponse.json(
      { error: "Failed to get purpose insight" },
      { status: 500 }
    );
  }
}

// STATUS: done | Premium Features - Shadow Work Portal
/**
 * app/api/shadow/analyze/route.ts
 * API endpoint for generating shadow work insights.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getOrGenerateShadowInsight,
  generateGlimpseShadowInsight,
} from "@/lib/ai/shadowInsightService";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const forceRegenerate = body.force === true && session.user.role === "ADMIN";

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
    const isAdmin = session.user.role === "ADMIN";
    const isPremium = isAdmin || tier === "CORE" || tier === "VIP";

    if (isPremium) {
      const insight = await getOrGenerateShadowInsight(
        userId,
        birthProfile,
        forceRegenerate
      );
      return NextResponse.json({ insight, tier: "premium" });
    } else {
      const glimpse = await generateGlimpseShadowInsight(userId, birthProfile);
      return NextResponse.json({ insight: glimpse, tier: "glimpse" });
    }
  } catch (error) {
    console.error("[shadow/analyze] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze shadow patterns" },
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
    const isAdmin = session.user.role === "ADMIN";
    const isPremium = isAdmin || tier === "CORE" || tier === "VIP";

    if (isPremium) {
      const insight = await getOrGenerateShadowInsight(userId, birthProfile);
      return NextResponse.json({ insight, tier: "premium" });
    } else {
      const glimpse = await generateGlimpseShadowInsight(userId, birthProfile);
      return NextResponse.json({ insight: glimpse, tier: "glimpse" });
    }
  } catch (error) {
    console.error("[shadow/analyze] Error:", error);
    return NextResponse.json(
      { error: "Failed to get shadow insight" },
      { status: 500 }
    );
  }
}

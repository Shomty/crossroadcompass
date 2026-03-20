// STATUS: done | Premium Features - Muhurta Finder
/**
 * app/api/muhurta/windows/route.ts
 * API endpoint for calculating muhurta timing windows.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateMuhurta, type IntentionCategory } from "@/lib/astro/muhurtaService";
import {
  getMuhurtaWithInsight,
  generateGlimpseMuhurtaInsight,
} from "@/lib/ai/muhurtaInsightService";

const VALID_INTENTIONS: IntentionCategory[] = [
  "career",
  "relationships",
  "health",
  "finance",
  "travel",
  "spiritual",
  "general",
];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const intentionParam = url.searchParams.get("intention") || "general";
    const intention = VALID_INTENTIONS.includes(intentionParam as IntentionCategory)
      ? (intentionParam as IntentionCategory)
      : "general";

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
      const result = await getMuhurtaWithInsight(userId, birthProfile, intention, true);
      return NextResponse.json({
        data: result.data,
        insight: result.insight,
        tier: "premium",
      });
    } else {
      const data = await calculateMuhurta(userId, birthProfile, intention);
      const glimpse = await generateGlimpseMuhurtaInsight(userId, birthProfile, intention);

      const limitedWindows = data.windows.slice(0, 3).map((w) => ({
        ...w,
        startTime: "●●:●●",
        endTime: "●●:●●",
        reasoning: [],
        hdAlignment: "",
      }));

      return NextResponse.json({
        data: { ...data, windows: limitedWindows },
        glimpse,
        tier: "glimpse",
      });
    }
  } catch (error) {
    console.error("[muhurta/windows] Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate timing windows" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const intentionParam = body.intention || "general";
    const intention = VALID_INTENTIONS.includes(intentionParam)
      ? intentionParam
      : "general";

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
      const result = await getMuhurtaWithInsight(userId, birthProfile, intention, true);
      return NextResponse.json({
        data: result.data,
        insight: result.insight,
        tier: "premium",
      });
    } else {
      return NextResponse.json(
        { error: "Premium subscription required for full muhurta" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("[muhurta/windows] Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate timing windows" },
      { status: 500 }
    );
  }
}

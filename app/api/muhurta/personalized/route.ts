/**
 * GET /api/muhurta/personalized
 * Personalized Vedic Muhurta windows (transit × natal scoring).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { getPersonalizedMuhurtaResponse } from "@/lib/astro/muhurta/personalizedMuhurtaService";
import type { MuhurtaIntentCategory, PersonalizedMuhurtaResponse } from "@/types";

const ALLOWED: MuhurtaIntentCategory[] = [
  "all",
  "career",
  "relationship",
  "finance",
  "health",
  "travel",
  "spiritual",
];

const MAX_RANGE_DAYS = 30;

function parseIntent(raw: string | null): MuhurtaIntentCategory {
  const x = (raw ?? "all").toLowerCase();
  if (x === "general") return "all";
  if (x === "relationships") return "relationship";
  if (ALLOWED.includes(x as MuhurtaIntentCategory)) return x as MuhurtaIntentCategory;
  return "all";
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const intention = parseIntent(url.searchParams.get("intention"));

    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");
    const startDate = startParam ? new Date(startParam) : new Date();
    const endDate = endParam
      ? new Date(endParam)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime())
    ) {
      return NextResponse.json({ error: "Invalid start or end date" }, { status: 400 });
    }

    const diffDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > MAX_RANGE_DAYS || diffDays < 0 || Number.isNaN(diffDays)) {
      return NextResponse.json(
        { error: `Date range must be 0–${MAX_RANGE_DAYS} days` },
        { status: 400 }
      );
    }

    const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
    if (!birthProfile) {
      return NextResponse.json({ error: "Birth profile not found" }, { status: 404 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { tier: true },
    });
    const tier = subscription?.tier ?? "FREE";
    const isAdmin = session.user.role === "ADMIN";
    const isPremium = isAdmin || tier === "CORE" || tier === "VIP";

    const vedicChart = await getOrCreateVedicChart(userId, birthProfile);

    let response: PersonalizedMuhurtaResponse = await getPersonalizedMuhurtaResponse(
      {
        userId,
        startDate,
        endDate,
        intentFilter: intention,
      },
      birthProfile,
      vedicChart,
      { useCache: isPremium }
    );

    if (!isPremium) {
      const sorted = [...response.windows].sort(
        (a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore
      );
      response = {
        ...response,
        windows: sorted.slice(0, 3),
      };
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[muhurta/personalized]", err);
    return NextResponse.json(
      { error: "Failed to compute personalized muhurta", detail: message },
      { status: 500 }
    );
  }
}

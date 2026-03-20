// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * app/api/chemistry/analyze/route.ts
 * API endpoint for compatibility analysis.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart, getOrCreateVedicChart } from "@/lib/astro/chartService";
import {
  generateChemistryInsight,
  generateGlimpseChemistry,
  type PartnerData,
} from "@/lib/ai/chemistryInsightService";
import type { VedicChart } from "@/lib/astro/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    
    const { partnerName, partnerNakshatra, partnerRashi } = body;
    if (!partnerName || !partnerNakshatra || !partnerRashi) {
      return NextResponse.json(
        { error: "Missing partner data" },
        { status: 400 }
      );
    }

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

    // Get user's chart data
    const [vedicChartRaw, hdChart] = await Promise.all([
      getOrCreateVedicChart(userId, birthProfile).catch(() => null),
      getOrCreateHDChart(userId, birthProfile),
    ]);

    const vedicChart = vedicChartRaw as unknown as VedicChart | null;
    const d1 = vedicChart?.rawResponse?.chartD1;
    
    const moonPlanet = d1?.planets?.find(p => p.name.toLowerCase() === "moon");
    const userNakshatra = moonPlanet?.nakshatra?.replace(/_/g, " ") || "Ashwini";
    const userRashi = moonPlanet?.sign || "Aries";
    const userName = birthProfile.birthName.split(" ")[0];

    const partner: PartnerData = {
      name: partnerName,
      nakshatra: partnerNakshatra,
      rashi: partnerRashi,
    };

    if (isPremium) {
      const result = await generateChemistryInsight(
        userName,
        userNakshatra,
        userRashi,
        hdChart,
        partner
      );

      return NextResponse.json({
        ...result,
        userName,
        partnerName,
        tier: "premium",
      });
    } else {
      const { kutaResult, glimpse } = await generateGlimpseChemistry(
        userNakshatra,
        userRashi,
        partner
      );

      return NextResponse.json({
        kutaResult: {
          overallScore: kutaResult.overallScore,
          overallPercentage: kutaResult.overallPercentage,
          quality: kutaResult.quality,
          kutas: kutaResult.kutas.slice(0, 1),
        },
        glimpse,
        tier: "glimpse",
      });
    }
  } catch (error) {
    console.error("[chemistry/analyze] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze compatibility" },
      { status: 500 }
    );
  }
}

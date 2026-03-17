/**
 * app/api/insights/hd-attribute/route.ts
 * POST /api/insights/hd-attribute
 * Generates a brief personalised insight for a specific HD attribute (type/strategy/authority/profile).
 * Not persisted — callers cache the result in component state.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { generateHDAttributeInsight } from "@/lib/ai/hdAttributeService";

const ALLOWED_ATTRIBUTES = ["type", "strategy", "authority", "profile"] as const;
type AllowedAttribute = (typeof ALLOWED_ATTRIBUTES)[number];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json();
  const { attribute, value } = body as { attribute: string; value: string };

  if (!ALLOWED_ATTRIBUTES.includes(attribute as AllowedAttribute)) {
    return NextResponse.json({ error: "Invalid attribute" }, { status: 400 });
  }
  if (!value || typeof value !== "string") {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json(
      { error: "No birth profile found. Complete onboarding first." },
      { status: 404 }
    );
  }

  try {
    const chart = await getOrCreateHDChart(userId, profile);
    const result = await generateHDAttributeInsight({
      userId,
      attribute: attribute as AllowedAttribute,
      value,
      fullChart: {
        type: chart.type,
        strategy: chart.strategy,
        authority: chart.authority,
        profile: chart.profile,
      },
      userName: profile.birthName,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[hd-attribute] generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate insight. Please try again." },
      { status: 500 }
    );
  }
}

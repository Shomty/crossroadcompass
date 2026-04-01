/**
 * GET /api/synthesis/periodic-report?period=daily|weekly|monthly
 *
 * Generates an AI synthesis report for the requested time window.
 * Uses the 3-layer natal synthesis engine (Western vs Vedic) + current
 * transits + dasha context as input to Gemini.
 *
 * Cache:
 *   daily   → 24h TTL  (keyed by userId + date)
 *   weekly  → 7d TTL   (keyed by userId + ISO week)
 *   monthly → 30d TTL  (keyed by userId + YYYY-MM)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { getOrCreateWesternNatalChart } from "@/lib/astro/westernChartService";
import {
  computeNatalSynthesisSeeds,
  westernToSynthesisInput,
  vedicToSynthesisInput,
} from "@/lib/astro/natalSynthesisEngine";
import { getOrBuildDashaTimeline } from "@/lib/astro/dashaTimelineService";
import { getWesternTransitTimeline } from "@/lib/astro/transitService";
import { geminiGenerate } from "@/lib/ai/geminiClient";
import type { BirthProfile } from "@prisma/client";

type Period = "daily" | "weekly" | "monthly";

// ─── Cache TTLs ───────────────────────────────────────────────────────────────

const CACHE_TTL: Record<Period, number> = {
  daily:   60 * 60 * 24,          // 24h
  weekly:  60 * 60 * 24 * 7,      // 7d
  monthly: 60 * 60 * 24 * 30,     // 30d
};

function cacheKey(userId: string, period: Period): string {
  const now = new Date();
  if (period === "daily")   return `synthesis:periodic:${userId}:daily:${now.toISOString().split("T")[0]}`;
  if (period === "weekly")  return `synthesis:periodic:${userId}:weekly:${getISOWeek(now)}`;
  return `synthesis:periodic:${userId}:monthly:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getISOWeek(d: Date): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are a synthesis astrologer and life coach who bridges Western (tropical) and Vedic (sidereal) astrology.
Your language is warm, specific, and practical. You never use prediction language ("you will", "this will cause").
Instead: "this period tends to", "you may notice", "your chart suggests".
Define every technical term on first use. Be specific to this person's actual chart data — never generic.
Format your response using clear markdown with H2 headings for each section. Use short paragraphs, not bullet lists.`;

function buildPrompt(
  period: Period,
  ctx: {
    mahaDasha: string;
    antarDasha: string;
    mahaDashaEnd: string;
    topSeeds: string;
    transitsText: string;
    dateContext: string;
  }
): string {
  const windows: Record<Period, { title: string; horizon: string; sections: string }> = {
    daily: {
      title: "Daily Synthesis",
      horizon: "today",
      sections: `
## Today's Energy Theme
Describe the dominant energy today based on the active Dasha and any transits. What is the psychological "colour" of the day?

## The Western Impulse vs The Vedic Invitation
Using the natal synthesis seeds, identify the one planet or pattern most active today.
Describe what the person's Western instinct will push them toward — and what the Vedic capacity invites instead.
Give a concrete, daily-life example.

## Practical Anchor
One simple, specific action or mindset shift for today that bridges the Western impulse and the Vedic invitation.`,
    },
    weekly: {
      title: "Weekly Synthesis",
      horizon: "this week",
      sections: `
## The Week's Overarching Theme
What is the dominant narrative this week? Combine the Dasha context with the most significant transit influences.

## Key Synthesis Point
Identify the one Western/Vedic divergence that will be most felt this week.
Symptom (Western): what will surface as desire, friction, or impulse.
Medicine (Vedic): the deeper capacity that resolves it.

## Monday to Friday Arc
Describe how the energy likely shifts across the week — early week vs mid-week vs end of week.

## The Week's Opportunity
One specific area of life where the synthesis of both systems is working in the person's favour this week.`,
    },
    monthly: {
      title: "Monthly Synthesis",
      horizon: "this month",
      sections: `
## The Month's Core Theme
What is the overarching narrative for this month based on the Dasha period and key transit patterns?

## The 3-Layer Synthesis Overview
Layer 1 — Psychological Facade (Western): What conscious drives and identity themes are prominent this month?
Layer 2 — Hidden Mechanisms (Vedic): What deeper Dasha-driven energies are operating beneath the surface?
Layer 3 — The AHA Intersection: Where do these two layers create the most important divergence or opportunity? Name it clearly.

## Key Dates and Turning Points
Identify 2–3 moments this month where the synthesis is particularly active. Describe what to watch for.

## The Month's Growth Edge
The one internal shift that would make this month's challenges into breakthroughs. Be specific to this chart.`,
    },
  };

  const w = windows[period];

  return `${w.title} Report for ${ctx.dateContext}

=== CHART CONTEXT ===
Current Mahadasha: ${ctx.mahaDasha} (ends ${ctx.mahaDashaEnd})
Current Antardasha: ${ctx.antarDasha}
Active Transits: ${ctx.transitsText}

Natal Synthesis Seeds (Western vs Vedic divergence per planet):
${ctx.topSeeds}
=== END CONTEXT ===

Please generate a ${period} synthesis report covering ${w.horizon}.
${w.sections}

End with a one-sentence synthesis mantra for ${w.horizon} — a practical phrase the person can carry with them.`;
}

// ─── Context builder ──────────────────────────────────────────────────────────

async function buildContext(
  userId: string,
  profile: BirthProfile,
  period: Period
) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (period === "daily" ? 1 : period === "weekly" ? 7 : 30));
  const endStr = endDate.toISOString().split("T")[0];

  // Fetch natal charts (both cached)
  const [vedicChart, westernChart] = await Promise.all([
    getOrCreateVedicChart(userId, profile),
    getOrCreateWesternNatalChart(userId, profile),
  ]);

  // Build synthesis seeds
  let topSeeds = "No synthesis seeds available.";
  try {
    const wInput = westernToSynthesisInput(westernChart);
    const vInput = vedicToSynthesisInput(vedicChart as unknown as Record<string, unknown>);
    const seeds = computeNatalSynthesisSeeds({ western: wInput, vedic: vInput });
    const priority = [...seeds.dignityFlips, ...seeds.elementConflicts].slice(0, 3);
    topSeeds = priority.length
      ? priority.map(s =>
          `• ${s.planet.charAt(0).toUpperCase() + s.planet.slice(1)}: Western ${s.westernSign} (${s.westernDignity}) → Vedic ${s.vedicSign} (${s.vedicDignity}) | ${s.conflictType}\n  AHA: ${s.ahaFormula}`
        ).join("\n\n")
      : seeds.seeds.slice(0, 3).map(s =>
          `• ${s.planet.charAt(0).toUpperCase() + s.planet.slice(1)}: ${s.westernSign} → ${s.vedicSign} | ${s.conflictType}`
        ).join("\n");
  } catch { /* skip if calc fails */ }

  // Get dasha timeline
  const dashaTimeline = await getOrBuildDashaTimeline(userId, profile, vedicChart);
  const mahaDasha = dashaTimeline.currentMahaDasha?.planetName ?? "Unknown";
  const antarDasha = dashaTimeline.currentAntarDasha?.planetName ?? "Unknown";
  const mahaDashaEnd = dashaTimeline.currentMahaDasha?.endDate
    ? new Date(dashaTimeline.currentMahaDasha.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Unknown";

  // Get western transits
  let transitsText = "No active transits";
  try {
    const transitTimeline = getWesternTransitTimeline(userId, profile, todayStr, endStr);
    const todayTransit = transitTimeline.transits.find(t => t.date === todayStr);
    if (todayTransit?.aspects?.length) {
      transitsText = todayTransit.aspects.slice(0, 3)
        .map(a => `${a.planet1}–${a.planet2} ${a.angleName}`)
        .join(", ");
    }
  } catch { /* skip */ }

  // Date context
  const dateContext = period === "daily"
    ? today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : period === "weekly"
    ? `Week of ${today.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    : today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return { mahaDasha, antarDasha, mahaDashaEnd, topSeeds, transitsText, dateContext };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "daily") as Period;
  if (!["daily", "weekly", "monthly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const profile = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "No birth profile found" }, { status: 404 });
  }

  const key = cacheKey(session.user.id, period);

  // Check cache
  const cached = await kvGet<{ text: string; generatedAt: string }>(key);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true, period });
  }

  try {
    const ctx = await buildContext(session.user.id, profile, period);
    const prompt = buildPrompt(period, ctx);
    const text = await geminiGenerate("flash", prompt, SYSTEM_INSTRUCTION);

    const result = { text, generatedAt: new Date().toISOString(), period, cached: false };
    await kvSet(key, { text, generatedAt: result.generatedAt }, CACHE_TTL[period]);

    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/synthesis/periodic-report]", e);
    const message = e instanceof Error ? e.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

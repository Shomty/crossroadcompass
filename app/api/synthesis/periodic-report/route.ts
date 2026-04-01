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
import { computeTraitScores } from "@/lib/astro/traitScoringEngine";
import type { BirthProfile } from "@prisma/client";

type Period = "daily" | "weekly" | "monthly";

// ─── Schedule helpers ─────────────────────────────────────────────────────────

/** ISO date of the Sunday that begins the current week (week starts Sunday). */
function getWeekStartSunday(d: Date): string {
  const date = new Date(d);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.toISOString().split("T")[0];
}

/** ISO date of the last Friday of the given month (1-indexed). */
function getLastFriday(year: number, month: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)); // day 0 = last day of prev month
  const dow = lastDay.getUTCDay(); // 0=Sun … 5=Fri … 6=Sat
  // Steps back: Sun→5, Mon→4, Tue→3, Wed→2, Thu→1, Fri→0, Sat→1
  const stepsBack = dow === 5 ? 0 : dow === 6 ? 1 : (dow + 2) % 7 === 0 ? 0 : (dow + 2) % 7;
  lastDay.setUTCDate(lastDay.getUTCDate() - stepsBack);
  return lastDay.toISOString().split("T")[0];
}

/**
 * The monthly report belongs to the last Friday of the current month.
 * If today is before that date, fall back to last month's last Friday
 * so there's always a valid report to show.
 */
function getActiveMonthlyDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const today = d.toISOString().split("T")[0];
  const thisFriday = getLastFriday(y, m);
  if (today >= thisFriday) return thisFriday;
  return getLastFriday(m === 1 ? y - 1 : y, m === 1 ? 12 : m - 1);
}

/** The next scheduled generation date for display in the UI. */
function getNextGenerationDate(period: Period): string {
  const now = new Date();
  if (period === "daily") {
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }
  if (period === "weekly") {
    const day = now.getUTCDay();
    const daysUntil = day === 0 ? 7 : 7 - day; // next Sunday (not today even if Sunday)
    const next = new Date(now);
    next.setUTCDate(next.getUTCDate() + daysUntil);
    return next.toISOString().split("T")[0];
  }
  // monthly: next last Friday (this month if not yet reached, else next month)
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const today = now.toISOString().split("T")[0];
  const thisFriday = getLastFriday(y, m);
  if (today < thisFriday) return thisFriday;
  return getLastFriday(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1);
}

/** Only daily reports may be force-refreshed by the user. */
function canForceRefresh(period: Period, force: boolean): boolean {
  return force && period === "daily";
}

// ─── Cache keys & TTLs ────────────────────────────────────────────────────────

/** TTL is generous — the key itself encodes which period the report belongs to. */
const CACHE_TTL: Record<Period, number> = {
  daily:   60 * 60 * 24 * 2,   // 2 days (buffer if clock skew)
  weekly:  60 * 60 * 24 * 8,   // 8 days
  monthly: 60 * 60 * 24 * 35,  // 35 days
};

function cacheKey(userId: string, period: Period): string {
  const now = new Date();
  if (period === "daily")   return `synthesis:periodic:${userId}:daily:${now.toISOString().split("T")[0]}`;
  if (period === "weekly")  return `synthesis:periodic:${userId}:weekly:${getWeekStartSunday(now)}`;
  return `synthesis:periodic:${userId}:monthly:${getActiveMonthlyDate(now)}`;
}

/** DB lookup key — the bare segment without userId prefix (stored in periodKey column). */
function periodKey(_userId: string, period: Period): string {
  const now = new Date();
  if (period === "daily")   return now.toISOString().split("T")[0];
  if (period === "weekly")  return getWeekStartSunday(now);
  return getActiveMonthlyDate(now);
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
    traitSummary: string;
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
${ctx.traitSummary ? `\nTrait Profile (scored 0–100 across both systems):\n${ctx.traitSummary}` : ""}
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
  let traitSummary = "";
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

  // Trait scoring (engine3.md §3–6)
  try {
    const ta = computeTraitScores(vedicChart, westernChart as any);
    const strengths = ta.topStrengths.slice(0, 3)
      .map(s => `${s.label} (Vedic ${Math.round(s.vedic_score * 100)}, Western ${Math.round(s.western_score * 100)}, ${s.alignment})`)
      .join("; ");
    const contradictions = ta.contradictions.slice(0, 2)
      .map(s => `${s.label}: Vedic ${Math.round(s.vedic_score * 100)} vs Western ${Math.round(s.western_score * 100)}`)
      .join("; ");
    const summaryBullets = ta.unifiedSummary.slice(0, 3).map(b => `• ${b}`).join("\n");
    traitSummary = [
      strengths ? `Top strengths: ${strengths}` : "",
      contradictions ? `Internal tensions: ${contradictions}` : "",
      summaryBullets ? `Unified profile:\n${summaryBullets}` : "",
    ].filter(Boolean).join("\n");
  } catch { /* non-fatal */ }

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
    const transitTimeline = await getWesternTransitTimeline(userId, profile, todayStr, endStr);
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

  return { mahaDasha, antarDasha, mahaDashaEnd, topSeeds, traitSummary, transitsText, dateContext };
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
  const force = searchParams.get("force") === "1";
  const userId = session.user.id;

  const profile = await db.birthProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "No birth profile found" }, { status: 404 });
  }

  const key = cacheKey(userId, period);
  const pKey = periodKey(userId, period);
  const nextGenerationDate = getNextGenerationDate(period);
  const allowed = canForceRefresh(period, force);

  // ── Layer 1: KV hot cache ────────────────────────────────────────────
  if (!allowed) {
    const cached = await kvGet<{ text: string; generatedAt: string }>(key);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true, period, nextGenerationDate });
    }
  }

  // ── Layer 2: DB durable store ────────────────────────────────────────
  if (!allowed) {
    const rows = await db.$queryRaw<Array<{ text: string; generatedAt: string; expiresAt: string }>>`
      SELECT text, generatedAt, expiresAt FROM periodic_reports
      WHERE userId = ${userId} AND period = ${period} AND periodKey = ${pKey}
      LIMIT 1
    `;
    const dbRow = rows[0];
    if (dbRow && new Date(dbRow.expiresAt) > new Date()) {
      const generatedAt = new Date(dbRow.generatedAt).toISOString();
      await kvSet(key, { text: dbRow.text, generatedAt }, CACHE_TTL[period]);
      return NextResponse.json({ text: dbRow.text, generatedAt, cached: true, period, nextGenerationDate });
    }
  }

  // ── Layer 3: Generate fresh ──────────────────────────────────────────
  try {
    const ctx = await buildContext(userId, profile, period);
    const prompt = buildPrompt(period, ctx);
    const text = await geminiGenerate("flash", prompt, SYSTEM_INSTRUCTION);

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + CACHE_TTL[period] * 1000);
    const id = `pr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Upsert via raw SQL — works regardless of Prisma client generation state
    await db.$executeRaw`
      INSERT INTO periodic_reports (id, userId, period, periodKey, text, generatedAt, expiresAt)
      VALUES (${id}, ${userId}, ${period}, ${pKey}, ${text}, ${generatedAt.toISOString()}, ${expiresAt.toISOString()})
      ON CONFLICT (userId, period, periodKey) DO UPDATE
        SET text = excluded.text,
            generatedAt = excluded.generatedAt,
            expiresAt = excluded.expiresAt
    `;

    await kvSet(key, { text, generatedAt: generatedAt.toISOString() }, CACHE_TTL[period]);

    return NextResponse.json({ text, generatedAt: generatedAt.toISOString(), period, cached: false, nextGenerationDate });
  } catch (e) {
    console.error("[GET /api/synthesis/periodic-report]", e);
    const message = e instanceof Error ? e.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

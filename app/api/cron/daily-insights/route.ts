/**
 * GET /api/cron/daily-insights
 * Scheduled via Vercel cron (vercel.json). Runs daily at 06:00 UTC.
 *
 * For each user with a birth profile:
 *   1. Skip if today's insight already exists (idempotent).
 *   2. Generate the daily insight via Gemini.
 *   3. Send the daily insight email (fire-and-forget; errors are logged, not thrown).
 *
 * Security: Vercel sends `Authorization: Bearer <CRON_SECRET>` with every invocation.
 * Unauthorised requests are rejected with 401.
 */

import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { generateDailyInsight, getTodaysDailyInsight } from "@/lib/ai/dailyInsightService";
import { sendEmail } from "@/lib/email/client";
import { DailyInsightEmail } from "@/lib/email/templates/DailyInsightEmail";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — allows batching many users

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (env.CRON_SECRET && token !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = env.APP_URL.replace(/\/$/, "");

  // ── Fetch all users with birth profiles ───────────────────────────────────
  const profilesIndex = await db.birthProfile.findMany({
    select: {
      userId: true,
      birthName: true,
      user: { select: { email: true } },
    },
  });

  const results: { userId: string; status: "generated" | "skipped" | "error"; error?: string }[] = [];

  for (const idx of profilesIndex) {
    try {
      // Idempotent — skip if already generated today
      const existing = await getTodaysDailyInsight(idx.userId);
      if (existing) {
        results.push({ userId: idx.userId, status: "skipped" });
        continue;
      }

      // Need full profile for chart generation
      const profile = await db.birthProfile.findUnique({ where: { userId: idx.userId } });
      if (!profile) {
        results.push({ userId: idx.userId, status: "error", error: "Profile not found" });
        continue;
      }

      // Generate insight
      const chart = await getOrCreateHDChart(idx.userId, profile);
      const insight = await generateDailyInsight(idx.userId, chart, profile.birthName);

      // Find the newly created DB row so we have its ID for email rating links
      const row = await getTodaysInsightRow(idx.userId);

      // Send email (fire-and-forget — never block on email failure)
      if (idx.user?.email && row) {
        void sendEmail({
          to: idx.user.email,
          subject: `✦ Your Daily Guidance · ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`,
          react: React.createElement(DailyInsightEmail, {
            insightContent: insight.insight,
            insightId: row.id,
            dashboardUrl: `${appUrl}/dashboard`,
          }),
        });
      }

      results.push({ userId: idx.userId, status: "generated" });
    } catch (err) {
      console.error(`[cron/daily-insights] failed for user ${idx.userId}:`, err);
      results.push({ userId: idx.userId, status: "error", error: String(err) });
    }
  }

  const summary = {
    total: results.length,
    generated: results.filter((r) => r.status === "generated").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
  };

  console.log("[cron/daily-insights] done:", summary);
  return NextResponse.json(summary);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getTodaysInsightRow(userId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  return db.insight.findFirst({
    where: { userId, type: "DAILY", periodDate: { gte: today, lt: tomorrow } },
    orderBy: { generatedAt: "desc" },
    select: { id: true },
  });
}

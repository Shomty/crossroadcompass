// STATUS: done | Task 7.5
/**
 * app/api/report/generate/route.ts
 * POST /api/report/generate
 * Calculates the HD chart and generates an AI report for the authenticated user.
 * Idempotent — re-generates if called again (overwrites the INITIAL insight).
 * Fires welcome email sequence on FIRST report generation only.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart, getOrCreateVedicChart } from "@/lib/astro/chartService";
import { generateHDReport } from "@/lib/ai/hdReportService";
import { triggerWelcomeSequence } from "@/lib/email/sequences/welcomeSequence";
import { env } from "@/lib/env";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const profile = await db.birthProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "No birth profile found. Complete onboarding first." },
      { status: 404 }
    );
  }

  try {
    // Check if this is the first report (before generating) to decide welcome email.
    const existingReport = await db.insight.findFirst({
      where: { userId, type: "INITIAL" },
      select: { id: true },
    });
    const isFirstReport = !existingReport;

    const chart = await getOrCreateHDChart(userId, profile);

    // Fetch + persist Vedic chart in the background — populates chartDataVedic + Dasha table.
    // Non-blocking: HD report generation doesn't depend on Vedic data.
    void getOrCreateVedicChart(userId, profile).catch(
      (err) => console.error("[report/generate] Vedic fetch failed:", err)
    );

    const report = await generateHDReport(userId, chart, {
      lifeSituation: profile.intakeLifeSituation,
      primaryFocus: profile.intakePrimaryFocus,
      wantsClarity: profile.intakeWantsClarity,
      birthName: profile.birthName,
    });

    // Fire welcome sequence on first report only (non-blocking).
    if (isFirstReport && session.user.email) {
      const reportUrl = `${env.NEXTAUTH_URL}/report`;
      triggerWelcomeSequence(userId, session.user.email, reportUrl).catch(
        (err) => console.error("[report/generate] welcome sequence failed:", err)
      );
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("[report/generate] failed:", err);
    return NextResponse.json(
      { error: "Report generation failed. Please try again." },
      { status: 500 }
    );
  }
}

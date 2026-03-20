/**
 * app/(app)/v4/page.tsx
 * Dharma Compass v4 — Digital Grimoire Design System.
 *
 * Layout (top → bottom):
 *   Header (greeting + date)
 *   ProfileStrip — identity anchor
 *   ✦ divider
 *   DharmaSynthesis — oracle card
 *   ✦ divider
 *   [DashaVisualizer 5/12] + [TransitTable 7/12]
 *   ✦ divider
 *   ForecastCard — existing component, reused
 *
 * Auth is handled by app/(app)/layout.tsx — this page only fetches data.
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart, getOrCreateVedicChart } from "@/lib/astro/chartService";
import {
  getThisWeeksForecast,
  getThisMonthsForecast,
  getWeekStart,
  getMonthStart,
} from "@/lib/ai/forecastService";
import {
  PLANET_COLOR,
  PLANET_FALLBACK_COLOR,
  PLANET_FALLBACK_GLYPH,
  PLANET_GLYPH,
} from "@/lib/astro/planetMetadata";
import { getCachedTransitReading } from "@/lib/ai/transitReadingService";
import { ProfileStrip } from "@/components/v4/ProfileStrip";
import { DharmaSynthesis } from "@/components/v4/DharmaSynthesis";
import { DashaVisualizer } from "@/components/v4/DashaVisualizer";
import { TransitTable } from "@/components/v4/TransitTable";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";

// ─── Section divider ──────────────────────────────────────────────────────────

function V4Divider({ glyph }: { glyph: string }) {
  return (
    <div className="v4-divider">
      <span className="v4-divider-glyph">{glyph}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function V4Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId    = session.user.id;
  const userName  = session.user?.name ?? session.user?.email?.split("@")[0] ?? "Traveler";
  const firstName = userName.split(" ")[0];

  // ── Subscription ────────────────────────────────────────────────────────────
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier    = subscription?.tier ?? "FREE";
  const isAdmin = session.user.role === "ADMIN";
  const isPaid  = isAdmin || tier === "CORE" || tier === "VIP";

  // ── Birth profile + charts ──────────────────────────────────────────────────
  const now          = new Date();
  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });

  let hdType:      string | null = null;
  let hdStrategy:  string | null = null;
  let hdAuthority: string | null = null;
  let hdProfile:   string | null = null;

  if (birthProfile) {
    try {
      const hdChart = await getOrCreateHDChart(userId, birthProfile);
      hdType      = hdChart.type      ?? null;
      hdStrategy  = hdChart.strategy  ?? null;
      hdAuthority = hdChart.authority ?? null;
      hdProfile   = hdChart.profile   ?? null;
    } catch { /* render without HD data */ }
    try {
      await getOrCreateVedicChart(userId, birthProfile);
    } catch { /* dasha card shows empty if API unavailable */ }
  }

  // ── Today's daily insight ───────────────────────────────────────────────────
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const dailyInsightRow = await db.insight.findFirst({
    where: { userId, type: "DAILY", periodDate: { gte: todayStart, lte: todayEnd } },
    orderBy: { generatedAt: "desc" },
  });

  // ── Forecasts ───────────────────────────────────────────────────────────────
  const [weeklyForecast, monthlyForecast] = await Promise.all([
    getThisWeeksForecast(userId),
    getThisMonthsForecast(userId),
  ]);
  const weekLabel  = getWeekStart().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const monthLabel = getMonthStart().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // ── Active Dasha ────────────────────────────────────────────────────────────
  const activeMaha = await db.dasha.findFirst({
    where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } },
  });
  const activeAntar = activeMaha
    ? await db.dasha.findFirst({
        where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } },
      })
    : null;

  const mahaRemainingDays = activeMaha
    ? Math.ceil((activeMaha.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const mahaTotalDays = activeMaha
    ? Math.ceil((activeMaha.endDate.getTime() - activeMaha.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const mahaProgress = mahaTotalDays && mahaRemainingDays != null
    ? Math.max(0, Math.min(100, Math.round(((mahaTotalDays - mahaRemainingDays) / mahaTotalDays) * 100)))
    : null;

  // ── Prefetch transit reading from KV (avoids client-side fetch on navigation) ─
  const initialTransitReading = await getCachedTransitReading(userId).catch(() => null);

  // ── Greeting ────────────────────────────────────────────────────────────────
  const hr        = now.getHours();
  const timeOfDay = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ── Dasha props ─────────────────────────────────────────────────────────────
  const mahaKey      = activeMaha?.planetName.toLowerCase() ?? "";
  const planetGlyph  = PLANET_GLYPH[mahaKey] ?? PLANET_FALLBACK_GLYPH;
  const planetColor  = PLANET_COLOR[mahaKey] ?? PLANET_FALLBACK_COLOR;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="v4-page">
      <div className="v4-inner">
        <div className="v4-wrap">

          {/* ── HEADER ────────────────────────────────────────────────────────── */}
          <header
            className="animate-enter animate-enter-1"
            style={{ paddingBottom: 4 }}
          >
            <p style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: 6,
            }}>
              Personal Navigation
            </p>
            <h1 style={{
              fontFamily: "Cinzel, serif",
              fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400,
              color: "rgba(255,255,255,0.92)", lineHeight: 1.1, marginBottom: 6,
            }}>
              Good {timeOfDay},{" "}
              <em style={{ fontStyle: "italic", color: "var(--gold-solar, #D4AF37)" }}>
                {firstName}
              </em>
            </h1>
            <p style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10, letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.30)",
            }}>
              {dateLabel}
            </p>
          </header>

          {/* ── PROFILE STRIP ─────────────────────────────────────────────────── */}
          <div className="animate-enter animate-enter-2">
            <ProfileStrip
              name={userName}
              initial={
                hdType ? { type: hdType, strategy: hdStrategy ?? undefined, authority: hdAuthority ?? undefined, profile: hdProfile ?? undefined }
                       : null
              }
            />
          </div>

          <V4Divider glyph="✦" />

          {/* ── DHARMA SYNTHESIS ──────────────────────────────────────────────── */}
          <div className="animate-enter animate-enter-3">
            <DharmaSynthesis
              initialInsight={
                dailyInsightRow
                  ? { id: dailyInsightRow.id, content: dailyInsightRow.content as string, accuracyRating: dailyInsightRow.accuracyRating }
                  : null
              }
              isPaid={isPaid}
            />
          </div>

          <V4Divider glyph="☽" />

          {/* ── DASHA + TRANSITS ── 2-col ──────────────────────────────────────── */}
          <div className="v4-row-2col animate-enter animate-enter-4">

            {/* Dasha Visualizer — 5 cols */}
            <DashaVisualizer
              activeMaha={
                activeMaha
                  ? { planetName: activeMaha.planetName, startDate: activeMaha.startDate, endDate: activeMaha.endDate }
                  : null
              }
              activeAntar={
                activeAntar
                  ? { planetName: activeAntar.planetName, startDate: activeAntar.startDate, endDate: activeAntar.endDate }
                  : null
              }
              mahaRemainingDays={mahaRemainingDays}
              mahaProgress={mahaProgress}
              planetGlyph={planetGlyph}
              planetColor={planetColor}
            />

            {/* Transit Table — 7 cols */}
            <TransitTable initialReading={initialTransitReading} />
          </div>

          <V4Divider glyph="♃" />

          {/* ── FORECAST ──────────────────────────────────────────────────────── */}
          <div className="animate-enter animate-enter-5">
            <V4GlassCard style={{ padding: "22px 24px" }}>
              <p style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)", marginBottom: 4,
              }}>
                Life Forecast
              </p>
              <h2 style={{
                fontFamily: "Cinzel, serif",
                fontSize: 18, fontWeight: 500,
                color: "rgba(255,255,255,0.9)", marginBottom: 18,
              }}>
                Weekly &amp; Monthly Outlook
              </h2>
              <ForecastCard
                initialWeekly={weeklyForecast}
                initialMonthly={monthlyForecast}
                isPaid={isPaid}
                weekLabel={weekLabel}
                monthLabel={monthLabel}
                variant="v4"
              />
            </V4GlassCard>
          </div>

        </div>
      </div>
    </div>
  );
}

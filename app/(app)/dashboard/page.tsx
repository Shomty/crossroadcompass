/**
 * app/(app)/dashboard/page.tsx
 * Dashboard — FRONTEND.md v1.0 design system.
 *
 * Layout:
 *   Header (greeting + date + actions)
 *   ── ✦ ──
 *   Grid row 1 [1-col: Life Phase] [2-col: Today's Guidance]
 *   ── ☉ ──
 *   Full: Today's Transits
 *   ── ☽ ──
 *   Full: Weekly / Monthly Forecast
 *   ── ♃ ──
 *   Full: Human Design Profile
 *   ── ♄ ──
 *   Full: Natal Chart Report
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Settings } from "lucide-react";
import { TodaysGuidanceV2 } from "@/components/v2/TodaysGuidance";
import { DashboardReport } from "@/components/report/DashboardReport";
import { HumanDesignTypeCard } from "@/components/dashboard/HumanDesignTypeCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { DashaCard } from "@/components/dashboard/DashaCard";
import { TransitCard } from "@/components/dashboard/TransitCard";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import {
  getThisWeeksForecast,
  getThisMonthsForecast,
  getWeekStart,
  getMonthStart,
} from "@/lib/ai/forecastService";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ rated?: string; subscribed?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const params = await searchParams;
  const userName = session.user?.name ?? session.user?.email?.split("@")[0] ?? "Traveler";
  const firstName = userName.split(" ")[0];

  // ── Subscription ────────────────────────────────────────────────────────────
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier    = subscription?.tier ?? "FREE";
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const isPaid  = isAdmin || tier === "CORE" || tier === "VIP";

  // ── Today's insight ─────────────────────────────────────────────────────────
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
  const now = new Date();
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
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  // ── Human Design ────────────────────────────────────────────────────────────
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
    } catch { /* render without — component fetches client-side */ }
  }

  // ── Greeting ────────────────────────────────────────────────────────────────
  const hr        = now.getHours();
  const timeOfDay = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="dash-page">
      <div className="dash-inner">
        <div className="dash-wrap">

          {/* ── HEADER ──────────────────────────────────────────────────────── */}
          <header className="dash-header">

            <div className="dash-header-left">
              <span className="dash-eyebrow">Personal Navigation</span>
              <h1 className="dash-greeting">
                Good {timeOfDay}, <em>{firstName}</em>
              </h1>
              <p className="dash-date-line">{dateLabel}</p>
            </div>

            <div className="dash-header-actions">
              {/* Feedback chip */}
              {(params.rated || params.subscribed) && (
                <span className="dash-status-chip">
                  <span style={{ color: "var(--accent-gold-cool, #D4AF37)" }}>✦</span>
                  {params.rated
                    ? "Rating saved"
                    : `Welcome to ${tier} — forecasts unlocked`}
                </span>
              )}

              {/* Settings */}
              <Link href="/settings" className="dash-icon-btn" title="Settings">
                <Settings size={15} />
              </Link>

              {/* Full Chart CTA */}
              <Link href="/report" className="dash-chart-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                Full Chart
              </Link>
            </div>
          </header>

          {/* ── ROW 1: Cosmic Guidance (8) + Current Period / Dasha (4) ─────── */}
          <div className="dash-grid-12 dash-mb">

            {/* Cosmic Guidance — 8 cols */}
            <div className="glass-card dash-col-8 dash-card-enter">
              <div className="dash-card-header">
                <div>
                  <h2 className="dash-section-title">Cosmic Guidance</h2>
                  <span className="dash-section-subtitle">Today&apos;s personal navigation</span>
                </div>
                <span className="dash-sparkle">✦</span>
              </div>
              <TodaysGuidanceV2
                insight={dailyInsightRow ? {
                  id:             dailyInsightRow.id,
                  content:        dailyInsightRow.content as string,
                  generatedAt:    dailyInsightRow.generatedAt,
                  accuracyRating: dailyInsightRow.accuracyRating,
                } : null}
                isPaid={true}
              />
            </div>

            {/* Current Period (Dasha) — 4 cols */}
            <div className="glass-card dash-col-4 dash-card-enter">
              <h2 className="dash-section-title">Current Period</h2>
              <span className="dash-section-subtitle">☽ Life phase · Dasha</span>
              <DashaCard
                activeMaha={activeMaha
                  ? { planetName: activeMaha.planetName, startDate: activeMaha.startDate, endDate: activeMaha.endDate }
                  : null}
                activeAntar={activeAntar
                  ? { planetName: activeAntar.planetName, startDate: activeAntar.startDate, endDate: activeAntar.endDate }
                  : null}
                mahaRemainingDays={mahaRemainingDays}
                mahaProgress={mahaProgress}
                planetGlyph={activeMaha ? (PLANET_GLYPH[activeMaha.planetName.toLowerCase()] ?? "★") : "★"}
                planetColor={activeMaha ? (PLANET_COLOR[activeMaha.planetName.toLowerCase()] ?? "var(--accent-gold-cool, #D4AF37)") : "var(--accent-gold-cool, #D4AF37)"}
                frontContent={
                  <div>
                    {activeMaha ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                          <PlanetOrb name={activeMaha.planetName} size={58} />
                          <div>
                            <div style={st.planet}>{cap(activeMaha.planetName)}</div>
                            <div style={st.type}>Mahadasha</div>
                            <div style={st.theme}>{getDashaTheme(cap(activeMaha.planetName))}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={st.mono}>{fmtDate(activeMaha.startDate)} → {fmtDate(activeMaha.endDate)}</span>
                          {mahaRemainingDays != null && (
                            <span style={st.days}>{mahaRemainingDays.toLocaleString()}d left</span>
                          )}
                        </div>

                        {mahaProgress != null && (
                          <div className="dash-progress-track">
                            <div className="dash-progress-fill" style={{ width: `${mahaProgress}%` }} />
                          </div>
                        )}

                        {activeAntar && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 12 }}>
                            <PlanetOrb name={activeAntar.planetName} size={20} />
                            <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 12, color: "var(--accent-gold-cool, #D4AF37)" }}>
                              {cap(activeAntar.planetName.split("/")[1] ?? activeAntar.planetName)} Antardasha
                            </span>
                          </div>
                        )}

                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginTop: activeAntar ? 0 : 14 }}>
                          {getDashaGuidance(cap(activeMaha.planetName)).map((item, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "var(--text-secondary, rgba(255,255,255,0.6))", lineHeight: 1.55, fontFamily: "'Instrument Sans', sans-serif" }}>
                              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(var(--accent-indigo-rgb, 129,140,248), 0.5)", flexShrink: 0, marginTop: 7 }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <div className="dash-empty">
                        <span className="dash-empty-glyph">☽</span>
                        <p className="dash-empty-text">
                          Complete your birth profile to see your active life phase.
                        </p>
                        <Link href="/settings/profile" style={st.emptyLink}>
                          Set up profile →
                        </Link>
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          </div>

          {/* ── ROW 2: Human Design (4) + Today's Transits (8) ──────────────── */}
          <div className="dash-grid-12 dash-mb">

            {/* Human Design — 4 cols */}
            <div className="glass-card dash-col-4 dash-card-enter">
              <h2 className="dash-section-title">Human Design</h2>
              <span className="dash-section-subtitle">◉ Energy type · Strategy</span>
              <HumanDesignTypeCard
                hdType={hdType}
                hdStrategy={hdStrategy}
                hdAuthority={hdAuthority}
                hdProfile={hdProfile}
              />
            </div>

            {/* Today's Transits — 8 cols */}
            <div className="glass-card dash-col-8 dash-card-enter">
              <h2 className="dash-section-title">Today&apos;s Transits</h2>
              <span className="dash-section-subtitle">☿ Planetary positions</span>
              <TransitCard />
            </div>
          </div>

          {/* ── ROW 3: Life Forecast — full width ───────────────────────────── */}
          <div className="glass-card dash-card-enter dash-mb">
            <h2 className="dash-section-title">Life Forecast</h2>
            <span className="dash-section-subtitle">♃ Weekly &amp; monthly outlook</span>
            <ForecastCard
              initialWeekly={weeklyForecast}
              initialMonthly={monthlyForecast}
              isPaid={isPaid}
              weekLabel={weekLabel}
              monthLabel={monthLabel}
            />
          </div>

          {/* ── ROW 4: Natal Chart Report — full width ───────────────────────── */}
          <div className="glass-card dash-card-enter">
            <h2 className="dash-section-title">Natal Chart Report</h2>
            <span className="dash-section-subtitle">◈ Full birth chart analysis</span>
            <DashboardReport />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Section divider component ────────────────────────────────────────────────

function Divider({ glyph }: { glyph: string }) {
  return (
    <div className="dash-divider">
      <span className="dash-divider-glyph">{glyph}</span>
    </div>
  );
}

// ─── Planet orb ───────────────────────────────────────────────────────────────

function PlanetOrb({ name, size }: { name: string; size: number }) {
  const key   = name.toLowerCase().split("/")[0];
  const glyph = PLANET_GLYPH[key] ?? "?";
  const color = PLANET_COLOR[key] ?? "var(--accent-gold-cool, #D4AF37)";
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      flexShrink: 0,
      background: `radial-gradient(circle at 38% 35%, ${color}18 0%, rgba(4,5,15,0.85) 70%)`,
      border: `${size >= 40 ? 1.5 : 1}px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontSize: size * 0.48, color, lineHeight: 1,
        fontFamily: "serif", userSelect: "none",
        filter: `drop-shadow(0 0 ${size * 0.1}px ${color}80)`,
      }}>
        {glyph}
      </span>
    </div>
  );
}

// ─── Dasha helpers ────────────────────────────────────────────────────────────

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const DASHA_THEME: Record<string, string> = {
  Saturn:  "Karma · Discipline · Endurance",
  Jupiter: "Wisdom · Expansion · Grace",
  Mars:    "Action · Courage · Drive",
  Sun:     "Identity · Authority · Purpose",
  Moon:    "Emotion · Intuition · Nurture",
  Mercury: "Intellect · Communication · Adaptability",
  Venus:   "Beauty · Pleasure · Abundance",
  Rahu:    "Desire · Illusion · Transformation",
  Ketu:    "Liberation · Detachment · Spirituality",
};
function getDashaTheme(planet: string) {
  return DASHA_THEME[planet] ?? "Reflection · Growth · Unfolding";
}

const DASHA_GUIDANCE: Record<string, string[]> = {
  Saturn:  ["Consolidate career gains and secure your position.", "Review long-term investments and savings.", "Practise patience in relationships."],
  Jupiter: ["Expand through wisdom and teaching others.", "Seek opportunities for growth and abundance.", "Honour your philosophical commitments."],
  Mars:    ["Channel energy into disciplined action.", "Initiate projects you have been holding back.", "Guard against impulsive decisions."],
  Sun:     ["Step into leadership and visibility.", "Focus on self-expression and purpose.", "Honour your father-figures and authority."],
  Moon:    ["Tend to emotional wellbeing and home.", "Trust your intuition over logic.", "Nurture important relationships."],
  Mercury: ["Communicate clearly and learn actively.", "Handle contracts and agreements carefully.", "Short journeys bring unexpected insight."],
  Venus:   ["Invest in beauty, comfort, and joy.", "Relationships and creativity are highlighted.", "Financial decisions bear fruit now."],
  Rahu:    ["Embrace innovation and unconventional paths.", "Past-life themes resurface for resolution.", "Avoid obsessive attachment to outcomes."],
  Ketu:    ["Release what no longer serves your soul.", "Spiritual practices deepen now.", "Detachment brings unexpected clarity."],
};
function getDashaGuidance(planet: string): string[] {
  return DASHA_GUIDANCE[planet] ?? [
    "Stay grounded and consistent in your efforts.",
    "Reflect on recurring patterns in your life.",
    "Trust the timing of your unfolding path.",
  ];
}

// ─── Planet glyphs & colours ──────────────────────────────────────────────────

const PLANET_GLYPH: Record<string, string> = {
  sun: "☉", moon: "☽", mars: "♂", mercury: "☿",
  jupiter: "♃", venus: "♀", saturn: "♄", rahu: "☊", ketu: "☋",
};
const PLANET_COLOR: Record<string, string> = {
  sun:     "#FFD96A",
  moon:    "#C8D8E8",
  mars:    "#E8705A",
  mercury: "#80D4A0",
  jupiter: "#D4AF5F",
  venus:   "#E8C0D0",
  saturn:  "#B0A080",
  rahu:    "#8888CC",
  ketu:    "#AA8866",
};

// ─── Inline style palette ─────────────────────────────────────────────────────

const st = {
  planet: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 38, fontWeight: 400, lineHeight: 0.95,
    color: "var(--text-primary, rgba(255,255,255,0.9))", letterSpacing: "-0.01em",
  } as React.CSSProperties,
  type: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18, fontWeight: 400, lineHeight: 1.1,
    color: "var(--text-secondary, rgba(255,255,255,0.6))", marginBottom: 4,
  } as React.CSSProperties,
  theme: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "var(--accent-gold-cool, #D4AF37)", opacity: 0.8,
  } as React.CSSProperties,
  mono: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, letterSpacing: "0.1em", color: "var(--text-muted, rgba(255,255,255,0.4))",
  } as React.CSSProperties,
  days: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, letterSpacing: "0.08em",
    color: "var(--accent-gold-cool, #D4AF37)", whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  emptyLink: {
    display: "inline-block", marginTop: "0.75rem",
    fontSize: 12, fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.12em", color: "var(--accent-indigo, #818CF8)",
    textDecoration: "none",
  } as React.CSSProperties,
} as const;

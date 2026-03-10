/**
 * app/dashboard/page.tsx
 * Dashboard — V2 design system (merged from /v2/dashboard)
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Settings } from "lucide-react";
import { GlassCardV2 } from "@/components/v2/GlassCard";
import { TodaysGuidanceV2 } from "@/components/v2/TodaysGuidance";
import { DashboardReport } from "@/components/report/DashboardReport";
import { HumanDesignTypeCard } from "@/components/dashboard/HumanDesignTypeCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { DashaCard } from "@/components/dashboard/DashaCard";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { getThisWeeksForecast, getThisMonthsForecast, getWeekStart, getMonthStart } from "@/lib/ai/forecastService";

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

  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const isPaid = isAdmin || tier === "CORE" || tier === "VIP";

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const dailyInsightRow = await db.insight.findFirst({
    where: { userId, type: "DAILY", periodDate: { gte: todayStart, lte: todayEnd } },
    orderBy: { generatedAt: "desc" },
  });

  const [weeklyForecast, monthlyForecast] = await Promise.all([
    getThisWeeksForecast(userId),
    getThisMonthsForecast(userId),
  ]);
  const weekLabel = getWeekStart().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const monthLabel = getMonthStart().toLocaleDateString("en-US", { month: "long", year: "numeric" });

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
  const mahaProgress = (mahaTotalDays && mahaRemainingDays != null)
    ? Math.max(0, Math.min(100, Math.round(((mahaTotalDays - mahaRemainingDays) / mahaTotalDays) * 100)))
    : null;
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
  let hdType: string | null = null;
  let hdStrategy: string | null = null;
  let hdAuthority: string | null = null;
  let hdProfile: string | null = null;
  if (birthProfile) {
    try {
      const hdChart = await getOrCreateHDChart(userId, birthProfile);
      hdType = hdChart.type ?? null;
      hdStrategy = hdChart.strategy ?? null;
      hdAuthority = hdChart.authority ?? null;
      hdProfile = hdChart.profile ?? null;
    } catch { /* render without — component will fetch client-side */ }
  }

  const timeOfDay = now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening";

  return (
    <div className="v2-content">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 8 }}>
            Personal Navigation
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 400, letterSpacing: "0.005em", color: "var(--cream)", lineHeight: 1.1, margin: 0, animation: "fadeUp 0.8s 0.2s forwards", opacity: 0 }}>
            Good {timeOfDay},{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{firstName}</em>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {(params.rated || params.subscribed) && (
            <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
              {params.rated ? "✦ Rating saved" : `✦ Welcome to ${tier} — forecasts unlocked`}
            </span>
          )}
          <Link href="/settings" style={{ width: 38, height: 38, borderRadius: 3, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(200, 135, 58, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mist)", textDecoration: "none" }} title="Settings">
            <Settings size={16} />
          </Link>
          <Link href="/report" className="full-chart-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "rgba(200, 135, 58, 0.05)", border: "1px solid var(--amber)", borderRadius: 2, fontFamily: "'Instrument Sans', sans-serif", fontSize: 12.5, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--amber)", textDecoration: "none", whiteSpace: "nowrap", transition: "background 0.2s, color 0.2s" }}>
            <svg className="full-chart-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transition: "transform 0.2s" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            Full Chart
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: 32, opacity: 0.35 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, var(--amber), transparent)" }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--amber)", animation: "pulseDot 2s ease-in-out infinite" }}>✦</span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, var(--amber), transparent)" }} />
      </div>

      <div className="v2-grid">

        {/* 1. Current Dasha — span 1 LEFT */}
        <GlassCardV2 style={{ padding: 0 }}>
          <div style={{ padding: 28, height: "100%", boxSizing: "border-box" }}>
            <DashaCard
              activeMaha={activeMaha ? { planetName: activeMaha.planetName, startDate: activeMaha.startDate, endDate: activeMaha.endDate } : null}
              activeAntar={activeAntar ? { planetName: activeAntar.planetName, startDate: activeAntar.startDate, endDate: activeAntar.endDate } : null}
              mahaRemainingDays={mahaRemainingDays}
              mahaProgress={mahaProgress}
              planetGlyph={activeMaha ? (PLANET_GLYPH[activeMaha.planetName.toLowerCase()] ?? "★") : "★"}
              planetColor={activeMaha ? (PLANET_COLOR[activeMaha.planetName.toLowerCase()] ?? "var(--gold)") : "var(--gold)"}
              frontContent={
                <div>
                  <p style={dashaLabel}>Current Period</p>
                  {activeMaha ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                        <PlanetOrb name={activeMaha.planetName} size={64} />
                        <div>
                          <div style={dashaPlanet}>
                            {activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1)}
                          </div>
                          <div style={dashaType}>Mahadasha</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--gold)", opacity: 0.7, marginTop: 4 }}>
                            {getDashaTheme(activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1))}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--mist)", letterSpacing: "0.06em" }}>
                          {fmtDate(activeMaha.startDate)} → {fmtDate(activeMaha.endDate)}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--gold)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                          {mahaRemainingDays != null ? `${mahaRemainingDays.toLocaleString()} days left` : ""}
                        </span>
                      </div>
                      {mahaProgress != null && (
                        <div style={{ height: 2, background: "rgba(201,168,76,0.1)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${mahaProgress}%`, background: "linear-gradient(90deg, rgba(201,168,76,0.5), var(--gold))", borderRadius: 2, transition: "width 0.5s" }} />
                        </div>
                      )}
                      {activeAntar && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <PlanetOrb name={activeAntar.planetName} size={22} />
                          <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 12.5, color: "var(--gold)" }}>
                            Sub: {activeAntar.planetName.split("/")[1]?.charAt(0).toUpperCase()}
                            {activeAntar.planetName.split("/")[1]?.slice(1) ?? ""} Antardasha
                          </span>
                        </div>
                      )}
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginTop: activeAntar ? 0 : 14 }}>
                        {getDashaGuidance(activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1)).map((item, i) => (
                          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "var(--mist)", lineHeight: 1.55 }}>
                            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(201,168,76,0.45)", flexShrink: 0, marginTop: 7 }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, opacity: 0.25, lineHeight: 1 }}>—</div>
                      <p style={{ fontSize: 12.5, color: "var(--mist)", marginTop: 10, lineHeight: 1.6 }}>
                        Complete your birth profile to see your active Dasha period.
                      </p>
                      <Link href="/settings/profile" style={{ display: "inline-block", marginTop: "1rem", fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", color: "var(--gold)", textDecoration: "none" }}>
                        Set up profile →
                      </Link>
                    </>
                  )}
                </div>
              }
            />
          </div>
        </GlassCardV2>

        {/* 2. Today's Guidance — span 2 RIGHT */}
        <GlassCardV2 span="2">
          <TodaysGuidanceV2
            insight={dailyInsightRow ? {
              id: dailyInsightRow.id,
              content: dailyInsightRow.content as string,
              generatedAt: dailyInsightRow.generatedAt,
              accuracyRating: dailyInsightRow.accuracyRating,
            } : null}
            isPaid={true}
          />
        </GlassCardV2>

        {/* 3. HD Identity — full row */}
        <GlassCardV2 span="full">
          <HumanDesignTypeCard
            hdType={hdType}
            hdStrategy={hdStrategy}
            hdAuthority={hdAuthority}
            hdProfile={hdProfile}
          />
        </GlassCardV2>

        {/* 4. Forecast — full row */}
        <GlassCardV2 span="full">
          <ForecastCard
            initialWeekly={weeklyForecast}
            initialMonthly={monthlyForecast}
            isPaid={isPaid}
            weekLabel={weekLabel}
            monthLabel={monthLabel}
          />
        </GlassCardV2>

        {/* 5. HD Report — full row */}
        <GlassCardV2 span="full" noPadding style={{ background: "transparent", border: "none", boxShadow: "none" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 14 }}>
            Human Design Report
          </div>
          <DashboardReport />
        </GlassCardV2>

      </div>
    </div>
  );
}

// ─── Dasha themes ─────────────────────────────────────────────────────────────
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
function getDashaTheme(planet: string): string {
  return DASHA_THEME[planet] ?? "Reflection · Growth · Unfolding";
}

// ─── Dasha guidance ───────────────────────────────────────────────────────────
const DASHA_GUIDANCE: Record<string, string[]> = {  Saturn:  ["Consolidate career gains and secure your position.", "Review long-term investments and savings.", "Practice patience in relationships."],
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
  sun: "#FFD96A", moon: "#C8D8E8", mars: "#E8705A", mercury: "#80D4A0",
  jupiter: "#D4AF5F", venus: "#E8C0D0", saturn: "#B0A080", rahu: "#8888CC", ketu: "#AA8866",
};

function PlanetOrb({ name, size }: { name: string; size: number }) {
  const key = name.toLowerCase().split("/")[0];
  const glyph = PLANET_GLYPH[key] ?? "?";
  const color = PLANET_COLOR[key] ?? "var(--gold)";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `radial-gradient(circle at 38% 35%, ${color}18 0%, rgba(4,5,15,0.85) 70%)`, border: `${size >= 40 ? 1.5 : 1}px solid ${color}40`, boxShadow: `0 0 ${size * 0.25}px ${color}30, inset 0 0 ${size * 0.3}px ${color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: size * 0.48, color, lineHeight: 1, fontFamily: "serif", filter: `drop-shadow(0 0 ${size * 0.1}px ${color}80)`, userSelect: "none" }}>
        {glyph}
      </span>
    </div>
  );
}

// ─── Inline styles ────────────────────────────────────────────────────────────
const dashaLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
  color: "var(--amber)", marginBottom: 12,
};
const dashaPlanet: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 42, fontWeight: 400, lineHeight: 0.95,
  color: "var(--cream)", letterSpacing: "-0.01em",
};
const dashaType: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 22, fontWeight: 400, lineHeight: 1,
  color: "var(--mist)", marginBottom: 12,
};

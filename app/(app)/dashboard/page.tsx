/**
 * app/dashboard/page.tsx
 * V2 dashboard — 5-card grid matching the v2 HTML wireframe.
 * Cards: Cosmic Weather (2col) | Dasha (1col) | HD Identity (1col) | Daily Insight (1col) | HD Report (2col)
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Settings } from "lucide-react";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { DashboardReport } from "@/components/report/DashboardReport";
import { TodaysGuidance } from "@/components/insights/TodaysGuidance";
import { HumanDesignTypeCard } from "@/components/dashboard/HumanDesignTypeCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { DashaCard } from "@/components/dashboard/DashaCard";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { getThisWeeksForecast, getThisMonthsForecast, getWeekStart, getMonthStart } from "@/lib/ai/forecastService";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ rated?: string }>;
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

  // Today's daily insight
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const dailyInsightRow = await db.insight.findFirst({
    where: { userId, type: "DAILY", periodDate: { gte: todayStart, lte: todayEnd } },
    orderBy: { generatedAt: "desc" },
  });
  // Weekly + Monthly forecasts
  const [weeklyForecast, monthlyForecast] = await Promise.all([
    getThisWeeksForecast(userId),
    getThisMonthsForecast(userId),
  ]);
  const weekLabel = getWeekStart().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const monthLabel = getMonthStart().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Active Mahadasha + Antardasha
  const now = new Date();
  const activeMaha = await db.dasha.findFirst({
    where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } },
  });
  const activeAntar = activeMaha
    ? await db.dasha.findFirst({
        where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } },
      })
    : null;

  // Dasha date helpers
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

  // HD chart — fetch server-side so HumanDesignTypeCard gets type without an extra round-trip
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
    <div className="dashboard-content">

      {/* ── Topbar ─────────────────────────────────────────────── */}
      <div className="dashboard-topbar" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={greetingLabel}>Personal Dashboard</div>
          <h1 style={greeting}>
            Good {timeOfDay}, <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{firstName}</em>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link href="/settings" style={iconBtn} title="Settings">
            <Settings size={16} />
          </Link>
          <Link
            href="/report"
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px",
              background: "transparent",
              border: "1px solid var(--border-lit)",
              borderRadius: 10,
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "var(--gold)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            Full Chart
          </Link>
          {params.rated && (
            <span style={{ fontSize: 11, color: "var(--gold)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
              ✦ Rating saved
            </span>
          )}
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────── */}
      <div className="dashboard-grid">

        {/* 1. Today's Guidance — span 2 */}
        <GlassCard span={2}>
          <TodaysGuidance
            insight={dailyInsightRow ? {
              id: dailyInsightRow.id,
              content: dailyInsightRow.content as string,
              generatedAt: dailyInsightRow.generatedAt,
              accuracyRating: dailyInsightRow.accuracyRating,
            } : null}
            isPaid={isPaid}
          />
        </GlassCard>

        {/* 2. Active Dasha — 1 col (flip card) */}
        <GlassCard style={{ padding: 0 }}>
          <div style={{ padding: "var(--card-padding, 20px)", height: "100%", boxSizing: "border-box" }}>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                        <PlanetOrb name={activeMaha.planetName} size={64} />
                        <div>
                          <div style={dashaPlanet}>{activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1)}</div>
                          <div style={dashaType}>Mahadasha</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--faint)", letterSpacing: "0.06em" }}>
                          {fmtDate(activeMaha.startDate)} → {fmtDate(activeMaha.endDate)}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--gold)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                          {mahaRemainingDays != null ? `${mahaRemainingDays.toLocaleString()} days left` : ""}
                        </span>
                      </div>
                      {mahaProgress != null && (
                        <div style={{ height: 3, background: "rgba(212,175,95,0.12)", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${mahaProgress}%`, background: "linear-gradient(90deg, rgba(212,175,95,0.6), rgba(212,175,95,0.9))", borderRadius: 2, transition: "width 0.5s" }} />
                        </div>
                      )}
                      {activeAntar && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <PlanetOrb name={activeAntar.planetName} size={22} />
                          <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, color: "var(--gold)" }}>
                            Sub: {activeAntar.planetName.split("/")[1]?.charAt(0).toUpperCase() + (activeAntar.planetName.split("/")[1]?.slice(1) ?? "")} Antardasha
                          </span>
                        </div>
                      )}
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginTop: activeAntar ? 0 : 14 }}>
                        {getDashaGuidance(activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1)).map((item, i) => (
                          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,175,95,0.4)", flexShrink: 0, marginTop: 6 }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <div style={{ ...dashaPlanet, opacity: 0.3, fontSize: 32 }}>—</div>
                      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>
                        Complete your birth profile to see your active Dasha period.
                      </p>
                      <Link href="/settings/profile" style={smallGoldLink}>Set up profile →</Link>
                    </>
                  )}
                </div>
              }
            />
          </div>
        </GlassCard>

        {/* 3. HD Type Card — full row (span 3) */}
        <GlassCard span="full">
          <HumanDesignTypeCard
            hdType={hdType}
            hdStrategy={hdStrategy}
            hdAuthority={hdAuthority}
            hdProfile={hdProfile}
          />
        </GlassCard>

        {/* 5. Weekly / Monthly Forecast — full width */}
        <GlassCard span="full">
          <ForecastCard
            initialWeekly={weeklyForecast}
            initialMonthly={monthlyForecast}
            isPaid={isPaid}
            weekLabel={weekLabel}
            monthLabel={monthLabel}
          />
        </GlassCard>

        {/* 6. HD Report — full width (span 3) */}
        <GlassCard span="full" style={{ padding: 0, overflow: "visible", background: "transparent", border: "none" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 14, paddingLeft: 2 }}>
            Human Design Report
          </p>
          <DashboardReport />
        </GlassCard>

      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DASHA_GUIDANCE: Record<string, string[]> = {
  Saturn: ["Consolidate career gains and secure your position.", "Review long-term investments and savings.", "Practice patience in relationships."],
  Jupiter: ["Expand through wisdom and teaching others.", "Seek opportunities for growth and abundance.", "Honour your philosophical commitments."],
  Mars: ["Channel energy into disciplined action.", "Initiate projects you've been holding back.", "Guard against impulsive decisions."],
  Sun: ["Step into leadership and visibility.", "Focus on self-expression and purpose.", "Honour your father-figures and authority."],
  Moon: ["Tend to emotional wellbeing and home.", "Trust your intuition over logic.", "Nurture important relationships."],
  Mercury: ["Communicate clearly and learn actively.", "Handle contracts and agreements carefully.", "Short journeys bring unexpected insight."],
  Venus: ["Invest in beauty, comfort, and joy.", "Relationships and creativity are highlighted.", "Financial decisions bear fruit now."],
  Rahu: ["Embrace innovation and unconventional paths.", "Past-life themes resurface for resolution.", "Avoid obsessive attachment to outcomes."],
  Ketu: ["Release what no longer serves your soul.", "Spiritual practices deepen now.", "Detachment brings unexpected clarity."],
};

function getDashaGuidance(planet: string): string[] {
  return DASHA_GUIDANCE[planet] ?? [
    "Stay grounded and consistent in your efforts.",
    "Reflect on recurring patterns in your life.",
    "Trust the timing of your unfolding path.",
  ];
}

// ─── Styles ──────────────────────────────────────────────────────────────────


const greetingLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--faint)",
  marginBottom: 5,
};

const greeting: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "clamp(22px, 3vw, 30px)",
  fontWeight: 400,
  letterSpacing: "0.01em",
  color: "var(--moon)",
  lineHeight: 1.1,
};

const iconBtn: React.CSSProperties = {
  width: 38, height: 38,
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--faint)",
  textDecoration: "none",
  transition: "all 0.2s",
  flexShrink: 0,
};

const dashaLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--faint)",
  marginBottom: 10,
};

const dashaPlanet: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 46,
  fontWeight: 300,
  lineHeight: 0.95,
  color: "var(--moon)",
  letterSpacing: "-0.01em",
};

const dashaType: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 28,
  fontWeight: 400,
  lineHeight: 1,
  color: "rgba(232,224,208,0.5)",
  marginBottom: 14,
};

const smallGoldLink: React.CSSProperties = {
  display: "inline-block",
  marginTop: "1rem",
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  letterSpacing: "0.1em",
  color: "var(--gold)",
  textDecoration: "none",
};

const upgradePill: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 16px",
  background: "var(--gold-glow)",
  border: "1px solid var(--border-lit)",
  borderRadius: 100,
  fontFamily: "'DM Mono', monospace",
  fontSize: 9.5,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--gold)",
  textDecoration: "none",
};

// ─── Planet astrology glyphs ─────────────────────────────────────────────────
// Traditional Unicode astrological symbols for each Vedic planet.
// Keys are lowercase to match DB values (API stores: mars, saturn, rahu, etc.)
const PLANET_GLYPH: Record<string, string> = {
  sun:     "☉",
  moon:    "☽",
  mars:    "♂",
  mercury: "☿",
  jupiter: "♃",
  venus:   "♀",
  saturn:  "♄",
  rahu:    "☊",
  ketu:    "☋",
};

// Accent colour per planet
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

function PlanetOrb({ name, size }: { name: string; size: number }) {
  const key = name.toLowerCase().split("/")[0]; // antardasha names are "mars/rahu"
  const glyph = PLANET_GLYPH[key] ?? "?";
  const color = PLANET_COLOR[key] ?? "var(--gold)";
  const fontSize = size * 0.48;

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 38% 35%, ${color}18 0%, rgba(4,5,15,0.85) 70%)`,
      border: `${size >= 40 ? 1.5 : 1}px solid ${color}40`,
      boxShadow: `0 0 ${size * 0.25}px ${color}30, inset 0 0 ${size * 0.3}px ${color}10`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontSize,
        color,
        lineHeight: 1,
        fontFamily: "serif",
        filter: `drop-shadow(0 0 ${size * 0.1}px ${color}80)`,
        userSelect: "none",
      }}>
        {glyph}
      </span>
    </div>
  );
}

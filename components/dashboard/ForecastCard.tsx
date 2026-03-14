"use client";
/**
 * components/dashboard/ForecastCard.tsx
 * Displays weekly and monthly forecasts with a tab toggle.
 * Shows generate button when no forecast exists.
 * FRONTEND.md: amber/gold, Cormorant/DM Mono/Instrument Sans, no box-shadow.
 */

import { useState, useEffect } from "react";

interface ForecastSection { title: string; body: string; }
type ForecastVariant = "default" | "v4";

interface WeeklyForecast {
  headline: string; theme: string; overview: string;
  sections: ForecastSection[]; practice: string; generatedAt: string;
}

interface MonthlyForecast {
  headline: string; theme: string; overview: string;
  sections: ForecastSection[]; intention: string; generatedAt: string;
}

interface Props {
  initialWeekly: WeeklyForecast | null;
  initialMonthly: MonthlyForecast | null;
  isPaid: boolean;
  weekLabel: string;   // e.g. "Week of Mar 3"
  monthLabel: string;  // e.g. "March 2026"
  variant?: ForecastVariant;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function getStyles(variant: ForecastVariant) {
  const isV4 = variant === "v4";
  const accent = isV4 ? "var(--gold-solar, #D4AF37)" : "var(--amber)";
  const accentSoft = isV4 ? "rgba(212,175,55,0.12)" : "rgba(200,135,58,0.12)";
  const accentBorder = isV4 ? "rgba(212,175,55,0.24)" : "rgba(200,135,58,0.2)";
  const accentBorderStrong = isV4 ? "rgba(212,175,55,0.4)" : "rgba(200,135,58,0.4)";
  const textPrimary = isV4 ? "rgba(255,255,255,0.92)" : "var(--cream)";
  const textSecondary = isV4 ? "rgba(255,255,255,0.62)" : "var(--mist)";
  const monoFont = isV4 ? "'JetBrains Mono', 'Courier New', monospace" : "'DM Mono', monospace";
  const serifFont = isV4 ? "'Playfair Display', Georgia, serif" : "Cinzel, serif";

  return {
    eyebrow: {
      fontFamily: monoFont,
      fontSize: "var(--type-label)",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: accent,
    } satisfies React.CSSProperties,
    headline: {
      fontFamily: serifFont,
      fontSize: "var(--type-h2)",
      fontWeight: isV4 ? 500 : 300,
      color: textPrimary,
      lineHeight: 1.3,
      margin: "8px 0 4px",
    } satisfies React.CSSProperties,
    themePill: {
      display: "inline-block",
      border: `1px solid ${accentBorderStrong}`,
      borderRadius: isV4 ? 999 : 2,
      padding: isV4 ? "4px 10px" : "2px 10px",
      fontFamily: monoFont,
      fontSize: "var(--type-label)",
      letterSpacing: "0.16em",
      color: accent,
      background: isV4 ? "rgba(124,58,237,0.1)" : "transparent",
      marginBottom: 14,
      textTransform: "uppercase",
    } satisfies React.CSSProperties,
    divider: {
      height: 1,
      background: isV4
        ? "linear-gradient(to right, rgba(212,175,55,0.35), rgba(124,58,237,0.14), transparent)"
        : "linear-gradient(to right, rgba(200,135,58,0.3), transparent)",
      margin: "14px 0",
    } satisfies React.CSSProperties,
    overview: {
      fontFamily: "'Lora', Georgia, serif",
      fontStyle: "italic",
      fontSize: "var(--type-oracle)",
      color: textSecondary,
      lineHeight: 1.8,
      marginBottom: 16,
    } satisfies React.CSSProperties,
    sectionTitle: {
      fontFamily: monoFont,
      fontSize: "var(--type-label)",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: accent,
      marginBottom: 4,
    } satisfies React.CSSProperties,
    sectionBody: {
      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      fontSize: "var(--type-body)",
      color: textSecondary,
      lineHeight: 1.65,
      marginBottom: 14,
    } satisfies React.CSSProperties,
    practiceBox: {
      marginTop: 4,
      padding: "10px 14px",
      background: isV4 ? "rgba(212,175,55,0.08)" : "rgba(200,135,58,0.05)",
      border: `1px solid ${accentBorder}`,
      borderRadius: isV4 ? 10 : 2,
      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      fontSize: "var(--type-body)",
      color: isV4 ? "var(--lavender, #EDE9FF)" : "var(--gold)",
      lineHeight: 1.6,
    } satisfies React.CSSProperties,
    generateBtn: {
      marginTop: 14,
      padding: "9px 20px",
      background: isV4
        ? "linear-gradient(135deg, rgba(212,175,55,0.16), rgba(124,58,237,0.08))"
        : "linear-gradient(135deg, rgba(200,135,58,0.12), rgba(200,135,58,0.04))",
      border: `1px solid ${accentBorderStrong}`,
      borderRadius: isV4 ? 999 : 2,
      color: accent,
      fontFamily: isV4 ? monoFont : "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      fontSize: 12,
      cursor: "pointer",
      letterSpacing: isV4 ? "0.12em" : "0.06em",
      textTransform: isV4 ? "uppercase" : undefined,
    } satisfies React.CSSProperties,
    tabBtn: (active: boolean): React.CSSProperties => ({
      padding: isV4 ? "4px 12px" : "4px 14px",
      background: active ? accentSoft : "transparent",
      border: `1px solid ${active ? accentBorderStrong : accentBorder}`,
      borderRadius: isV4 ? 999 : 2,
      color: active ? accent : textSecondary,
      fontFamily: monoFont,
      fontSize: "var(--type-label)",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    upgradeEyebrow: {
      fontFamily: monoFont,
      fontSize: "var(--type-label)",
      color: accent,
      letterSpacing: "0.12em",
      opacity: 0.8,
      textTransform: "uppercase",
    } satisfies React.CSSProperties,
    upgradeText: {
      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      fontSize: "var(--type-body)",
      color: textSecondary,
      textAlign: "center",
      maxWidth: 280,
      lineHeight: 1.5,
    } satisfies React.CSSProperties,
    upgradeLink: {
      padding: "8px 20px",
      border: `1px solid ${accentBorderStrong}`,
      borderRadius: isV4 ? 999 : 2,
      color: accent,
      fontFamily: monoFont,
      fontSize: "var(--type-label)",
      letterSpacing: "0.14em",
      textDecoration: "none",
      background: accentSoft,
      textTransform: "uppercase",
    } satisfies React.CSSProperties,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ForecastCard({ initialWeekly, initialMonthly, isPaid, weekLabel, monthLabel, variant = "default" }: Props) {
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");
  const [weekly, setWeekly] = useState<WeeklyForecast | null>(initialWeekly);
  const [monthly, setMonthly] = useState<MonthlyForecast | null>(initialMonthly);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const styles = getStyles(variant);

  // Auto-generate weekly forecast on first load if missing
  useEffect(() => {
    if (!initialWeekly && isPaid) {
      setTab("weekly");
      void (async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/insights/generate/weekly", { method: "POST" });
          const data = await res.json();
          if (res.ok) setWeekly(data.forecast);
        } finally { setLoading(false); }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate monthly forecast on first load if missing (runs in background, no tab switch)
  useEffect(() => {
    if (!initialMonthly && isPaid) {
      void (async () => {
        try {
          const res = await fetch("/api/insights/generate/monthly", { method: "POST" });
          const data = await res.json();
          if (res.ok) setMonthly(data.forecast);
        } catch { /* silent — monthly generates in background */ }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true); setError(null);
    const url = tab === "weekly" ? "/api/insights/generate/weekly" : "/api/insights/generate/monthly";
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      if (tab === "weekly") setWeekly(data.forecast);
      else setMonthly(data.forecast);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  const current = tab === "weekly" ? weekly : monthly;
  const label = tab === "weekly" ? weekLabel : monthLabel;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={styles.eyebrow}>Forecast · {label}</div>
        </div>
        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 6 }}>
          <button style={styles.tabBtn(tab === "weekly")} onClick={() => setTab("weekly")}>Weekly</button>
          <button style={styles.tabBtn(tab === "monthly")} onClick={() => setTab("monthly")}>Monthly</button>
        </div>
      </div>

      {isPaid ? (
        current ? (
          <ForecastContent forecast={current} type={tab} variant={variant} />
        ) : (
          <div>
            <p style={{ ...styles.overview, opacity: 0.45, fontStyle: "italic", marginBottom: 0 }}>
              Your {tab} forecast is ready to generate…
            </p>
            <button onClick={generate} disabled={loading} style={styles.generateBtn}>
              {loading ? "Generating…" : `✦ Generate ${tab === "weekly" ? "Weekly" : "Monthly"} Forecast`}
            </button>
            {error && <p style={{ marginTop: 8, fontSize: 12, color: "rgba(220,80,80,0.8)" }}>{error}</p>}
          </div>
        )
      ) : (
        // Free tier — blurred preview + upgrade CTA
        <div style={{ position: "relative" }}>
          <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none", opacity: 0.5 }}>
            <h3 style={headline}>A week of deeper integration awaits you</h3>
            <div style={themePill}>Clarity & Momentum</div>
            <p style={overview}>
              This week carries a distinct energy of consolidation. Your defined centres are amplified
              by the current dasha themes, creating moments of unusual clarity in decision-making.
            </p>
            <div style={sectionTitle}>Energy & Body</div>
            <div style={sectionBody}>Your sacral energy peaks mid-week. Honour rest on the bookends.</div>
            <div style={sectionTitle}>Relationships & Aura</div>
            <div style={sectionBody}>Your aura is particularly receptive to new connections this week.</div>
          </div>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <div style={styles.upgradeEyebrow}>
              CORE & VIP MEMBERS
            </div>
            <p style={styles.upgradeText}>
              Unlock weekly and monthly personalised forecasts
            </p>
            <a href="/subscribe" style={styles.upgradeLink}>Upgrade to Core →</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Forecast content renderer ────────────────────────────────────────────────

function ForecastContent({ forecast, type, variant }: { forecast: WeeklyForecast | MonthlyForecast; type: "weekly" | "monthly"; variant: ForecastVariant }) {
  const practiceLabel = type === "weekly" ? "Weekly Practice" : "Monthly Intention";
  const practiceText = type === "weekly"
    ? (forecast as WeeklyForecast).practice
    : (forecast as MonthlyForecast).intention;
  const styles = getStyles(variant);

  return (
    <div>
      <h3 style={styles.headline}>{forecast.headline}</h3>
      <span style={styles.themePill}>{forecast.theme}</span>
      <p style={styles.overview}>{forecast.overview}</p>
      <div style={styles.divider} />
      {forecast.sections.map((s, i) => (
        <div key={i}>
          <div style={styles.sectionTitle}>{s.title}</div>
          <div style={styles.sectionBody}>{s.body}</div>
        </div>
      ))}
      <div style={styles.divider} />
      <div style={{ ...styles.sectionTitle, marginBottom: 6 }}>
        {practiceLabel}
      </div>
      <div style={styles.practiceBox}>{practiceText}</div>
    </div>
  );
}

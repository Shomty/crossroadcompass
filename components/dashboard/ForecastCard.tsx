"use client";
/**
 * components/dashboard/ForecastCard.tsx
 * Displays weekly and monthly forecasts with a tab toggle.
 * Shows generate button when no forecast exists.
 * FRONTEND.md: amber/gold, Cormorant/DM Mono/Instrument Sans, no box-shadow.
 */

import { useState, useEffect } from "react";

interface ForecastSection { title: string; body: string; }

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
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 9,
  letterSpacing: "0.3em", textTransform: "uppercase",
  color: "var(--amber)",
};

const headline: React.CSSProperties = {
  fontFamily: "Cinzel, serif",
  fontSize: 22, fontWeight: 300, color: "var(--cream)",
  lineHeight: 1.3, margin: "8px 0 4px",
};

const themePill: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid rgba(200,135,58,0.35)",
  borderRadius: 2, padding: "2px 10px",
  fontFamily: "'DM Mono', monospace", fontSize: 9,
  letterSpacing: "0.16em", color: "var(--amber)",
  marginBottom: 14,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "linear-gradient(to right, rgba(200,135,58,0.3), transparent)",
  margin: "14px 0",
};

const overview: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 13, color: "var(--mist)", lineHeight: 1.7, marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 9,
  letterSpacing: "0.3em", textTransform: "uppercase",
  color: "var(--amber)", marginBottom: 4,
};

const sectionBody: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 12.5, color: "var(--mist)", lineHeight: 1.65, marginBottom: 14,
};

const practiceBox: React.CSSProperties = {
  marginTop: 4, padding: "10px 14px",
  background: "rgba(200,135,58,0.05)",
  border: "1px solid rgba(200,135,58,0.2)",
  borderRadius: 2,
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 12.5, color: "var(--gold)", lineHeight: 1.6,
};

const generateBtn: React.CSSProperties = {
  marginTop: 14, padding: "9px 20px",
  background: "linear-gradient(135deg, rgba(200,135,58,0.12), rgba(200,135,58,0.04))",
  border: "1px solid rgba(200,135,58,0.4)",
  borderRadius: 2, color: "var(--amber)",
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 12, cursor: "pointer", letterSpacing: "0.06em",
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: "4px 14px",
  background: active ? "rgba(200,135,58,0.12)" : "transparent",
  border: `1px solid ${active ? "rgba(200,135,58,0.4)" : "rgba(200,135,58,0.15)"}`,
  borderRadius: 2, color: active ? "var(--amber)" : "var(--mist)",
  fontFamily: "'DM Mono', monospace", fontSize: 9,
  letterSpacing: "0.14em", textTransform: "uppercase",
  cursor: "pointer", transition: "all 0.2s",
});

// ─── Main component ───────────────────────────────────────────────────────────

export function ForecastCard({ initialWeekly, initialMonthly, isPaid, weekLabel, monthLabel }: Props) {
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");
  const [weekly, setWeekly] = useState<WeeklyForecast | null>(initialWeekly);
  const [monthly, setMonthly] = useState<MonthlyForecast | null>(initialMonthly);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <div style={eyebrow}>Forecast · {label}</div>
        </div>
        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 6 }}>
          <button style={tabBtn(tab === "weekly")} onClick={() => setTab("weekly")}>Weekly</button>
          <button style={tabBtn(tab === "monthly")} onClick={() => setTab("monthly")}>Monthly</button>
        </div>
      </div>

      {isPaid ? (
        current ? (
          <ForecastContent forecast={current} type={tab} />
        ) : (
          <div>
            <p style={{ ...overview, opacity: 0.45, fontStyle: "italic", marginBottom: 0 }}>
              Your {tab} forecast is ready to generate…
            </p>
            <button onClick={generate} disabled={loading} style={generateBtn}>
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
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--amber)", letterSpacing: "0.12em", opacity: 0.8 }}>
              CORE & VIP MEMBERS
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 13, color: "var(--mist)", textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
              Unlock weekly and monthly personalised forecasts
            </p>
            <a href="/subscribe" style={{
              padding: "8px 20px",
              border: "1px solid rgba(200,135,58,0.5)",
              borderRadius: 2, color: "var(--amber)",
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              letterSpacing: "0.14em", textDecoration: "none",
              background: "rgba(200,135,58,0.08)",
            }}>Upgrade to Core →</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Forecast content renderer ────────────────────────────────────────────────

function ForecastContent({ forecast, type }: { forecast: WeeklyForecast | MonthlyForecast; type: "weekly" | "monthly" }) {
  const practiceLabel = type === "weekly" ? "Weekly Practice" : "Monthly Intention";
  const practiceText = type === "weekly"
    ? (forecast as WeeklyForecast).practice
    : (forecast as MonthlyForecast).intention;

  return (
    <div>
      <h3 style={headline}>{forecast.headline}</h3>
      <span style={themePill}>{forecast.theme}</span>
      <p style={overview}>{forecast.overview}</p>
      <div style={divider} />
      {forecast.sections.map((s, i) => (
        <div key={i}>
          <div style={sectionTitle}>{s.title}</div>
          <div style={sectionBody}>{s.body}</div>
        </div>
      ))}
      <div style={divider} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>
        {practiceLabel}
      </div>
      <div style={practiceBox}>{practiceText}</div>
    </div>
  );
}

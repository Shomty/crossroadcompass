// STATUS: done | Task 8.4
/**
 * components/insights/LifePhaseIndicator.tsx
 * Compact HD identity strip — shows type, strategy, and authority.
 * Data fetched server-side from the HD chart cache.
 * Note: Dasha / Vedic life-phase display is blocked on DECISION NEEDED
 * for the Vedic API (TASKS.md open decision #1). Shows HD identity instead.
 */

"use client";

import { useEffect, useState } from "react";

interface HDSummary {
  type: string;
  strategy: string;
  authority: string;
  profile?: string;
}

export function LifePhaseIndicator({ compact }: { compact?: boolean }) {
  const [data, setData] = useState<HDSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hd-chart")
      .then((r) => r.json())
      .then((json) => {
        if (json?.chart) {
          setData({
            type: json.chart.type ?? "Unknown",
            strategy: json.chart.strategy ?? "—",
            authority: json.chart.authority ?? "—",
            profile: json.chart.profile,
          });
        }
      })
      .catch(() => {/* silent — placeholder shown */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={compact ? compactContainer : containerStyle}>
        <span style={placeholderStyle}>Calculating…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={compact ? compactContainer : containerStyle}>
        <span style={placeholderStyle}>Complete onboarding to see your life phase.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={compactContainer}>
        {/* Progress-bar style phase indicator */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 100, position: "relative", marginBottom: 8 }}>
            <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, rgba(212,175,95,0.3) 0%, var(--gold) 100%)", borderRadius: 100, position: "relative" }}>
              <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, background: "var(--gold)", borderRadius: "50%", boxShadow: "0 0 0 4px rgba(212,175,95,0.2), 0 0 12px rgba(212,175,95,0.4)" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {["Type", "Strategy", "Authority"].map((label) => (
              <span key={label} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--faint)" }}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          padding: "14px 16px",
          background: "rgba(212,175,95,0.05)",
          border: "1px solid rgba(212,175,95,0.15)",
          borderLeft: "3px solid var(--gold)",
          borderRadius: "0 10px 10px 0",
        }}>
          <p style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gold)", marginBottom: 4, letterSpacing: "0.01em" }}>
            {data.type}
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            {data.strategy} · {data.authority}
            {data.profile && ` · Profile ${data.profile}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <span style={eyebrow}>Your Human Design</span>
      <div style={pillsRow}>
        <Pill label="Type" value={data.type} accent />
        <Pill label="Strategy" value={data.strategy} />
        <Pill label="Authority" value={data.authority} />
        {data.profile && <Pill label="Profile" value={data.profile} />}
      </div>
    </div>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={pillStyle}>
      <span style={pillLabel}>{label}</span>
      <span style={{ ...pillValue, color: accent ? "var(--gold)" : "var(--cream)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
  padding: "1rem 1.5rem",
  borderBottom: "1px solid rgba(200,135,58,0.1)",
  background: "rgba(255,255,255,0.01)",
  flexWrap: "wrap",
};

const compactContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.6rem",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "var(--amber)",
  flexShrink: 0,
};

const pillsRow: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  flexWrap: "wrap",
};

const pillStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

const pillLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.55rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--mist)",
  opacity: 0.6,
};

const pillValue: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "1rem",
  fontWeight: 400,
};

const placeholderStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--mist)",
  opacity: 0.5,
};

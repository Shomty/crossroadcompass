"use client";
/**
 * components/insights/DailyInsightCard.tsx
 * Client component for the Daily Insight card.
 * Shows the insight if available, or a Generate button if not.
 * Handles the POST /api/insights/generate call on click.
 */

import { useState, useEffect } from "react";

interface DailyInsightData {
  summary: string;
  insight: string;
  action: string;
  energyTheme: string;
  generatedAt: string;
}

interface Props {
  initialInsight: DailyInsightData | null;
  isPaid: boolean;
  todayDate: string;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--mist)",
  marginBottom: 12,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 1.7,
  color: "var(--cream)",
};

const actionStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "10px 14px",
  background: "rgba(212,175,95,0.07)",
  borderLeft: "2px solid rgba(212,175,95,0.4)",
  borderRadius: 4,
  fontFamily: "'Instrument Sans', sans-serif",
  fontSize: 12,
  color: "var(--gold)",
  lineHeight: 1.5,
};

const themePillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 20,
  border: "1px solid rgba(212,175,95,0.3)",
  background: "rgba(212,175,95,0.06)",
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  color: "rgba(212,175,95,0.7)",
  letterSpacing: "0.08em",
  marginBottom: 12,
};

const generateBtnStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 20px",
  background: "linear-gradient(135deg, rgba(212,175,95,0.15), rgba(212,175,95,0.05))",
  border: "1px solid rgba(212,175,95,0.4)",
  borderRadius: 8,
  color: "var(--gold)",
  fontFamily: "'Instrument Sans', sans-serif",
  fontSize: 13,
  cursor: "pointer",
  letterSpacing: "0.04em",
  transition: "all 0.2s",
};

export function DailyInsightCard({ initialInsight, isPaid, todayDate }: Props) {
  const [insight, setInsight] = useState<DailyInsightData | null>(initialInsight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate on first load if no insight exists and user is eligible
  useEffect(() => {
    if (!initialInsight && isPaid) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights/generate", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate insight");
      }
      const data = await res.json();
      setInsight(data.insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p style={labelStyle}>Today&apos;s Insight · {todayDate}</p>

      {insight ? (
        <div>
          <span style={themePillStyle}>{insight.energyTheme}</span>
          <p style={{ ...bodyStyle, fontStyle: "italic", marginBottom: 8 }}>
            {insight.insight}
          </p>
          <div style={actionStyle}>
            <span style={{ opacity: 0.6, fontSize: 10, display: "block", marginBottom: 3 }}>
              TODAY&apos;S FOCUS
            </span>
            {insight.action}
          </div>
        </div>
      ) : isPaid ? (
        <div>
          <p style={{ ...bodyStyle, fontStyle: "italic", opacity: 0.45, lineHeight: 1.7, marginBottom: 0 }}>
            Your daily insight is ready to be generated…
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={generateBtnStyle}
          >
            {loading ? "Generating…" : "✦ Generate Today's Insight"}
          </button>
          {error && (
            <p style={{ marginTop: 8, fontSize: 12, color: "rgba(220,80,80,0.8)" }}>{error}</p>
          )}
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <p style={{ ...bodyStyle, fontStyle: "italic", opacity: 0.45, lineHeight: 1.7, filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
            With your Moon in the 4th house, this Saturn transit calls for stillness before motion. Your authority is clearest when you wait for the exhale, not the inhale.
          </p>
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <a href="/subscribe" style={{
              display: "inline-block", padding: "8px 18px",
              background: "linear-gradient(135deg,rgba(212,175,95,0.18),rgba(212,175,95,0.06))",
              border: "1px solid rgba(212,175,95,0.4)", borderRadius: 20,
              color: "var(--gold)", fontSize: 12, textDecoration: "none",
              fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "0.06em",
            }}>
              Upgrade for Daily Insights
            </a>
          </div>
        </div>
      )}
    </>
  );
}

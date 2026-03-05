"use client";
/**
 * components/insights/TodaysGuidance.tsx
 * Today's Guidance — short empowering message from the day's energy.
 * Shows: eyebrow + energyTheme tag + insight quote (big italic) + action focus + star rating.
 * Also handles generate / upgrade when no insight exists.
 */

import { useState, useEffect } from "react";

interface InsightContent {
  insight?: string;
  action?: string;
  energyTheme?: string;
}

interface InsightProp {
  id: string;
  content: string;
  generatedAt: Date;
  accuracyRating: number | null;
}

interface Props {
  insight: InsightProp | null;
  isPaid: boolean;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
  color: "var(--amber)", opacity: 0.7, marginBottom: 14,
};

const themeTag: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid rgba(200,135,58,0.3)",
  borderRadius: 2, padding: "2px 9px",
  fontFamily: "'DM Mono', monospace",
  fontSize: 9, letterSpacing: "0.14em", color: "var(--amber)",
  marginBottom: 14,
};

const quoteText: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "clamp(19px, 2.2vw, 26px)",
  fontWeight: 300, fontStyle: "italic",
  lineHeight: 1.6, color: "var(--moon)",
  marginBottom: 16,
};

const actionBox: React.CSSProperties = {
  padding: "9px 13px",
  borderLeft: "2px solid rgba(200,135,58,0.4)",
  background: "rgba(200,135,58,0.05)",
  fontFamily: "'Instrument Sans', sans-serif",
  fontSize: 12.5, color: "var(--gold)", lineHeight: 1.6,
  marginBottom: 18,
};

const actionLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
  color: "var(--amber)", opacity: 0.6,
  display: "block", marginBottom: 3,
};

const ratingRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, marginTop: 4,
};

const ratingLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--faint)",
};

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ insightId, initial }: { insightId: string; initial: number | null }) {
  const [rating, setRating] = useState<number>(initial ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [submitted, setSubmitted] = useState(initial !== null);

  async function handleRate(r: number) {
    if (submitted) return;
    setRating(r);
    setSubmitted(true);
    try {
      await fetch("/api/insights/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId, rating: r }),
      });
    } catch { /* silent optimistic */ }
  }

  const display = submitted ? rating : (hover || rating);
  return (
    <div style={ratingRow}>
      <span style={ratingLabel}>Accuracy</span>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((r) => (
          <button key={r} onClick={() => handleRate(r)}
            onMouseEnter={() => !submitted && setHover(r)}
            onMouseLeave={() => !submitted && setHover(0)}
            title={submitted ? `Rated ${rating}/5` : `Rate ${r}`}
            style={{ background: "none", border: "none", padding: "2px 1px", fontSize: 16, lineHeight: 1,
              cursor: submitted ? "default" : "pointer",
              color: display >= r ? "var(--gold)" : "rgba(200,135,58,0.18)", transition: "color 0.15s" }}
            aria-label={`${r} star`}>★</button>
        ))}
      </div>
      {submitted && (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--amber)", opacity: 0.6, letterSpacing: "0.1em" }}>Saved</span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TodaysGuidance({ insight, isPaid }: Props) {
  const [generated, setGenerated] = useState<InsightProp | null>(insight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Auto-generate on mount if paid and no insight yet
  useEffect(() => {
    if (!insight && isPaid) handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/insights/generate", { method: "POST" });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? "Failed"); }
      const data = await res.json();
      // Re-fetch the row id by reloading — or just show parsed content inline
      setGenerated({ id: data.id ?? "new", content: JSON.stringify(data.insight), generatedAt: new Date(), accuracyRating: null });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  let parsed: InsightContent | null = null;
  if (generated) {
    try { parsed = JSON.parse(generated.content); } catch { /* fallback */ }
  }

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <div style={eyebrow}>Today&apos;s Guidance · {today}</div>

      {parsed ? (
        <>
          {parsed.energyTheme && <span style={themeTag}>{parsed.energyTheme}</span>}
          {parsed.insight && <p style={quoteText}>{parsed.insight}</p>}
          {parsed.action && (
            <div style={actionBox}>
              <span style={actionLabel}>Today&apos;s Focus</span>
              {parsed.action}
            </div>
          )}
          <StarRating insightId={generated!.id} initial={generated!.accuracyRating} />
        </>
      ) : loading ? (
        <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, color: "var(--mist)", opacity: 0.55, fontStyle: "italic" }}>
          Channeling today&apos;s energy…
        </p>
      ) : isPaid ? (
        <>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: "italic", color: "var(--mist)", opacity: 0.4, lineHeight: 1.7, marginBottom: 14 }}>
            Your guidance for today is ready to be revealed…
          </p>
          <button onClick={handleGenerate} style={{
            padding: "9px 20px", background: "rgba(212,175,95,0.1)",
            border: "1px solid rgba(212,175,95,0.4)", borderRadius: 2,
            color: "var(--gold)", fontFamily: "'Instrument Sans', sans-serif",
            fontSize: 13, cursor: "pointer", letterSpacing: "0.04em",
          }}>✦ Reveal Today&apos;s Guidance</button>
          {error && <p style={{ marginTop: 8, fontSize: 12, color: "rgba(220,80,80,0.8)" }}>{error}</p>}
        </>
      ) : (
        <>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: "italic", color: "var(--mist)", opacity: 0.35, lineHeight: 1.7, filter: "blur(3px)", userSelect: "none", marginBottom: 14 }}>
            With the stars aligned in your chart, today calls for deep presence and inner clarity as you move through the world.
          </p>
          <a href="/subscribe" style={{
            display: "inline-block", padding: "8px 18px",
            background: "rgba(212,175,95,0.1)", border: "1px solid rgba(212,175,95,0.4)",
            borderRadius: 2, color: "var(--gold)", fontSize: 12, textDecoration: "none",
            fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "0.06em",
          }}>Unlock Daily Guidance →</a>
        </>
      )}
    </>
  );
}

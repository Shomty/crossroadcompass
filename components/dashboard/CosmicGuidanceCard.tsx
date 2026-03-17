"use client";
/**
 * components/dashboard/CosmicGuidanceCard.tsx
 * Renders the Cosmic Guidance card.
 * If no insight is passed, auto-triggers POST /api/insights/generate on mount.
 * Parses the stored JSON content and renders structured fields.
 */

import { useEffect, useState } from "react";

interface InsightContent {
  summary?: string;
  insight?: string;
  action?: string;
  energyTheme?: string;
}

interface InsightState {
  id: string;
  parsed: InsightContent;
  accuracyRating: number | null;
}

interface Props {
  initialInsight: {
    id: string;
    content: string;
    accuracyRating: number | null;
  } | null;
}

function parseContentSafe(content: string): InsightContent | null {
  try { return JSON.parse(content) as InsightContent; } catch { return null; }
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ insightId, initial }: { insightId: string; initial: number | null }) {
  const [rating, setRating] = useState<number>(initial ?? 0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(initial !== null);

  async function handleRate(r: number) {
    if (submitted) return;
    setRating(r); setSubmitted(true);
    try {
      await fetch("/api/insights/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId, rating: r }),
      });
    } catch { /* optimistic */ }
  }

  const display = submitted ? rating : (hover || rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--type-label)", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--mist)" }}>
        Accuracy
      </span>
      <div style={{ display: "flex", gap: 3 }}>
        {[1,2,3,4,5].map(r => (
          <button key={r}
            onClick={() => handleRate(r)}
            onMouseEnter={() => !submitted && setHover(r)}
            onMouseLeave={() => !submitted && setHover(0)}
            style={{
              background: "none", border: "none", padding: "2px 1px", fontSize: 18, lineHeight: 1,
              cursor: submitted ? "default" : "pointer",
              color: display >= r ? "#f5d76e" : "rgba(201,168,76,0.16)",
              textShadow: display >= r ? "0 0 6px rgba(212,175,55,0.5)" : "none",
              transition: "color 0.15s, text-shadow 0.15s",
            }}
            title={submitted ? `Rated ${rating}/5` : `Rate ${r}`}
            aria-label={`${r} star`}
          >★</button>
        ))}
      </div>
      {submitted && (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--type-label)", color: "var(--amber)", letterSpacing: "0.1em" }}>Saved</span>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function CosmicGuidanceCard({ initialInsight }: Props) {
  const [state, setState] = useState<InsightState | null>(() => {
    if (!initialInsight) return null;
    const parsed = parseContentSafe(initialInsight.content);
    return parsed ? { id: initialInsight.id, parsed, accuracyRating: initialInsight.accuracyRating } : null;
  });
  const [loading, setLoading] = useState(initialInsight === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialInsight !== null) return;
    let cancelled = false;

    async function generate() {
      try {
        const res = await fetch("/api/insights/generate", { method: "POST" });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          if (!cancelled) setError(d.error ?? "Generation failed");
          return;
        }
        const data = await res.json();
        const raw = data?.insight;
        if (!cancelled && raw) {
          setState({
            id: data.id ?? "new",
            parsed: { summary: raw.summary, insight: raw.insight, action: raw.action, energyTheme: raw.energyTheme },
            accuracyRating: null,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void generate();
    return () => { cancelled = true; };
  }, [initialInsight]);

  return (
    <div className="glass-card glass-card-hero dash-col-8 animate-enter animate-enter-1">
      <div className="dash-card-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div className="dash-live-dot" />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--type-label)", letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#4ADE80", opacity: 0.85 }}>Daily Message</span>
          </div>
          <h2 className="dash-section-title">Cosmic Guidance</h2>
          <span className="dash-section-subtitle">Today&apos;s personal navigation</span>
        </div>
        {state?.parsed.energyTheme ? (
          <span style={{
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: 2, padding: "3px 10px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "var(--type-label)", letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color: "var(--amber)",
          }}>{state.parsed.energyTheme}</span>
        ) : (
          <span className="dash-sparkle">✦</span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 16, borderRadius: 6, background: "rgba(212,175,95,0.08)", animation: "pulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.12}s`, width: i === 3 ? "60%" : "100%" }} />
          ))}
        </div>
      ) : state ? (
        <>
          {state.parsed.insight && (
            <p className="oracle-body" style={{
              color: "var(--cream)",
              marginBottom: 22, letterSpacing: "0.01em",
            }}>
              &ldquo;{state.parsed.insight}&rdquo;
            </p>
          )}

          <div className="v2-ornament" style={{ marginBottom: 18 }}>✦</div>

          {state.parsed.action && (
            <div style={{
              padding: "12px 16px",
              borderLeft: "2px solid rgba(201,168,76,0.35)",
              background: "rgba(201,168,76,0.04)",
              borderRadius: "0 6px 6px 0",
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--type-label)", letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "var(--amber)", display: "block", marginBottom: 5 }}>
                Today&apos;s Focus
              </span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 13, color: "var(--cream)", lineHeight: 1.6 }}>
                {state.parsed.action}
              </span>
            </div>
          )}

          <StarRating insightId={state.id} initial={state.accuracyRating} />
        </>
      ) : (
        <div className="dash-empty">
          {error ?? "Could not generate guidance right now. Please refresh."}
        </div>
      )}
    </div>
  );
}

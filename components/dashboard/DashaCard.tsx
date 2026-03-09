"use client";
/**
 * components/dashboard/DashaCard.tsx
 * Flip card — front: Dasha stats, back: AI-generated insight for this period.
 * Click anywhere to flip. Insight is fetched lazily on first flip.
 */

import { useState } from "react";

interface DashaData {
  planetName: string;
  startDate: Date;
  endDate: Date;
}

interface Props {
  activeMaha: DashaData | null;
  activeAntar: DashaData | null;
  mahaRemainingDays: number | null;
  mahaProgress: number | null;
  planetGlyph: string;
  planetColor: string;
  /** Sub-components rendered on the front (planet orb + guidance list) */
  frontContent: React.ReactNode;
}

export function DashaCard({
  activeMaha,
  mahaRemainingDays,
  mahaProgress,
  planetGlyph,
  planetColor,
  frontContent,
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function fetchInsight() {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/insights/dasha", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        console.error("[DashaCard] API error", res.status, data);
        setApiError(`${res.status}: ${data.error ?? "Unknown error"}`);
      } else {
        setInsight(data.insight ?? null);
      }
    } catch (err) {
      console.error("[DashaCard] fetch failed", err);
      setApiError("Network error");
    } finally {
      setFetched(true);
      setLoading(false);
    }
  }

  async function handleFlip() {
    const next = !flipped;
    setFlipped(next);
    if (next && !fetched) {
      await fetchInsight();
    }
  }

  const mahaName = activeMaha
    ? activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1)
    : "";

  return (
    <>
      <style>{`
        .dasha-flip-inner { transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1); transform-style: preserve-3d; }
        .dasha-flip-inner.flipped { transform: rotateY(180deg); }
        .dasha-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .dasha-back { transform: rotateY(180deg); }
        @keyframes dashaPulse {
          0%,100% { opacity:0.5 } 50% { opacity:1 }
        }
      `}</style>

      {/* Flip wrapper — preserves exact GlassCard dimensions */}
      <div
        style={{ perspective: 900, width: "100%", height: "100%", cursor: activeMaha ? "pointer" : "default" }}
        onClick={activeMaha ? handleFlip : undefined}
        title={activeMaha ? (flipped ? "See period stats" : "See AI insight") : undefined}
      >
        <div className={`dasha-flip-inner${flipped ? " flipped" : ""}`} style={{ position: "relative", width: "100%", height: "100%" }}>

          {/* ── FRONT ────────────────────────────────────────────────── */}
          <div className="dasha-face" style={{ position: "absolute", inset: 0 }}>
            {/* Planet glyph bg */}
            {activeMaha && (
              <div style={{ position: "absolute", top: 12, right: 16, opacity: 0.08, pointerEvents: "none", fontSize: 88, lineHeight: 1, fontFamily: "serif", color: planetColor, userSelect: "none" }}>
                {planetGlyph}
              </div>
            )}
            <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
              {frontContent}
              {activeMaha && (
                <div style={{ position: "absolute", bottom: 0, right: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--amber)", opacity: 0.45, textTransform: "uppercase" }}>
                    tap for insight
                  </span>
                  <span style={{ fontSize: 9, color: "var(--amber)", opacity: 0.45 }}>↺</span>
                </div>
              )}
            </div>
          </div>

          {/* ── BACK ─────────────────────────────────────────────────── */}
          <div className="dasha-face dasha-back" style={{ position: "absolute", inset: 0 }}>
            {/* Subtle glyph on back too */}
            <div style={{ position: "absolute", top: 12, right: 16, opacity: 0.06, pointerEvents: "none", fontSize: 88, lineHeight: 1, fontFamily: "serif", color: planetColor, userSelect: "none" }}>
              {planetGlyph}
            </div>
            <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.7 }}>
                  {mahaName} · Insight
                </p>
                {mahaProgress != null && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--mist)", letterSpacing: "0.06em" }}>
                    {mahaProgress}% complete
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {mahaProgress != null && (
                <div style={{ height: 2, background: "rgba(212,175,95,0.1)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${mahaProgress}%`, background: "linear-gradient(90deg, rgba(212,175,95,0.5), rgba(212,175,95,0.85))", borderRadius: 2 }} />
                </div>
              )}

              {/* Insight text */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {loading ? (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", color: "var(--cream)", opacity: 0.45, lineHeight: 1.8, animation: "dashaPulse 1.8s ease-in-out infinite" }}>
                    Reading the stars…
                  </p>
                ) : insight ? (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", fontWeight: 300, color: "var(--cream)", lineHeight: 1.8 }}>
                    {insight}
                  </p>
                ) : apiError ? (
                  <div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--amber)", opacity: 0.7, lineHeight: 1.65, marginBottom: 10 }}>
                      Could not load insight. Please try again.
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFetched(false); fetchInsight(); }}
                      style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", background: "none", border: "1px solid rgba(212,175,95,0.3)", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 12, color: "var(--mist)", lineHeight: 1.65 }}>
                    No Dasha data yet. Complete your birth profile to receive your planetary insight.
                  </p>
                )}
              </div>

              {/* Days remaining */}
              {mahaRemainingDays != null && (
                <div style={{ marginTop: 14, borderTop: "1px solid rgba(212,175,95,0.1)", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--mist)", letterSpacing: "0.06em" }}>
                    {mahaRemainingDays.toLocaleString()} days remaining
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--amber)", opacity: 0.4, textTransform: "uppercase" }}>
                    tap to flip ↺
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

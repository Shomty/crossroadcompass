"use client";
/**
 * components/dashboard/DashaCard.tsx
 * Flip card — front: Dasha stats, back: AI-generated insight for this period.
 * Click anywhere to flip. Insight is fetched lazily on first flip.
 */

import { useEffect, useState } from "react";

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

const PLANET_COLOR_2: Record<string, string> = {
  sun:     "#FF8C00",
  moon:    "#E8E0FF",
  mars:    "#300000",
  mercury: "#B0E0FF",
  jupiter: "#4B7BCC",
  venus:   "#60C080",
  saturn:  "#303030",
  rahu:    "#220044",
  ketu:    "#663300",
};

export function DashaCard({
  activeMaha,
  activeAntar,
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

  // Animated visual progress (0 → mahaProgress)
  const [animatedProgress, setAnimatedProgress] = useState<number | null>(null);

  // Antardasha orbit dot color
  const antarDotColor =
    PLANET_COLOR_2[activeAntar?.planetName?.toLowerCase().split("/")[0] ?? ""] ??
    "rgba(255,255,255,0.25)";

  useEffect(() => {
    if (mahaProgress == null) {
      setAnimatedProgress(null);
      return;
    }
    // Start from 0 so CSS transitions are visible
    setAnimatedProgress(0);
    const id = window.requestAnimationFrame(() => {
      setAnimatedProgress(mahaProgress);
    });
    return () => window.cancelAnimationFrame(id);
  }, [mahaProgress]);

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
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dashaGlyphPulse {
          0%,100% { opacity: 0.72; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.1); }
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
            <div style={{ position: "relative", zIndex: 1, height: "100%" }}>

              {/* ── Orbit Engine ──────────────────────────────────────── */}
              {activeMaha && (
                <div style={{ position: "relative", height: 150, marginBottom: 8 }}>

                  {/* Center glyph — pulsing (wrapper for translate, inner for scale) */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
                    <div style={{
                      fontSize: 40, lineHeight: 1,
                      fontFamily: "Cinzel, serif",
                      color: planetColor,
                      userSelect: "none",
                      display: "inline-block",
                      animation: "dashaGlyphPulse 3s ease-in-out infinite",
                      filter: `drop-shadow(0 0 12px ${planetColor}99)`,
                    }}>
                      {planetGlyph}
                    </div>
                  </div>

                  {/* Inner orbit — Antardasha — 80px diameter */}
                  <div style={{
                    position: "absolute",
                    width: 80, height: 80,
                    top: "50%", left: "50%",
                    marginTop: -40, marginLeft: -40,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.07)",
                    animation: "orbitSpin 8s linear infinite",
                  }}>
                    <div style={{
                      position: "absolute", bottom: -5, left: "50%",
                      transform: "translateX(-50%)",
                      width: 10, height: 10, borderRadius: "50%",
                      background: antarDotColor,
                      boxShadow: `0 0 8px 3px ${antarDotColor}99`,
                    }} />
                  </div>

                  {/* Outer orbit — Mahadasha — 130px diameter */}
                  <div style={{
                    position: "absolute",
                    width: 130, height: 130,
                    top: "50%", left: "50%",
                    marginTop: -65, marginLeft: -65,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.07)",
                    animation: "orbitSpin 18s linear infinite reverse",
                  }}>
                    <div style={{
                      position: "absolute", top: "50%", right: -6.5,
                      transform: "translateY(-50%)",
                      width: 13, height: 13, borderRadius: "50%",
                      background: planetColor,
                      boxShadow: `0 0 12px 4px ${planetColor}99`,
                    }} />
                  </div>

                </div>
              )}

              {frontContent}
              {activeMaha && mahaProgress != null && animatedProgress != null && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Mini SVG progress ring */}
                  {(() => {
                    const r = 14, circ = 2 * Math.PI * r;
                    const dash = (animatedProgress / 100) * circ;
                    return (
                      <svg width={36} height={36} viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                        <circle cx={18} cy={18} r={r} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth={2} />
                        <circle
                          cx={18}
                          cy={18}
                          r={r}
                          fill="none"
                          stroke="rgba(212,175,55,0.55)"
                          strokeWidth={2}
                          strokeDasharray={`${dash} ${circ}`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                          style={{ transition: "stroke-dasharray 0.6s ease" }}
                        />
                        <text
                          x={18}
                          y={22}
                          textAnchor="middle"
                          fontSize={7}
                          fill="rgba(212,175,55,0.7)"
                          fontFamily="'DM Mono',monospace"
                        >
                          {mahaProgress}%
                        </text>
                      </svg>
                    );
                  })()}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="tap-insight-pill" style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--amber)", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(200,135,58,0.25)", background: "rgba(200,135,58,0.04)" }}>
                      tap for insight
                    </span>
                    <span style={{ fontSize: 9, color: "var(--amber)", opacity: 0.6 }}>↺</span>
                  </div>
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
              {mahaProgress != null && animatedProgress != null && (
                <div style={{ height: 2, background: "rgba(212,175,95,0.1)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${animatedProgress}%`,
                      background: "linear-gradient(90deg, rgba(212,175,95,0.5), rgba(212,175,95,0.85))",
                      borderRadius: 2,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              )}

              {/* Insight text */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {loading ? (
                  <p style={{ fontFamily: "Cinzel, serif", fontSize: 16, fontStyle: "italic", color: "var(--cream)", opacity: 0.45, lineHeight: 1.8, animation: "dashaPulse 1.8s ease-in-out infinite" }}>
                    Reading the stars…
                  </p>
                ) : insight ? (
                  <p style={{ fontFamily: "Cinzel, serif", fontSize: 16, fontStyle: "italic", fontWeight: 300, color: "var(--cream)", lineHeight: 1.8 }}>
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
                  <p style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "var(--mist)", lineHeight: 1.65 }}>
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

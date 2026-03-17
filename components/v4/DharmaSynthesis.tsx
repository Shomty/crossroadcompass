"use client";
/**
 * components/v4/DharmaSynthesis.tsx
 * The Oracle Card — v4 Digital Grimoire design system.
 *
 * Visual elements:
 *  - Cosmic Violet radial glow background (.v4-violet-glow)
 *  - 60-dot constellation layer with staggered twinkle animation
 *  - LIVE animate-ping pulse dot
 *  - Circular SVG alignment gauge (gold arc, ported from v3 Gauge)
 *  - Daily insight text in Cinzel serif
 *  - Auto-generate on mount pattern (same as CosmicGuidanceCard)
 */

import { useState, useEffect, useRef } from "react";
import { V4GlassCard } from "./V4GlassCard";

interface InsightData {
  id: string;
  content: string;
  accuracyRating?: number | null;
}

interface DharmaSynthesisProps {
  initialInsight: InsightData | null;
  isPaid: boolean;
}

/* ── Alignment Gauge (gold arc, ported from v3) ── */
function AlignmentGauge({ value }: { value: number }) {
  const r = 44, cx = 55, cy = 55;
  const startDeg = -210, totalDeg = 240;
  const fillDeg = (Math.min(100, Math.max(0, value)) / 100) * totalDeg;
  const toRad = (d: number) => (d * Math.PI) / 180;

  function arc(s: number, e: number) {
    const sr = toRad(s), er = toRad(e);
    const n = (v: number) => Math.round(v * 1000) / 1000;
    const x1 = n(cx + r * Math.cos(sr)), y1 = n(cy + r * Math.sin(sr));
    const x2 = n(cx + r * Math.cos(er)), y2 = n(cy + r * Math.sin(er));
    const large = e - s > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const na = toRad(startDeg + fillDeg);
  const nx = Math.round((cx + 36 * Math.cos(na)) * 1000) / 1000;
  const ny = Math.round((cy + 36 * Math.sin(na)) * 1000) / 1000;

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
      <defs>
        <filter id="gauge-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Background ring tick marks */}
      {Array.from({ length: 11 }, (_, i) => {
        const a = toRad(startDeg + (i / 10) * totalDeg);
        const r1 = 48, r2 = i % 5 === 0 ? 42 : 45;
        const n = (v: number) => Math.round(v * 1000) / 1000;
        return (
          <line key={i}
            x1={n(cx + r1 * Math.cos(a))} y1={n(cy + r1 * Math.sin(a))}
            x2={n(cx + r2 * Math.cos(a))} y2={n(cy + r2 * Math.sin(a))}
            stroke={i % 5 === 0 ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.10)"}
            strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
          />
        );
      })}

      {/* Track */}
      <path d={arc(startDeg, startDeg + totalDeg)} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="5" strokeLinecap="round" />

      {/* Gold fill */}
      <path d={arc(startDeg, startDeg + fillDeg)} fill="none"
        stroke="url(#gauge-grad)" strokeWidth="5" strokeLinecap="round"
        filter="url(#gauge-glow)" />

      {/* Inner content circle */}
      <circle cx={cx} cy={cy} r={28} fill="rgba(5,5,5,0.85)"
        stroke="rgba(212,175,55,0.20)" strokeWidth="0.75" />

      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny}
        stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"
        filter="url(#gauge-glow)" />
      <circle cx={cx} cy={cy} r={2.5} fill="#D4AF37" />
      <circle cx={cx} cy={cy} r={1.2} fill="white" />

      {/* Value */}
      <text x={cx} y={cy - 3} textAnchor="middle"
        fill="#D4AF37" fontSize="14"
        fontFamily="'DM Mono',monospace" fontWeight="500">
        {value}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle"
        fill="rgba(255,255,255,0.28)" fontSize="6"
        fontFamily="'DM Mono',monospace" letterSpacing="1.5">
        ALIGN
      </text>
    </svg>
  );
}

/* ── Static star positions (stable across renders) ── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  left:  `${(i * 137.508) % 100}%`,
  top:   `${(i * 97.301) % 100}%`,
  size:  i % 8 === 0 ? 2 : 1,
  delay: `${(i * 0.23) % 4}s`,
  dur:   `${3 + (i % 4)}s`,
}));

export function DharmaSynthesis({ initialInsight, isPaid }: DharmaSynthesisProps) {
  const [insight, setInsight] = useState<InsightData | null>(initialInsight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generated = useRef(false);

  /* Auto-generate if paid and no insight exists */
  useEffect(() => {
    if (!insight && isPaid && !generated.current) {
      generated.current = true;
      generateInsight();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateInsight() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate insight.");
      } else if (data.insight) {
        setInsight({ id: data.insight.id, content: data.insight.content, accuracyRating: null });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* Alignment gauge value: based on accuracy rating or default 72 */
  const gaugeValue = insight?.accuracyRating != null
    ? Math.round((insight.accuracyRating / 5) * 100)
    : 72;

  return (
    <V4GlassCard violetGlow style={{ padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
      {/* ── Constellation background ── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
      }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.left, top: s.top,
              width: s.size, height: s.size,
              borderRadius: "50%",
              background: i % 12 === 0
                ? "rgba(212,175,55,0.8)"
                : i % 7 === 0
                  ? "rgba(124,58,237,0.7)"
                  : "rgba(255,255,255,0.4)",
              animation: `v4-constellation ${s.dur} ease-in-out ${s.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Content layer ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div className="v4-live-dot" />
              <span style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "var(--type-label)", letterSpacing: "0.22em", textTransform: "uppercase",
                color: "#4ADE80", opacity: 0.85,
              }}>
                Live Oracle
              </span>
            </div>
            <h2 style={{
              fontFamily: "Cinzel, serif",
              fontSize: 22, fontWeight: 500,
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.15,
            }}>
              Dharma Synthesis
            </h2>
            <p style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "var(--type-label)", letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(124,58,237,0.8)", marginTop: 4,
            }}>
              Vedic × Human Design
            </p>
          </div>

          {/* Alignment gauge */}
          <AlignmentGauge value={gaugeValue} />
        </div>

        {/* Insight content */}
        <div style={{ minHeight: 80 }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="oracle-body" style={{
                color: "var(--lavender, #EDE9FF)", opacity: 0.5,
                animation: "pulse 2s ease-in-out infinite",
              }}>
                Reading the celestial patterns…
              </p>
              {[90, 100, 80].map((w, i) => (
                <div key={i} style={{
                  height: 12, borderRadius: 6,
                  width: `${w}%`, background: "rgba(255,255,255,0.06)",
                  animation: "pulse 1.8s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div>
              <p style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 12, color: "#F87171", marginBottom: 14,
              }}>
                {error}
              </p>
              <button onClick={generateInsight} style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10, letterSpacing: "0.12em",
                color: "var(--gold-solar, #D4AF37)",
                background: "none",
                border: "1px solid rgba(212,175,55,0.25)",
                borderRadius: 4, padding: "6px 16px", cursor: "pointer",
              }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && insight && (
            <div>
              <p className="oracle-body" style={{
                color: "rgba(255,255,255,0.88)",
                marginBottom: 18,
              }}>
                {insight.content}
              </p>

              {/* Footer row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="v4-badge">Jyotish</span>
                  <span className="v4-badge">Human Design</span>
                </div>
                {isPaid && (
                  <button onClick={generateInsight} style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "var(--type-label)", letterSpacing: "0.14em",
                    color: "rgba(212,175,55,0.65)",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                  }}>
                    ↺ Refresh
                  </button>
                )}
              </div>
            </div>
          )}

          {!loading && !error && !insight && !isPaid && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p className="oracle-body" style={{
                color: "rgba(255,255,255,0.45)", marginBottom: 14,
              }}>
                Upgrade to Core to unlock your daily dharma reading.
              </p>
              <a href="/subscribe" style={{
                display: "inline-block",
                fontFamily: "'DM Mono',monospace",
                fontSize: "var(--type-label)", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--gold-solar, #D4AF37)",
                border: "1px solid rgba(212,175,55,0.30)",
                borderRadius: 4, padding: "7px 18px",
                textDecoration: "none",
              }}>
                Unlock Oracle
              </a>
            </div>
          )}
        </div>
      </div>
    </V4GlassCard>
  );
}

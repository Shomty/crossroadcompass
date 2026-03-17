"use client";

/**
 * components/dashboard/JyotishCard.tsx
 * Full-width VIP card — Comprehensive Jyotish reading via Gemini Gem.
 * Placed above Life Forecast on the dashboard.
 */

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Crown } from "lucide-react";
import type { LifeReading } from "@/lib/ai/lifeReadingService";

// ─── Shared style tokens ──────────────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
const serif: React.CSSProperties = { fontFamily: "Cinzel, serif" };
const body: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: "var(--type-body)",
  color: "var(--mist)",
  lineHeight: 1.65,
};

const ACCENT = "var(--accent-gold-cool, #D4AF37)";
const ACCENT_HEX = "#D4AF37";

// ─── Animated mandala orb ─────────────────────────────────────────────────────

function MandalaOrb({ loading }: { loading: boolean }) {
  // Four Sanskrit / Vedic dot positions around a central Om
  const dotAngles = [0, 90, 180, 270];

  return (
    <div
      style={{
        position: "relative",
        width: 96,
        height: 96,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer ring — slow CW rotation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1px solid ${ACCENT_HEX}22`,
          animation: "v4-orbit-cw 60s linear infinite",
        }}
      >
        {dotAngles.map((deg) => (
          <span
            key={deg}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: `${ACCENT_HEX}60`,
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
              transform: `rotate(${deg}deg) translateX(47px) translateY(-2px)`,
            }}
          />
        ))}
      </div>

      {/* Middle ring — slow CCW rotation */}
      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: "50%",
          border: `1px solid rgba(129,140,248,0.18)`,
          animation: "v4-orbit-ccw 40s linear infinite",
        }}
      >
        {[45, 135, 225, 315].map((deg) => (
          <span
            key={deg}
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(129,140,248,0.45)",
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
              transform: `rotate(${deg}deg) translateX(33px) translateY(-1.5px)`,
            }}
          />
        ))}
      </div>

      {/* Inner glow disc */}
      <div
        style={{
          position: "absolute",
          inset: 28,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 38%, ${ACCENT_HEX}12 0%, rgba(0,0,0,0) 70%)`,
          border: `1px solid ${ACCENT_HEX}18`,
        }}
      />

      {/* Om glyph */}
      <span
        style={{
          ...serif,
          fontSize: 28,
          color: ACCENT,
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
          filter: `drop-shadow(0 0 8px ${ACCENT_HEX}55)`,
          animation: loading ? "glowPulse 1.2s ease-in-out infinite" : "glowPulse 4s ease-in-out infinite",
          userSelect: "none",
        }}
      >
        ☸
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flex: 1 }}>
      <MandalaOrb loading />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
        {[95, 80, 65, 80, 50].map((w, i) => (
          <div
            key={i}
            className="dash-skeleton"
            style={{ width: `${w}%`, height: i < 3 ? 10 : i === 3 ? 22 : 14, borderRadius: 3 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Reading content ──────────────────────────────────────────────────────────

function ReadingContent({ reading, loading, onRegenerate }: {
  reading: LifeReading;
  loading: boolean;
  onRegenerate: () => void;
}) {
  const genDate = new Date(reading.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flex: 1 }}>
      <MandalaOrb loading={loading} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Headline */}
        <p style={{
          fontFamily: "Lora, Georgia, serif",
          fontStyle: "italic",
          fontSize: 15,
          color: ACCENT,
          lineHeight: 1.55,
          marginBottom: 12,
        }}>
          {reading.headline}
        </p>

        {/* Overview */}
        <p style={{ ...body, marginBottom: 14 }}>
          {reading.overview}
        </p>

        {/* Key themes */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {reading.keyThemes.map((theme) => (
            <span key={theme} className="reading-theme-pill">{theme}</span>
          ))}
        </div>

        {/* Guidance */}
        <p style={{
          ...body,
          borderLeft: `2px solid ${ACCENT_HEX}40`,
          paddingLeft: 12,
          opacity: 0.85,
          marginBottom: 0,
        }}>
          {reading.guidance}
        </p>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 14, paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <span style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
            ♃ D1 · D9 · D10 · Dasha
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.06em", color: "rgba(255,255,255,0.18)" }}>
              {genDate}
            </span>
            <button
              onClick={onRegenerate}
              disabled={loading}
              title="Regenerate"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer",
                padding: 0,
                ...mono,
                fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                color: loading ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              <RefreshCw size={10} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
              {loading ? "…" : "↺"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VIP gate ─────────────────────────────────────────────────────────────────

function VipGate() {
  return (
    <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flex: 1 }}>
      <MandalaOrb loading={false} />
      <div style={{ flex: 1, position: "relative" }}>
        {/* Blurred mock */}
        <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none", opacity: 0.3 }}>
          <p style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 15, color: ACCENT, marginBottom: 12 }}>
            Your chart speaks of a profound karmic turning point — the stars align for deep renewal.
          </p>
          <p style={{ ...body, marginBottom: 14 }}>
            With Vargottama Venus anchoring your D1 and D9, the fruits of past effort are beginning to crystallise.
            The Amatyakaraka in your D10 reveals a career path rooted in wisdom and transformation.
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {["Dharmic Expansion", "Soul Vocation", "Inner Alchemy"].map((t) => (
              <span key={t} className="reading-theme-pill">{t}</span>
            ))}
          </div>
        </div>
        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span style={{
            ...mono,
            fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--gold, #D4AF37)", opacity: 0.85,
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 3, padding: "3px 9px",
          }}>
            VIP Members Only
          </span>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 12, color: "rgba(255,255,255,0.4)",
            textAlign: "center", lineHeight: 1.5,
            maxWidth: 200, margin: 0,
          }}>
            Unlock your full Vedic synthesis reading
          </p>
          <a href="/subscribe" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "8px 16px",
            background: "transparent",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: 8,
            ...mono,
            fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--gold, #D4AF37)",
            textDecoration: "none",
          }}>
            Upgrade to VIP →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  isVip: boolean;
  initialReading: LifeReading | null;
}

export function JyotishCard({ isVip, initialReading }: Props) {
  const [reading, setReading]   = useState<LifeReading | null>(initialReading);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const generate = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights/life-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "jyotish", force }),
      });
      const data = await res.json() as { reading?: LifeReading; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.reading) setReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-generate on mount if VIP and no cached reading
  useEffect(() => {
    if (isVip && !reading) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVip]);

  return (
    <div className="glass-card glass-card-hero animate-enter animate-enter-4" style={{ padding: "22px 26px", position: "relative", overflow: "hidden" }}>

      {/* Ambient background ring — purely decorative */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          right: -60,
          top: -80,
          borderRadius: "50%",
          border: `1px solid ${ACCENT_HEX}08`,
          animation: "v4-orbit-cw 90s linear infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          right: 0,
          top: -20,
          borderRadius: "50%",
          border: `1px solid rgba(129,140,248,0.07)`,
          animation: "v4-orbit-ccw 55s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="dash-card-header" style={{ marginBottom: 20 }}>
        <div>
          <span className="dash-eyebrow" style={{ marginBottom: 5, display: "block" }}>
            <span style={{ color: ACCENT, marginRight: 5 }}>☸</span>
            Vedic Synthesis
          </span>
          <h2 className="dash-section-title" style={{ fontSize: 20, marginBottom: 2 }}>
            Jyotish Reading
          </h2>
          <span className="dash-section-subtitle">◎ Full chart · D1 · D9 · D10 · Dasha</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span className="reading-vip-badge">
            <Crown size={9} />
            VIP
          </span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      {!isVip ? (
        <VipGate />
      ) : loading && !reading ? (
        <Skeleton />
      ) : error && !reading ? (
        <div style={{ display: "flex", gap: 28, alignItems: "center", flex: 1 }}>
          <MandalaOrb loading={false} />
          <div>
            <p style={{ ...body, color: "#F87171", marginBottom: 12 }}>{error}</p>
            <button
              onClick={() => void generate()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: 8,
                ...mono,
                fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                color: ACCENT, cursor: "pointer",
              }}
            >
              <RefreshCw size={11} />
              Try Again
            </button>
          </div>
        </div>
      ) : reading ? (
        <ReadingContent
          reading={reading}
          loading={loading}
          onRegenerate={() => void generate(true)}
        />
      ) : null}
    </div>
  );
}

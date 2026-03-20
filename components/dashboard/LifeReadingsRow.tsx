"use client";

/**
 * components/dashboard/LifeReadingsRow.tsx
 * Three VIP-only reading cards: Career · Love · Health
 * Prompts are editable in lib/ai/prompts/lifeReadingPrompts.ts
 */

// STATUS: done | Phase 4 Glimpse
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Crown } from "lucide-react";
import type { LifeReading } from "@/lib/ai/lifeReadingService";
import { GlimpseBlur } from "@/components/glimpse";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReadingType = "career" | "love" | "health";

interface Props {
  isVip: boolean;
  initialCareer: LifeReading | null;
  initialLove:   LifeReading | null;
  initialHealth: LifeReading | null;
}

interface CardConfig {
  type:     ReadingType;
  glyph:    string;
  label:    string;
  title:    string;
  subtitle: string;
  accent:   string;           // CSS color
  mockLine: string;           // blurred placeholder text for non-VIP
}

// ─── Card definitions ─────────────────────────────────────────────────────────

const CARDS: CardConfig[] = [
  {
    type:     "career",
    glyph:    "♄",
    label:    "Vocation",
    title:    "Career",
    subtitle: "D1 · D10 · Human Design",
    accent:   "var(--amber, #C8873A)",
    mockLine: "A period of directed action and vocational clarity unfolds — your chart shows a natural alignment between purpose and output.",
  },
  {
    type:     "love",
    glyph:    "♀",
    label:    "Relationships",
    title:    "Love",
    subtitle: "D1 · D9 · Human Design",
    accent:   "#E8A0B4",
    mockLine: "Your relational aura is attuned to depth and soul-level recognition — the Navamsa reveals a dharmic pull toward authentic connection.",
  },
  {
    type:     "health",
    glyph:    "☿",
    label:    "Vitality",
    title:    "Health",
    subtitle: "Human Design",
    accent:   "#6EE7B7",
    mockLine: "Your energy architecture favours rhythmic cycles over sustained output — honouring your body's natural timing unlocks deeper vitality.",
  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
const bodyText: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: "var(--type-body)",
  color: "var(--mist)",
  lineHeight: 1.65,
};

// ─── Single reading card ──────────────────────────────────────────────────────

function ReadingCard({
  config,
  reading,
  loading,
  error,
  onGenerate,
}: {
  config:     CardConfig;
  reading:    LifeReading | null;
  loading:    boolean;
  error:      string | null;
  onGenerate: (type: ReadingType) => void;
}) {
  const genDate = reading
    ? new Date(reading.generatedAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <div className="glass-card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="dash-card-header" style={{ marginBottom: 12 }}>
        <div>
          <span className="dash-eyebrow" style={{ marginBottom: 5, display: "block" }}>
            <span style={{ color: config.accent, marginRight: 5 }}>{config.glyph}</span>
            {config.label}
          </span>
          <h3 className="dash-section-title" style={{ fontSize: 18, marginBottom: 2 }}>
            {config.title}
          </h3>
          <span className="dash-section-subtitle">{config.subtitle}</span>
        </div>

        {/* VIP badge + regenerate */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span className="reading-vip-badge">
            <Crown size={9} />
            VIP
          </span>
          {reading && (
            <button
              onClick={() => onGenerate(config.type)}
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
              onMouseEnter={(e) => !loading && (e.currentTarget.style.color = config.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              <RefreshCw size={10} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
              {loading ? "…" : "↺"}
            </button>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {loading && !reading ? (
        // Skeleton
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {[100, 85, 70].map((w) => (
            <div key={w} className="dash-skeleton" style={{ width: `${w}%`, height: 10, borderRadius: 4 }} />
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[60, 55, 65].map((w) => (
              <div key={w} className="dash-skeleton" style={{ width: w, height: 22, borderRadius: 3 }} />
            ))}
          </div>
        </div>
      ) : error && !reading ? (
        // Error state
        <div style={{ marginTop: 4 }}>
          <p style={{ ...bodyText, color: "#F87171", marginBottom: 12 }}>{error}</p>
          <button
            onClick={() => onGenerate(config.type)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(200,135,58,0.3)",
              borderRadius: 8,
              ...mono,
              fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--amber, #C8873A)", cursor: "pointer",
            }}
          >
            <RefreshCw size={11} />
            Try Again
          </button>
        </div>
      ) : reading ? (
        // Reading content
        <>
          {/* Headline */}
          <p style={{
            fontFamily: "Lora, Georgia, serif",
            fontStyle: "italic",
            fontSize: 14,
            color: config.accent,
            lineHeight: 1.55,
            marginBottom: 12,
          }}>
            {reading.headline}
          </p>

          {/* Overview */}
          <p style={{ ...bodyText, marginBottom: 14 }}>
            {reading.overview}
          </p>

          {/* Key themes */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {reading.keyThemes.map((theme) => (
              <span key={theme} className="reading-theme-pill">
                {theme}
              </span>
            ))}
          </div>

          {/* Guidance */}
          <p style={{
            ...bodyText,
            borderLeft: `2px solid ${config.accent}40`,
            paddingLeft: 10,
            marginBottom: 0,
            opacity: 0.85,
          }}>
            {reading.guidance}
          </p>

          {/* Footer */}
          {genDate && (
            <div style={{
              display: "flex", justifyContent: "flex-end",
              marginTop: 14, paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ ...mono, fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.2)" }}>
                {genDate}
              </span>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// ─── VIP gate overlay ─────────────────────────────────────────────────────────

function VipGateCard({ config }: { config: CardConfig }) {
  return (
    <div className="glass-card" style={{ padding: "20px 22px" }}>
      {/* Header (visible) */}
      <div className="dash-card-header" style={{ marginBottom: 12 }}>
        <div>
          <span className="dash-eyebrow" style={{ marginBottom: 5, display: "block" }}>
            <span style={{ color: config.accent, marginRight: 5 }}>{config.glyph}</span>
            {config.label}
          </span>
          <h3 className="dash-section-title" style={{ fontSize: 18, marginBottom: 2 }}>
            {config.title}
          </h3>
          <span className="dash-section-subtitle">{config.subtitle}</span>
        </div>
      </div>

      {/* Glimpse blur with analytics */}
      <GlimpseBlur
        preview={config.mockLine}
        featureName={`life_reading_${config.type}`}
        ctaText={`Unlock your ${config.title.toLowerCase()} reading`}
        ctaHref="/pricing"
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["Focus", "Growth", "Alignment"].map((t) => (
            <span key={t} className="reading-theme-pill">{t}</span>
          ))}
        </div>
      </GlimpseBlur>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LifeReadingsRow({
  isVip,
  initialCareer,
  initialLove,
  initialHealth,
}: Props) {
  const [readings, setReadings] = useState<Record<ReadingType, LifeReading | null>>({
    career: initialCareer,
    love:   initialLove,
    health: initialHealth,
  });
  const [loading, setLoading] = useState<Record<ReadingType, boolean>>({
    career: false, love: false, health: false,
  });
  const [errors, setErrors] = useState<Record<ReadingType, string | null>>({
    career: null, love: null, health: null,
  });

  const generate = useCallback(async (type: ReadingType, force = false) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    setErrors((prev)  => ({ ...prev, [type]: null  }));
    try {
      const res = await fetch("/api/insights/life-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, force }),
      });
      const data = await res.json() as { reading?: LifeReading; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.reading) setReadings((prev) => ({ ...prev, [type]: data.reading! }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrors((prev) => ({ ...prev, [type]: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  // Auto-generate missing readings on mount (VIP only)
  useEffect(() => {
    if (!isVip) return;
    if (!readings.career) void generate("career");
    if (!readings.love)   void generate("love");
    if (!readings.health) void generate("health");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVip]);

  return (
    <div className="life-readings-grid">
      {CARDS.map((config) =>
        isVip ? (
          <ReadingCard
            key={config.type}
            config={config}
            reading={readings[config.type]}
            loading={loading[config.type]}
            error={errors[config.type]}
            onGenerate={(t) => void generate(t, true)}
          />
        ) : (
          <VipGateCard key={config.type} config={config} />
        )
      )}
    </div>
  );
}

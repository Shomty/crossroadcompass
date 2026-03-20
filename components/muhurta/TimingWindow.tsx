"use client";
// STATUS: done | Premium Features - Muhurta Finder
/**
 * components/muhurta/TimingWindow.tsx
 * Individual timing window card with quality indicator.
 */

interface TimingWindowProps {
  date: string;
  dayOfWeek: string;
  timeRange: string;
  quality: "excellent" | "good" | "moderate";
  planetaryHour: string;
  nakshatra: string;
  narrative?: string;
  index: number;
}

const QUALITY_STYLES = {
  excellent: {
    border: "rgba(200,135,58,0.4)",
    bg: "rgba(200,135,58,0.12)",
    badge: "#e8b96a",
    icon: "★",
  },
  good: {
    border: "rgba(200,135,58,0.25)",
    bg: "rgba(200,135,58,0.08)",
    badge: "#c8873a",
    icon: "◈",
  },
  moderate: {
    border: "rgba(200,135,58,0.12)",
    bg: "rgba(200,135,58,0.04)",
    badge: "rgba(200,135,58,0.7)",
    icon: "○",
  },
};

export function TimingWindow({
  date,
  dayOfWeek,
  timeRange,
  quality,
  planetaryHour,
  nakshatra,
  narrative,
  index,
}: TimingWindowProps) {
  const style = QUALITY_STYLES[quality];
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="animate-enter"
      style={{
        animationDelay: `${0.1 + index * 0.08}s`,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 14,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 16,
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {dayOfWeek}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {formattedDate}
            </span>
          </div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 18,
              fontWeight: 500,
              color: style.badge,
            }}
          >
            {timeRange}
          </span>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 20,
            background: "rgba(0,0,0,0.2)",
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: style.badge,
            textTransform: "capitalize",
          }}
        >
          <span>{style.icon}</span>
          {quality}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: "rgba(200,135,58,0.6)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Planetary Hour
          </span>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              margin: "3px 0 0",
            }}
          >
            {planetaryHour}
          </p>
        </div>
        <div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: "rgba(200,135,58,0.6)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Nakshatra
          </span>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
              margin: "3px 0 0",
            }}
          >
            {nakshatra}
          </p>
        </div>
      </div>

      {/* Narrative (premium only) */}
      {narrative && (
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            margin: 0,
            paddingTop: 8,
            borderTop: "1px solid rgba(200,135,58,0.1)",
          }}
        >
          {narrative}
        </p>
      )}
    </div>
  );
}

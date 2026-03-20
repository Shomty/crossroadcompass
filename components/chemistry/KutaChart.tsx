"use client";
// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * components/chemistry/KutaChart.tsx
 * Visual breakdown of 8-fold Kuta dimensions.
 */

import type { KutaScore } from "@/lib/astro/kutaService";

interface KutaChartProps {
  kutas: KutaScore[];
  showAll?: boolean;
}

const QUALITY_COLORS = {
  excellent: "#4ade80",
  good: "#e8b96a",
  moderate: "#f59e0b",
  challenging: "#f87171",
};

export function KutaChart({ kutas, showAll = true }: KutaChartProps) {
  const displayKutas = showAll ? kutas : kutas.slice(0, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {displayKutas.map((kuta, i) => {
        const percentage = (kuta.earnedPoints / kuta.maxPoints) * 100;
        const color = QUALITY_COLORS[kuta.quality];

        return (
          <div
            key={kuta.dimension}
            className="animate-enter"
            style={{
              animationDelay: `${0.05 + i * 0.05}s`,
              background: "rgba(13,18,32,0.4)",
              border: "1px solid rgba(200,135,58,0.1)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {kuta.dimension}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  color,
                }}
              >
                {kuta.earnedPoints}/{kuta.maxPoints}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percentage}%`,
                  background: color,
                  borderRadius: 3,
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {kuta.interpretation}
            </p>
          </div>
        );
      })}

      {!showAll && kutas.length > 1 && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            color: "rgba(200,135,58,0.6)",
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 12,
          }}
        >
          + {kutas.length - 1} more dimensions
        </div>
      )}
    </div>
  );
}

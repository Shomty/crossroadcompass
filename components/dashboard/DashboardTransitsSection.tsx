"use client";

import { parseSerializedVedicChart } from "@/lib/astro/serializeVedicChart";
import type { VedicChartCalculations } from "openastrology-library";
import { MoonTracker } from "@/components/transit/MoonTracker";

interface Props {
  transitJson: unknown | null;
}

const PLANET_SYMBOL: Record<string, string> = {
  sun: "☉", moon: "☽", mars: "♂", mercury: "☿",
  jupiter: "♃", venus: "♀", saturn: "♄", rahu: "☊", ketu: "☋",
};

const PLANET_KEYS = ["sun", "mars", "mercury", "jupiter", "venus", "saturn"] as const;

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function InlinePlanetRow({ chart }: { chart: VedicChartCalculations }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 10px",
        paddingTop: 10,
        borderTop: "1px solid var(--border)",
      }}
    >
      {PLANET_KEYS.map((k) => {
        const p = chart.planets[k];
        return (
          <span
            key={k}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "rgba(200,190,170,0.7)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: 0.85, marginRight: 2 }}>{PLANET_SYMBOL[k]}</span>
            {cap(p.sign).slice(0, 3)}
            {p.isRetrograde && (
              <span style={{ color: "var(--amber)", marginLeft: 1, fontSize: 8 }}>ᴿ</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function DashboardTransitsSection({ transitJson }: Props) {
  if (!transitJson) return null;
  const chart = parseSerializedVedicChart(transitJson) as VedicChartCalculations;

  return (
    <div className="glass-card" style={{ height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 16,
        }}
      >
        <div className="dash-live-dot" />
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "var(--type-label)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold)",
            opacity: 0.75,
          }}
        >
          Live Sky
        </span>
      </div>

      {/* Moon widget */}
      <MoonTracker transitChart={chart} />

      {/* Compact planet row */}
      <InlinePlanetRow chart={chart} />
    </div>
  );
}

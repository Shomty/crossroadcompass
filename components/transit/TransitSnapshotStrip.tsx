"use client";

import type { VedicChartCalculations } from "openastrology-library";

const SYMBOL: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mars: "♂",
  mercury: "☿",
  jupiter: "♃",
  venus: "♀",
  saturn: "♄",
  rahu: "☊",
  ketu: "☋",
};

const KEYS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"] as const;

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

interface Props {
  transitChart: VedicChartCalculations;
}

export function TransitSnapshotStrip({ transitChart }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {KEYS.map((k) => {
        const p = transitChart.planets[k];
        const isLuminary = k === "sun" || k === "moon";
        const isRetro = p.isRetrograde;
        const isCombust = p.isCombust;

        return (
          <div
            key={k}
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid ${isLuminary ? "var(--border-lit)" : "var(--border)"}`,
              background: isLuminary
                ? "rgba(232,185,106,0.06)"
                : "rgba(13,18,37,0.5)",
              backdropFilter: "blur(8px)",
              minWidth: 80,
            }}
          >
            {/* Symbol + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  fontFamily: "serif",
                  fontSize: 14,
                  color: isLuminary ? "var(--gold)" : "var(--mist)",
                  lineHeight: 1,
                }}
              >
                {SYMBOL[k]}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "var(--type-label)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isLuminary ? "var(--gold)" : "var(--mist)",
                }}
              >
                {cap(k)}
              </span>
            </div>

            {/* Sign */}
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                color: "var(--cream)",
                lineHeight: 1.2,
              }}
            >
              {cap(p.sign)}
            </span>

            {/* Moon nakshatra */}
            {k === "moon" && (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  lineHeight: 1.2,
                }}
              >
                {cap(p.nakshatra)}
              </span>
            )}

            {/* Badges row */}
            {(isRetro || isCombust) && (
              <div style={{ display: "flex", gap: 4, marginTop: 1 }}>
                {isRetro && (
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      color: "var(--amber)",
                      border: "1px solid rgba(200,135,58,0.3)",
                      borderRadius: 3,
                      padding: "1px 4px",
                    }}
                  >
                    (R)
                  </span>
                )}
                {isCombust && (
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      color: "rgba(220,80,80,0.85)",
                      border: "1px solid rgba(200,60,60,0.25)",
                      borderRadius: 3,
                      padding: "1px 4px",
                    }}
                  >
                    comb
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

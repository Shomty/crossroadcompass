"use client";
/**
 * components/v4/DashaVisualizer.tsx
 * The Time Visualizer — v4 Digital Grimoire design system.
 *
 * Visual elements:
 *  - Inner ring (80px): 8s clockwise orbit (v4-orbit-cw) — antardasha glyph
 *  - Outer ring (150px): 18s counter-clockwise orbit (v4-orbit-ccw) — mahadasha glyph
 *  - Gold-to-violet gradient progress bar
 *  - Planet name in Cinzel serif (large, gold)
 *  - Dasha theme + date range in DM Mono
 *  - Guidance list below
 *
 * Uses same props shape as existing DashaCard.
 */

import { V4GlassCard } from "./V4GlassCard";
import { PLANET_COLOR, PLANET_GLYPH } from "@/lib/astro/planetMetadata";

interface DashaEntry {
  planetName: string;
  startDate: Date;
  endDate: Date;
}

interface DashaVisualizerProps {
  activeMaha: DashaEntry | null;
  activeAntar: DashaEntry | null;
  mahaRemainingDays: number | null;
  mahaProgress: number | null;
  planetGlyph: string;
  planetColor: string;
}

const DASHA_THEME: Record<string, string> = {
  Saturn:  "Karma · Discipline · Endurance",
  Jupiter: "Wisdom · Expansion · Grace",
  Mars:    "Action · Courage · Drive",
  Sun:     "Identity · Authority · Purpose",
  Moon:    "Emotion · Intuition · Nurture",
  Mercury: "Intellect · Communication · Adaptability",
  Venus:   "Beauty · Pleasure · Abundance",
  Rahu:    "Desire · Illusion · Transformation",
  Ketu:    "Liberation · Detachment · Spirituality",
};

const DASHA_GUIDANCE: Record<string, string[]> = {
  Saturn:  ["Consolidate career gains and secure your position.", "Review long-term investments and savings.", "Practise patience in relationships."],
  Jupiter: ["Expand through wisdom and teaching others.", "Seek opportunities for growth and abundance.", "Honour your philosophical commitments."],
  Mars:    ["Channel energy into disciplined action.", "Initiate projects you have been holding back.", "Guard against impulsive decisions."],
  Sun:     ["Step into leadership and visibility.", "Focus on self-expression and purpose.", "Honour your father-figures and authority."],
  Moon:    ["Tend to emotional wellbeing and home.", "Trust your intuition over logic.", "Nurture important relationships."],
  Mercury: ["Communicate clearly and learn actively.", "Handle contracts and agreements carefully.", "Short journeys bring unexpected insight."],
  Venus:   ["Invest in beauty, comfort, and joy.", "Relationships and creativity are highlighted.", "Financial decisions bear fruit now."],
  Rahu:    ["Embrace innovation and unconventional paths.", "Past-life themes resurface for resolution.", "Avoid obsessive attachment to outcomes."],
  Ketu:    ["Release what no longer serves your soul.", "Spiritual practices deepen now.", "Detachment brings unexpected clarity."],
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function DashaVisualizer({
  activeMaha,
  activeAntar,
  mahaRemainingDays,
  mahaProgress,
  planetGlyph,
  planetColor,
}: DashaVisualizerProps) {
  if (!activeMaha) {
    return (
      <V4GlassCard style={{ padding: "28px 24px", textAlign: "center" }}>
        <div style={{ padding: "32px 0" }}>
          <span style={{ fontSize: 32, opacity: 0.3 }}>☽</span>
          <p style={{
            fontFamily: "Lora, Georgia, serif",
            fontStyle: "italic", fontSize: 14,
            color: "rgba(255,255,255,0.4)", marginTop: 12, lineHeight: 1.6,
          }}>
            Complete your birth profile to see your active dasha period.
          </p>
        </div>
      </V4GlassCard>
    );
  }

  const mahaName = cap(activeMaha.planetName);
  const antarName = activeAntar ? cap(activeAntar.planetName.split("/")[1] ?? activeAntar.planetName) : null;
  const antarKey = activeAntar?.planetName.split("/")[0]?.toLowerCase() ?? "";
  const antarGlyph = PLANET_GLYPH[antarKey] ?? "★";
  const antarColor = PLANET_COLOR[antarKey] ?? "rgba(255,255,255,0.6)";
  const theme = DASHA_THEME[mahaName] ?? "Reflection · Growth · Unfolding";
  const guidance = DASHA_GUIDANCE[mahaName] ?? [
    "Stay grounded and consistent in your efforts.",
    "Reflect on recurring patterns in your life.",
    "Trust the timing of your unfolding path.",
  ];

  return (
    <V4GlassCard style={{ padding: "28px 24px" }}>
      {/* ── Header ── */}
      <p className="v4-eyebrow" style={{ marginBottom: 6 }}>Current Period</p>
      <h2 style={{
        fontFamily: "Cinzel, serif",
        fontSize: 18, fontWeight: 500,
        color: "rgba(255,255,255,0.9)", marginBottom: 18,
      }}>
        Vimshottari Dasha
      </h2>

      {/* ── Orbit engine ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24, marginBottom: 20,
      }}>
        {/* Orbit rings container */}
        <div className="v4-orbit-wrapper" style={{ width: 160, height: 160, flexShrink: 0 }}>
          {/* Outer ring — 18s CCW — mahadasha */}
          <div
            className="v4-orbit-ring"
            style={{
              width: 150, height: 150,
              border: `1px solid ${planetColor}30`,
              animation: "v4-orbit-ccw 18s linear infinite",
            }}
          >
            {/* Glyph dot on outer ring — positioned at top */}
            <div style={{
              position: "absolute",
              top: -10, left: "50%",
              transform: "translateX(-50%)",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 35%, ${planetColor}40, rgba(5,5,5,0.9))`,
                border: `1px solid ${planetColor}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "v4-glyph-pulse 3s ease-in-out infinite",
                fontSize: "var(--type-mono)", color: planetColor,
              }}>
                {planetGlyph}
              </div>
            </div>
          </div>

          {/* Inner ring — 8s CW — antardasha */}
          <div
            className="v4-orbit-ring"
            style={{
              width: 80, height: 80,
              border: `1px solid ${antarColor}35`,
              animation: "v4-orbit-cw 8s linear infinite",
            }}
          >
            <div style={{
              position: "absolute",
              top: -9, left: "50%",
              transform: "translateX(-50%)",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 35%, ${antarColor}40, rgba(5,5,5,0.9))`,
                border: `1px solid ${antarColor}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "v4-glyph-pulse 3s ease-in-out infinite",
                animationDelay: "1.5s",
                fontSize: "var(--type-label)", color: antarColor,
              }}>
                {antarGlyph}
              </div>
            </div>
          </div>

          {/* Centre dot */}
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: planetColor,
            boxShadow: `0 0 10px ${planetColor}60`,
            position: "absolute",
          }} />
        </div>

        {/* ── Text data ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Planet name */}
          <p style={{
            fontFamily: "Cinzel, serif",
            fontSize: 36, fontWeight: 400, lineHeight: 0.9,
            color: planetColor,
            marginBottom: 4,
            filter: `drop-shadow(0 0 8px ${planetColor}40)`,
          }}>
            {mahaName}
          </p>
          <p style={{
            fontFamily: "Cinzel, serif",
            fontSize: 13, fontWeight: 400,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 6,
          }}>
            Mahadasha
          </p>

          {/* Theme */}
          <p style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "var(--type-label)", letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--gold-solar, #D4AF37)", opacity: 0.75,
            marginBottom: 10,
          }}>
            {theme}
          </p>

          {/* Date range + days left */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "var(--type-label)", letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.35)",
            }}>
              {fmtDate(activeMaha.startDate)} → {fmtDate(activeMaha.endDate)}
            </span>
            {mahaRemainingDays != null && (
              <span style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "var(--type-label)", letterSpacing: "0.08em",
                color: "var(--gold-solar, #D4AF37)",
                whiteSpace: "nowrap",
              }}>
                {mahaRemainingDays.toLocaleString()}d left
              </span>
            )}
          </div>

          {/* Progress bar */}
          {mahaProgress != null && (
            <div className="v4-progress-track">
              <div className="v4-progress-fill" style={{ width: `${mahaProgress}%` }} />
            </div>
          )}

          {/* Antardasha label */}
          {antarName && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginTop: 10,
            }}>
              <span style={{ fontSize: 12, color: antarColor }}>
                {antarGlyph}
              </span>
              <span style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "var(--type-label)", letterSpacing: "0.1em",
                color: "var(--gold-solar, #D4AF37)", opacity: 0.7,
              }}>
                {antarName} Antardasha
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Guidance list ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 14,
        display: "flex", flexDirection: "column", gap: 9,
      }}>
        {guidance.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{
              width: 3, height: 3, borderRadius: "50%",
              background: "rgba(124,58,237,0.5)", flexShrink: 0, marginTop: 8,
            }} />
            <p style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 12, lineHeight: 1.6,
              color: "rgba(255,255,255,0.55)",
            }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </V4GlassCard>
  );
}

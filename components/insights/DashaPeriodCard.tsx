"use client";
// STATUS: done | Phase 5 Feature Pages
/**
 * components/insights/DashaPeriodCard.tsx
 * A single Mahadasha period card for the Karma Timeline.
 *
 * past    → collapsed, muted, title + dates only
 * current → expanded, highlighted, AI insight shown (CORE+) or theme + guidance (FREE)
 * future  → title + dates + static guidance for CORE+; title + dates only for FREE
 */

import type { SubscriptionTier } from "@/types";

const PLANET_GLYPH: Record<string, string> = {
  sun: "☉", moon: "☽", mars: "♂", mercury: "☿",
  jupiter: "♃", venus: "♀", saturn: "♄", rahu: "☊", ketu: "☋",
};

const PLANET_COLOR: Record<string, string> = {
  sun: "#FFD96A", moon: "#C8D8E8", mars: "#E8705A", mercury: "#80D4A0",
  jupiter: "#D4AF5F", venus: "#E8C0D0", saturn: "#B0A080", rahu: "#8888CC", ketu: "#AA8866",
};

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

interface DashaPeriodCardProps {
  planet: string;
  startDate: Date;
  endDate: Date;
  /** "past" | "current" | "future" */
  status: "past" | "current" | "future";
  /** AI-generated insight for this period (current period only for FREE; all for CORE+) */
  insight?: string | null;
  userTier: SubscriptionTier;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DashaPeriodCard({
  planet,
  startDate,
  endDate,
  status,
  insight,
  userTier,
}: DashaPeriodCardProps) {
  const isPaid = userTier === "CORE" || userTier === "VIP";
  const key = planet.toLowerCase();
  const glyph = PLANET_GLYPH[key] ?? "★";
  const color = PLANET_COLOR[key] ?? "#e8b96a";
  const planetName = cap(planet);
  const theme = DASHA_THEME[planetName] ?? "Reflection · Growth · Unfolding";
  const guidance = DASHA_GUIDANCE[planetName] ?? ["Stay grounded and consistent.", "Reflect on recurring patterns.", "Trust the timing of your path."];

  const isCurrent = status === "current";
  const isPast = status === "past";
  const expanded = isCurrent || (isPaid && status === "future");

  return (
    <div
      style={{
        padding: expanded ? "20px 24px" : "14px 20px",
        borderRadius: 14,
        background: isCurrent
          ? `linear-gradient(135deg, ${color}08 0%, rgba(13,18,32,0.7) 100%)`
          : "rgba(13,18,32,0.45)",
        border: `1px solid ${isCurrent ? `${color}35` : "rgba(255,255,255,0.05)"}`,
        opacity: isPast ? 0.5 : 1,
        transition: "opacity 0.2s",
        position: "relative" as const,
      }}
    >
      {/* Active badge */}
      {isCurrent && (
        <div style={{
          position: "absolute", top: 14, right: 16,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const,
          color, background: `${color}18`,
          padding: "3px 9px", borderRadius: 20,
          border: `1px solid ${color}30`,
        }}>
          Active
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Planet orb */}
        <div style={{
          width: expanded ? 44 : 32, height: expanded ? 44 : 32,
          borderRadius: "50%", flexShrink: 0,
          background: `radial-gradient(circle at 38% 35%, ${color}22 0%, rgba(4,5,15,0.85) 70%)`,
          border: `1.5px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "width 0.2s, height 0.2s",
        }}>
          <span style={{
            fontSize: expanded ? 20 : 14, color, lineHeight: 1,
            fontFamily: "serif", userSelect: "none" as const,
            filter: `drop-shadow(0 0 5px ${color}80)`,
          }}>
            {glyph}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Planet name */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span style={{
              fontFamily: "Cinzel, serif",
              fontSize: expanded ? 18 : 14,
              fontWeight: 400,
              color: "var(--cream, rgba(255,255,255,0.9))",
              transition: "font-size 0.2s",
            }}>
              {planetName}
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "var(--mist, rgba(255,255,255,0.35))",
            }}>
              Mahadasha
            </span>
          </div>

          {/* Theme */}
          {expanded && (
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color, opacity: 0.75, marginBottom: 8,
            }}>
              {theme}
            </div>
          )}

          {/* Dates */}
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "var(--mist, rgba(255,255,255,0.4))", letterSpacing: "0.08em",
            marginBottom: expanded ? 12 : 0,
          }}>
            {fmtDate(startDate)} → {fmtDate(endDate)}
          </div>

          {/* AI Insight (current period for all, other periods for CORE+) */}
          {expanded && insight && (
            <p style={{
              fontFamily: "Cinzel, serif", fontSize: 14, fontStyle: "italic",
              fontWeight: 300, color: "var(--cream, rgba(255,255,255,0.85))",
              lineHeight: 1.8, marginBottom: 12,
            }}>
              {insight}
            </p>
          )}

          {/* Static guidance for paid users on future periods (no AI insight) */}
          {expanded && !insight && isPaid && status === "future" && (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
              {guidance.map((item, i) => (
                <li key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  fontSize: 12, color: "var(--mist, rgba(255,255,255,0.55))",
                  lineHeight: 1.55,
                  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                }}>
                  <span style={{
                    width: 3, height: 3, borderRadius: "50%",
                    background: `${color}70`, flexShrink: 0, marginTop: 7,
                  }} />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

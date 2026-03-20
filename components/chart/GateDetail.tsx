"use client";
// STATUS: done | Phase 5 Feature Pages
/**
 * components/chart/GateDetail.tsx
 * Inline popover/detail row for a single Human Design gate + its Jyotish planet ruler.
 *
 * FREE:  Row visible but planet correlation text locked (LockedInsightCard style).
 * CORE+: Full gate name, planet ruler, and keyword shown.
 * VIP:   Same as CORE (AI narrative per gate is a future enhancement).
 */

import { useState } from "react";
import type { GateInfo } from "@/lib/humandesign/gateMapping";
import type { SubscriptionTier } from "@/types";

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mars: "♂", Mercury: "☿",
  Jupiter: "♃", Venus: "♀", Saturn: "♄", Rahu: "☊", Ketu: "☋",
};

const PLANET_COLOR: Record<string, string> = {
  Sun: "#FFD96A", Moon: "#C8D8E8", Mars: "#E8705A", Mercury: "#80D4A0",
  Jupiter: "#E0C070", Venus: "#E8C0D0", Saturn: "#C8C090", Rahu: "#8888CC", Ketu: "#C8A07A",
};

interface GateDetailProps {
  gateInfo: GateInfo;
  userTier: SubscriptionTier;
  /** Whether this row is "active" (part of defined gates) */
  isActive?: boolean;
}

export function GateDetail({ gateInfo, userTier, isActive = true }: GateDetailProps) {
  const isPaid = userTier === "CORE" || userTier === "VIP";
  const [expanded, setExpanded] = useState(false);

  const planetColor = PLANET_COLOR[gateInfo.planet] ?? "#e8b96a";
  const planetGlyph = PLANET_GLYPH[gateInfo.planet] ?? "★";

  return (
    <div
      onClick={isPaid ? () => setExpanded((v) => !v) : undefined}
      style={{
        padding: "12px 16px",
        borderRadius: 10,
        background: expanded ? "rgba(200,135,58,0.06)" : "rgba(13,18,32,0.4)",
        border: `1px solid ${expanded ? "rgba(200,135,58,0.25)" : "rgba(255,255,255,0.05)"}`,
        cursor: isPaid ? "pointer" : "default",
        transition: "background 0.15s, border-color 0.15s",
        opacity: isActive ? 1 : 0.65,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Gate number badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: "rgba(200,135,58,0.1)",
          border: "1px solid rgba(200,135,58,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: "#c8873a", fontWeight: 600,
        }}>
          {gateInfo.gate}
        </div>

        {/* Gate name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13, fontWeight: 500,
            color: "var(--cream, rgba(255,255,255,0.88))",
            marginBottom: 2,
          }}>
            Gate {gateInfo.gate} — {gateInfo.name}
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            letterSpacing: "0.12em", textTransform: "uppercase" as const,
            color: "var(--mist, rgba(255,255,255,0.35))",
          }}>
            {gateInfo.keyword}
          </div>
        </div>

        {/* Planet ruler — locked for FREE */}
        {isPaid ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 16, color: planetColor, filter: `drop-shadow(0 0 4px ${planetColor}80)` }}>
              {planetGlyph}
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: planetColor,
            }}>
              {gateInfo.planet}
            </span>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20,
            border: "1px dashed rgba(200,135,58,0.3)",
            background: "rgba(200,135,58,0.04)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11 }}>🔒</span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: "rgba(200,135,58,0.5)",
            }}>
              CORE+
            </span>
          </div>
        )}

        {/* Expand chevron for paid */}
        {isPaid && (
          <span style={{
            color: "rgba(255,255,255,0.25)", fontSize: 12,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>
            ▾
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && isPaid && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{
              fontSize: 24, color: planetColor,
              filter: `drop-shadow(0 0 6px ${planetColor}80)`,
              lineHeight: 1, flexShrink: 0,
            }}>
              {planetGlyph}
            </span>
            <div>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: "0.14em", textTransform: "uppercase" as const,
                color: planetColor, marginBottom: 6,
              }}>
                {gateInfo.planet} · Jyotish Ruler
              </div>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 13, color: "rgba(240,220,160,0.88)", lineHeight: 1.65, margin: 0,
              }}>
                Gate {gateInfo.gate} ({gateInfo.name}) carries the energy of <strong>{gateInfo.planet}</strong> in the Jyotish system.
                This planetary influence shapes how this gate expresses through your chart — bringing the qualities of{" "}
                {gateInfo.keyword.toLowerCase()} into the centers and channels it touches.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

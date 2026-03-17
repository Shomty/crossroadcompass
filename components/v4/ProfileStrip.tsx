"use client";
/**
 * components/v4/ProfileStrip.tsx
 * Identity Anchor — v4 Digital Grimoire design system.
 *
 * Gold left-border glass card with:
 *  - Violet gradient avatar circle
 *  - Pill badges: Type · Strategy · Authority · Profile
 *  - 4-column data grid using DM Mono labels
 *
 * Fetches from /api/hd-chart on mount (same endpoint as LifePhaseIndicator).
 * In v4 this strip is the stable HD identity readout that later synthesis panels
 * relate back to when Vedic transits activate gates, strategies, or authorities.
 */

import { useState, useEffect } from "react";
import { V4GlassCard } from "./V4GlassCard";

interface HDChartData {
  type?: string;
  strategy?: string;
  authority?: string;
  profile?: string;
  definition?: string;
  incarnationCross?: string;
}

interface ProfileStripProps {
  /** User display name */
  name: string;
  /** Optional initial data if already known server-side */
  initial?: HDChartData | null;
}

const TYPE_COLOR: Record<string, string> = {
  "Generator":             "#D4AF37",
  "Manifesting Generator": "#F59E0B",
  "Projector":             "#7C3AED",
  "Manifestor":            "#E87060",
  "Reflector":             "#60A5FA",
};

export function ProfileStrip({ name, initial }: ProfileStripProps) {
  const [data, setData] = useState<HDChartData | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (initial) return;
    fetch("/api/hd-chart")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initial]);

  const typeColor = data?.type ? (TYPE_COLOR[data.type] ?? "#D4AF37") : "#D4AF37";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const grid: Array<{ label: string; value: string }> = [
    { label: "Type",      value: data?.type      ?? "—" },
    { label: "Strategy",  value: data?.strategy  ?? "—" },
    { label: "Authority", value: data?.authority ?? "—" },
    { label: "Profile",   value: data?.profile   ?? "—" },
  ];

  return (
    <V4GlassCard goldEdge style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>

        {/* ── Avatar ── */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
          background: `radial-gradient(circle at 38% 35%, rgba(124,58,237,0.55) 0%, rgba(5,5,5,0.9) 70%)`,
          border: "1.5px solid rgba(124,58,237,0.35)",
          boxShadow: "0 0 18px rgba(124,58,237,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "Cinzel, serif",
            fontSize: 17, fontWeight: 500,
            color: "var(--lavender, #EDE9FF)",
            userSelect: "none",
          }}>
            {initials}
          </span>
        </div>

        {/* ── Name + badges ── */}
        <div style={{ flex: 1, minWidth: 140 }}>
          <p style={{
            fontFamily: "Cinzel, serif",
            fontSize: 18, fontWeight: 500, lineHeight: 1.2,
            color: "rgba(255,255,255,0.92)",
            marginBottom: 8,
          }}>
            {name}
          </p>

          {loading ? (
            <div style={{ display: "flex", gap: 6 }}>
              {[80, 110, 70, 60].map((w, i) => (
                <div key={i} style={{
                  width: w, height: 20, borderRadius: 100,
                  background: "rgba(255,255,255,0.06)", animation: "pulse 1.8s ease-in-out infinite",
                  animationDelay: `${i * 0.12}s`,
                }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data?.type && (
                <span className="v4-badge" style={{
                  background: `${typeColor}18`,
                  borderColor: `${typeColor}35`,
                  color: typeColor,
                }}>
                  {data.type}
                </span>
              )}
              {data?.authority && (
                <span className="v4-badge">
                  {data.authority}
                </span>
              )}
              {data?.profile && (
                <span className="v4-badge">
                  Profile {data.profile}
                </span>
              )}
              {data?.definition && (
                <span className="v4-badge">
                  {data.definition}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── 4-column data grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, auto)",
          gap: "8px 24px",
          paddingLeft: 8,
          borderLeft: "1px solid rgba(255,255,255,0.07)",
        }}>
          {grid.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span className="v4-eyebrow">{label}</span>
              {loading ? (
                <div style={{
                  width: 70, height: 14, borderRadius: 4,
                  background: "rgba(255,255,255,0.06)",
                  animation: "pulse 1.8s ease-in-out infinite",
                }} />
              ) : (
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11, letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.80)",
                  lineHeight: 1.3,
                  maxWidth: 130,
                }}>
                  {value}
                </span>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Incarnation cross — secondary data row */}
      {!loading && data?.incarnationCross && (
        <div style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span className="v4-eyebrow">Incarnation Cross</span>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10.5, letterSpacing: "0.05em",
            color: "var(--lavender, #EDE9FF)", opacity: 0.75,
          }}>
            {data.incarnationCross}
          </span>
        </div>
      )}
    </V4GlassCard>
  );
}

"use client";
/**
 * components/v4/TransitTable.tsx
 * Precision Data Table — v4 Digital Grimoire design system.
 *
 * Fetches from /api/transit/reading — same endpoint as TransitCard.
 * Columns: Planet glyph | Degree (mono gold) | Sign | House | Quality badge
 * Hover rows with bg-white/5. Separator rows with border-b border-white/5.
 */

import { useState, useEffect } from "react";
import type { TransitReading, TransitPlanetLine, RawTransitPlanet } from "@/lib/ai/transitReadingService";
import { PLANET_COLOR, PLANET_GLYPH } from "@/lib/astro/planetMetadata";
import { V4GlassCard } from "./V4GlassCard";

// RawTransitPlanet uses `name` not `planet`, and `degreeFmt` for display

const QUALITY_CLASS: Record<string, string> = {
  favorable:   "v4-quality-favorable",
  neutral:     "v4-quality-neutral",
  challenging: "v4-quality-challenging",
};

const QUALITY_LABEL: Record<string, string> = {
  favorable:   "Favorable",
  neutral:     "Neutral",
  challenging: "Challenging",
};

function SkeletonRow() {
  return (
    <div className="v4-table-row" style={{ animation: "pulse 1.8s ease-in-out infinite" }}>
      {[28, 110, 60, 36, 90].map((w, i) => (
        <div key={i} style={{
          width: w, height: 13, borderRadius: 4,
          background: "rgba(255,255,255,0.06)",
        }} />
      ))}
    </div>
  );
}

interface TransitTableProps {
  /** Optional server-fetched reading. When provided, skips the client-side fetch. */
  initialReading?: TransitReading | null;
}

export function TransitTable({ initialReading }: TransitTableProps = {}) {
  const [reading, setReading] = useState<TransitReading | null>(initialReading ?? null);
  const [loading, setLoading] = useState(!initialReading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReading) return;
    fetchReading();
  }, []);

  async function fetchReading() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transit/reading");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load transit data.");
      } else {
        setReading(data.reading);
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <V4GlassCard style={{ padding: "22px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <p className="v4-eyebrow" style={{ marginBottom: 4 }}>Planetary Positions</p>
          <h2 style={{
            fontFamily: "Cinzel, serif",
            fontSize: 18, fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
          }}>
            Today&apos;s Transits
          </h2>
        </div>

        {/* LIVE indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="v4-live-dot" />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "var(--type-label)", letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#4ADE80", opacity: 0.85,
          }}>
            Live
          </span>
        </div>
      </div>

      {/* Table header */}
      <div className="v4-table-header">
        {["", "Planet", "Degree", "Hse", "Quality"].map((h) => (
          <span key={h} className="v4-eyebrow">{h}</span>
        ))}
      </div>

      {/* Rows */}
      {loading && Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}

      {error && (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "var(--type-mono)", color: "#F87171", marginBottom: 12,
          }}>
            {error}
          </p>
          <button
            onClick={fetchReading}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "var(--type-label)", letterSpacing: "0.12em",
              color: "var(--gold-solar, #D4AF37)",
              background: "none",
              border: "1px solid rgba(212,175,55,0.22)",
              borderRadius: 4, padding: "5px 14px", cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && reading && (
        <>
          {/* AI overview narrative */}
          {reading.overview && (
            <p style={{
              fontFamily: "Lora, Georgia, serif",
              fontStyle: "italic",
              fontSize: 13, lineHeight: 1.65,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              &ldquo;{reading.overview}&rdquo;
            </p>
          )}

          {/* Key transit planet rows */}
          {reading.keyTransits?.map((line: TransitPlanetLine) => {
            const key = line.planet.toLowerCase();
            const glyph = PLANET_GLYPH[key] ?? "✦";
            const color = PLANET_COLOR[key] ?? "#D4AF37";
            const qualityKey = line.quality?.toLowerCase() as string;
            const qClass = QUALITY_CLASS[qualityKey] ?? "v4-quality-neutral";
            const qLabel = QUALITY_LABEL[qualityKey] ?? line.quality ?? "—";
            // Find matching raw planet for degree
            const raw = reading.allPlanets?.find(
              (p: RawTransitPlanet) => p.name.toLowerCase() === key
            );

            return (
              <div key={line.planet} className="v4-table-row">
                {/* Glyph */}
                <span style={{
                  fontSize: 16, color, lineHeight: 1,
                  textAlign: "center",
                  filter: `drop-shadow(0 0 3px ${color}60)`,
                }}>
                  {glyph}
                </span>

                {/* Planet name + transit sign */}
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "var(--type-mono)", color: "rgba(255,255,255,0.80)",
                  letterSpacing: "0.04em",
                }}>
                  {line.planet}
                  {line.transitSign && (
                    <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 6, fontSize: "var(--type-label)" }}>
                      in {line.transitSign}
                    </span>
                  )}
                </span>

                {/* Degree */}
                <span className="v4-data" style={{ whiteSpace: "nowrap" }}>
                  {raw?.degreeFmt ?? "—"}
                </span>

                {/* House from Moon */}
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "var(--type-label)", color: "rgba(255,255,255,0.35)",
                  textAlign: "center",
                }}>
                  {line.transitHouseFromMoon != null ? `H${line.transitHouseFromMoon}` : "—"}
                </span>

                {/* Quality badge */}
                <span className={`v4-badge ${qClass}`} style={{ fontSize: "var(--type-label)" }}>
                  {qLabel}
                </span>
              </div>
            );
          })}

          {/* Fallback: all raw planets if no key transits parsed */}
          {(!reading.keyTransits || reading.keyTransits.length === 0) &&
            reading.allPlanets?.map((p: RawTransitPlanet) => {
              const key = p.name?.toLowerCase() ?? "";
              const glyph = PLANET_GLYPH[key] ?? "✦";
              const color = PLANET_COLOR[key] ?? "#D4AF37";
              return (
                <div key={p.name} className="v4-table-row">
                  <span style={{ fontSize: 16, color, lineHeight: 1, textAlign: "center" }}>
                    {glyph}
                  </span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--type-mono)", color: "rgba(255,255,255,0.80)",
                  }}>
                    {p.name}
                    {p.sign && (
                      <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 6, fontSize: "var(--type-label)" }}>
                        in {p.sign}
                      </span>
                    )}
                  </span>
                  <span className="v4-data">{p.degreeFmt ?? "—"}</span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--type-label)", color: "rgba(255,255,255,0.35)", textAlign: "center",
                  }}>
                    {p.house != null ? `H${p.house}` : "—"}
                  </span>
                  <span className="v4-badge v4-quality-neutral" style={{ fontSize: "var(--type-label)" }}>
                    {p.nakshatra ?? "—"}
                  </span>
                </div>
              );
            })}
        </>
      )}
    </V4GlassCard>
  );
}

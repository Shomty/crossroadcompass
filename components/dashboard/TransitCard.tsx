"use client";
/**
 * components/dashboard/TransitCard.tsx
 * Today's Vedic Transit Reading — auto-fetches on mount.
 * Displays Gemini AI reading based on Parasara Hora analysis of
 * natal Rasi chart vs today's planetary positions (Gochara).
 */

import { useState, useEffect } from "react";
import type { TransitReading, TransitPlanetLine, RawTransitPlanet } from "@/lib/ai/transitReadingService";

const PLANET_GLYPHS: Record<string, string> = {
  sun: "☉", moon: "☽", mars: "♂", mercury: "☿", jupiter: "♃",
  venus: "♀", saturn: "♄", rahu: "☊", ketu: "☋",
};

const QUALITY_COLOR: Record<string, string> = {
  favorable: "var(--gold)",
  neutral: "var(--mist)",
  challenging: "rgba(220,120,60,0.85)",
};

const QUALITY_LABEL: Record<string, string> = {
  favorable: "Favorable",
  neutral: "Neutral",
  challenging: "Challenging",
};

export function TransitCard() {
  const [reading, setReading] = useState<TransitReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchReading(); }, []);

  async function fetchReading() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transit/reading");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load transit reading.");
      } else {
        setReading(data.reading);
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const sans: React.CSSProperties = { fontFamily: "'Instrument Sans', sans-serif" };
  const serif: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: "8px 0" }}>
        <p style={{ ...mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>
          ✦ Today&apos;s Transits
        </p>
        <p style={{ ...serif, fontSize: 16, fontStyle: "italic", color: "var(--mist)", animation: "dashaPulse 1.8s ease-in-out infinite" }}>
          Reading the sky…
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error || !reading) {
    return (
      <div style={{ padding: "8px 0" }}>
        <p style={{ ...mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>
          ✦ Today&apos;s Transits
        </p>
        <p style={{ ...sans, fontSize: 13, color: "rgba(220,100,80,0.85)", marginBottom: 12, lineHeight: 1.6 }}>
          {error ?? "Transit reading unavailable."}
        </p>
        <button onClick={fetchReading} style={{ ...sans, fontSize: 11.5, color: "var(--amber)", background: "none", border: "1px solid rgba(200,135,58,0.22)", borderRadius: 2, padding: "5px 14px", cursor: "pointer", letterSpacing: "0.06em" }}>
          Try Again
        </button>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ ...mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>
            ✦ Today&apos;s Transits
          </p>
          <h3 style={{ ...serif, fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 300, color: "var(--cream)", lineHeight: 1.15, margin: 0 }}>
            {reading.headline}
          </h3>
          {/* Location tag */}
          {reading.location && (
            <p style={{ ...mono, fontSize: 8, color: "var(--mist)", marginTop: 5, letterSpacing: "0.1em" }}>
              ◎ {reading.location}
            </p>
          )}
        </div>
        <span style={{ ...mono, fontSize: 8.5, color: "var(--mist)", letterSpacing: "0.08em", marginTop: 4, flexShrink: 0 }}>{today}</span>
      </div>

      {/* Overview */}
      <p style={{ ...sans, fontSize: 13.5, color: "var(--mist)", lineHeight: 1.75, marginBottom: 22 }}>
        {reading.overview}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(200,135,58,0.1)", marginBottom: 20 }} />

      {/* Key Transits — AI analysis */}
      <p style={{ ...mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 12 }}>
        Key Planetary Movements
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reading.keyTransits.map((t: TransitPlanetLine, i: number) => {
          const glyph = PLANET_GLYPHS[t.planet.toLowerCase()] ?? "·";
          const isOpen = expanded === t.planet;
          return (
            <div key={i}>
              <button
                onClick={() => setExpanded(isOpen ? null : t.planet)}
                style={{
                  width: "100%", textAlign: "left", background: "none",
                  border: "none", cursor: "pointer", padding: "10px 0",
                  borderBottom: "1px solid rgba(200,135,58,0.06)",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                {/* Glyph */}
                <span style={{ ...serif, fontSize: 18, color: QUALITY_COLOR[t.quality], width: 22, flexShrink: 0, textAlign: "center" }}>
                  {glyph}
                </span>
                {/* Planet + signs */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ ...sans, fontSize: 13, fontWeight: 500, color: "var(--cream)", textTransform: "capitalize" }}>
                    {t.planet}
                  </span>
                  <span style={{ ...mono, fontSize: 9, color: "var(--mist)", marginLeft: 8, letterSpacing: "0.06em" }}>
                    {t.natalSign} → {t.transitSign}
                    {t.transitHouseFromMoon !== null ? ` · H${t.transitHouseFromMoon} from ☽` : ""}
                  </span>
                </div>
                {/* Quality badge */}
                <span style={{
                  ...mono, fontSize: 7.5, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: QUALITY_COLOR[t.quality], padding: "2px 7px",
                  border: `1px solid ${QUALITY_COLOR[t.quality]}44`,
                  borderRadius: 2, flexShrink: 0,
                }}>
                  {QUALITY_LABEL[t.quality]}
                </span>
                {/* Expand chevron */}
                <span style={{ ...mono, fontSize: 9, color: "var(--amber)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>▾</span>
              </button>

              {/* Expanded note */}
              {isOpen && (
                <div style={{ padding: "8px 0 12px 32px", borderBottom: "1px solid rgba(200,135,58,0.06)" }}>
                  <p style={{ ...sans, fontSize: 12.5, color: "var(--mist)", lineHeight: 1.7, margin: 0 }}>
                    {t.note}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guidance */}
      <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(200,135,58,0.04)", border: "1px solid rgba(200,135,58,0.12)", borderRadius: 2 }}>
        <p style={{ ...mono, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>
          Today&apos;s Guidance
        </p>
        <p style={{ ...sans, fontSize: 13.5, color: "var(--cream)", lineHeight: 1.7, margin: 0 }}>
          {reading.guidance}
        </p>
      </div>

      {/* All Planetary Positions */}
      {reading.allPlanets?.length > 0 && (
        <>
          <div style={{ height: 1, background: "rgba(200,135,58,0.1)", margin: "24px 0 18px" }} />
          <p style={{ ...mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 14 }}>
            All Planetary Positions
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", ...mono, fontSize: 11 }}>
              <thead>
                <tr>
                  {["Planet", "Sign", "House", "Degree", "Nakshatra", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "4px 10px 8px 0", fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", fontWeight: 400, borderBottom: "1px solid rgba(200,135,58,0.12)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reading.allPlanets.map((p: RawTransitPlanet, i: number) => {
                  const glyph = PLANET_GLYPHS[p.name.toLowerCase()] ?? "·";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(200,135,58,0.04)" }}>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--cream)" }}>
                        <span style={{ ...serif, fontSize: 14, marginRight: 6 }}>{glyph}</span>
                        <span style={{ ...sans, fontSize: 12, textTransform: "capitalize" }}>{p.name}</span>
                      </td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--cream)", ...sans, fontSize: 12, textTransform: "capitalize" }}>{p.sign}</td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--mist)", fontSize: 11 }}>{p.house ?? "—"}</td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--mist)", fontSize: 11 }}>{p.degreeFmt || `${p.degree?.toFixed(1)}°`}</td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--mist)", fontSize: 10, textTransform: "capitalize" }}>
                        {p.nakshatra?.replace(/_/g, " ") ?? "—"}
                      </td>
                      <td style={{ padding: "7px 0 7px 0", color: "rgba(220,120,60,0.7)", fontSize: 9 }}>
                        {p.isRetrograde ? "℞" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={fetchReading}
          style={{ ...mono, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mist)", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
        >
          ↺ Refresh
        </button>
      </div>
    </div>
  );
}


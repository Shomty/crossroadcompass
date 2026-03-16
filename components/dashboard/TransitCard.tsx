"use client";
/**
 * components/dashboard/TransitCard.tsx
 * Today's Vedic Transit Reading — auto-fetches on mount.
 * Displays Gemini AI reading based on Parasara Hora analysis of
 * natal Rasi chart vs today's planetary positions (Gochara).
 *
 * Caching: /api/transit/reading uses 24h KV cache — Gemini is called
 * at most once per user per day. Refresh button forces re-generation.
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

function formatGeneratedAt(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    if (isToday) return `today at ${time}`;
    return `${d.toLocaleDateString("en-US", { day: "numeric", month: "short" })} at ${time}`;
  } catch {
    return iso;
  }
}

export function TransitCard() {
  const [reading, setReading] = useState<TransitReading | null>(null);
  const [source, setSource] = useState<"cache" | "generated" | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchReading(); }, []);

  async function fetchReading(force = false) {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const url = force ? "/api/transit/reading?force=true" : "/api/transit/reading";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load transit reading.");
      } else {
        setReading(data.reading);
        setSource(data.source ?? null);
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" };
  const serif: React.CSSProperties = { fontFamily: "Cinzel, serif" };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: "8px 0" }}>
        <p style={{ ...mono, fontSize: "var(--type-label)", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>
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
        <p style={{ ...mono, fontSize: "var(--type-label)", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>
          ✦ Today&apos;s Transits
        </p>
        <p style={{ ...sans, fontSize: 13, color: "rgba(220,100,80,0.85)", marginBottom: 12, lineHeight: 1.6 }}>
          {error ?? "Transit reading unavailable."}
        </p>
        <button onClick={() => fetchReading()} style={{ ...sans, fontSize: "var(--type-small)", color: "var(--amber)", background: "none", border: "1px solid rgba(200,135,58,0.22)", borderRadius: 2, padding: "5px 14px", cursor: "pointer", letterSpacing: "0.06em" }}>
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
          <p style={{ ...mono, fontSize: "var(--type-label)", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>
            ✦ Today&apos;s Transits
          </p>
          <h3 style={{ ...serif, fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 300, color: "var(--cream)", lineHeight: 1.15, margin: 0 }}>
            {reading.headline}
          </h3>
        </div>
        <span style={{ ...mono, fontSize: "var(--type-label)", color: "var(--mist)", letterSpacing: "0.08em", marginTop: 4, flexShrink: 0 }}>{today}</span>
      </div>

      {/* Overview */}
      <p style={{ ...sans, fontSize: 13.5, color: "var(--mist)", lineHeight: 1.75, marginBottom: 22 }}>
        {reading.overview}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(200,135,58,0.1)", marginBottom: 20 }} />

      {/* Key Transits — AI analysis */}
      <p style={{ ...mono, fontSize: "var(--type-label)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 12 }}>
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
                  border: "none", cursor: "pointer", padding: "10px 0 10px 10px",
                  borderBottom: "1px solid rgba(200,135,58,0.08)",
                  borderLeft: `2px solid ${QUALITY_COLOR[t.quality]}33`,
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
                  <span style={{ ...mono, fontSize: "var(--type-label)", color: "var(--mist)", marginLeft: 8, letterSpacing: "0.06em" }}>
                    {t.natalSign} → {t.transitSign}
                    {t.transitHouseFromMoon !== null ? ` · H${t.transitHouseFromMoon} from ☽` : ""}
                  </span>
                </div>
                {/* Quality badge */}
                <span style={{
                  ...mono, fontSize: "var(--type-label)", letterSpacing: "0.12em", textTransform: "uppercase",
                  color: QUALITY_COLOR[t.quality], padding: "2px 7px",
                  border: `1px solid ${QUALITY_COLOR[t.quality]}44`,
                  borderRadius: 2, flexShrink: 0,
                }}>
                  {QUALITY_LABEL[t.quality]}
                </span>
                {/* Expand chevron */}
                <span style={{ ...mono, fontSize: "var(--type-label)", color: "var(--amber)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>▾</span>
              </button>

              {/* Expanded note */}
              {isOpen && (
                <div style={{ padding: "8px 0 12px 32px", borderBottom: "1px solid rgba(200,135,58,0.06)" }}>
                  <p style={{ ...sans, fontSize: "var(--type-body)", color: "var(--mist)", lineHeight: 1.7, margin: 0 }}>
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
        <p style={{ ...mono, fontSize: "var(--type-label)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>
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
          <p style={{ ...mono, fontSize: "var(--type-label)", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 14 }}>
            All Planetary Positions
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", ...mono, fontSize: "var(--type-mono)" }}>
              <thead>
                <tr>
                  {["Planet", "Sign", "House", "Degree", "Nakshatra", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "4px 10px 8px 0", fontSize: "var(--type-label)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", fontWeight: 400, borderBottom: "1px solid rgba(200,135,58,0.12)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reading.allPlanets.map((p: RawTransitPlanet, i: number) => {
                  const glyph = PLANET_GLYPHS[p.name.toLowerCase()] ?? "·";
                  return (
                    <tr key={i} className={i % 2 === 1 ? "transit-table-row-alt" : ""} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--cream)" }}>
                        <span style={{ ...serif, fontSize: 14, marginRight: 6 }}>{glyph}</span>
                        <span style={{ ...sans, fontSize: 12, textTransform: "capitalize" }}>{p.name}</span>
                      </td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--cream)", ...sans, fontSize: 12, textTransform: "capitalize" }}>{p.sign}</td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--mist)", fontSize: "var(--type-mono)" }}>{p.house ?? "—"}</td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--mist)", fontSize: "var(--type-mono)" }}>{p.degreeFmt || `${p.degree?.toFixed(1)}°`}</td>
                      <td style={{ padding: "7px 10px 7px 0", color: "var(--mist)", fontSize: "var(--type-label)", textTransform: "capitalize" }}>
                        {p.nakshatra?.replace(/_/g, " ") ?? "—"}
                      </td>
                      <td style={{ padding: "7px 0 7px 0", color: "rgba(220,120,60,0.7)", fontSize: "var(--type-label)" }}>
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

      {/* Footer — location · generated timestamp · refresh */}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(200,135,58,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {reading.location && (
            <span style={{ ...mono, fontSize: "var(--type-label)", color: "var(--mist)", letterSpacing: "0.06em" }}>
              ◎ {reading.location}
            </span>
          )}
          {reading.generatedAt && (
            <span style={{ ...mono, fontSize: "var(--type-label)", color: "var(--mist)", letterSpacing: "0.06em", opacity: 0.65 }}>
              ✦ {source === "cache" ? "Cached" : "Generated"} {formatGeneratedAt(reading.generatedAt)}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchReading(true)}
          disabled={refreshing}
          style={{
            ...mono, fontSize: "var(--type-label)", letterSpacing: "0.1em", textTransform: "uppercase",
            color: refreshing ? "var(--mist)" : "var(--amber)",
            background: "none",
            border: `1px solid ${refreshing ? "rgba(200,135,58,0.1)" : "rgba(200,135,58,0.22)"}`,
            borderRadius: 2, cursor: refreshing ? "default" : "pointer",
            padding: "5px 14px", transition: "all 0.2s",
          }}
        >
          {refreshing ? "Refreshing…" : "↺ Refresh"}
        </button>
      </div>
    </div>
  );
}

"use client";

/**
 * Client wrapper for the Sudarshana Chakra page.
 * Renders:
 *   1. SVG Sudarshana Chakra visualization
 *   2. Layer info cards
 *   3. Planet Positions table (with nakshatra, rasi lord, etc.)
 *   4. House Positions table (From Ascendant / Moon / Sun)
 */

import { SudarshanChakraChart } from "./SudarshanChakraChart";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import type {
  SudarshanChakraResult,
  SudarshanLayer,
  PlanetPositionRow,
  HousePositionRow,
} from "@/lib/astro/sudarshanaChakraService";

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Glyph lookup tables
// ---------------------------------------------------------------------------

const PLANET_GLYPH: Record<string, string> = {
  sun:       "☉",
  moon:      "☽",
  mercury:   "☿",
  venus:     "♀",
  mars:      "♂",
  jupiter:   "♃",
  saturn:    "♄",
  rahu:      "☊",
  ketu:      "☋",
  ascendant: "↑",
};

const RASI_GLYPH: Record<string, string> = {
  Mesha:      "♈",
  Vrishabha:  "♉",
  Mithuna:    "♊",
  Karka:      "♋",
  Simha:      "♌",
  Kanya:      "♍",
  Tula:       "♎",
  Vrischika:  "♏",
  Dhanu:      "♐",
  Makara:     "♑",
  Kumbha:     "♒",
  Meena:      "♓",
};

/** Planet-specific accent colors for Lord badges */
const PLANET_COLOR: Record<string, string> = {
  Sun:     "rgba(232,148,90,0.18)",
  Moon:    "rgba(180,185,230,0.18)",
  Mars:    "rgba(220,80,80,0.18)",
  Mercury: "rgba(100,200,130,0.18)",
  Jupiter: "rgba(240,200,90,0.18)",
  Venus:   "rgba(230,150,200,0.18)",
  Saturn:  "rgba(130,130,170,0.18)",
  Rahu:    "rgba(140,100,230,0.18)",
  Ketu:    "rgba(80,190,180,0.18)",
};
const PLANET_TEXT: Record<string, string> = {
  Sun:     "#e8945a",
  Moon:    "#b4b9e6",
  Mars:    "#e05555",
  Mercury: "#64c882",
  Jupiter: "#f0c85a",
  Venus:   "#e696c8",
  Saturn:  "#9090b0",
  Rahu:    "#9b6be6",
  Ketu:    "#50bebf",
};

// ---------------------------------------------------------------------------
// Planet Positions Table
// ---------------------------------------------------------------------------

function PlanetPositionsTable({ rows }: { rows: PlanetPositionRow[] }) {
  return (
    <div className="sc-table-scroll">
      <table className="sc-table">
        <thead>
          <tr>
            <th className="sc-th sc-th-planet">Planet</th>
            <th className="sc-th sc-th-mono">Longitude</th>
            <th className="sc-th sc-th-mono">Degrees</th>
            <th className="sc-th">Rasi</th>
            <th className="sc-th">Rasi Lord</th>
            <th className="sc-th">Nakshatra</th>
            <th className="sc-th">Nakshatra Lord</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key} className={i % 2 === 0 ? "sc-tr sc-tr-even" : "sc-tr sc-tr-odd"}>
              <td className="sc-td sc-td-planet">
                <span className="sc-planet-glyph">{PLANET_GLYPH[row.key] ?? ""}</span>
                <span className="sc-planet-name">{row.label}</span>
              </td>
              <td className="sc-td sc-td-mono">{row.absoluteLongitude}</td>
              <td className="sc-td sc-td-mono">{row.signDegree}</td>
              <td className="sc-td">
                <span className="sc-rasi-glyph">{RASI_GLYPH[row.rasi] ?? ""}</span>
                <span className="sc-rasi-name">{row.rasi}</span>
              </td>
              <td className="sc-td">
                <LordBadge name={row.rasiLord} />
              </td>
              <td className="sc-td sc-td-nakshatra">{row.nakshatra}</td>
              <td className="sc-td">
                <LordBadge name={row.nakshatraLord} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Colored pill badge for Rasi Lord / Nakshatra Lord */
function LordBadge({ name }: { name: string }) {
  const bg   = PLANET_COLOR[name] ?? "rgba(200,168,76,0.12)";
  const text = PLANET_TEXT[name]  ?? "var(--v2-moon, #EDE6D3)";
  const glyph = PLANET_GLYPH[name.toLowerCase()] ?? "";
  return (
    <span className="sc-lord-badge" style={{ background: bg, color: text }}>
      {glyph && <span className="sc-lord-glyph">{glyph}</span>}
      {name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// House Positions Table
// ---------------------------------------------------------------------------

function HouseCircle({ n, theme }: { n: number; theme: "lagna" | "chandra" | "surya" }) {
  const colors = {
    lagna:   { bg: "rgba(232,184,109,0.18)", text: "#e8b86d" },
    chandra: { bg: "rgba(180,185,230,0.18)", text: "#b4b9e6" },
    surya:   { bg: "rgba(232,148,90,0.18)",  text: "#e8945a" },
  };
  const { bg, text } = colors[theme];
  return (
    <span className="sc-house-badge" style={{ background: bg, color: text }}>
      {n || "—"}
    </span>
  );
}

function HousePositionsTable({ rows }: { rows: HousePositionRow[] }) {
  return (
    <div className="sc-table-scroll">
      <table className="sc-table">
        <thead>
          <tr>
            <th className="sc-th sc-th-planet">Planet</th>
            <th className="sc-th sc-th-layer" style={{ color: "#e8b86d" }}>
              <span className="sc-layer-dot" style={{ background: "#e8b86d" }} />
              From Ascendant
            </th>
            <th className="sc-th sc-th-layer" style={{ color: "#b4b9e6" }}>
              <span className="sc-layer-dot" style={{ background: "#b4b9e6" }} />
              From Moon
            </th>
            <th className="sc-th sc-th-layer" style={{ color: "#e8945a" }}>
              <span className="sc-layer-dot" style={{ background: "#e8945a" }} />
              From Sun
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key} className={i % 2 === 0 ? "sc-tr sc-tr-even" : "sc-tr sc-tr-odd"}>
              <td className="sc-td sc-td-planet">
                <span className="sc-planet-glyph">{PLANET_GLYPH[row.key] ?? ""}</span>
                <span className="sc-planet-name">{row.label}</span>
              </td>
              <td className="sc-td sc-td-center"><HouseCircle n={row.fromLagna} theme="lagna" /></td>
              <td className="sc-td sc-td-center"><HouseCircle n={row.fromMoon} theme="chandra" /></td>
              <td className="sc-td sc-td-center"><HouseCircle n={row.fromSun} theme="surya" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layer description cards
// ---------------------------------------------------------------------------

const LAYER_INFO: Record<SudarshanLayer["name"], { title: string; description: string }> = {
  lagna: {
    title: "Lagna Chakra — Inner Ring",
    description:
      "Houses rotated from the Ascendant. Shows the physical body, personality, and how you project yourself into the world. The foundational layer of the self.",
  },
  chandra: {
    title: "Chandra Chakra — Middle Ring",
    description:
      "Houses rotated from the Moon's natal house. Reveals the emotional landscape, mental conditioning, and the subjective experience of your life circumstances.",
  },
  surya: {
    title: "Surya Chakra — Outer Ring",
    description:
      "Houses rotated from the Sun's natal house. Illuminates the soul's authority, dharmic purpose, and the chapters of life governed by vitality and will.",
  },
};

function LayerCard({ layer }: { layer: SudarshanLayer }) {
  const info = LAYER_INFO[layer.name];
  return (
    <div className="sudarshan-layer-card">
      <h3 className="sudarshan-layer-title">{info.title}</h3>
      <p className="sudarshan-layer-desc">{info.description}</p>
      <p className="sudarshan-layer-meta">
        Reference sign: <strong>{capitalise(layer.referenceSign)}</strong>
        &nbsp;·&nbsp;House 1 from: <strong>house {layer.referenceHouse}</strong>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface Props {
  result: SudarshanChakraResult;
  planetPositions: PlanetPositionRow[];
  housePositions: HousePositionRow[];
}

export function SudarshanChakraPageClient({ result, planetPositions, housePositions }: Props) {
  return (
    <div className="chart-page animate-enter animate-enter-2">
      {/* SVG Chart */}
      <V4GlassCard goldEdge style={{ padding: "28px 24px" }}>
        <SudarshanChakraChart result={result} />
      </V4GlassCard>

      {/* Layer descriptions */}
      <div className="sudarshan-layers-grid">
        {(["lagna", "chandra", "surya"] as const).map((name) => {
          const layer =
            name === "lagna"
              ? result.lagnaChakra
              : name === "chandra"
              ? result.chandraChakra
              : result.suryaChakra;
          return (
            <V4GlassCard key={name} style={{ padding: "20px 22px" }}>
              <LayerCard layer={layer} />
            </V4GlassCard>
          );
        })}
      </div>

      {/* Planet Positions */}
      <V4GlassCard style={{ padding: "22px 24px" }}>
        <h2 className="sudarshan-section-title">Planet Positions</h2>
        <p className="sudarshan-section-subtitle">
          The table below shows the position of planets at the date, time and place of birth as entered in the input form.
        </p>
        <PlanetPositionsTable rows={planetPositions} />
      </V4GlassCard>

      {/* House Positions */}
      <V4GlassCard style={{ padding: "22px 24px" }}>
        <h2 className="sudarshan-section-title">House Positions</h2>
        <p className="sudarshan-section-subtitle">
          House occupied by each planet across the three Sudarshana Chakra perspectives.
        </p>
        <HousePositionsTable rows={housePositions} />
      </V4GlassCard>

      <style>{`
        /* ── Layer cards ── */
        .sudarshan-layers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .sudarshan-layer-title {
          font-family: var(--font-cinzel, 'Cinzel', serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--v2-moon, #EDE6D3);
          margin: 0 0 8px;
          letter-spacing: 0.02em;
        }
        .sudarshan-layer-desc {
          font-size: 13px;
          color: var(--v2-muted, rgba(232,224,208,0.42));
          line-height: 1.6;
          margin: 0 0 10px;
        }
        .sudarshan-layer-meta {
          font-size: 12px;
          color: var(--v2-faint, rgba(232,224,208,0.2));
          margin: 0;
        }
        .sudarshan-layer-meta strong {
          color: var(--v2-muted, rgba(232,224,208,0.42));
        }

        /* ── Section headers ── */
        .sudarshan-section-title {
          font-family: var(--font-cinzel, 'Cinzel', serif);
          font-size: 15px;
          font-weight: 600;
          color: var(--v2-moon, #EDE6D3);
          margin: 0 0 4px;
          letter-spacing: 0.04em;
        }
        .sudarshan-section-subtitle {
          font-size: 13px;
          color: var(--v2-muted, rgba(232,224,208,0.42));
          margin: 0 0 18px;
          line-height: 1.55;
        }

        /* ── Table base ── */
        .sc-table-scroll {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid var(--v2-border-warm, rgba(212,175,95,0.12));
        }
        .sc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 560px;
        }

        /* ── Header ── */
        .sc-th {
          padding: 10px 14px;
          text-align: left;
          font-family: var(--font-cinzel, 'Cinzel', serif);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--v2-muted, rgba(232,224,208,0.42));
          background: rgba(14,22,40,0.9);
          border-bottom: 1px solid var(--v2-border-lit, rgba(212,175,95,0.22));
          white-space: nowrap;
        }
        .sc-th-mono {
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 10px;
          letter-spacing: 0.04em;
        }
        .sc-th-layer {
          text-align: center;
        }
        .sc-layer-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
          margin-bottom: 1px;
          opacity: 0.85;
        }

        /* ── Rows ── */
        .sc-tr {
          transition: background 150ms ease;
        }
        .sc-tr-even { background: rgba(9,16,31,0.6); }
        .sc-tr-odd  { background: rgba(14,22,40,0.4); }
        .sc-tr:hover { background: rgba(201,168,76,0.07); }

        /* ── Cells ── */
        .sc-td {
          padding: 9px 14px;
          border-bottom: 1px solid var(--v2-border, rgba(255,255,255,0.055));
          color: var(--v2-bone, #D8D0BC);
          vertical-align: middle;
          white-space: nowrap;
        }
        .sc-tr:last-child .sc-td { border-bottom: none; }
        .sc-td-mono {
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 12px;
          color: var(--v2-muted, rgba(232,224,208,0.42));
          letter-spacing: 0.02em;
        }
        .sc-td-nakshatra {
          color: var(--v2-moon, #EDE6D3);
        }
        .sc-td-center {
          text-align: center;
        }

        /* ── Planet cell ── */
        .sc-td-planet {
          white-space: nowrap;
        }
        .sc-planet-glyph {
          display: inline-block;
          width: 22px;
          font-size: 15px;
          color: var(--v2-gold, #C9A84C);
          opacity: 0.9;
          text-align: center;
          vertical-align: middle;
        }
        .sc-planet-name {
          font-weight: 500;
          color: var(--v2-moon, #EDE6D3);
          vertical-align: middle;
        }

        /* ── Rasi cell ── */
        .sc-rasi-glyph {
          display: inline-block;
          width: 20px;
          font-size: 14px;
          color: var(--v2-gold-soft, rgba(201,168,76,0.7));
          text-align: center;
          vertical-align: middle;
        }
        .sc-rasi-name {
          vertical-align: middle;
        }

        /* ── Lord badge ── */
        .sc-lord-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px 2px 6px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.02em;
          border: 1px solid currentColor;
          border-opacity: 0.25;
        }
        .sc-lord-glyph {
          font-size: 12px;
          opacity: 0.85;
        }

        /* ── House circle ── */
        .sc-house-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          border: 1px solid currentColor;
        }

        /* ── th-planet wider ── */
        .sc-th-planet { min-width: 130px; }
      `}</style>
    </div>
  );
}

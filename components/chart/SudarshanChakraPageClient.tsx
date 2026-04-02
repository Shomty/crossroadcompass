"use client";

/**
 * Client wrapper for the Sudarshana Chakra page.
 * Renders the SVG chart + a reference legend table.
 */

import { SudarshanChakraChart } from "./SudarshanChakraChart";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import type { SudarshanChakraResult, SudarshanLayer } from "@/lib/astro/sudarshanaChakraService";
import type { Planet } from "openastrology-library";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLANET_ABBREV: Record<Planet, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me",
  jupiter: "Ju", venus: "Ve", saturn: "Sa", rahu: "Ra", ketu: "Ke",
};

const PLANET_FULL: Record<Planet, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Reference table — one row per planet, three house-number columns
// ---------------------------------------------------------------------------

function ReferenceTable({ result }: { result: SudarshanChakraResult }) {
  const { lagnaChakra, chandraChakra, suryaChakra } = result;

  const planets: Planet[] = [
    "sun", "moon", "mars", "mercury", "jupiter",
    "venus", "saturn", "rahu", "ketu",
  ];

  function houseIn(layer: SudarshanLayer, planet: Planet): number | null {
    for (const h of layer.houses) {
      if (h.planets.some((p) => p.name === planet)) return h.rotatedHouse;
    }
    return null;
  }

  return (
    <div className="sudarshan-table-wrapper">
      <table className="chart-data-table">
        <thead>
          <tr>
            <th>Planet</th>
            <th style={{ color: "var(--cc-amber-light, #e8b86d)" }}>Lagna H.</th>
            <th style={{ color: "#b4b9e6" }}>Chandra H.</th>
            <th style={{ color: "#e8945a" }}>Surya H.</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((p) => (
            <tr key={p}>
              <td>
                <span style={{ fontFamily: "var(--font-dm-mono, 'DM Mono', monospace)", marginRight: 6, opacity: 0.6, fontSize: 11 }}>
                  {PLANET_ABBREV[p]}
                </span>
                {PLANET_FULL[p]}
              </td>
              <td>{houseIn(lagnaChakra, p) ?? "—"}</td>
              <td>{houseIn(chandraChakra, p) ?? "—"}</td>
              <td>{houseIn(suryaChakra, p) ?? "—"}</td>
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

interface LayerCardProps {
  layer: SudarshanLayer;
}

function LayerCard({ layer }: LayerCardProps) {
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
}

export function SudarshanChakraPageClient({ result }: Props) {
  return (
    <div className="chart-page animate-enter animate-enter-2">
      {/* Chart */}
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

      {/* Planet reference table */}
      <V4GlassCard style={{ padding: "22px 24px" }}>
        <h2 className="sudarshan-section-title">Planet House Reference</h2>
        <p className="sudarshan-section-subtitle">
          House position of each planet in the three rotated views.
        </p>
        <ReferenceTable result={result} />
      </V4GlassCard>

      <style>{`
        .sudarshan-layers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .sudarshan-layer-title {
          font-family: var(--font-cinzel, 'Cinzel', serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--cc-text-primary, #ede9dc);
          margin: 0 0 8px;
          letter-spacing: 0.02em;
        }
        .sudarshan-layer-desc {
          font-size: 13px;
          color: var(--cc-text-secondary, #8a8678);
          line-height: 1.6;
          margin: 0 0 10px;
        }
        .sudarshan-layer-meta {
          font-size: 12px;
          color: var(--cc-text-tertiary, #4e4c44);
          margin: 0;
        }
        .sudarshan-layer-meta strong {
          color: var(--cc-text-secondary, #8a8678);
        }
        .sudarshan-section-title {
          font-family: var(--font-cinzel, 'Cinzel', serif);
          font-size: 14px;
          font-weight: 600;
          color: var(--cc-text-primary, #ede9dc);
          margin: 0 0 4px;
          letter-spacing: 0.03em;
        }
        .sudarshan-section-subtitle {
          font-size: 13px;
          color: var(--cc-text-secondary, #8a8678);
          margin: 0 0 16px;
        }
        .sudarshan-table-wrapper {
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}

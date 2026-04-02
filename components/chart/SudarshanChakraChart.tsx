"use client";

/**
 * SudarshanChakraChart — SVG circular visualization.
 *
 * Three concentric rings, each divided into 12 equal wedges (30° each).
 * Inner ring  = Lagna Chakra  (amber/gold tones)
 * Middle ring = Chandra Chakra (cool silver-blue tones)
 * Outer ring  = Surya Chakra  (warm solar-orange tones)
 */

import { useState, useRef, useCallback } from "react";
import type { SudarshanChakraResult, SudarshanLayer, SudarshanHouse } from "@/lib/astro/sudarshanaChakraService";
import type { Planet, ZodiacSign } from "openastrology-library";

// ---------------------------------------------------------------------------
// Planet abbreviations (matches CosmicGateway convention)
// ---------------------------------------------------------------------------
const PLANET_ABBREV: Record<Planet, string> = {
  sun: "Su",
  moon: "Mo",
  mars: "Ma",
  mercury: "Me",
  jupiter: "Ju",
  venus: "Ve",
  saturn: "Sa",
  rahu: "Ra",
  ketu: "Ke",
};

const PLANET_FULL: Record<Planet, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

// ---------------------------------------------------------------------------
// Zodiac sign abbreviations (3-letter)
// ---------------------------------------------------------------------------

const SIGN_ABBREV: Record<ZodiacSign, string> = {
  aries: "Ari", taurus: "Tau", gemini: "Gem", cancer: "Can",
  leo: "Leo", virgo: "Vir", libra: "Lib", scorpio: "Sco",
  sagittarius: "Sag", capricorn: "Cap", aquarius: "Aqu", pisces: "Pis",
};

const SIGN_FULL: Record<ZodiacSign, string> = {
  aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer",
  leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio",
  sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
};

// ---------------------------------------------------------------------------
// Layer colour tokens (dark-theme adapted)
// ---------------------------------------------------------------------------
interface LayerTheme {
  fill: string;
  fillAlt: string;
  stroke: string;
  label: string;
  dot: string;
}

const LAYER_THEMES: Record<SudarshanLayer["name"], LayerTheme> = {
  lagna: {
    fill: "rgba(200,144,42,0.18)",
    fillAlt: "rgba(200,144,42,0.10)",
    stroke: "rgba(200,144,42,0.45)",
    label: "#e8b86d",
    dot: "#c8902a",
  },
  chandra: {
    fill: "rgba(180,185,230,0.14)",
    fillAlt: "rgba(180,185,230,0.08)",
    stroke: "rgba(180,185,230,0.38)",
    label: "#b4b9e6",
    dot: "#9096c8",
  },
  surya: {
    fill: "rgba(220,130,60,0.14)",
    fillAlt: "rgba(220,130,60,0.08)",
    stroke: "rgba(220,130,60,0.38)",
    label: "#e8945a",
    dot: "#dc823c",
  },
};

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const DEG = Math.PI / 180;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg - 90) * DEG; // 0° at top, clockwise
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function wedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number
): string {
  const p1 = polarToXY(cx, cy, outerR, startDeg);
  const p2 = polarToXY(cx, cy, outerR, endDeg);
  const p3 = polarToXY(cx, cy, innerR, endDeg);
  const p4 = polarToXY(cx, cy, innerR, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Tooltip state
// ---------------------------------------------------------------------------

interface TooltipData {
  layerLabel: string;
  house: SudarshanHouse;
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Single layer renderer
// ---------------------------------------------------------------------------

interface LayerProps {
  layer: SudarshanLayer;
  cx: number;
  cy: number;
  innerR: number;
  outerR: number;
  visible: boolean;
  onHover: (data: TooltipData) => void;
  onLeave: () => void;
}

function ChakraLayer({ layer, cx, cy, innerR, outerR, visible, onHover, onLeave }: LayerProps) {
  const theme = LAYER_THEMES[layer.name];
  const midR = (innerR + outerR) / 2;

  return (
    <g opacity={visible ? 1 : 0.18} style={{ transition: "opacity 0.3s" }}>
      {layer.houses.map((h) => {
        const startDeg = (h.rotatedHouse - 1) * 30;
        const endDeg = h.rotatedHouse * 30;
        const midDeg = startDeg + 15;
        const isAlt = h.rotatedHouse % 2 === 0;
        const fill = isAlt ? theme.fillAlt : theme.fill;

        const textPos = polarToXY(cx, cy, midR, midDeg);
        const houseNumPos = polarToXY(cx, cy, midR + (outerR - midR) * 0.45, midDeg);
        // Sign label — close to the inner boundary of this ring
        const signLabelPos = polarToXY(cx, cy, innerR + (outerR - innerR) * 0.1, midDeg);
        const planetLineSpacing = 13;

        const planetTexts = h.planets.map((p) => {
          const abbr = PLANET_ABBREV[p.name];
          return p.isRetrograde ? `${abbr}®` : abbr;
        });

        return (
          <g key={h.rotatedHouse}>
            <path
              d={wedgePath(cx, cy, innerR, outerR, startDeg, endDeg)}
              fill={fill}
              stroke={theme.stroke}
              strokeWidth={0.8}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget.closest("svg") as SVGSVGElement)
                  ?.getBoundingClientRect();
                onHover({
                  layerLabel: layer.label,
                  house: h,
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0),
                });
              }}
              onMouseLeave={onLeave}
            />
            {/* House number — near outer edge */}
            <text
              x={houseNumPos.x}
              y={houseNumPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={outerR > 160 ? 11 : 9}
              fontWeight="600"
              fill={theme.label}
              fontFamily="var(--font-cinzel, 'Cinzel', serif)"
              style={{ userSelect: "none" }}
            >
              {h.rotatedHouse}
            </text>
            {/* Sign abbreviation — near inner edge */}
            <text
              x={signLabelPos.x}
              y={signLabelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={outerR > 160 ? 8 : 6.5}
              fill={theme.label}
              opacity={0.55}
              fontFamily="var(--font-dm-mono, 'DM Mono', monospace)"
              style={{ userSelect: "none" }}
            >
              {SIGN_ABBREV[h.sign]}
            </text>
            {/* Planet abbreviations stacked at midR */}
            {planetTexts.map((abbr, i) => {
              const offset = (i - (planetTexts.length - 1) / 2) * planetLineSpacing;
              return (
                <text
                  key={abbr + i}
                  x={textPos.x}
                  y={textPos.y + offset}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={outerR > 160 ? 10 : 8}
                  fill="var(--cc-text-primary, #ede9dc)"
                  fontFamily="var(--font-dm-mono, 'DM Mono', monospace)"
                  style={{ userSelect: "none" }}
                >
                  {abbr}
                </text>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  result: SudarshanChakraResult;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SudarshanChakraChart({ result }: Props) {
  const [visible, setVisible] = useState<Record<SudarshanLayer["name"], boolean>>({
    lagna: true,
    chandra: true,
    surya: true,
  });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const toggleLayer = (name: SudarshanLayer["name"]) => {
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleHover = useCallback((data: TooltipData) => setTooltip(data), []);
  const handleLeave = useCallback(() => setTooltip(null), []);

  const SIZE = 600;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const outerR = SIZE / 2 - 28;
  const middleR = outerR * 0.68;
  const innerR = outerR * 0.36;
  const coreR = innerR * 0.38;

  const LAYERS: { layer: SudarshanLayer; inner: number; outer: number }[] = [
    { layer: result.suryaChakra, inner: middleR, outer: outerR },
    { layer: result.chandraChakra, inner: innerR, outer: middleR },
    { layer: result.lagnaChakra, inner: coreR, outer: innerR },
  ];

  return (
    <div className="sudarshan-chakra-wrapper">
      {/* Layer toggles */}
      <div className="sudarshan-toggles">
        {(["lagna", "chandra", "surya"] as const).map((name) => {
          const theme = LAYER_THEMES[name];
          const labels: Record<SudarshanLayer["name"], string> = {
            lagna: "Lagna",
            chandra: "Chandra",
            surya: "Surya",
          };
          return (
            <button
              key={name}
              type="button"
              className="sudarshan-toggle-btn"
              data-active={visible[name] ? "true" : "false"}
              onClick={() => toggleLayer(name)}
              style={{ "--layer-color": theme.dot } as React.CSSProperties}
            >
              <span className="sudarshan-toggle-dot" />
              {labels[name]}
            </button>
          );
        })}
      </div>

      {/* SVG Chart */}
      <div className="sudarshan-svg-wrapper" ref={svgWrapperRef} style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width="100%"
          style={{ maxWidth: SIZE, display: "block", margin: "0 auto" }}
          aria-label="Sudarshana Chakra — three concentric ring chart"
        >
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 4}
            fill="var(--cc-bg-card, #0d1022)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />

          {/* Spokes */}
          {Array.from({ length: 12 }, (_, i) => {
            const p = polarToXY(cx, cy, outerR, i * 30);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.5}
              />
            );
          })}

          {/* Render layers outer → inner so inner is on top */}
          {LAYERS.map(({ layer, inner, outer }) => (
            <ChakraLayer
              key={layer.name}
              layer={layer}
              cx={cx}
              cy={cy}
              innerR={inner}
              outerR={outer}
              visible={visible[layer.name]}
              onHover={handleHover}
              onLeave={handleLeave}
            />
          ))}

          {/* Ring separators */}
          {[coreR, innerR, middleR, outerR].map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
          ))}

          {/* Centre badge */}
          <circle cx={cx} cy={cy} r={coreR} fill="var(--cc-bg-base, #080a14)" />
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fontSize={11}
            fontWeight="700"
            fill="var(--cc-amber-light, #e8b86d)"
            fontFamily="var(--font-cinzel, 'Cinzel', serif)"
            style={{ userSelect: "none" }}
          >
            Sudarshana
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontSize={9}
            fill="var(--cc-text-secondary, #8a8678)"
            fontFamily="var(--font-cinzel, 'Cinzel', serif)"
            style={{ userSelect: "none" }}
          >
            Chakra
          </text>

          {/* Ring labels (arc text via textPath) */}
          {[
            { r: (coreR + innerR) / 2, label: "LAGNA", name: "lagna" as const },
            { r: (innerR + middleR) / 2, label: "CHANDRA", name: "chandra" as const },
            { r: (middleR + outerR) / 2, label: "SURYA", name: "surya" as const },
          ].map(({ r, label, name }) => {
            const pathId = `arc-label-${name}`;
            const startP = polarToXY(cx, cy, r, 175);
            const endP = polarToXY(cx, cy, r, 180);
            return (
              <g key={name} opacity={visible[name] ? 0.55 : 0.18}>
                <defs>
                  <path
                    id={pathId}
                    d={`M ${startP.x} ${startP.y} A ${r} ${r} 0 0 1 ${endP.x} ${endP.y}`}
                  />
                </defs>
                <text
                  fontSize={7}
                  fill={LAYER_THEMES[name].label}
                  fontFamily="var(--font-cinzel, 'Cinzel', serif)"
                  letterSpacing="2"
                  style={{ userSelect: "none" }}
                >
                  <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                    {label}
                  </textPath>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="sudarshan-tooltip"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 10,
            }}
          >
            <div className="sudarshan-tooltip-layer">{tooltip.layerLabel}</div>
            <div className="sudarshan-tooltip-house">
              House {tooltip.house.rotatedHouse} — {SIGN_FULL[tooltip.house.sign]}
            </div>
            {tooltip.house.planets.length > 0 ? (
              <ul className="sudarshan-tooltip-planets">
                {tooltip.house.planets.map((p) => (
                  <li key={p.name}>
                    <span className="sudarshan-tooltip-abbr">{PLANET_ABBREV[p.name]}</span>
                    {PLANET_FULL[p.name]}
                    {p.isRetrograde && <span className="sudarshan-tooltip-retro">® Retrograde</span>}
                    <span className="sudarshan-tooltip-deg">{p.degreeDMSFormatted}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sudarshan-tooltip-empty">No planets</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .sudarshan-chakra-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sudarshan-toggles {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .sudarshan-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.12);
          background: var(--cc-bg-card, #0d1022);
          color: var(--cc-text-secondary, #8a8678);
          font-size: 12px;
          font-family: var(--font-cinzel, 'Cinzel', serif);
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .sudarshan-toggle-btn[data-active='true'] {
          border-color: var(--layer-color);
          color: var(--cc-text-primary, #ede9dc);
        }
        .sudarshan-toggle-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--layer-color);
          flex-shrink: 0;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .sudarshan-toggle-btn[data-active='true'] .sudarshan-toggle-dot {
          opacity: 1;
        }
        .sudarshan-svg-wrapper {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .sudarshan-tooltip {
          position: absolute;
          pointer-events: none;
          background: var(--cc-bg-card, #0d1022);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 10px 14px;
          min-width: 160px;
          max-width: 220px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          z-index: 10;
          animation: tooltip-in 0.12s ease;
        }
        @keyframes tooltip-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sudarshan-tooltip-layer {
          font-family: var(--font-cinzel, 'Cinzel', serif);
          font-size: 10px;
          color: var(--cc-text-tertiary, #4e4c44);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .sudarshan-tooltip-house {
          font-size: 13px;
          font-weight: 600;
          color: var(--cc-text-primary, #ede9dc);
          margin-bottom: 8px;
        }
        .sudarshan-tooltip-planets {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sudarshan-tooltip-planets li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--cc-text-secondary, #8a8678);
        }
        .sudarshan-tooltip-abbr {
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 11px;
          color: var(--cc-amber-light, #e8b86d);
          min-width: 20px;
        }
        .sudarshan-tooltip-retro {
          font-size: 10px;
          color: var(--cc-red-dim, rgba(180,60,60,0.9));
          margin-left: 2px;
        }
        .sudarshan-tooltip-deg {
          font-family: var(--font-dm-mono, 'DM Mono', monospace);
          font-size: 10px;
          color: var(--cc-text-tertiary, #4e4c44);
          margin-left: auto;
        }
        .sudarshan-tooltip-empty {
          font-size: 12px;
          color: var(--cc-text-tertiary, #4e4c44);
          margin: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

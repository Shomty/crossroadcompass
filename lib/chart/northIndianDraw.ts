/**
 * North Indian (diamond) Vedic chart SVG — ported from instructions/NI/draw/draw.service.ts
 * (NestJS-free; cosmic theme for Crossroads Compass).
 */

import type { HouseNumber, Planet, VedicChartCalculations } from "openastrology-library";

export type ZodiacSignName =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface PlanetGlyph {
  abbrev: string;
  isRetrograde: boolean;
  isCombust: boolean;
}

export interface NorthIndianHouseContent {
  number: HouseNumber;
  natal: PlanetGlyph[];
  transit?: PlanetGlyph[];
}

export interface NorthIndianChartInput {
  lagna: ZodiacSignName;
  houses: NorthIndianHouseContent[];
}

const PLANET_KEYS = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
  "rahu",
  "ketu",
] as const satisfies readonly Planet[];

const ABBREV: Record<(typeof PLANET_KEYS)[number], string> = {
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

function planetGlyphFromKey(k: Planet, pl: { isRetrograde: boolean; isCombust: boolean }): PlanetGlyph {
  return {
    abbrev: ABBREV[k as keyof typeof ABBREV] ?? String(k).slice(0, 2),
    isRetrograde: pl.isRetrograde,
    isCombust: pl.isCombust,
  };
}

function planetsInHouse(chart: VedicChartCalculations, house: HouseNumber): PlanetGlyph[] {
  const out: PlanetGlyph[] = [];
  if (!chart.planets) return out;
  for (const k of PLANET_KEYS) {
    const pl = chart.planets[k];
    if (pl && pl.house === house) out.push(planetGlyphFromKey(k, pl));
  }
  return out;
}

/**
 * Build draw input from natal chart and optional transit chart (same house system).
 */
export function vedicChartsToNorthIndianInput(
  natal: VedicChartCalculations,
  transit: VedicChartCalculations | null | undefined,
): NorthIndianChartInput {
  const lagna = natal.ascendant?.sign as ZodiacSignName | undefined;
  const houses: NorthIndianHouseContent[] = [];
  for (let n = 1; n <= 12; n++) {
    const h = n as HouseNumber;
    const nat = planetsInHouse(natal, h);
    const tr = transit ? planetsInHouse(transit, h) : [];
    houses.push({
      number: h,
      natal: nat,
      transit: tr.length > 0 ? tr : undefined,
    });
  }
  return {
    lagna: lagna ?? "aries",
    houses,
  };
}

function formatGlyph(g: PlanetGlyph): string {
  let text = g.abbrev;
  if (g.isRetrograde && g.isCombust) text += "(RC)";
  else if (g.isRetrograde) text += "(R)";
  else if (g.isCombust) text += "(C)";
  return text;
}

/**
 * House label / planet anchors — normalized cell centers for conventional North Indian Rāśi chart:
 * House 1 (Lagna) at top (12 o’clock), then counter‑clockwise 2–12. Matches common Parāśara / JH-style diamonds.
 */
const BASE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0.5, y: 0.25 },
  2: { x: 0.25, y: 0.1 },
  3: { x: 0.11, y: 0.25 },
  4: { x: 0.25, y: 0.5 },
  5: { x: 0.11, y: 0.75 },
  6: { x: 0.25, y: 0.9 },
  7: { x: 0.5, y: 0.75 },
  8: { x: 0.75, y: 0.9 },
  9: { x: 0.89, y: 0.75 },
  10: { x: 0.75, y: 0.5 },
  11: { x: 0.89, y: 0.25 },
  12: { x: 0.75, y: 0.1 },
};

function calculateOptimalLayout(planetCount: number): number {
  if (planetCount <= 4) return 1;
  return 2;
}

function generateChartStructure(svgWidth: number, svgHeight: number): string {
  const borderWidth = 4;
  const halfBorder = borderWidth / 2;
  const L = halfBorder;
  const R = svgWidth - halfBorder;
  const T = halfBorder;
  const B = svgHeight - halfBorder;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  // Same geometry as instructions/north_indian_rashi_chart.tsx: main X + diamond through edge midpoints.
  return `
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" class="ni-bg"/>
  <rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" class="ni-outer"/>
  <line x1="${L}" y1="${T}" x2="${R}" y2="${B}" class="ni-line"/>
  <line x1="${R}" y1="${T}" x2="${L}" y2="${B}" class="ni-line"/>
  <line x1="${cx}" y1="${T}" x2="${R}" y2="${cy}" class="ni-line"/>
  <line x1="${R}" y1="${cy}" x2="${cx}" y2="${B}" class="ni-line"/>
  <line x1="${cx}" y1="${B}" x2="${L}" y2="${cy}" class="ni-line"/>
  <line x1="${L}" y1="${cy}" x2="${cx}" y2="${T}" class="ni-line"/>
`;
}

function generateHouseContent(
  house: NorthIndianHouseContent,
  svgWidth: number,
  svgHeight: number,
): string {
  const basePos = BASE_POSITIONS[house.number];
  if (!basePos) return "";

  const natal = house.natal ?? [];
  const transit = house.transit ?? [];

  const centerX = basePos.x * svgWidth;
  const centerY = basePos.y * svgHeight;
  const scale = Math.min(svgWidth, svgHeight) / 480;

  // Whole-sign North Indian: rāśi index (1–12) is drawn separately as the “house”.
  // This layer is planets only; empty houses have no text here (rāśi still shows).
  if (natal.length === 0 && transit.length === 0) return "";

  const lineHeightNatal = 20 * scale;
  const lineHeightTransit = 16 * scale;
  const padding = 4 * scale;

  type Row = { text: string; kind: "natal" | "transit" };
  const rows: Row[] = [];

  if (natal.length > 0) {
    const perRow = calculateOptimalLayout(natal.length);
    for (let row = 0; row < Math.ceil(natal.length / perRow); row++) {
      const slice = natal.slice(row * perRow, row * perRow + perRow);
      rows.push({ text: slice.map(formatGlyph).join(", "), kind: "natal" });
    }
  }
  if (transit.length > 0) {
    const perRow = calculateOptimalLayout(transit.length);
    for (let row = 0; row < Math.ceil(transit.length / perRow); row++) {
      const slice = transit.slice(row * perRow, row * perRow + perRow);
      rows.push({
        text: `T·${slice.map(formatGlyph).join(", ")}`,
        kind: "transit",
      });
    }
  }

  const natalRows = rows.filter((r) => r.kind === "natal");
  const transitRows = rows.filter((r) => r.kind === "transit");

  let totalHeight = padding * 2;
  for (const _ of natalRows) totalHeight += lineHeightNatal;
  if (transitRows.length > 0 && natalRows.length > 0) totalHeight += padding * 0.5;
  for (const _ of transitRows) totalHeight += lineHeightTransit;

  // Slightly below cell centroid so glyphs sit under the rāśi numeral drawn beneath.
  const blockStartY = centerY + 10 * scale - totalHeight / 2;
  let y = blockStartY + padding;

  let content = "";
  for (const r of natalRows) {
    y += lineHeightNatal * 0.72;
    content += `<text x="${centerX}" y="${y}" class="ni-planet-natal"><title>${escapeXml(r.text)}</title>${escapeXml(r.text)}</text>\n`;
    y += lineHeightNatal * 0.28;
  }
  if (transitRows.length > 0 && natalRows.length > 0) y += padding * 0.5;
  for (const r of transitRows) {
    y += lineHeightTransit * 0.72;
    content += `<text x="${centerX}" y="${y}" class="ni-planet-transit"><title>Transit: ${escapeXml(r.text.replace(/^T·/, ""))}</title>${escapeXml(r.text)}</text>\n`;
    y += lineHeightTransit * 0.28;
  }

  return content;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ZODIAC_ORDER: ZodiacSignName[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

function zodiacTitleName(sign: ZodiacSignName): string {
  return sign.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * One numeral per compartment: whole-sign rāśi index (1 = Aries … 12 = Pisces).
 * In North Indian style the sign *is* the house; compartment order is fixed, signs rotate with Lagna.
 */
function generateZodiacSigns(lagna: ZodiacSignName, svgWidth: number, svgHeight: number): string {
  const lagnaIndex = ZODIAC_ORDER.indexOf(lagna);
  if (lagnaIndex === -1) return "";

  const scale = Math.min(svgWidth, svgHeight) / 480;
  let content = "";
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const zodiacIndex = (lagnaIndex + houseNum - 1) % 12;
    const zodiacNumber = zodiacIndex + 1;
    const signName = ZODIAC_ORDER[zodiacIndex];
    const pos = BASE_POSITIONS[houseNum];
    if (!pos) continue;
    const pull = 0.32;
    const x = (0.5 + (pos.x - 0.5) * (1 - pull)) * svgWidth;
    const y = (0.5 + (pos.y - 0.5) * (1 - pull)) * svgHeight - 20 * scale;
    const title = `Rāśi ${zodiacNumber} (${zodiacTitleName(signName)}) — whole-sign house from Lagna`;
    content += `<text x="${x}" y="${y}" class="ni-zodiac"><title>${escapeXml(title)}</title>${zodiacNumber}</text>\n`;
  }
  return content;
}

/** Unified gold stroke for frame + inner diamond */
const NI_STROKE = "rgba(200, 135, 58, 0.42)";
const NI_TEXT = "rgba(240, 220, 160, 0.92)";

const STYLE_BLOCK = `
  .ni-bg { fill: transparent; stroke: none; }
  .ni-outer {
    fill: rgba(13, 18, 32, 0.55);
    stroke: ${NI_STROKE};
    stroke-width: 2.5;
  }
  .ni-line {
    stroke: ${NI_STROKE};
    stroke-width: 1.5;
    fill: none;
  }
  .ni-planet-natal {
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 11px;
    fill: ${NI_TEXT};
    text-anchor: middle;
  }
  .ni-planet-transit {
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 11px;
    fill: ${NI_TEXT};
    text-anchor: middle;
  }
  .ni-zodiac {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    fill: ${NI_TEXT};
    text-anchor: middle;
    opacity: 0.9;
  }
`;

/**
 * Generate SVG string for North Indian chart (instruction geometry + app styling).
 */
export function generateNorthIndianChartSVG(
  input: NorthIndianChartInput,
  width = 480,
  height = 480,
): string {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="North Indian style Vedic chart">
  <defs><style>${STYLE_BLOCK}</style></defs>
`;
  svg += generateChartStructure(width, height);

  // Rāśi numerals first (whole-sign “house”), then planets on top.
  svg += generateZodiacSigns(input.lagna, width, height);
  for (const house of input.houses) {
    svg += generateHouseContent(house, width, height);
  }
  svg += "</svg>";
  return svg;
}

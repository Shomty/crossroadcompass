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
  highlightLagna?: boolean;
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

const BASE_POSITIONS: Record<
  number,
  { x: number; y: number }
> = {
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
  return `
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" class="ni-bg"/>
  <rect x="${halfBorder}" y="${halfBorder}" width="${svgWidth - borderWidth}" height="${svgHeight - borderWidth}" class="ni-outer"/>
  <line x1="${halfBorder}" y1="${halfBorder}" x2="${svgWidth - halfBorder}" y2="${svgHeight - halfBorder}" class="ni-line"/>
  <line x1="${halfBorder}" y1="${svgHeight - halfBorder}" x2="${svgWidth - halfBorder}" y2="${halfBorder}" class="ni-line"/>
  <line x1="${svgWidth / 2}" y1="${halfBorder}" x2="${halfBorder}" y2="${svgHeight / 2}" class="ni-line"/>
  <line x1="${svgWidth / 2}" y1="${halfBorder}" x2="${svgWidth - halfBorder}" y2="${svgHeight / 2}" class="ni-line"/>
  <line x1="${svgWidth / 2}" y1="${svgHeight - halfBorder}" x2="${halfBorder}" y2="${svgHeight / 2}" class="ni-line"/>
  <line x1="${svgWidth / 2}" y1="${svgHeight - halfBorder}" x2="${svgWidth - halfBorder}" y2="${svgHeight / 2}" class="ni-line"/>
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

  // Always render house number label (even when no planets occupy this house).
  let content = `<text x="${centerX}" y="${centerY - 22 * scale}" class="ni-house-num">${house.number}</text>\n`;

  if (natal.length === 0 && transit.length === 0) return content;

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

  const containerY = centerY - totalHeight / 2;
  let y = containerY + padding;

  for (const r of natalRows) {
    content += `<text x="${centerX}" y="${y + lineHeightNatal * 0.7}" class="ni-planet-natal"><title>${escapeXml(r.text)}</title>${escapeXml(r.text)}</text>\n`;
    y += lineHeightNatal;
  }
  if (transitRows.length > 0 && natalRows.length > 0) y += padding * 0.5;
  for (const r of transitRows) {
    content += `<text x="${centerX}" y="${y + lineHeightTransit * 0.7}" class="ni-planet-transit"><title>Transit: ${escapeXml(r.text.replace(/^T·/, ""))}</title>${escapeXml(r.text)}</text>\n`;
    y += lineHeightTransit;
  }

  return content;
}

/**
 * Generate a filled polygon highlight for house 1 (Lagna) in the North Indian diamond.
 * House 1 occupies the top triangle: top-center point, mid-left, mid-right.
 */
function generateLagnaHighlight(svgWidth: number, svgHeight: number): string {
  const hb = 2; // half border
  const cx = svgWidth / 2;
  const mx = svgWidth / 2;
  const top = hb;
  const midY = svgHeight / 2;
  // The top diamond triangle for house 1: top-center → left-center → right-center
  const points = `${cx},${top} ${hb},${midY} ${svgWidth - hb},${midY}`;
  return `<polygon points="${points}" class="ni-lagna-fill"/>\n`;
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

function generateZodiacSigns(lagna: ZodiacSignName, svgWidth: number, svgHeight: number): string {
  const lagnaIndex = ZODIAC_ORDER.indexOf(lagna);
  if (lagnaIndex === -1) return "";

  const zodiacSignFontSize = 12;
  const zodiacSignHalfSize = zodiacSignFontSize / 2;
  const offset = 15;

  const zodiacPositions: Record<
    number,
    { x: number; y: number; xOffset: number; yOffset: number }
  > = {
    1: { x: 0.5, y: 0.5, xOffset: 0, yOffset: -offset + zodiacSignHalfSize },
    2: { x: 0.25, y: 0.25, xOffset: 0, yOffset: -offset + zodiacSignHalfSize },
    3: { x: 0.25, y: 0.25, xOffset: -offset, yOffset: zodiacSignHalfSize },
    4: { x: 0.5, y: 0.5, xOffset: -offset, yOffset: zodiacSignHalfSize },
    5: { x: 0.25, y: 0.75, xOffset: -offset, yOffset: zodiacSignHalfSize },
    6: { x: 0.25, y: 0.75, xOffset: 0, yOffset: offset + zodiacSignHalfSize },
    7: { x: 0.5, y: 0.5, xOffset: 0, yOffset: offset + zodiacSignHalfSize },
    8: { x: 0.75, y: 0.75, xOffset: 0, yOffset: offset + zodiacSignHalfSize },
    9: { x: 0.75, y: 0.75, xOffset: offset, yOffset: zodiacSignHalfSize },
    10: { x: 0.5, y: 0.5, xOffset: offset, yOffset: zodiacSignHalfSize },
    11: { x: 0.75, y: 0.25, xOffset: offset, yOffset: zodiacSignHalfSize },
    12: { x: 0.75, y: 0.25, xOffset: 0, yOffset: -offset + zodiacSignHalfSize },
  };

  let content = "";
  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    const zodiacIndex = (lagnaIndex + houseNum - 1) % 12;
    const zodiacNumber = zodiacIndex + 1;
    const position = zodiacPositions[houseNum];
    if (!position) continue;
    const x = position.x * svgWidth + position.xOffset;
    const y = position.y * svgHeight + position.yOffset;
    content += `<text x="${x}" y="${y}" class="ni-zodiac"><title>House ${houseNum} sign</title>${zodiacNumber}</text>\n`;
  }
  return content;
}

const STYLE_BLOCK = `
  .ni-bg { fill: transparent; stroke: none; }
  .ni-outer {
    fill: rgba(13, 18, 32, 0.55);
    stroke: rgba(200, 135, 58, 0.45);
    stroke-width: 3;
  }
  .ni-line {
    stroke: rgba(200, 135, 58, 0.32);
    stroke-width: 1.25;
    fill: none;
  }
  .ni-planet-natal {
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 11px;
    fill: rgba(240, 220, 160, 0.95);
    text-anchor: middle;
  }
  .ni-planet-transit {
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 10px;
    fill: rgba(232, 185, 106, 0.92);
    text-anchor: middle;
    font-style: italic;
  }
  .ni-zodiac {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
    font-size: 12px;
    fill: rgba(200, 135, 58, 0.75);
    text-anchor: middle;
  }
  .ni-house-num {
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 9px;
    fill: rgba(200, 135, 58, 0.5);
    text-anchor: middle;
  }
  .ni-lagna-fill {
    fill: rgba(200, 135, 58, 0.07);
    stroke: rgba(200, 135, 58, 0.38);
    stroke-width: 1;
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

  // Lagna highlight drawn before planets so it sits behind text.
  if (input.highlightLagna !== false) {
    svg += generateLagnaHighlight(width, height);
  }

  for (const house of input.houses) {
    svg += generateHouseContent(house, width, height);
  }

  svg += generateZodiacSigns(input.lagna, width, height);
  svg += "</svg>";
  return svg;
}

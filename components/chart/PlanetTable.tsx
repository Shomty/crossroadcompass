"use client";

import { Fragment, useMemo, useState } from "react";
import type { Planet, PlanetaryPositions } from "openastrology-library";
import clsx from "clsx";

// ── Glyph tables ──────────────────────────────────────────────────────────────

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
};

const SIGN_GLYPH: Record<string, string> = {
  aries:       "♈",
  taurus:      "♉",
  gemini:      "♊",
  cancer:      "♋",
  leo:         "♌",
  virgo:       "♍",
  libra:       "♎",
  scorpio:     "♏",
  sagittarius: "♐",
  capricorn:   "♑",
  aquarius:    "♒",
  pisces:      "♓",
};

/** Planet-specific accent colors — matches SudarshanChakraPageClient palette */
const PLANET_BG: Record<string, string> = {
  Sun:     "rgba(232,148,90,0.15)",
  Moon:    "rgba(180,185,230,0.15)",
  Mars:    "rgba(220,80,80,0.15)",
  Mercury: "rgba(100,200,130,0.15)",
  Jupiter: "rgba(240,200,90,0.15)",
  Venus:   "rgba(230,150,200,0.15)",
  Saturn:  "rgba(130,130,170,0.15)",
  Rahu:    "rgba(140,100,230,0.15)",
  Ketu:    "rgba(80,190,180,0.15)",
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

/** Dignity badge styles — all dark-themed, no Tailwind dark: prefix needed */
const DIGNITY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Exalted:      { bg: "rgba(52,211,153,0.12)",  text: "#6ee7b7", border: "rgba(52,211,153,0.28)" },
  Own:          { bg: "rgba(96,165,250,0.12)",   text: "#93c5fd", border: "rgba(96,165,250,0.28)" },
  Moolatrikona: { bg: "rgba(96,165,250,0.12)",   text: "#93c5fd", border: "rgba(96,165,250,0.28)" },
  Friendly:     { bg: "rgba(45,212,191,0.10)",   text: "#5eead4", border: "rgba(45,212,191,0.25)" },
  Neutral:      { bg: "rgba(148,163,184,0.08)",  text: "rgba(232,224,208,0.55)", border: "rgba(148,163,184,0.2)" },
  Inimical:     { bg: "rgba(251,146,60,0.10)",   text: "#fbbf24", border: "rgba(251,146,60,0.25)" },
  Debilitated:  { bg: "rgba(248,113,113,0.12)",  text: "#fca5a5", border: "rgba(248,113,113,0.28)" },
};

const PLANETS: Planet[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

type SortKey = "house" | "name" | "sign" | "nakshatra" | "dignity";

interface Props {
  planets: PlanetaryPositions;
  onPlanetSelect?: (key: Planet | null) => void;
  transitPlanets?: PlanetaryPositions | null;
  /** Narrow column beside chart: smaller type, full width, transit rows match natal palette. */
  variant?: "default" | "panel";
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function DignityBadge({ dignity }: { dignity: string }) {
  const style = DIGNITY_STYLE[dignity] ?? DIGNITY_STYLE.Neutral;
  return (
    <span
      className="pt-dignity"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {dignity}
    </span>
  );
}

export function PlanetTable({ planets, onPlanetSelect, transitPlanets, variant = "default" }: Props) {
  const panel = variant === "panel";
  const [sortKey, setSortKey] = useState<SortKey>("house");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<Planet | null>(null);

  const rows = useMemo(() => {
    const list = PLANETS.map((k) => ({ key: k, p: planets[k] }));
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "house")      cmp = a.p.house - b.p.house;
      else if (sortKey === "name")  cmp = a.key.localeCompare(b.key);
      else if (sortKey === "sign")  cmp = a.p.sign.localeCompare(b.p.sign);
      else if (sortKey === "nakshatra") cmp = a.p.nakshatra.localeCompare(b.p.nakshatra);
      else if (sortKey === "dignity")   cmp = a.p.dignity.localeCompare(b.p.dignity);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [planets, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  }

  function SortTh({ k, label, className }: { k: SortKey; label: string; className?: string }) {
    return (
      <th className={clsx("pt-th", panel && "pt-th--panel", className)}>
        <button type="button" className="pt-th-btn" onClick={() => toggleSort(k)}>
          {label}
          {sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
        </button>
      </th>
    );
  }

  return (
    <div className={clsx("pt-scroll", panel && "min-w-0")}>
      <table className={clsx("pt-table", panel ? "min-w-0" : "min-w-[640px]")}>
        <thead>
          <tr>
            <SortTh k="name"      label="Planet" />
            <SortTh k="sign"      label="Sign" />
            <SortTh k="house"     label="House" className="pt-th--center" />
            <SortTh k="nakshatra" label="Nakshatra" />
            <th className={clsx("pt-th", panel && "pt-th--panel")}>Pada</th>
            <SortTh k="dignity" label="Dignity" />
            <th className={clsx("pt-th", panel && "pt-th--panel")} title="Retrograde">R</th>
            <th className={clsx("pt-th", panel && "pt-th--panel")}>Combust</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, p }, i) => {
            const tp = transitPlanets?.[key] ?? null;
            const pName = cap(key);
            const pBg   = PLANET_BG[pName]   ?? "rgba(200,168,76,0.1)";
            const pText = PLANET_TEXT[pName]  ?? "var(--gold, #e8b96a)";
            const pGlyph = PLANET_GLYPH[key] ?? "";
            const sGlyph = SIGN_GLYPH[p.sign.toLowerCase()] ?? "";

            return (
              <Fragment key={key}>
                {/* ── natal row ── */}
                <tr
                  className={clsx(
                    "pt-tr",
                    i % 2 === 0 ? "pt-tr--even" : "pt-tr--odd",
                    expanded === key && "pt-tr--expanded",
                  )}
                  onClick={() => {
                    const next = expanded === key ? null : key;
                    setExpanded(next);
                    onPlanetSelect?.(next);
                  }}
                >
                  {/* Planet */}
                  <td className="pt-td pt-td--planet">
                    <span className="pt-planet-glyph" style={{ color: pText }}>{pGlyph}</span>
                    <span className="pt-planet-badge" style={{ background: pBg, color: pText }}>{pName}</span>
                  </td>
                  {/* Sign */}
                  <td className="pt-td">
                    <span className="pt-sign-glyph">{sGlyph}</span>
                    <span className="pt-sign-name">{cap(p.sign)}</span>
                  </td>
                  {/* House */}
                  <td className="pt-td pt-td--center pt-td--mono">{p.house}</td>
                  {/* Nakshatra */}
                  <td className="pt-td pt-td--nakshatra">{cap(p.nakshatra)}</td>
                  {/* Pada */}
                  <td className="pt-td pt-td--mono pt-td--muted">{p.nakshatraPada}</td>
                  {/* Dignity */}
                  <td className="pt-td"><DignityBadge dignity={p.dignity} /></td>
                  {/* Retrograde */}
                  <td className="pt-td pt-td--center">
                    {p.isRetrograde && <span className="pt-retro">℞</span>}
                  </td>
                  {/* Combust */}
                  <td className="pt-td pt-td--center">
                    {p.isCombust && <span className="pt-combust" title="Combust">●</span>}
                  </td>
                </tr>

                {/* ── expanded detail row ── */}
                {expanded === key && (
                  <tr className="pt-tr pt-tr--detail">
                    <td colSpan={8} className="pt-td pt-td--detail">
                      <span className="pt-detail-item">Speed: {p.speed.toFixed(4)}°/day</span>
                      <span className="pt-detail-sep">·</span>
                      <span className="pt-detail-item">
                        Drishti:{" "}
                        {p.aspects.length === 0
                          ? "—"
                          : p.aspects.map((a, j) => (
                              <span key={j}>
                                {j > 0 ? " · " : ""}
                                house {a.house} ({a.aspect}°)
                              </span>
                            ))}
                      </span>
                    </td>
                  </tr>
                )}

                {/* ── transit row ── */}
                {tp != null && (
                  <tr className="pt-tr pt-tr--transit">
                    <td className="pt-td pt-td--planet">
                      <span className="pt-transit-badge">transit</span>
                      <span className="pt-planet-glyph" style={{ color: pText, opacity: 0.6 }}>{pGlyph}</span>
                      <span className="pt-td--muted">{pName}</span>
                    </td>
                    <td className="pt-td pt-td--muted">
                      <span className="pt-sign-glyph" style={{ opacity: 0.55 }}>{SIGN_GLYPH[tp.sign.toLowerCase()] ?? ""}</span>
                      {cap(tp.sign)}
                    </td>
                    <td className="pt-td pt-td--center pt-td--mono pt-td--muted">{tp.house}</td>
                    <td className="pt-td pt-td--muted">{cap(tp.nakshatra)}</td>
                    <td className="pt-td pt-td--mono pt-td--muted">{tp.nakshatraPada}</td>
                    <td className="pt-td"><DignityBadge dignity={tp.dignity} /></td>
                    <td className="pt-td pt-td--center">
                      {tp.isRetrograde && <span className="pt-retro" style={{ opacity: 0.7 }}>℞</span>}
                    </td>
                    <td className="pt-td pt-td--center">
                      {tp.isCombust && <span className="pt-combust" style={{ opacity: 0.7 }}>●</span>}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

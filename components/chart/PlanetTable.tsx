"use client";

import { Fragment, useMemo, useState } from "react";
import type { Planet, PlanetaryPositions } from "openastrology-library";
import clsx from "clsx";

const dignityColor: Record<string, string> = {
  Exalted: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  Own: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  Moolatrikona: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  Friendly: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
  Neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  Inimical: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200",
  Debilitated: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
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

export function PlanetTable({ planets, onPlanetSelect, transitPlanets, variant = "default" }: Props) {
  const panel = variant === "panel";
  const [sortKey, setSortKey] = useState<SortKey>("house");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<Planet | null>(null);

  const rows = useMemo(() => {
    const list = PLANETS.map((k) => ({ key: k, p: planets[k] }));
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "house") cmp = a.p.house - b.p.house;
      else if (sortKey === "name") cmp = a.key.localeCompare(b.key);
      else if (sortKey === "sign") cmp = a.p.sign.localeCompare(b.p.sign);
      else if (sortKey === "nakshatra") cmp = a.p.nakshatra.localeCompare(b.p.nakshatra);
      else if (sortKey === "dignity") cmp = a.p.dignity.localeCompare(b.p.dignity);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [planets, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  const thPad = panel ? "px-2 py-1.5" : "px-3 py-2.5";
  const tdPad = panel ? "px-2 py-1.5" : "px-3 py-2.5";

  function header(k: SortKey, label: string) {
    return (
      <th
        className={clsx(
          "cursor-pointer select-none text-left uppercase tracking-wider text-[var(--mist)]",
          thPad,
          panel ? "text-[10px]" : "text-xs",
        )}
      >
        <button type="button" className="hover:text-[rgba(232,185,106,0.95)]" onClick={() => toggleSort(k)}>
          {label}
          {sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
        </button>
      </th>
    );
  }

  return (
    <div className={clsx("overflow-x-auto", panel && "min-w-0")}>
      <table
        className={clsx(
          "chart-data-table w-full border-collapse",
          panel ? "min-w-0 text-xs" : "min-w-[640px] text-sm",
        )}
      >
        <thead>
          <tr className="border-b border-[rgba(200,135,58,0.22)]">
            {header("name", "Planet")}
            {header("sign", "Sign")}
            {header("house", "House")}
            {header("nakshatra", "Nakshatra")}
            <th
              className={clsx(
                "text-left uppercase tracking-wider text-[var(--mist)]",
                thPad,
                panel ? "text-[10px]" : "text-xs",
              )}
            >
              Pada
            </th>
            {header("dignity", "Dignity")}
            <th
              className={clsx(
                "text-left uppercase tracking-wider text-[var(--mist)]",
                thPad,
                panel ? "text-[10px]" : "text-xs",
              )}
            >
              R
            </th>
            <th
              className={clsx(
                "text-left uppercase tracking-wider text-[var(--mist)]",
                thPad,
                panel ? "text-[10px]" : "text-xs",
              )}
            >
              Combust
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, p }) => {
            const tp = transitPlanets?.[key] ?? null;
            return (
              <Fragment key={key}>
                <tr
                  className={clsx(
                    "cursor-pointer border-b border-[rgba(200,135,58,0.12)] hover:bg-[rgba(200,135,58,0.06)]",
                    expanded === key && "bg-[rgba(200,135,58,0.1)]"
                  )}
                  onClick={() => {
                    const next = expanded === key ? null : key;
                    setExpanded(next);
                    onPlanetSelect?.(next);
                  }}
                >
                  <td className={clsx(tdPad, "font-medium text-[var(--cream)]")}>{cap(key)}</td>
                  <td className={tdPad}>{cap(p.sign)}</td>
                  <td className={tdPad}>{p.house}</td>
                  <td className={tdPad}>{cap(p.nakshatra)}</td>
                  <td className={tdPad}>{p.nakshatraPada}</td>
                  <td className={tdPad}>
                    <span
                      className={clsx(
                        "rounded px-1.5 py-0.5 text-xs",
                        dignityColor[p.dignity] ?? "bg-gray-100 text-gray-600"
                      )}
                    >
                      {p.dignity}
                    </span>
                  </td>
                  <td className={clsx(tdPad, "font-medium text-amber-600")}>{p.isRetrograde ? "(R)" : ""}</td>
                  <td className={clsx(tdPad, "text-red-500")}>{p.isCombust ? "●" : ""}</td>
                </tr>
                {expanded === key && (
                  <tr className="border-b border-[rgba(200,135,58,0.12)] bg-[rgba(200,135,58,0.06)]">
                    <td colSpan={8} className={clsx(panel ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm", "text-[var(--mist)]")}>
                      <div className="mb-1">Speed: {p.speed.toFixed(4)}°/day</div>
                      <div>
                        Aspects:{" "}
                        {p.aspects.length === 0
                          ? "—"
                          : p.aspects.map((a, i) => (
                              <span key={i}>
                                {i > 0 ? " · " : ""}
                                houses {a.house} ({a.aspect}°)
                              </span>
                            ))}
                      </div>
                    </td>
                  </tr>
                )}
                {tp != null && (
                  <tr
                    className={clsx(
                      "border-b border-[rgba(200,135,58,0.12)]",
                      panel ? "bg-[rgba(200,135,58,0.04)]" : "bg-[rgba(60,120,220,0.06)]",
                    )}
                  >
                    <td className={clsx(tdPad, "pl-5 text-[var(--mist)]", !panel && "text-[rgba(130,180,255,0.75)]")}>
                      <span
                        className={clsx(
                          "mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium",
                          panel
                            ? "border border-[rgba(200,135,58,0.35)] text-[var(--cream)]"
                            : "bg-[rgba(60,120,220,0.25)] text-[rgba(130,180,255,0.9)]",
                        )}
                      >
                        transit
                      </span>
                      {cap(key)}
                    </td>
                    <td className={clsx(tdPad, panel ? "text-[var(--mist)]" : "text-[rgba(130,180,255,0.75)]")}>
                      {cap(tp.sign)}
                    </td>
                    <td className={clsx(tdPad, panel ? "text-[var(--mist)]" : "text-[rgba(130,180,255,0.75)]")}>
                      {tp.house}
                    </td>
                    <td className={clsx(tdPad, panel ? "text-[var(--mist)]" : "text-[rgba(130,180,255,0.75)]")}>
                      {cap(tp.nakshatra)}
                    </td>
                    <td className={clsx(tdPad, panel ? "text-[var(--mist)]" : "text-[rgba(130,180,255,0.75)]")}>
                      {tp.nakshatraPada}
                    </td>
                    <td className={tdPad}>
                      <span
                        className={clsx(
                          "rounded px-1.5 py-0.5 text-xs",
                          panel ? "" : "opacity-75",
                          dignityColor[tp.dignity] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {tp.dignity}
                      </span>
                    </td>
                    <td
                      className={clsx(
                        tdPad,
                        "font-medium text-amber-600",
                        !panel && "opacity-75",
                      )}
                    >
                      {tp.isRetrograde ? "(R)" : ""}
                    </td>
                    <td className={clsx(tdPad, "text-red-500", !panel && "opacity-75")}>{tp.isCombust ? "●" : ""}</td>
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

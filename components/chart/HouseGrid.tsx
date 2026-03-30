"use client";

import { useState } from "react";
import type { HouseInfo, HouseNumber, HousePositions } from "openastrology-library";
import { HOUSE_TYPE_BY_NUMBER, HOUSE_TYPE_LABELS, VEDIC_HOUSE_NAMES } from "@/lib/astro/houseLabels";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function emptyHouse(n: HouseNumber): HouseInfo {
  return {
    number: n,
    cusp: 0,
    sign: "aries",
    lord: "unknown",
    planets: [],
    strength: 0,
    significance: [],
  };
}

function HouseCard({
  houseNumber,
  house,
}: {
  houseNumber: HouseNumber;
  house: HouseInfo;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeKey = HOUSE_TYPE_BY_NUMBER[houseNumber] ?? "Regular";
  const badge = HOUSE_TYPE_LABELS[typeKey] ?? HOUSE_TYPE_LABELS.Regular;
  const resident = house.planets.length
    ? house.planets.map((n) => cap(n)).join(", ")
    : "—";
  /* Library uses 0–100 scale (see openastrology calculateHouseStrength), not 0–1 */
  const strengthPct = Math.round(Math.min(100, Math.max(0, house.strength)));
  const tier =
    house.strength >= 75 ? "Strong" : house.strength >= 40 ? "Moderate" : "Weak";
  const barColor =
    house.strength >= 75
      ? "bg-emerald-400/80"
      : house.strength >= 40
        ? "bg-amber-400/85"
        : "bg-rose-400/75";

  const tags = house.significance ?? [];
  const showTags = expanded ? tags : tags.slice(0, 4);

  const vedicLine = VEDIC_HOUSE_NAMES[houseNumber] ?? "";

  return (
    <article className="chart-bp-card chart-bp-card--houses flex flex-col gap-3.5 p-4 sm:p-[1.125rem_1.25rem]">
      <header className="flex flex-col gap-2.5">
        <div className="min-w-0">
          <p className="cc-title-card text-[var(--cream)]">House {houseNumber}</p>
          <p className="mt-1 text-[var(--type-small)] leading-snug text-[rgba(240,220,160,0.88)]">{vedicLine}</p>
        </div>
        <span
          className={`house-type-badge ${badge.className}`}
          title={`House type: ${badge.label}`}
        >
          {badge.label}
        </span>
      </header>

      <dl className="grid grid-cols-2 items-start gap-x-3 gap-y-2.5 border-t border-[rgba(200,135,58,0.12)] pt-3 sm:gap-x-4">
        <dt className="ui-label self-start text-left text-[var(--mist)]">Sign</dt>
        <dd className="min-w-0 text-left text-[var(--type-body)] leading-snug text-[var(--cream)]">
          {cap(house.sign)}
        </dd>
        <dt className="ui-label self-start text-left text-[var(--mist)]">Lord</dt>
        <dd className="min-w-0 text-left text-[var(--type-body)] leading-snug text-[var(--cream)]">
          {cap(house.lord)}
        </dd>
        <dt className="ui-label self-start text-left text-[var(--mist)]">Planets</dt>
        <dd className="min-w-0 text-left text-[var(--type-body)] leading-relaxed text-[var(--cream)]">
          {resident}
        </dd>
      </dl>

      <div>
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <span className="ui-label text-[var(--mist)]">Bhava strength</span>
          <span className="text-[var(--type-small)] text-[var(--cream)]">
            {tier}
            <span className="text-[var(--muted)]"> · </span>
            <span className="font-mono tabular-nums text-[rgba(232,185,106,0.95)]">{strengthPct}%</span>
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]"
          role="presentation"
        >
          <div className={`h-full rounded-full transition-[width] ${barColor}`} style={{ width: `${strengthPct}%` }} />
        </div>
        <p className="mt-1.5 max-w-none text-[11px] font-normal leading-relaxed text-[var(--muted)] sm:text-[0.8125rem] sm:leading-relaxed">
          Relative to this chart (0–100). Higher = more supportive emphasis in timing techniques.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="border-t border-[rgba(200,135,58,0.1)] pt-3">
          <p className="ui-label mb-2 text-[var(--mist)]">Themes</p>
          <ul className="flex flex-wrap gap-1.5">
            {showTags.map((t, i) => (
              <li
                key={i}
                className="rounded-md border border-[rgba(200,135,58,0.14)] bg-[rgba(13,18,32,0.35)] px-2 py-1 text-[var(--type-small)] leading-snug text-[rgba(232,224,208,0.82)]"
              >
                {t}
              </li>
            ))}
          </ul>
          {tags.length > 4 && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-2 text-left text-[var(--type-small)] text-[rgba(232,185,106,0.9)] underline-offset-2 hover:underline"
            >
              {expanded ? "Show fewer themes" : `Show all ${tags.length} themes`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

interface Props {
  houses: HousePositions | null | undefined;
}

export function HouseGrid({ houses }: Props) {
  if (houses == null) {
    return (
      <p className="text-muted-chart">House data is not available for this chart.</p>
    );
  }

  return (
    <div className="chart-bp-stack">
      <div className="chart-bp-hero">
        <span className="chart-bp-hero-star" aria-hidden>
          ✦
        </span>
        <span className="chart-bp-hero-title">Twelve houses (bhāva)</span>
        <span className="chart-bp-hero-sub">
          Sign on the cusp, ruling planet, who sits there, and a strength score — read top to bottom, left to
          right (house 1 → 12).
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => {
          const n = (i + 1) as HouseNumber;
          return <HouseCard key={n} houseNumber={n} house={houses[n] ?? emptyHouse(n)} />;
        })}
      </div>
    </div>
  );
}

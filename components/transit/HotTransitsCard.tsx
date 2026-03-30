"use client";
// STATUS: done | FE-09

import type { VedicChartCalculations, HouseNumber } from "openastrology-library";

interface Props {
  natalChart: VedicChartCalculations;
  transitChart: VedicChartCalculations;
}

const KENDRA_TRIKONA: HouseNumber[] = [1, 4, 5, 7, 9, 10];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface HotTransit {
  planet: string;
  transitSign: string;
  natalHouse: HouseNumber | null;
  type: "Kendra/Trikona" | "Other";
}

function findHotTransits(natal: VedicChartCalculations, transit: VedicChartCalculations): HotTransit[] {
  const result: HotTransit[] = [];
  const transitPlanets = transit.planets ?? {};
  const natalHouses = natal.houses ?? {};

  for (const [planetName, transitPos] of Object.entries(transitPlanets)) {
    if (!transitPos) continue;
    const transitSign = transitPos.sign;

    // Find which natal house has this sign
    let natalHouse: HouseNumber | null = null;
    for (const [hNum, hInfo] of Object.entries(natalHouses)) {
      if (hInfo?.sign === transitSign) {
        natalHouse = Number(hNum) as HouseNumber;
        break;
      }
    }

    if (natalHouse && KENDRA_TRIKONA.includes(natalHouse)) {
      result.push({ planet: planetName, transitSign, natalHouse, type: "Kendra/Trikona" });
    }
  }

  return result;
}

/**
 * Highlights planets transiting Kendra (1,4,7,10) or Trikona (1,5,9) houses
 * of the natal chart — considered particularly impactful in Jyotish.
 */
export function HotTransitsCard({ natalChart, transitChart }: Props) {
  const hot = findHotTransits(natalChart, transitChart);

  if (hot.length === 0) {
    return (
      <div className="rounded border border-indigo-500/15 px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--mist)]">Planetary Activity</p>
        <p className="mt-1 text-sm text-[var(--mist)]">
          A relatively quieter day — no planets transiting your key natal houses right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-amber-500/20 bg-amber-500/05 px-4 py-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-300/80">
        Active Transits · {hot.length} key {hot.length === 1 ? "influence" : "influences"}
      </p>
      <ul className="space-y-1.5">
        {hot.map((t, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-[var(--cream)]">{cap(t.planet)}</span>
            <span className="text-[var(--mist)]">in {cap(t.transitSign)}</span>
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] text-amber-300">
              House {t.natalHouse} · {t.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

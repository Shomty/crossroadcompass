"use client";
// STATUS: done | FE-05

import type { PlanetDasha } from "openastrology-library";
import { DASHA_LABELS } from "@/lib/astro/dashaLabels";

interface Props {
  mahadasha: PlanetDasha;
}

function fmtDate(d: Date | unknown): string {
  const dt = d instanceof Date ? d : new Date(d as string);
  return dt.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function remainingLabel(end: Date | unknown): string {
  const endDate = end instanceof Date ? end : new Date(end as string);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs <= 0) return "Ended";
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 30) return `${days}d left`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months}mo left`;
  const yrs = (days / 365.25).toFixed(1);
  return `${yrs}y left`;
}

/**
 * Expandable list of Antardasha sub-periods within a Mahadasha.
 * Highlights the currently active sub-period.
 */
export function AntardashaList({ mahadasha }: Props) {
  const subPeriods = mahadasha.subPeriods ?? [];
  const now = new Date();

  if (subPeriods.length === 0) {
    return <p className="text-xs text-[var(--mist)]">Sub-period data unavailable.</p>;
  }

  return (
    <ul className="mt-2 space-y-1 border-l-2 border-[rgba(200,135,58,0.35)] pl-3">
      {subPeriods.map((sp, i) => {
        const start = sp.startDate instanceof Date ? sp.startDate : new Date(sp.startDate as string);
        const end   = sp.endDate   instanceof Date ? sp.endDate   : new Date(sp.endDate   as string);
        const isActive = start <= now && now <= end;
        const label = DASHA_LABELS[sp.planet];

        return (
          <li
            key={i}
            className={`flex flex-wrap items-center justify-between gap-x-2 rounded px-2 py-1 text-[11px] ${
              isActive
                ? "bg-[rgba(200,135,58,0.12)] text-[var(--cream)]"
                : "text-[var(--mist)]"
            }`}
          >
            <span className="font-medium">
              {label?.planet ?? sp.planet} sub-period
              {isActive && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#e8b96a] align-middle" />
              )}
            </span>
            <span className="font-mono text-[9px] opacity-70">
              {fmtDate(start)} — {fmtDate(end)}
              {isActive && <span className="ml-1.5 text-[rgba(232,185,106,0.9)]">{remainingLabel(end)}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

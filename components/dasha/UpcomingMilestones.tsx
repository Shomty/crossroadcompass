"use client";
// STATUS: done | FE-05

import type { PlanetDasha } from "openastrology-library";
import { DASHA_LABELS } from "@/lib/astro/dashaLabels";

interface Props {
  dashaPeriods: PlanetDasha[];
}

function fmtDate(d: Date | unknown): string {
  const dt = d instanceof Date ? d : new Date(d as string);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function yearsUntil(d: Date | unknown): string {
  const dt = d instanceof Date ? d : new Date(d as string);
  const yrs = (dt.getTime() - Date.now()) / (365.25 * 86_400_000);
  if (yrs < 0) return "";
  if (yrs < 1) return `in ${Math.round(yrs * 12)}mo`;
  return `in ${yrs.toFixed(1)}y`;
}

/**
 * Shows the next 2 upcoming Mahadasha transitions.
 */
export function UpcomingMilestones({ dashaPeriods }: Props) {
  const now = new Date();

  // Find the active index
  const activeIdx = dashaPeriods.findIndex((d) => {
    const start = d.startDate instanceof Date ? d.startDate : new Date(d.startDate as string);
    const end   = d.endDate   instanceof Date ? d.endDate   : new Date(d.endDate   as string);
    return start <= now && now <= end;
  });

  const upcoming = dashaPeriods.slice(
    activeIdx >= 0 ? activeIdx + 1 : 0,
    activeIdx >= 0 ? activeIdx + 3 : 2
  );

  if (upcoming.length === 0) return null;

  return (
    <div className="chart-bp-card">
      <div className="chart-bp-section-title">Upcoming transitions</div>
      <p className="chart-bp-muted mb-3">
        Next mahādaśā boundaries — useful for planning longer arcs.
      </p>
      <ul className="space-y-2.5">
        {upcoming.map((d, i) => {
          const label = DASHA_LABELS[d.planet];
          const start = d.startDate instanceof Date ? d.startDate : new Date(d.startDate as string);
          return (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-[rgba(200,135,58,0.14)] bg-[rgba(13,18,32,0.35)] px-3 py-3 sm:px-4"
            >
              <div
                className={`mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${label?.bgClass ?? "bg-amber-600"}`}
              />
              <div>
                <p className="text-[var(--type-small)] font-medium text-[var(--cream)]">
                  {label?.planet ?? d.planet} life period
                  <span className="ml-1.5 font-mono text-[10px] text-[rgba(232,185,106,0.9)]">
                    {yearsUntil(start)}
                  </span>
                </p>
                <p className="chart-bp-muted mt-0.5">{fmtDate(start)}</p>
                {label?.theme && <p className="chart-bp-muted mt-1.5 opacity-90">{label.theme}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

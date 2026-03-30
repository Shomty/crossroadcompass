"use client";
// STATUS: done | FE-05

import type { PlanetDasha } from "openastrology-library";
import { DASHA_LABELS } from "@/lib/astro/dashaLabels";

interface Props {
  dashaPeriods: PlanetDasha[];
}

function remainingLabel(end: Date | unknown): string {
  const endDate = end instanceof Date ? end : new Date(end as string);
  const days = Math.floor((endDate.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "Ended";
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months}mo`;
  return `${(days / 365.25).toFixed(1)}y`;
}

/**
 * Compact dasha widget for embedding on the dashboard.
 * Shows the active Mahadasha with theme + remaining time.
 */
export function DashaWidget({ dashaPeriods }: Props) {
  const now = new Date();

  const active = dashaPeriods.find((d) => {
    const start = d.startDate instanceof Date ? d.startDate : new Date(d.startDate as string);
    const end   = d.endDate   instanceof Date ? d.endDate   : new Date(d.endDate   as string);
    return start <= now && now <= end;
  });

  if (!active) return null;

  const label = DASHA_LABELS[active.planet];
  const activeAntar = active.subPeriods?.find((sp) => {
    const start = sp.startDate instanceof Date ? sp.startDate : new Date(sp.startDate as string);
    const end   = sp.endDate   instanceof Date ? sp.endDate   : new Date(sp.endDate   as string);
    return start <= now && now <= end;
  });

  return (
    <div
      className="glass-card rounded-xl p-4"
      style={{ borderColor: "rgba(99,102,241,0.2)" }}
    >
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--mist)]">
        Current Life Period
      </p>
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${label?.bgClass ?? "bg-indigo-500"}`} />
        <h3 className="font-serif text-base text-[var(--cream)]">
          {label?.planet ?? active.planet} Period
        </h3>
        <span className="ml-auto font-mono text-[10px] text-indigo-300">
          {remainingLabel(active.endDate)} left
        </span>
      </div>
      {label?.theme && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--mist)]">{label.theme}</p>
      )}
      {activeAntar && (
        <p className="mt-1 font-mono text-[9px] text-[var(--mist)] opacity-70">
          Sub-period: {DASHA_LABELS[activeAntar.planet]?.planet ?? activeAntar.planet}
          {" · "}ends {(activeAntar.endDate instanceof Date ? activeAntar.endDate : new Date(activeAntar.endDate as string))
            .toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {label?.keywords.map((kw) => (
          <span key={kw} className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[9px] text-indigo-300">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

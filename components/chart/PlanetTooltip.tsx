"use client";

import type { PlanetPosition } from "openastrology-library";

interface Props {
  planet: PlanetPosition;
  planetKey: string;
  children: React.ReactNode;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function PlanetTooltip({ planet, planetKey, children }: Props) {
  const retro = planet.isRetrograde ? "Retrograde" : "";
  const comb = planet.isCombust ? " • Combust" : "";
  const line2 = `${cap(planet.sign)} • ${planet.degreeDMSFormatted}`;
  const line3 = `${cap(planet.nakshatra)} · Pada ${planet.nakshatraPada}`;
  const line4 = `Dignity: ${planet.dignity}${retro ? ` · ${retro}` : ""}${comb}`;

  return (
    <span className="group relative inline-block cursor-help">
      {children}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-56 -translate-x-1/2 rounded-lg border border-[rgba(200,135,58,0.35)] bg-[var(--cosmos,#0c0a12)] px-2 py-1.5 text-left text-[10px] leading-snug text-[var(--cream)] shadow-lg group-hover:block"
        style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}
      >
        <span className="block font-semibold text-[rgba(232,185,106,0.95)]">{cap(planetKey)}</span>
        <span className="block text-[var(--mist)]">{line2}</span>
        <span className="block text-[var(--mist)]">{line3}</span>
        <span className="block text-[var(--mist)]">{line4}</span>
      </span>
    </span>
  );
}

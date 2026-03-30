"use client";

import type { PlanetaryPositions } from "openastrology-library";

interface Props {
  planets: PlanetaryPositions | null | undefined;
}

export function PlanetSummaryCard({ planets }: Props) {
  const map = (planets ?? {}) as PlanetaryPositions;
  const strongest = Object.entries(map)
    .filter(([, p]) => ["Exalted", "Own", "Moolatrikona"].includes(p.dignity))
    .map(([k]) => k);
  const debilitated = Object.entries(map)
    .filter(([, p]) => p.dignity === "Debilitated")
    .map(([k]) => k);
  const retrograde = Object.entries(map)
    .filter(([, p]) => p.isRetrograde)
    .map(([k]) => k);

  const cap = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);

  return (
    <div className="rounded-lg border border-[rgba(200,135,58,0.2)] bg-[rgba(200,135,58,0.06)] p-4 text-base leading-relaxed text-[var(--cream)]">
      {strongest.length > 0 && (
        <p className="mb-2">
          {strongest.length} of your planets are in strong positions: {strongest.map(cap).join(", ")}.
        </p>
      )}
      {debilitated.length > 0 && (
        <p className="mb-2 text-[var(--mist)]">
          {debilitated.map(cap).join(", ")} {debilitated.length === 1 ? "is" : "are"} in a weakened position — an area of
          growth.
        </p>
      )}
      {retrograde.length > 0 && (
        <p className="text-[var(--mist)]">
          {retrograde.map(cap).join(" and ")} {retrograde.length === 1 ? "is" : "are"} retrograde — their energy turns
          inward.
        </p>
      )}
      {strongest.length === 0 && debilitated.length === 0 && retrograde.length === 0 && (
        <p className="text-[var(--mist)]">Your planetary positions are balanced across dignity states.</p>
      )}
    </div>
  );
}

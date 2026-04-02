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
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(212,175,95,0.18)",
        background: "rgba(200,135,58,0.06)",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {strongest.length > 0 && (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--cream, #f2ead8)" }}>
          <span style={{ color: "rgba(232,185,106,0.9)", fontWeight: 600 }}>
            {strongest.length === 1 ? "1 planet is" : `${strongest.length} planets are`}
          </span>{" "}
          in strong positions:{" "}
          <span style={{ color: "var(--moon, #E8E0D0)", fontWeight: 500 }}>
            {strongest.map(cap).join(", ")}
          </span>.
        </p>
      )}
      {debilitated.length > 0 && (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--muted, rgba(232,224,208,0.45))" }}>
          <span style={{ color: "rgba(248,113,113,0.85)", fontWeight: 500 }}>
            {debilitated.map(cap).join(", ")}
          </span>{" "}
          {debilitated.length === 1 ? "is" : "are"} in a weakened position — an area of growth.
        </p>
      )}
      {retrograde.length > 0 && (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--muted, rgba(232,224,208,0.45))" }}>
          <span style={{ color: "rgba(232,185,106,0.85)", fontWeight: 500 }}>
            {retrograde.map(cap).join(" and ")}
          </span>{" "}
          {retrograde.length === 1 ? "is" : "are"} retrograde — {retrograde.length === 1 ? "its" : "their"} energy turns inward.
        </p>
      )}
      {strongest.length === 0 && debilitated.length === 0 && retrograde.length === 0 && (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--muted, rgba(232,224,208,0.45))" }}>
          Your planetary positions are balanced across dignity states.
        </p>
      )}
    </div>
  );
}

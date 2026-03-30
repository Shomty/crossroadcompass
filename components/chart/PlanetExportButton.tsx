"use client";

import type { PlanetaryPositions } from "openastrology-library";

interface Props {
  planets: PlanetaryPositions;
}

export function PlanetExportButton({ planets }: Props) {
  function download() {
    const rows = [["Planet", "Sign", "House", "Nakshatra", "Pada", "Dignity", "Retrograde", "Combust"]];
    for (const [name, p] of Object.entries(planets)) {
      rows.push([
        name,
        p.sign,
        String(p.house),
        p.nakshatra,
        String(p.nakshatraPada),
        p.dignity,
        p.isRetrograde ? "true" : "false",
        p.isCombust ? "true" : "false",
      ]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vedic-planets.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="btn-ghost text-xs font-mono uppercase tracking-wider" onClick={download}>
      Export CSV
    </button>
  );
}

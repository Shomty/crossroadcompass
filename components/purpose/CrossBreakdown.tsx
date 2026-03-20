"use client";
// STATUS: done | Premium Features - Purpose Decoder
/**
 * components/purpose/CrossBreakdown.tsx
 * Displays the Incarnation Cross breakdown with gate numbers.
 */

interface CrossBreakdownProps {
  crossType: string;
  crossName: string;
  gates: number[];
}

export function CrossBreakdown({ crossType, crossName, gates }: CrossBreakdownProps) {
  const gateLabels = ["Personality Sun", "Personality Earth", "Design Sun", "Design Earth"];

  return (
    <div
      style={{
        background: "rgba(13,18,32,0.5)",
        border: "1px solid rgba(200,135,58,0.12)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18, color: "#e8b96a" }}>✦</span>
        <div>
          <h4
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 15,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
            }}
          >
            {crossName}
          </h4>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "rgba(200,135,58,0.7)",
            }}
          >
            {crossType}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
        }}
      >
        {gates.map((gate, i) => (
          <div
            key={i}
            style={{
              background: "rgba(200,135,58,0.08)",
              borderRadius: 8,
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {gateLabels[i]}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 14,
                fontWeight: 500,
                color: "#e8b96a",
              }}
            >
              {gate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

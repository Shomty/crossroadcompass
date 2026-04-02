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
        padding: "1.5rem",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 18, color: "#e8b96a", display: "block", marginBottom: 6 }}>✦</span>
        <h4
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 20,
            fontWeight: 400,
            color: "rgba(255,255,255,0.92)",
            margin: "0 0 6px",
            lineHeight: 1.25,
          }}
        >
          {crossName}
        </h4>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#c8873a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {crossType}
        </span>
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
              background: "rgba(13,18,32,0.6)",
              border: "1px solid rgba(200,135,58,0.12)",
              borderRadius: 8,
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {gateLabels[i]}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 16,
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

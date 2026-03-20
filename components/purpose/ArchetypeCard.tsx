"use client";
// STATUS: done | Premium Features - Purpose Decoder
/**
 * components/purpose/ArchetypeCard.tsx
 * Displays a matched career archetype with match reasoning and guidance.
 */

interface ArchetypeCardProps {
  name: string;
  match: string;
  guidance: string;
  index: number;
}

export function ArchetypeCard({ name, match, guidance, index }: ArchetypeCardProps) {
  const medals = ["◈", "◇", "○"];
  const medal = medals[index] || "·";

  return (
    <div
      className="animate-enter"
      style={{
        animationDelay: `${0.1 + index * 0.1}s`,
        background: "rgba(13,18,32,0.6)",
        border: "1px solid rgba(200,135,58,0.15)",
        borderRadius: 14,
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 20,
            color: index === 0 ? "#e8b96a" : "rgba(240,220,160,0.5)",
          }}
        >
          {medal}
        </span>
        <h4
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            margin: 0,
          }}
        >
          {name}
        </h4>
      </div>

      <div style={{ paddingLeft: 32 }}>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: "rgba(240,220,160,0.8)",
            lineHeight: 1.6,
            margin: "0 0 10px",
          }}
        >
          <span style={{ color: "#c8873a", fontWeight: 500 }}>Why this fits: </span>
          {match}
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          <span style={{ color: "rgba(200,135,58,0.8)", fontWeight: 500 }}>Guidance: </span>
          {guidance}
        </p>
      </div>
    </div>
  );
}

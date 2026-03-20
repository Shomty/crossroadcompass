"use client";
// STATUS: done | Premium Features - Shadow Work Portal
/**
 * components/shadow/ShadowMap.tsx
 * Visual representation of shadow patterns from Vedic + HD.
 */

interface ShadowPattern {
  name: string;
  description: string;
  integration: string;
}

interface ShadowMapProps {
  patterns: ShadowPattern[];
}

export function ShadowMap({ patterns }: ShadowMapProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {patterns.map((pattern, i) => (
        <div
          key={i}
          className="animate-enter"
          style={{
            animationDelay: `${0.1 + i * 0.08}s`,
            background: "rgba(13,18,32,0.6)",
            border: "1px solid rgba(200,135,58,0.12)",
            borderRadius: 14,
            padding: "1.25rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle gradient accent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: "linear-gradient(180deg, rgba(200,135,58,0.6) 0%, rgba(200,135,58,0.1) 100%)",
            }}
          />

          <div style={{ paddingLeft: 12 }}>
            <h4
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 15,
                fontWeight: 500,
                color: "#e8b96a",
                margin: "0 0 10px",
              }}
            >
              {pattern.name}
            </h4>

            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
                margin: "0 0 12px",
              }}
            >
              {pattern.description}
            </p>

            <div
              style={{
                background: "rgba(200,135,58,0.08)",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "#c8873a",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Integration Path
              </span>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                  fontSize: 12,
                  color: "rgba(240,220,160,0.85)",
                  lineHeight: 1.55,
                  margin: "6px 0 0",
                }}
              >
                {pattern.integration}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

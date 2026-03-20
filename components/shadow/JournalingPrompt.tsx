"use client";
// STATUS: done | Premium Features - Shadow Work Portal
/**
 * components/shadow/JournalingPrompt.tsx
 * Individual journaling prompt card with depth indicator.
 */

interface JournalingPromptProps {
  theme: string;
  prompt: string;
  depth: "surface" | "medium" | "deep";
  index: number;
}

const DEPTH_STYLES = {
  surface: {
    color: "rgba(200,135,58,0.7)",
    bg: "rgba(200,135,58,0.06)",
    label: "Surface",
    icon: "○",
  },
  medium: {
    color: "#c8873a",
    bg: "rgba(200,135,58,0.1)",
    label: "Medium",
    icon: "◐",
  },
  deep: {
    color: "#e8b96a",
    bg: "rgba(200,135,58,0.15)",
    label: "Deep",
    icon: "●",
  },
};

export function JournalingPrompt({ theme, prompt, depth, index }: JournalingPromptProps) {
  const depthStyle = DEPTH_STYLES[depth];

  return (
    <div
      className="animate-enter"
      style={{
        animationDelay: `${0.1 + index * 0.08}s`,
        background: depthStyle.bg,
        border: "1px solid rgba(200,135,58,0.1)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: depthStyle.color,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {theme}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: depthStyle.color,
          }}
        >
          <span>{depthStyle.icon}</span>
          {depthStyle.label}
        </span>
      </div>

      <p
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 14,
          fontStyle: "italic",
          color: "rgba(240,220,160,0.9)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        &ldquo;{prompt}&rdquo;
      </p>
    </div>
  );
}

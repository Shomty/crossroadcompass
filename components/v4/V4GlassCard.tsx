import React from "react";

interface V4GlassCardProps {
  children: React.ReactNode;
  className?: string;
  goldEdge?: boolean;
  violetGlow?: boolean;
  style?: React.CSSProperties;
}

/**
 * Base glass card for the v4 Digital Grimoire design system.
 * Uses .glass-card (dashboard standard: blur 20px, 16px radius, gradient bg).
 * Optional goldEdge adds the Solar Gold left border (Profile Strip anchor).
 * Optional violetGlow adds the oracle radial gradient (Dharma Synthesis).
 */
export function V4GlassCard({
  children,
  className = "",
  goldEdge = false,
  violetGlow = false,
  style,
}: V4GlassCardProps) {
  const classes = [
    "glass-card",
    goldEdge ? "v4-gold-edge" : "",
    violetGlow ? "v4-violet-glow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style}>
      {/* Micro-noise grain layer */}
      <div
        className="card-grain"
        style={{ zIndex: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

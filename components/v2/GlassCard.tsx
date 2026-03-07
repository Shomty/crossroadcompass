/**
 * components/v2/GlassCard.tsx
 * Premium V2 glass card — elevated, warm inner glow.
 */

import React from "react";

interface GlassCardV2Props {
  children: React.ReactNode;
  span?: "1" | "2" | "full";
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
}

const spanMap: Record<string, React.CSSProperties> = {
  "1":    { gridColumn: "span 1" },
  "2":    { gridColumn: "span 2" },
  "full": { gridColumn: "1 / -1" },
};

export function GlassCardV2({ children, span = "1", className = "", style, noPadding }: GlassCardV2Props) {
  return (
    <div
      className={`v2-card ${className}`}
      style={{
        ...spanMap[span],
        ...(noPadding ? { padding: 0, overflow: "visible" } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

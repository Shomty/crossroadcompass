import type { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  /** "2" spans 2 cols; "full" spans all 3 cols */
  span?: 2 | "full";
  className?: string;
}

export function GlassCard({ children, style, span, className }: GlassCardProps) {
  const colSpan =
    span === "full" ? "1 / -1" :
    span === 2 ? "span 2" :
    undefined;

  return (
    <div
      className={`glass-card${className ? ` ${className}` : ""}`}
      style={{ gridColumn: colSpan, ...style }}
    >
      <div className="card-grain" />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

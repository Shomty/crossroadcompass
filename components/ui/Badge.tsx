/**
 * components/ui/Badge.tsx
 * DM Mono small tag for plan tier labels, subscription status, etc.
 */

import type { HTMLAttributes } from "react";

export function Badge({ className = "", children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase" as const,
        border: "1px solid var(--amber)",
        color: "var(--amber)",
        padding: "0.2rem 0.6rem",
        borderRadius: "2px",
      }}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
}

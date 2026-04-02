import type { CSSProperties } from "react";

/**
 * Instrument panels — inline style objects (bypasses Tailwind JIT scanning issue).
 * These are used as style={} props so changes take effect immediately without a dev restart.
 */

/** Standard inner card — dark bg, amber border, 1.5rem padding */
export const synthesisCardStyle: CSSProperties = {
  background: "rgba(13,18,32,0.5)",
  border: "1px solid rgba(200,135,58,0.15)",
  borderRadius: 12,
  padding: "1.5rem",
};

/** Dense inner card — same as synthesisCardStyle but tighter padding */
export const synthesisCardStyleDense: CSSProperties = {
  background: "rgba(13,18,32,0.5)",
  border: "1px solid rgba(200,135,58,0.15)",
  borderRadius: 12,
  padding: "1.25rem",
};

/** Accent card — amber-tinted for highlighted sections */
export const synthesisCardStyleAccent: CSSProperties = {
  background: "rgba(200,135,58,0.08)",
  border: "1px solid rgba(200,135,58,0.35)",
  borderRadius: 12,
  padding: "1.5rem",
};

/** Nested card base — slightly deeper bg, no padding (add per usage) */
export const synthesisNestedCardBaseStyle: CSSProperties = {
  background: "rgba(13,18,32,0.52)",
  border: "1px solid rgba(200,135,58,0.15)",
  borderRadius: 12,
};

/** Nested card with standard padding */
export const synthesisNestedCardStyle: CSSProperties = {
  ...synthesisNestedCardBaseStyle,
  padding: "1.5rem",
};

// Legacy Tailwind class string exports — kept for gradual migration only.
// Prefer the CSSProperties exports above for new code.
export const synthesisInnerPanel =
  "rounded-[12px] border border-[rgba(200,135,58,0.15)] bg-[rgba(13,18,32,0.5)] p-6";

export const synthesisInnerPanelDense =
  "rounded-[12px] border border-[rgba(200,135,58,0.15)] bg-[rgba(13,18,32,0.5)] p-5";

export const synthesisInnerPanelAccent =
  "rounded-[12px] border border-[rgba(200,135,58,0.35)] bg-[rgba(200,135,58,0.08)] p-6";

export const synthesisNestedPanelBase =
  "rounded-[12px] border border-[rgba(200,135,58,0.15)] bg-[rgba(13,18,32,0.52)]";

export const synthesisNestedPanel = `${synthesisNestedPanelBase} p-6`;

export const synthesisLabelClass =
  "mb-2 text-[9px] uppercase tracking-[0.16em] text-[rgba(200,135,58,0.65)]";

export const synthesisLabelStyle = {
  fontFamily: "'DM Mono', monospace",
} as const;

export const synthesisBodyMuted = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 14,
  lineHeight: 1.8,
  color: "rgba(255,255,255,0.82)",
} as const;

export const synthesisCream = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 14,
  color: "rgba(255,255,255,0.92)",
} as const;

export const synthesisTitleCinzel = {
  fontFamily: "Cinzel, serif",
  color: "rgba(240,220,160,0.95)",
} as const;

/** Intra-panel sub-heading — Cinzel 16px. Always larger than body text. */
export const synthesisSubheading = {
  fontFamily: "Cinzel, serif",
  fontSize: 16,
  fontWeight: 400,
  color: "rgba(240,220,160,0.95)",
} as const;

/** Panel section heading — Cinzel 18px. Used for "Layer N" section titles. */
export const synthesisSectionHeading = {
  fontFamily: "Cinzel, serif",
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.3,
  color: "rgba(240,220,160,0.95)",
  margin: 0,
} as const;

export const synthesisPrimaryCta: CSSProperties = {
  marginTop: 8,
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  background: "linear-gradient(135deg, #c8873a, #e8b96a)",
  color: "#0d1220",
};

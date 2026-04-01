import type { CSSProperties } from "react";

/**
 * Instrument panels — matches Purpose Decoder–style inner boxes:
 * rgba(13,18,32,0.5), border rgba(200,135,58,0.12), 12px radius, 1.25rem padding.
 */
export const synthesisInnerPanel =
  "rounded-[12px] border border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.5)] p-5";

export const synthesisInnerPanelDense =
  "rounded-[12px] border border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.5)] p-4";

export const synthesisInnerPanelAccent =
  "rounded-[12px] border border-[rgba(200,135,58,0.35)] bg-[rgba(200,135,58,0.08)] p-5";

export const synthesisNestedPanelBase =
  "rounded-[12px] border border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.42)]";

export const synthesisNestedPanel = `${synthesisNestedPanelBase} p-4`;

export const synthesisLabelClass =
  "mb-2 text-[9px] uppercase tracking-[0.16em] text-[rgba(200,135,58,0.65)]";

export const synthesisLabelStyle = {
  fontFamily: "'DM Mono', monospace",
} as const;

export const synthesisBodyMuted = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  lineHeight: 1.8,
  color: "rgba(240,220,160,0.78)",
} as const;

export const synthesisCream = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  color: "rgba(240,220,160,0.92)",
} as const;

export const synthesisTitleCinzel = {
  fontFamily: "Cinzel, serif",
  color: "rgba(240,220,160,0.95)",
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

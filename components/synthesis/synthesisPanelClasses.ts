import type { CSSProperties } from "react";

/** Inner dense panels — STYLE_GUIDE.md Glass Card Contract (nested cells). */
export const synthesisInnerPanel =
  "rounded-[14px] border border-white/5 bg-[rgba(13,18,32,0.45)] p-4";

export const synthesisLabelClass =
  "mb-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--mist,rgba(255,255,255,0.45))]";

export const synthesisLabelStyle = {
  fontFamily: "'DM Mono', monospace",
} as const;

export const synthesisBodyMuted = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  color: "var(--mist, rgba(255,255,255,0.55))",
} as const;

export const synthesisCream = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  color: "var(--cream, rgba(255,255,255,0.9))",
} as const;

export const synthesisTitleCinzel = {
  fontFamily: "Cinzel, serif",
  color: "var(--cream, rgba(255,255,255,0.92))",
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

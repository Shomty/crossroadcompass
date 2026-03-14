export const PLANET_GLYPH: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mars: "♂",
  mercury: "☿",
  jupiter: "♃",
  venus: "♀",
  saturn: "♄",
  rahu: "☊",
  ketu: "☋",
};

export const PLANET_COLOR: Record<string, string> = {
  sun: "#FFD96A",
  moon: "#C8D8E8",
  mars: "#E8705A",
  mercury: "#80D4A0",
  jupiter: "#D4AF5F",
  venus: "#E8C0D0",
  saturn: "#B0A080",
  rahu: "#8888CC",
  ketu: "#AA8866",
};

export const PLANET_FALLBACK_GLYPH = "★";
export const PLANET_FALLBACK_COLOR = "var(--gold-solar, #D4AF37)";

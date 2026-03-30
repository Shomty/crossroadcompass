export const VEDIC_HOUSE_NAMES: Record<number, string> = {
  1: "Tanu (Self)",
  2: "Dhana (Wealth)",
  3: "Sahaja (Siblings)",
  4: "Sukha (Home)",
  5: "Putra (Intelligence)",
  6: "Ripu (Obstacles)",
  7: "Kalatra (Partnership)",
  8: "Mrityu (Transformation)",
  9: "Dharma (Fortune)",
  10: "Karma (Career)",
  11: "Labha (Gains)",
  12: "Vyaya (Liberation)",
};

/** Cosmic / dark UI — color tokens pair with `.house-type-badge` in globals.css */
export const HOUSE_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  Kendra: {
    label: "Kendra",
    className:
      "border border-[rgba(200,135,58,0.5)] bg-[rgba(200,135,58,0.12)] text-[rgba(252,240,210,0.96)]",
  },
  Trikona: {
    label: "Trikona",
    className:
      "border border-[rgba(180,150,255,0.38)] bg-[rgba(130,100,210,0.1)] text-[rgba(235,225,255,0.94)]",
  },
  Upachaya: {
    label: "Upachaya",
    className:
      "border border-[rgba(100,200,185,0.4)] bg-[rgba(60,150,140,0.1)] text-[rgba(210,245,238,0.92)]",
  },
  Dusthana: {
    label: "Dusthana",
    className:
      "border border-[rgba(230,110,120,0.42)] bg-[rgba(160,50,70,0.12)] text-[rgba(255,215,218,0.94)]",
  },
  Maraka: {
    label: "Maraka",
    className:
      "border border-[rgba(230,170,110,0.45)] bg-[rgba(190,110,50,0.12)] text-[rgba(255,235,210,0.94)]",
  },
  Regular: {
    label: "Regular",
    className:
      "border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] text-[rgba(232,224,208,0.72)]",
  },
};

/** Mirrors openastrology HouseUtils.HOUSE_TYPES — kept local so client bundles avoid native swisseph. */
export const HOUSE_TYPE_BY_NUMBER: Record<number, keyof typeof HOUSE_TYPE_LABELS> = {
  1: "Kendra",
  2: "Maraka",
  3: "Upachaya",
  4: "Kendra",
  5: "Trikona",
  6: "Upachaya",
  7: "Kendra",
  8: "Dusthana",
  9: "Trikona",
  10: "Kendra",
  11: "Upachaya",
  12: "Dusthana",
};

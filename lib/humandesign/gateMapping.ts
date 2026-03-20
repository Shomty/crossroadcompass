// STATUS: done | Phase 5 Feature Pages
/**
 * lib/humandesign/gateMapping.ts
 * Static mapping of all 64 Human Design gates to their Jyotish planetary rulers.
 * Based on the Rave I Ching wheel planetary correspondences.
 */

export interface GateInfo {
  gate: number;
  /** I Ching hexagram name used in HD */
  name: string;
  /** Jyotish planetary ruler */
  planet: string;
  /** One-word keyword for this gate */
  keyword: string;
}

export const GATE_MAPPING: Record<number, GateInfo> = {
  1:  { gate: 1,  name: "Self-Expression",      planet: "Sun",     keyword: "Creativity" },
  2:  { gate: 2,  name: "Direction",             planet: "Moon",    keyword: "Receptivity" },
  3:  { gate: 3,  name: "Ordering",              planet: "Saturn",  keyword: "Difficulty" },
  4:  { gate: 4,  name: "Formulization",         planet: "Mercury", keyword: "Answers" },
  5:  { gate: 5,  name: "Fixed Rhythms",         planet: "Mercury", keyword: "Waiting" },
  6:  { gate: 6,  name: "Friction",              planet: "Venus",   keyword: "Conflict" },
  7:  { gate: 7,  name: "Role of the Self",      planet: "Mars",    keyword: "Leadership" },
  8:  { gate: 8,  name: "Holding Together",      planet: "Venus",   keyword: "Contribution" },
  9:  { gate: 9,  name: "Focus",                 planet: "Mars",    keyword: "Taming Power" },
  10: { gate: 10, name: "Behavior of the Self",  planet: "Moon",    keyword: "Treading" },
  11: { gate: 11, name: "Ideas",                 planet: "Jupiter", keyword: "Peace" },
  12: { gate: 12, name: "Caution",               planet: "Venus",   keyword: "Standstill" },
  13: { gate: 13, name: "The Listener",          planet: "Sun",     keyword: "Fellowship" },
  14: { gate: 14, name: "Power Skills",          planet: "Sun",     keyword: "Possession" },
  15: { gate: 15, name: "Extremes",              planet: "Moon",    keyword: "Modesty" },
  16: { gate: 16, name: "Skills",                planet: "Venus",   keyword: "Enthusiasm" },
  17: { gate: 17, name: "Opinions",              planet: "Saturn",  keyword: "Following" },
  18: { gate: 18, name: "Correction",            planet: "Saturn",  keyword: "Correcting" },
  19: { gate: 19, name: "Wanting",               planet: "Moon",    keyword: "Approach" },
  20: { gate: 20, name: "The Now",               planet: "Mercury", keyword: "Contemplation" },
  21: { gate: 21, name: "Biting Through",        planet: "Mars",    keyword: "Control" },
  22: { gate: 22, name: "Grace",                 planet: "Ketu",    keyword: "Openness" },
  23: { gate: 23, name: "Assimilation",          planet: "Mercury", keyword: "Splitting Apart" },
  24: { gate: 24, name: "Return",                planet: "Mercury", keyword: "Rationalization" },
  25: { gate: 25, name: "Innocence",             planet: "Sun",     keyword: "Innocence" },
  26: { gate: 26, name: "The Egoist",            planet: "Mars",    keyword: "Taming Power" },
  27: { gate: 27, name: "Nourishment",           planet: "Moon",    keyword: "Caring" },
  28: { gate: 28, name: "The Game Player",       planet: "Saturn",  keyword: "Preponderance" },
  29: { gate: 29, name: "Perseverance",          planet: "Ketu",    keyword: "Abysmal" },
  30: { gate: 30, name: "Desire",                planet: "Ketu",    keyword: "Clinging Fire" },
  31: { gate: 31, name: "Influence",             planet: "Jupiter", keyword: "Leading" },
  32: { gate: 32, name: "Duration",              planet: "Saturn",  keyword: "Continuity" },
  33: { gate: 33, name: "Privacy",               planet: "Mars",    keyword: "Retreat" },
  34: { gate: 34, name: "Power",                 planet: "Jupiter", keyword: "Great Power" },
  35: { gate: 35, name: "Change",                planet: "Venus",   keyword: "Progress" },
  36: { gate: 36, name: "Crisis",                planet: "Rahu",    keyword: "Darkening" },
  37: { gate: 37, name: "Friendship",            planet: "Moon",    keyword: "Family" },
  38: { gate: 38, name: "Opposition",            planet: "Mars",    keyword: "Fighting" },
  39: { gate: 39, name: "Provocation",           planet: "Mars",    keyword: "Obstruction" },
  40: { gate: 40, name: "Aloneness",             planet: "Saturn",  keyword: "Deliverance" },
  41: { gate: 41, name: "Contraction",           planet: "Rahu",    keyword: "Decrease" },
  42: { gate: 42, name: "Growth",                planet: "Jupiter", keyword: "Increase" },
  43: { gate: 43, name: "Insight",               planet: "Mercury", keyword: "Breakthrough" },
  44: { gate: 44, name: "Coming to Meet",        planet: "Saturn",  keyword: "Alertness" },
  45: { gate: 45, name: "Gathering",             planet: "Jupiter", keyword: "Gathering" },
  46: { gate: 46, name: "Love of Body",          planet: "Venus",   keyword: "Pushing Upward" },
  47: { gate: 47, name: "Realization",           planet: "Mercury", keyword: "Oppression" },
  48: { gate: 48, name: "Depth",                 planet: "Moon",    keyword: "The Well" },
  49: { gate: 49, name: "Revolution",            planet: "Rahu",    keyword: "Principles" },
  50: { gate: 50, name: "Values",                planet: "Saturn",  keyword: "The Cauldron" },
  51: { gate: 51, name: "Shock",                 planet: "Sun",     keyword: "Arousing" },
  52: { gate: 52, name: "Stillness",             planet: "Saturn",  keyword: "Keeping Still" },
  53: { gate: 53, name: "Development",           planet: "Jupiter", keyword: "Gradual Progress" },
  54: { gate: 54, name: "Ambition",              planet: "Moon",    keyword: "Marrying Maiden" },
  55: { gate: 55, name: "Abundance",             planet: "Rahu",    keyword: "Spirit" },
  56: { gate: 56, name: "Stimulation",           planet: "Mercury", keyword: "The Wanderer" },
  57: { gate: 57, name: "Intuitive Clarity",     planet: "Ketu",    keyword: "The Gentle" },
  58: { gate: 58, name: "Joy",                   planet: "Jupiter", keyword: "The Joyous" },
  59: { gate: 59, name: "Sexuality",             planet: "Venus",   keyword: "Dispersion" },
  60: { gate: 60, name: "Limitation",            planet: "Saturn",  keyword: "Limitation" },
  61: { gate: 61, name: "Mystery",               planet: "Moon",    keyword: "Inner Truth" },
  62: { gate: 62, name: "Details",               planet: "Mercury", keyword: "Preponderance" },
  63: { gate: 63, name: "Doubt",                 planet: "Rahu",    keyword: "After Completion" },
  64: { gate: 64, name: "Confusion",             planet: "Rahu",    keyword: "Before Completion" },
};

/** Look up gate info by gate number (1-64). Returns undefined for invalid gates. */
export function getGateInfo(gate: number): GateInfo | undefined {
  return GATE_MAPPING[gate];
}

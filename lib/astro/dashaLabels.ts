// STATUS: done | FE-05
/**
 * lib/astro/dashaLabels.ts
 * Human-readable themes and keywords for all 9 Vimshottari Dasha planets.
 * Used by DashaTimelinePanel, DashaWidget, and UpcomingMilestones.
 */

export interface DashaLabel {
  planet: string;          // display name
  yearsTotal: number;      // standard dasha duration
  theme: string;           // one-line life theme
  keywords: string[];      // 3–4 keywords for the period card
  color: string;           // tailwind text class for timeline segment
  bgClass: string;         // tailwind bg class for timeline bar
}

export const DASHA_LABELS: Record<string, DashaLabel> = {
  sun: {
    planet: "Sun",
    yearsTotal: 6,
    theme: "Identity, authority and self-expression take centre stage.",
    keywords: ["Career focus", "Visibility", "Leadership", "Recognition"],
    color: "text-amber-300",
    bgClass: "bg-amber-400",
  },
  moon: {
    planet: "Moon",
    yearsTotal: 10,
    theme: "Inner life, home and emotional roots call for attention.",
    keywords: ["Emotional depth", "Intuition", "Home & family", "Nurturing"],
    color: "text-sky-300",
    bgClass: "bg-sky-400",
  },
  mars: {
    planet: "Mars",
    yearsTotal: 7,
    theme: "Drive, courage and decisive action move you forward.",
    keywords: ["Initiative", "Ambition", "Resilience", "Property"],
    color: "text-red-400",
    bgClass: "bg-red-500",
  },
  rahu: {
    planet: "Rahu",
    yearsTotal: 18,
    theme: "Unconventional paths, transformation and worldly ambition expand your horizon.",
    keywords: ["Reinvention", "Ambition", "Foreign influence", "Disruption"],
    color: "text-violet-400",
    bgClass: "bg-violet-500",
  },
  jupiter: {
    planet: "Jupiter",
    yearsTotal: 16,
    theme: "Wisdom, growth and meaningful expansion through dharma.",
    keywords: ["Growth", "Wisdom", "Opportunities", "Abundance"],
    color: "text-yellow-300",
    bgClass: "bg-yellow-400",
  },
  saturn: {
    planet: "Saturn",
    yearsTotal: 19,
    theme: "Discipline, responsibility and karmic maturation build lasting foundations.",
    keywords: ["Discipline", "Endurance", "Karma", "Long-term results"],
    color: "text-slate-400",
    bgClass: "bg-slate-500",
  },
  mercury: {
    planet: "Mercury",
    yearsTotal: 17,
    theme: "Intellect, communication and analytical skill open new doors.",
    keywords: ["Learning", "Communication", "Business", "Adaptability"],
    color: "text-green-400",
    bgClass: "bg-green-500",
  },
  ketu: {
    planet: "Ketu",
    yearsTotal: 7,
    theme: "Detachment, spiritual insight and releasing the familiar deepen inner knowing.",
    keywords: ["Spirituality", "Letting go", "Introspection", "Past patterns"],
    color: "text-rose-300",
    bgClass: "bg-rose-400",
  },
  venus: {
    planet: "Venus",
    yearsTotal: 20,
    theme: "Relationships, beauty and the pursuit of pleasure and fulfilment unfold.",
    keywords: ["Relationships", "Creativity", "Comfort", "Pleasure"],
    color: "text-pink-400",
    bgClass: "bg-pink-500",
  },
};

/** Total dasha cycle = 120 years */
export const TOTAL_DASHA_YEARS = 120;

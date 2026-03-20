// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * lib/astro/kutaService.ts
 * 8-fold Kuta matching algorithm for Vedic compatibility.
 * Based on traditional Ashta Kuta scoring system (36 points max).
 */

// ─── Types ────────────────────────────────────────────────────────────────

export interface KutaScore {
  dimension: string;
  maxPoints: number;
  earnedPoints: number;
  interpretation: string;
  quality: "excellent" | "good" | "moderate" | "challenging";
}

export interface CompatibilityResult {
  overallScore: number;
  overallPercentage: number;
  quality: "excellent" | "good" | "moderate" | "challenging";
  kutas: KutaScore[];
}

// ─── Nakshatra Data ───────────────────────────────────────────────────────

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_INDEX: Record<string, number> = {};
NAKSHATRAS.forEach((n, i) => {
  NAKSHATRA_INDEX[n.toLowerCase()] = i;
  NAKSHATRA_INDEX[n.toLowerCase().replace(/\s/g, "_")] = i;
});

// ─── Rashi (Moon Sign) Data ───────────────────────────────────────────────

const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const RASHI_INDEX: Record<string, number> = {};
RASHIS.forEach((r, i) => {
  RASHI_INDEX[r.toLowerCase()] = i;
});

// ─── Varna (Caste/Spiritual) Groups ───────────────────────────────────────

const VARNA_GROUPS = [
  [0, 1, 2],     // Brahmin
  [3, 4, 5],     // Kshatriya
  [6, 7, 8],     // Vaishya
  [9, 10, 11],   // Shudra
];

function getVarna(rashiIndex: number): number {
  return Math.floor(rashiIndex / 3);
}

// ─── Vasya (Dominance) Groups ─────────────────────────────────────────────

const VASYA_GROUPS: Record<number, number[]> = {
  0: [4],           // Aries → Leo
  1: [6, 2],        // Taurus → Libra, Cancer
  2: [10],          // Gemini → Virgo
  3: [7, 1],        // Cancer → Scorpio, Taurus
  4: [0],           // Leo → Aries
  5: [2, 11],       // Virgo → Gemini, Pisces
  6: [1, 5],        // Libra → Taurus, Virgo
  7: [3],           // Scorpio → Cancer
  8: [11],          // Sagittarius → Pisces
  9: [10],          // Capricorn → Aquarius
  10: [9],          // Aquarius → Capricorn
  11: [8, 5],       // Pisces → Sagittarius, Virgo
};

// ─── Tara (Star/Nakshatra Compatibility) ──────────────────────────────────

function getTaraScore(n1: number, n2: number): number {
  const diff = ((n2 - n1) % 27 + 27) % 27;
  const tara = (diff % 9) + 1;
  const auspicious = [1, 2, 4, 6, 8, 9];
  return auspicious.includes(tara) ? 3 : 0;
}

// ─── Yoni (Sexual/Physical Compatibility) ─────────────────────────────────

const YONI_ANIMALS = [
  "Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat",
  "Cow", "Buffalo", "Tiger", "Hare", "Monkey", "Mongoose", "Lion"
];

const NAKSHATRA_YONI: Record<number, number> = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 3, 5: 4, 6: 5, 7: 2, 8: 5,
  9: 6, 10: 6, 11: 7, 12: 8, 13: 9, 14: 8, 15: 9, 16: 4,
  17: 4, 18: 4, 19: 12, 20: 12, 21: 12, 22: 13, 23: 0,
  24: 13, 25: 7, 26: 1
};

const YONI_COMPATIBILITY: Record<string, number> = {
  "same": 4,
  "friendly": 3,
  "neutral": 2,
  "enemy": 1,
  "mortal": 0,
};

const YONI_ENEMIES: Record<number, number> = {
  0: 8, 1: 13, 2: 12, 3: 12, 4: 5, 5: 4, 6: 5, 7: 9,
  8: 0, 9: 7, 10: 4, 11: 3, 12: 3, 13: 1
};

function getYoniScore(n1: number, n2: number): number {
  const y1 = NAKSHATRA_YONI[n1] ?? 0;
  const y2 = NAKSHATRA_YONI[n2] ?? 0;
  
  if (y1 === y2) return 4;
  if (YONI_ENEMIES[y1] === y2 || YONI_ENEMIES[y2] === y1) return 0;
  if (Math.abs(y1 - y2) <= 2) return 3;
  return 2;
}

// ─── Graha Maitri (Planetary Friendship) ──────────────────────────────────

const RASHI_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];

const PLANET_FRIENDSHIP: Record<string, Record<string, string>> = {
  Sun: { Moon: "friend", Mars: "friend", Jupiter: "friend", Venus: "enemy", Saturn: "enemy", Mercury: "neutral" },
  Moon: { Sun: "friend", Mercury: "friend", Venus: "neutral", Mars: "neutral", Jupiter: "neutral", Saturn: "neutral" },
  Mars: { Sun: "friend", Moon: "friend", Jupiter: "friend", Venus: "neutral", Saturn: "neutral", Mercury: "enemy" },
  Mercury: { Sun: "friend", Venus: "friend", Moon: "enemy", Mars: "neutral", Jupiter: "neutral", Saturn: "neutral" },
  Jupiter: { Sun: "friend", Moon: "friend", Mars: "friend", Venus: "enemy", Mercury: "enemy", Saturn: "neutral" },
  Venus: { Mercury: "friend", Saturn: "friend", Sun: "enemy", Moon: "enemy", Mars: "neutral", Jupiter: "neutral" },
  Saturn: { Mercury: "friend", Venus: "friend", Sun: "enemy", Moon: "enemy", Mars: "enemy", Jupiter: "neutral" },
};

function getGrahaMaitriScore(r1: number, r2: number): number {
  const lord1 = RASHI_LORDS[r1];
  const lord2 = RASHI_LORDS[r2];
  
  if (lord1 === lord2) return 5;
  
  const f1 = PLANET_FRIENDSHIP[lord1]?.[lord2] || "neutral";
  const f2 = PLANET_FRIENDSHIP[lord2]?.[lord1] || "neutral";
  
  if (f1 === "friend" && f2 === "friend") return 5;
  if (f1 === "friend" || f2 === "friend") return 4;
  if (f1 === "neutral" && f2 === "neutral") return 3;
  if (f1 === "enemy" && f2 === "enemy") return 0;
  return 1;
}

// ─── Gana (Temperament) ───────────────────────────────────────────────────

const NAKSHATRA_GANA: Record<number, string> = {
  0: "Deva", 1: "Manushya", 2: "Rakshasa", 3: "Deva", 4: "Deva",
  5: "Manushya", 6: "Deva", 7: "Deva", 8: "Rakshasa", 9: "Rakshasa",
  10: "Manushya", 11: "Manushya", 12: "Deva", 13: "Rakshasa", 14: "Deva",
  15: "Rakshasa", 16: "Deva", 17: "Rakshasa", 18: "Rakshasa", 19: "Manushya",
  20: "Manushya", 21: "Deva", 22: "Rakshasa", 23: "Rakshasa",
  24: "Manushya", 25: "Manushya", 26: "Deva"
};

function getGanaScore(n1: number, n2: number): number {
  const g1 = NAKSHATRA_GANA[n1] || "Manushya";
  const g2 = NAKSHATRA_GANA[n2] || "Manushya";
  
  if (g1 === g2) return 6;
  if ((g1 === "Deva" && g2 === "Manushya") || (g1 === "Manushya" && g2 === "Deva")) return 5;
  if ((g1 === "Manushya" && g2 === "Rakshasa") || (g1 === "Rakshasa" && g2 === "Manushya")) return 1;
  return 0;
}

// ─── Bhakoot (Moon Sign) ──────────────────────────────────────────────────

function getBhakootScore(r1: number, r2: number): number {
  const diff = Math.abs(r1 - r2);
  const badCombos = [1, 5, 6, 7, 11]; // 2/12, 6/8, 5/9 doshas
  
  if (diff === 0 || diff === 12) return 7;
  if (badCombos.includes(diff)) return 0;
  return 7;
}

// ─── Nadi (Health/Genetic) ────────────────────────────────────────────────

const NAKSHATRA_NADI: Record<number, string> = {
  0: "Vata", 1: "Pitta", 2: "Kapha", 3: "Kapha", 4: "Pitta",
  5: "Vata", 6: "Vata", 7: "Pitta", 8: "Kapha", 9: "Kapha",
  10: "Pitta", 11: "Vata", 12: "Vata", 13: "Pitta", 14: "Kapha",
  15: "Kapha", 16: "Pitta", 17: "Vata", 18: "Vata", 19: "Pitta",
  20: "Kapha", 21: "Kapha", 22: "Pitta", 23: "Vata",
  24: "Vata", 25: "Pitta", 26: "Kapha"
};

function getNadiScore(n1: number, n2: number): number {
  const nadi1 = NAKSHATRA_NADI[n1] || "Vata";
  const nadi2 = NAKSHATRA_NADI[n2] || "Vata";
  
  return nadi1 === nadi2 ? 0 : 8;
}

// ─── Quality Assessment ───────────────────────────────────────────────────

function getQuality(percentage: number): "excellent" | "good" | "moderate" | "challenging" {
  if (percentage >= 75) return "excellent";
  if (percentage >= 60) return "good";
  if (percentage >= 45) return "moderate";
  return "challenging";
}

function getKutaQuality(earned: number, max: number): "excellent" | "good" | "moderate" | "challenging" {
  const pct = (earned / max) * 100;
  return getQuality(pct);
}

// ─── Main Export ──────────────────────────────────────────────────────────

/**
 * Calculate 8-fold Kuta compatibility between two people.
 * Requires Moon nakshatra and rashi for each person.
 */
export function calculateKuta(
  person1: { nakshatra: string; rashi: string },
  person2: { nakshatra: string; rashi: string }
): CompatibilityResult {
  const n1 = NAKSHATRA_INDEX[person1.nakshatra.toLowerCase().replace(/\s/g, "_")] ?? 0;
  const n2 = NAKSHATRA_INDEX[person2.nakshatra.toLowerCase().replace(/\s/g, "_")] ?? 0;
  const r1 = RASHI_INDEX[person1.rashi.toLowerCase()] ?? 0;
  const r2 = RASHI_INDEX[person2.rashi.toLowerCase()] ?? 0;
  
  const kutas: KutaScore[] = [];
  
  // 1. Varna (1 point max)
  const v1 = getVarna(r1);
  const v2 = getVarna(r2);
  const varnaEarned = v1 >= v2 ? 1 : 0;
  kutas.push({
    dimension: "Varna",
    maxPoints: 1,
    earnedPoints: varnaEarned,
    interpretation: varnaEarned === 1
      ? "Spiritual and ego compatibility is harmonious"
      : "Some spiritual ego adjustments may be needed",
    quality: getKutaQuality(varnaEarned, 1),
  });
  
  // 2. Vasya (2 points max)
  const vasyaFavors = VASYA_GROUPS[r1]?.includes(r2) || VASYA_GROUPS[r2]?.includes(r1);
  const vasyaEarned = vasyaFavors ? 2 : (r1 === r2 ? 2 : 0);
  kutas.push({
    dimension: "Vasya",
    maxPoints: 2,
    earnedPoints: vasyaEarned,
    interpretation: vasyaEarned === 2
      ? "Natural mutual respect and cooperation"
      : "Power dynamics may need conscious attention",
    quality: getKutaQuality(vasyaEarned, 2),
  });
  
  // 3. Tara (3 points max)
  const taraEarned = getTaraScore(n1, n2);
  kutas.push({
    dimension: "Tara",
    maxPoints: 3,
    earnedPoints: taraEarned,
    interpretation: taraEarned === 3
      ? "Strong destiny and fortune alignment"
      : "Different life rhythms require understanding",
    quality: getKutaQuality(taraEarned, 3),
  });
  
  // 4. Yoni (4 points max)
  const yoniEarned = getYoniScore(n1, n2);
  kutas.push({
    dimension: "Yoni",
    maxPoints: 4,
    earnedPoints: yoniEarned,
    interpretation: yoniEarned >= 3
      ? "Strong physical and emotional chemistry"
      : yoniEarned >= 2
        ? "Physical connection needs nurturing"
        : "Significant physical compatibility challenges",
    quality: getKutaQuality(yoniEarned, 4),
  });
  
  // 5. Graha Maitri (5 points max)
  const maitriEarned = getGrahaMaitriScore(r1, r2);
  kutas.push({
    dimension: "Graha Maitri",
    maxPoints: 5,
    earnedPoints: maitriEarned,
    interpretation: maitriEarned >= 4
      ? "Excellent mental and emotional rapport"
      : maitriEarned >= 2
        ? "Developing mutual understanding is key"
        : "Mental wavelengths differ significantly",
    quality: getKutaQuality(maitriEarned, 5),
  });
  
  // 6. Gana (6 points max)
  const ganaEarned = getGanaScore(n1, n2);
  kutas.push({
    dimension: "Gana",
    maxPoints: 6,
    earnedPoints: ganaEarned,
    interpretation: ganaEarned >= 5
      ? "Temperaments blend naturally"
      : ganaEarned >= 1
        ? "Some temperament differences to navigate"
        : "Contrasting temperaments require patience",
    quality: getKutaQuality(ganaEarned, 6),
  });
  
  // 7. Bhakoot (7 points max)
  const bhakootEarned = getBhakootScore(r1, r2);
  kutas.push({
    dimension: "Bhakoot",
    maxPoints: 7,
    earnedPoints: bhakootEarned,
    interpretation: bhakootEarned === 7
      ? "Moon sign positions support mutual growth"
      : "Potential for emotional friction exists",
    quality: getKutaQuality(bhakootEarned, 7),
  });
  
  // 8. Nadi (8 points max)
  const nadiEarned = getNadiScore(n1, n2);
  kutas.push({
    dimension: "Nadi",
    maxPoints: 8,
    earnedPoints: nadiEarned,
    interpretation: nadiEarned === 8
      ? "Health and progeny factors are favorable"
      : "Same Nadi may indicate health considerations",
    quality: getKutaQuality(nadiEarned, 8),
  });
  
  const totalEarned = kutas.reduce((sum, k) => sum + k.earnedPoints, 0);
  const totalMax = 36;
  const percentage = Math.round((totalEarned / totalMax) * 100);
  
  return {
    overallScore: totalEarned,
    overallPercentage: percentage,
    quality: getQuality(percentage),
    kutas,
  };
}

/**
 * Parse nakshatra name from various formats.
 */
export function parseNakshatra(input: string): string {
  const normalized = input.toLowerCase().replace(/_/g, " ").trim();
  for (const n of NAKSHATRAS) {
    if (n.toLowerCase() === normalized) return n;
    if (normalized.includes(n.toLowerCase())) return n;
  }
  return input;
}

/**
 * Parse rashi name from various formats.
 */
export function parseRashi(input: string): string {
  const normalized = input.toLowerCase().trim();
  for (const r of RASHIS) {
    if (r.toLowerCase() === normalized) return r;
  }
  return input;
}

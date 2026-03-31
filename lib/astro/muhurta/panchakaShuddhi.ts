/**
 * Pañcaka śuddhi–style scoring: purity of Tithi / Nakṣatra / Karaṇa for general purpose.
 * Malefic sets are configurable; subtract from a baseline "auspiciousness" score.
 */

import type { PanchangaLimbs } from "@/lib/astro/muhurta/panchanga";

export interface PanchakaShuddhiConfig {
  /** Tithi index within pakṣa (1–15): Caturthī, Navamī, Caturdaśī often avoided. */
  maleficTithiIndicesInPaksha: number[];
  /** 0-based Nakṣatra indices (Aśvinī = 0). */
  maleficNakshatraIndices0to26: number[];
  /** 1-based Yoga indices to penalize (e.g. Atigaṇḍa, Śūla, Gaṇḍa, Vyatīpāta, Parigha, Vaidhṛti). */
  maleficYogaIndices1to27: number[];
  pointsTithi: number;
  pointsNakshatra: number;
  pointsYoga: number;
  pointsVishtiKarana: number;
  baseScore: number;
}

export const DEFAULT_PANCHAKA_CONFIG: PanchakaShuddhiConfig = {
  maleficTithiIndicesInPaksha: [4, 9, 14],
  maleficNakshatraIndices0to26: [
    1, // Bharanī
    9, // Maghā
    17, // Jyeṣṭhā
  ],
  maleficYogaIndices1to27: [6, 9, 10, 17, 19, 27],
  pointsTithi: 12,
  pointsNakshatra: 15,
  pointsYoga: 8,
  pointsVishtiKarana: 10,
  baseScore: 100,
};

export interface PanchakaScoreResult {
  score: number;
  deductions: string[];
}

export function scorePanchakaShuddhi(
  limbs: PanchangaLimbs,
  config: PanchakaShuddhiConfig = DEFAULT_PANCHAKA_CONFIG
): PanchakaScoreResult {
  const deductions: string[] = [];
  let score = config.baseScore;

  if (config.maleficTithiIndicesInPaksha.includes(limbs.tithi.indexInPaksha1to15)) {
    score -= config.pointsTithi;
    deductions.push(`Tithi ${limbs.tithi.sanskritName} (${limbs.tithi.paksha}) — reduced purity`);
  }

  if (config.maleficNakshatraIndices0to26.includes(limbs.nakshatra.index0to26)) {
    score -= config.pointsNakshatra;
    deductions.push(`Nakṣatra ${limbs.nakshatra.sanskritName} — flagged for general work`);
  }

  if (config.maleficYogaIndices1to27.includes(limbs.yoga.index1to27)) {
    score -= config.pointsYoga;
    deductions.push(`Yoga ${limbs.yoga.sanskritName} — unfavourable blend`);
  }

  if (limbs.karana.isVishti) {
    score -= config.pointsVishtiKarana;
    deductions.push("Karaṇa Viṣṭi (Bhadra) — traditionally avoided");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    deductions,
  };
}

// STATUS: done | Synthesis Engine Phase 4.1
/**
 * lib/astro/opportunityScoreService.ts
 * Calculate Opportunity Scores (0-100) per life area.
 *
 * Scores reflect readiness for action in each domain:
 * - Career: Western Midheaven transits + Vedic 10th house Dasha activation
 * - Love: Venus/7th house transits + Vedic 7th house Dasha
 * - Relocation: 4th house transits + Vedic 4th Dasha
 * - Health: 6th house transits + Vedic health Dasha
 * - Spirituality: 12th/9th house transits + Vedic spiritual Dasha
 *
 * Score formula (per area):
 * - Base: Dasha activation (0-100)
 * - Boost: Harmonious Western transits (+0-30)
 * - Risk: Challenging transits (-0-20)
 * - Final: clamp(0, base + boost - risk, 100)
 */

import type { SynthesisResult, DashaPeriod } from "@/types";

export interface OpportunityScores {
  career: number;        // 0-100
  love: number;          // 0-100
  relocation: number;    // 0-100
  health: number;        // 0-100
  spirituality: number;  // 0-100
  overall: number;       // Average of all 5
  bestArea: string;      // Highest scoring area
  risky: string[];       // Areas below 40 (proceed cautiously)
}

/**
 * Calculate Opportunity Scores from synthesis result.
 * Each area evaluated on Western + Vedic convergence.
 */
export function calculateOpportunityScores(synthesis: SynthesisResult): OpportunityScores {
  // Base: Dasha activation is the foundation (all areas benefit from strong Dasha)
  const dashaBase = synthesis.currentAntarDasha.strength ?? 50;

  // Calculate each area
  const career = scoreCareer(synthesis, dashaBase);
  const love = scoreLove(synthesis, dashaBase);
  const relocation = scoreRelocation(synthesis, dashaBase);
  const health = scoreHealth(synthesis, dashaBase);
  const spirituality = scoreSpirituality(synthesis, dashaBase);

  // Aggregate
  const scores = [career, love, relocation, health, spirituality];
  const overall = Math.round(scores.reduce((a, b) => a + b) / scores.length);
  const bestArea = ['career', 'love', 'relocation', 'health', 'spirituality'][
    scores.indexOf(Math.max(...scores))
  ];
  const risky = ['career', 'love', 'relocation', 'health', 'spirituality'].filter(
    (_, i) => scores[i] < 40
  );

  return {
    career: Math.round(career),
    love: Math.round(love),
    relocation: Math.round(relocation),
    health: Math.round(health),
    spirituality: Math.round(spirituality),
    overall,
    bestArea,
    risky,
  };
}

/**
 * Career score: Midheaven transits + 10th house Dasha.
 * Strong when Saturn/Jupiter transit Midheaven or 10th house active.
 */
function scoreCareer(synthesis: SynthesisResult, dashaBase: number): number {
  let score = dashaBase;

  // Check for Midheaven aspects in current day's transits
  const hasCareerTransit = synthesis.currentTransits.aspects.some(
    a => (a.planet1 === 'saturn' || a.planet1 === 'jupiter') && a.strength > 50
  );

  if (hasCareerTransit) {
    score += 20;
  }

  // Dasha lord in 10th house is excellent
  const antarName = synthesis.currentAntarDasha.planetName.toLowerCase();
  if (antarName.includes('saturn') || antarName.includes('jupiter')) {
    score += 15;
  }

  // Check for challenging transits
  if (synthesis.currentTransits.aspects.some(a => a.angleName === 'opposition' && a.strength > 70)) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Love score: Venus/7th house transits + 7th house Dasha.
 * Strong when Venus in favorable aspect or 7th house Dasha active.
 */
function scoreLove(synthesis: SynthesisResult, dashaBase: number): number {
  let score = dashaBase;

  // Venus aspects
  const venusAspect = synthesis.currentTransits.aspects.find(a => a.planet1 === 'venus');
  if (venusAspect) {
    if (venusAspect.angleName === 'conjunction' || venusAspect.angleName === 'trine') {
      score += 25;
    } else if (venusAspect.angleName === 'opposition' || venusAspect.angleName === 'square') {
      score -= 20;
    }
  }

  // 7th house planets
  const seventhHousePlanets = synthesis.currentTransits.planets.filter(p => p.house === 7);
  if (seventhHousePlanets.length > 0) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Relocation score: 4th house transits + IC/home Dasha.
 * Strong when 4th house active and Moon/Saturn favorable.
 */
function scoreRelocation(synthesis: SynthesisResult, dashaBase: number): number {
  let score = dashaBase;

  // 4th house planets
  const fourthHousePlanets = synthesis.currentTransits.planets.filter(p => p.house === 4);
  if (fourthHousePlanets.length > 0) {
    score += 15;
  }

  // Saturn aspects (can indicate closure + new start)
  const saturnAspect = synthesis.currentTransits.aspects.find(a => a.planet1 === 'saturn');
  if (saturnAspect && (saturnAspect.angleName === 'square' || saturnAspect.angleName === 'opposition')) {
    score += 10; // Challenging but motivating
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Health score: 6th house transits + Mars/Mercury Dasha.
 * High when 6th house is clear and Mars/Mercury favorable.
 */
function scoreHealth(synthesis: SynthesisResult, dashaBase: number): number {
  let score = dashaBase;

  // 6th house challenges
  const sixthHousePlanets = synthesis.currentTransits.planets.filter(p => p.house === 6);
  if (sixthHousePlanets.some(p => ['mars', 'saturn'].includes(p.name))) {
    score -= 10; // Challenging placements
  } else if (sixthHousePlanets.length > 0) {
    score += 5; // Supportive energy
  }

  // Mercury/Mars favorable
  const mercuryMarsAspect = synthesis.currentTransits.aspects.find(
    a => (a.planet1 === 'mercury' || a.planet1 === 'mars') &&
         (a.angleName === 'sextile' || a.angleName === 'trine')
  );
  if (mercuryMarsAspect) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Spirituality score: 12th/9th house transits + Ketu/Jupiter Dasha.
 * High during introspective or expansive periods.
 */
function scoreSpirituality(synthesis: SynthesisResult, dashaBase: number): number {
  let score = dashaBase;

  // 9th house expansion
  const ninthHousePlanets = synthesis.currentTransits.planets.filter(p => p.house === 9);
  if (ninthHousePlanets.length > 0) {
    score += 20;
  }

  // 12th house introspection
  const twelfthHousePlanets = synthesis.currentTransits.planets.filter(p => p.house === 12);
  if (twelfthHousePlanets.length > 0) {
    score += 15;
  }

  // Jupiter/Neptune favorable
  const spiritualAspect = synthesis.currentTransits.aspects.find(
    a => (a.planet1 === 'jupiter' || a.planet1 === 'neptune') && a.strength > 60
  );
  if (spiritualAspect) {
    score += 20;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Translate score to verbal guidance.
 * Used by UI to show actionable insights.
 */
export function scoreToGuidance(area: string, score: number): string {
  if (score >= 80) {
    return `Excellent timing for ${area}. Strong support from current cycles. Move forward with confidence.`;
  }
  if (score >= 60) {
    return `Good conditions for ${area}. Moderate support. Proceed with thoughtful planning.`;
  }
  if (score >= 40) {
    return `Mixed signals for ${area}. Possible, but requires careful navigation. Consider additional timing checks.`;
  }
  return `Challenging period for ${area}. Suggest waiting or focusing on preparation. Timing will improve.`;
}

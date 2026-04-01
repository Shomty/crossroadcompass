// STATUS: done | Synthesis Engine Phase 4.2
/**
 * lib/ai/synthesisInsightService.ts
 * Generate human-readable synthesis verdicts using Gemini API.
 *
 * Takes matched If-Then rules + convergence data → Expands into actionable text.
 * Cached in KV (24h TTL) to avoid redundant API calls.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { KV_TTL } from "@/lib/kv/keys";
import type { IfThenRule, ConvergenceEvent, OpportunityScores } from "@/types";

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

/**
 * Generate synthesis insight from matched rules + convergence data.
 * Returns 3-4 sentences of actionable guidance.
 *
 * Cached per user per day (KV key: synthesis-insight:${userId}:${YYYY-MM-DD})
 */
export async function generateSynthesisInsight(
  userId: string,
  matchedRules: IfThenRule[],
  convergenceScore: number,
  opportunityScores: OpportunityScores,
  eventDate: string
): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    // Graceful fallback if Gemini not configured
    return fallbackInsight(matchedRules, convergenceScore, opportunityScores);
  }

  const cacheKey = `synthesis-insight:${userId}:${eventDate}`;
  const cached = await kvGet<string>(cacheKey);
  if (cached) return cached;

  try {
    if (!model) throw new Error("Gemini API not configured");
    const prompt = buildPrompt(matchedRules, convergenceScore, opportunityScores, eventDate);
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Cache result
    await kvSet(cacheKey, text, KV_TTL.SYNTHESIS_SECONDS);

    return text;
  } catch (error) {
    console.error("[synthesisInsightService] Gemini API error:", error);
    return fallbackInsight(matchedRules, convergenceScore, opportunityScores);
  }
}

/**
 * Build prompt for Gemini.
 * Includes matched rules, convergence score, opportunity scores, and date.
 */
function buildPrompt(
  matchedRules: IfThenRule[],
  convergenceScore: number,
  scores: OpportunityScores,
  eventDate: string
): string {
  const rulesSummary = matchedRules
    .slice(0, 3) // Top 3 rules only
    .map(r => `• ${r.verdict}`)
    .join("\n");

  const topArea = scores.bestArea.charAt(0).toUpperCase() + scores.bestArea.slice(1);
  const riskAreas = scores.risky.length > 0 ? `Areas to avoid: ${scores.risky.join(", ")}` : "";

  return `You are a Vedic and Western astrology synthesis expert. Generate a 3-4 sentence guidance for this moment:

Date: ${eventDate}
Convergence Score: ${convergenceScore}/100
Best Opportunity Area: ${topArea} (score: ${scores[scores.bestArea as keyof typeof scores]}/100)
${riskAreas}

Matched Astrological Rules:
${rulesSummary}

Synthesize this into warm, practical guidance that:
1. Acknowledges the convergence strength (${convergenceScore}/100 is ${
    convergenceScore > 70 ? "high" : convergenceScore > 50 ? "moderate" : "low"
  })
2. Highlights the best opportunity area (${scores.bestArea})
3. Provides one specific action for the next 7 days
4. Uses the word "you" to feel personal

Keep it under 4 sentences, actionable, and avoid woo language. Focus on psychological readiness meeting astrological timing.`;
}

/**
 * Fallback insight when Gemini API unavailable.
 * Uses simple heuristics + matched rule verdicts.
 */
function fallbackInsight(
  matchedRules: IfThenRule[],
  convergenceScore: number,
  scores: OpportunityScores
): string {
  if (matchedRules.length > 0) {
    // Use the best matched rule verdict
    const topRule = matchedRules[0];
    return `${topRule.verdict} The timing is ${
      convergenceScore > 70 ? "strongly" : convergenceScore > 50 ? "moderately" : "somewhat"
    } favorable. Focus on ${scores.bestArea} where your charts show the most support (${
      scores[scores.bestArea as keyof typeof scores]
    }/100). Trust the convergence and act accordingly.`;
  }

  return `Your Western transits and Vedic Dasha are in ${
    convergenceScore > 50 ? "alignment" : "independent cycles"
  }. The best opportunity right now is in ${scores.bestArea} (score: ${
    scores[scores.bestArea as keyof typeof scores]
  }/100). Proceed thoughtfully over the next week.`;
}

/**
 * Generate brief daily guidance combining all life areas.
 * Used for dashboard card summaries.
 */
export async function generateDailyGuidance(
  userId: string,
  opportunityScores: OpportunityScores,
  convergenceScore: number
): Promise<string> {
  const cacheKey = `daily-guidance:${userId}:${new Date().toISOString().split('T')[0]}`;
  const cached = await kvGet<string>(cacheKey);
  if (cached) return cached;

  const prompt = `Generate a 2-sentence morning guidance that:
1. Acknowledges overall convergence strength: ${convergenceScore}/100
2. Highlights the best opportunity: ${
    opportunityScores.bestArea
  } (${opportunityScores[opportunityScores.bestArea as keyof typeof opportunityScores]}/100)
3. Recommends alignment with one of the 5 life areas
4. Feels warm and personal

Keep it under 2 sentences, practical, no woo.`;

  try {
    if (!model) throw new Error("Gemini API not configured");

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    await kvSet(cacheKey, text, KV_TTL.SYNTHESIS_SECONDS);
    return text;
  } catch (error) {
    console.error("[generateDailyGuidance] Error:", error);
    return `Today's best opportunity is in ${opportunityScores.bestArea}. Trust your readiness and act aligned with the cycles.`;
  }
}

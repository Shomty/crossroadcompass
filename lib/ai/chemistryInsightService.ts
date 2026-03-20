// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * lib/ai/chemistryInsightService.ts
 * AI-powered compatibility synthesis using Gemini.
 * Combines Kuta and HD composite analysis into narrative insights.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { calculateKuta, parseNakshatra, parseRashi, type CompatibilityResult } from "@/lib/astro/kutaService";
import { analyzeHDComposite, type HDCompositeResult } from "@/lib/astro/hdCompositeService";
import type { HDChartData } from "@/types";

// ─── Gemini Singleton ─────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY ?? "" });
  return _gemini;
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface PartnerData {
  name: string;
  nakshatra: string;
  rashi: string;
  hdChart?: HDChartData;
}

export interface ChemistryInsight {
  headline: string;
  overallNarrative: string;
  kutaHighlights: string[];
  hdHighlights: string[];
  attractions: string[];
  challenges: string[];
  growthOpportunities: string[];
  practicalAdvice: string;
}

export interface GlimpseChemistryInsight {
  scoreDisplay: string;
  oneLineHook: string;
  topKutaDimension: string;
}

export interface FullChemistryResult {
  kutaResult: CompatibilityResult;
  hdComposite: HDCompositeResult | null;
  insight: ChemistryInsight;
}

// ─── Prompt Building ──────────────────────────────────────────────────────

function buildChemistryPrompt(
  userName: string,
  partnerName: string,
  kutaResult: CompatibilityResult,
  hdComposite: HDCompositeResult | null
): string {
  const kutaSummary = kutaResult.kutas
    .map(k => `- ${k.dimension}: ${k.earnedPoints}/${k.maxPoints} (${k.quality})`)
    .join("\n");
  
  const hdSummary = hdComposite ? `
HD COMPOSITE:
- Type Dynamic: ${hdComposite.typeDynamic}
- Authority Interplay: ${hdComposite.authorityInterplay}
- Electromagnetic Channels: ${hdComposite.channelConnections.filter(c => c.type === "electromagnetic").map(c => c.channel).join(", ") || "None"}
- Attractions: ${hdComposite.attractions.length}
- Compromises: ${hdComposite.compromises.length}
` : "HD composite data not available.";

  return `You are a relationship astrologer helping ${userName} understand their compatibility with ${partnerName}.

KUTA ANALYSIS (Vedic Compatibility):
Overall Score: ${kutaResult.overallScore}/36 (${kutaResult.overallPercentage}%)
Quality: ${kutaResult.quality}

Dimension Scores:
${kutaSummary}
${hdSummary}

INSTRUCTIONS:
1. Synthesize both Kuta and HD insights into a warm, balanced narrative
2. Highlight 2-3 key strengths (attractions)
3. Acknowledge 1-2 challenges with constructive framing
4. Offer practical relationship advice
5. Use warm but grounded language—no mystical hyperbole
6. Be honest but compassionate if compatibility is low

Return ONLY valid JSON:
{
  "headline": "A 5-8 word essence of this connection",
  "overallNarrative": "2-3 paragraphs synthesizing the compatibility picture",
  "kutaHighlights": ["Key insight from Kuta 1", "Key insight from Kuta 2"],
  "hdHighlights": ["HD insight 1", "HD insight 2"],
  "attractions": ["What draws you together 1", "What draws you together 2"],
  "challenges": ["Challenge to navigate 1", "Challenge to navigate 2"],
  "growthOpportunities": ["Growth opportunity 1", "Growth opportunity 2"],
  "practicalAdvice": "2-3 sentences of actionable relationship guidance"
}`;
}

// ─── Generation Functions ─────────────────────────────────────────────────

export async function generateChemistryInsight(
  userName: string,
  userNakshatra: string,
  userRashi: string,
  userHDChart: HDChartData | undefined,
  partner: PartnerData
): Promise<FullChemistryResult> {
  const kutaResult = calculateKuta(
    { nakshatra: parseNakshatra(userNakshatra), rashi: parseRashi(userRashi) },
    { nakshatra: parseNakshatra(partner.nakshatra), rashi: parseRashi(partner.rashi) }
  );
  
  let hdComposite: HDCompositeResult | null = null;
  if (userHDChart && partner.hdChart) {
    hdComposite = analyzeHDComposite(userHDChart, partner.hdChart);
  }
  
  const prompt = buildChemistryPrompt(userName, partner.name, kutaResult, hdComposite);
  
  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.75,
      maxOutputTokens: 8192,
    },
  });
  
  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");
  
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const insight = JSON.parse(clean) as ChemistryInsight;
  
  return { kutaResult, hdComposite, insight };
}

export async function generateGlimpseChemistry(
  userNakshatra: string,
  userRashi: string,
  partner: PartnerData
): Promise<{ kutaResult: CompatibilityResult; glimpse: GlimpseChemistryInsight }> {
  const kutaResult = calculateKuta(
    { nakshatra: parseNakshatra(userNakshatra), rashi: parseRashi(userRashi) },
    { nakshatra: parseNakshatra(partner.nakshatra), rashi: parseRashi(partner.rashi) }
  );
  
  const topKuta = [...kutaResult.kutas].sort(
    (a, b) => (b.earnedPoints / b.maxPoints) - (a.earnedPoints / a.maxPoints)
  )[0];
  
  const glimpse: GlimpseChemistryInsight = {
    scoreDisplay: `${kutaResult.overallPercentage}%`,
    oneLineHook: kutaResult.overallPercentage >= 70
      ? "Strong cosmic alignment detected"
      : kutaResult.overallPercentage >= 50
        ? "Promising potential with growth areas"
        : "Unique dynamic requiring awareness",
    topKutaDimension: `${topKuta.dimension}: ${topKuta.interpretation}`,
  };
  
  return { kutaResult, glimpse };
}

/**
 * Quick score calculation without AI (for preview).
 */
export function getQuickCompatibility(
  userNakshatra: string,
  userRashi: string,
  partnerNakshatra: string,
  partnerRashi: string
): CompatibilityResult {
  return calculateKuta(
    { nakshatra: parseNakshatra(userNakshatra), rashi: parseRashi(userRashi) },
    { nakshatra: parseNakshatra(partnerNakshatra), rashi: parseRashi(partnerRashi) }
  );
}

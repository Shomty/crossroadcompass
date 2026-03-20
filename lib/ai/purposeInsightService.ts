// STATUS: done | Premium Features - Purpose Decoder
/**
 * lib/ai/purposeInsightService.ts
 * AI-powered purpose/career synthesis using Gemini.
 * Generates narrative insights from Vedic + HD chart analysis.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { analyzePurpose, type PurposeData, type CareerArchetype } from "@/lib/astro/purposeService";
import type { BirthProfile } from "@prisma/client";
import { InsightType } from "@prisma/client";

// ─── Gemini Singleton ─────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY ?? "" });
  return _gemini;
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface PurposeInsight {
  purposeTheme: string;
  overview: string;
  tenthHouseNarrative: string;
  hdPurposeNarrative: string;
  archetypes: {
    name: string;
    match: string;
    guidance: string;
  }[];
  practicalSteps: string[];
  idealEnvironment: string;
  leadershipStyle: string;
  timingGuidance: string;
  generatedAt: string;
}

export interface GlimpsePurposeInsight {
  purposeTheme: string;
  overview: string;
}

// ─── Prompt Building ──────────────────────────────────────────────────────

function buildPurposePrompt(data: PurposeData, userName: string): string {
  const archetypeList = data.matchedArchetypes
    .map(a => `- ${a.name}: ${a.description}`)
    .join("\n");

  return `You are a synthesizer of Vedic astrology and Human Design wisdom, helping ${userName} understand their life purpose and career path.

CHART DATA:
- HD Type: ${data.hdType}
- HD Profile: ${data.hdProfile}
- HD Authority: ${data.hdAuthority}
- Incarnation Cross: ${data.incarnationCross.name} (${data.incarnationCross.type})
- Cross Gates: ${data.incarnationCross.gates.join(", ")}
- Defined Centers: ${data.definedCenters.join(", ") || "None"}
- Undefined Centers: ${data.undefinedCenters.join(", ") || "None"}
- Variables: Digestion (${data.variables.digestion}), Environment (${data.variables.environment}), Perspective (${data.variables.perspective}), Motivation (${data.variables.motivation})

VEDIC 10TH HOUSE:
- 10th House Lord: ${data.tenthHouse.tenthHouseLord} in ${data.tenthHouse.tenthHouseLordPlacement.sign} (House ${data.tenthHouse.tenthHouseLordPlacement.house})
- 10th House Sign: ${data.tenthHouse.tenthHouseSign}
- Dignity: ${data.tenthHouse.tenthHouseLordPlacement.dignity}
- Planets in 10th: ${data.tenthHouse.planetsInTenth.join(", ") || "None"}
- Dispositor Chain: ${data.tenthHouse.dispositorChain.join(" → ") || "N/A"}
${data.d10 ? `
D10 CAREER CHART:
- D10 Ascendant: ${data.d10.ascendantSign}
- D10 10th Lord: ${data.d10.tenthLord} in ${data.d10.tenthLordPlacement.sign} (House ${data.d10.tenthLordPlacement.house})
- Strongest Planet: ${data.d10.strongestPlanet || "N/A"}` : ""}

MATCHED ARCHETYPES (based on planetary + HD type correlation):
${archetypeList}

INSTRUCTIONS:
1. Synthesize both systems into a coherent narrative about ${userName}'s purpose
2. Explain how the 10th house lord and its placement indicate career direction
3. Describe how their HD Type, Profile, and Incarnation Cross shape their unique contribution
4. For each archetype match, explain WHY it resonates with their specific chart
5. Provide practical, actionable guidance
6. Use warm but grounded language — no mystical hyperbole
7. Every astrological term must be briefly explained on first use

Return ONLY valid JSON in this exact format:
{
  "purposeTheme": "A 4-6 word essence of their purpose",
  "overview": "2-3 paragraphs synthesizing both systems into a unified purpose narrative",
  "tenthHouseNarrative": "1-2 paragraphs specifically about their 10th house and what it indicates for career",
  "hdPurposeNarrative": "1-2 paragraphs about how their HD design shapes their purpose expression",
  "archetypes": [
    {
      "name": "Archetype name",
      "match": "Why this archetype matches their chart specifically",
      "guidance": "How to embody this archetype authentically"
    }
  ],
  "practicalSteps": ["Step 1", "Step 2", "Step 3"],
  "idealEnvironment": "Description of their ideal work environment based on Variables and HD",
  "leadershipStyle": "Their natural leadership approach based on Authority and Profile",
  "timingGuidance": "Brief note on how to use their HD Strategy for career decisions"
}`;
}

function buildGlimpsePrompt(data: PurposeData, userName: string): string {
  return `You are a synthesizer of Vedic astrology and Human Design. Write a brief purpose glimpse for ${userName}.

KEY DATA:
- HD Type: ${data.hdType}, Profile: ${data.hdProfile}
- Incarnation Cross: ${data.incarnationCross.name}
- 10th House Lord: ${data.tenthHouse.tenthHouseLord} in ${data.tenthHouse.tenthHouseSign}

Write a compelling 2-3 sentence overview of their purpose theme that creates curiosity for the full reading.
Use warm, specific language — no vague mysticism.

Return ONLY valid JSON:
{
  "purposeTheme": "A 4-6 word essence",
  "overview": "2-3 sentences about their core purpose direction"
}`;
}

// ─── Cache Key ────────────────────────────────────────────────────────────

const PURPOSE_EPOCH = new Date("2000-01-02T00:00:00.000Z");

// ─── Generation Functions ─────────────────────────────────────────────────

export async function generatePurposeInsight(
  userId: string,
  birthProfile: BirthProfile
): Promise<PurposeInsight> {
  const data = await analyzePurpose(userId, birthProfile);
  const userName = birthProfile.birthName.split(" ")[0];
  
  const prompt = buildPurposePrompt(data, userName);
  
  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.75,
      maxOutputTokens: 4096,
    },
  });
  
  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");
  
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<PurposeInsight, "generatedAt">;
  
  if (!parsed.purposeTheme || !parsed.overview || !Array.isArray(parsed.archetypes)) {
    throw new Error("Gemini response missing required fields");
  }
  
  const insight: PurposeInsight = { ...parsed, generatedAt: new Date().toISOString() };
  
  await db.insight.upsert({
    where: {
      userId_type_periodDate: { userId, type: InsightType.CAREER, periodDate: PURPOSE_EPOCH },
    },
    create: {
      userId,
      type: InsightType.CAREER,
      periodDate: PURPOSE_EPOCH,
      content: JSON.stringify(insight),
      reviewedByConsultant: false,
    },
    update: {
      content: JSON.stringify(insight),
      generatedAt: new Date(),
    },
  });
  
  return insight;
}

export async function generateGlimpsePurposeInsight(
  userId: string,
  birthProfile: BirthProfile
): Promise<GlimpsePurposeInsight> {
  const data = await analyzePurpose(userId, birthProfile);
  const userName = birthProfile.birthName.split(" ")[0];
  
  const prompt = buildGlimpsePrompt(data, userName);
  
  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  });
  
  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");
  
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean) as GlimpsePurposeInsight;
}

// ─── Cache Retrieval ──────────────────────────────────────────────────────

export async function getPurposeInsight(userId: string): Promise<PurposeInsight | null> {
  const row = await db.insight.findUnique({
    where: {
      userId_type_periodDate: { userId, type: InsightType.CAREER, periodDate: PURPOSE_EPOCH },
    },
  });
  
  if (!row) return null;
  
  try {
    return JSON.parse(row.content) as PurposeInsight;
  } catch {
    return null;
  }
}

export async function getOrGeneratePurposeInsight(
  userId: string,
  birthProfile: BirthProfile,
  forceRegenerate = false
): Promise<PurposeInsight> {
  if (!forceRegenerate) {
    const cached = await getPurposeInsight(userId);
    if (cached) return cached;
  }
  
  return generatePurposeInsight(userId, birthProfile);
}

// STATUS: done | Premium Features - Shadow Work Portal
/**
 * lib/ai/shadowInsightService.ts
 * AI-powered shadow work synthesis using Gemini.
 * Generates narrative insights and journaling prompts from shadow analysis.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { analyzeShadow, type ShadowData } from "@/lib/astro/shadowService";
import type { BirthProfile } from "@prisma/client";
import { InsightType } from "@prisma/client";

// ─── Gemini Singleton ─────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY ?? "" });
  return _gemini;
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface JournalingPrompt {
  theme: string;
  prompt: string;
  depth: "surface" | "medium" | "deep";
}

export interface ShadowInsight {
  shadowTheme: string;
  overview: string;
  twelfthHouseNarrative: string;
  ketuNarrative: string;
  undefinedCentersNarrative: string;
  shadowPatterns: {
    name: string;
    description: string;
    integration: string;
  }[];
  journalingPrompts: JournalingPrompt[];
  practicalPractices: string[];
  compassionStatement: string;
  generatedAt: string;
}

export interface GlimpseShadowInsight {
  shadowTheme: string;
  overview: string;
}

// ─── Prompt Building ──────────────────────────────────────────────────────

function buildShadowPrompt(data: ShadowData, userName: string): string {
  const patternsList = data.shadowPatterns
    .map(p => `- ${p.name}: ${p.description} (${p.theme})`)
    .join("\n");
  
  const undefinedList = data.undefinedCenters
    .map(c => `- ${c.center}: ${c.shadowPattern}`)
    .join("\n");

  return `You are a compassionate guide helping ${userName} understand their shadow patterns through the lens of Vedic astrology and Human Design. Shadow work is about integration, not elimination—these patterns contain hidden gifts.

IMPORTANT TONE: Be warm, gentle, and non-judgmental. Shadow patterns are not flaws—they're doorways to growth. Avoid clinical or harsh language.

SHADOW DATA:
HD Type: ${data.hdType}
HD Authority: ${data.hdAuthority}
Not-Self Theme: ${data.notSelfTheme}

12TH HOUSE (Subconscious/Hidden):
- Sign: ${data.twelfthHouse.sign}
- Lord: ${data.twelfthHouse.lord} in ${data.twelfthHouse.lordPlacement.sign} (House ${data.twelfthHouse.lordPlacement.house})
- Planets in 12th: ${data.twelfthHouse.planetsIn12th.map(p => p.name).join(", ") || "None"}
${data.twelfthHouse.ketuPlacement ? `
KETU (Karmic Release Point):
- Placement: House ${data.twelfthHouse.ketuPlacement.house} in ${data.twelfthHouse.ketuPlacement.sign}
- Nakshatra: ${data.twelfthHouse.ketuPlacement.nakshatra}
- Aspects: ${data.twelfthHouse.ketuAspects.join(", ") || "None"}` : ""}

UNDEFINED HD CENTERS (Conditioning Vulnerabilities):
${undefinedList}

IDENTIFIED SHADOW PATTERNS:
${patternsList}

INSTRUCTIONS:
1. Synthesize these patterns into a compassionate narrative
2. Help ${userName} see these as opportunities for growth, not problems to fix
3. Create journaling prompts that are specific to their chart (not generic)
4. Suggest practical practices aligned with their HD Authority
5. Use warm, supportive language throughout
6. End with a self-compassion statement

Return ONLY valid JSON in this exact format:
{
  "shadowTheme": "A 4-6 word essence of their shadow work journey",
  "overview": "2-3 paragraphs introducing their shadow landscape with compassion",
  "twelfthHouseNarrative": "1-2 paragraphs about their 12th house and what it reveals about hidden patterns",
  "ketuNarrative": "1-2 paragraphs about Ketu placement and karmic release themes (or N/A if no Ketu data)",
  "undefinedCentersNarrative": "1-2 paragraphs about their undefined centers as sources of wisdom",
  "shadowPatterns": [
    {
      "name": "Pattern name",
      "description": "What this pattern looks like in daily life",
      "integration": "How to work with this pattern compassionately"
    }
  ],
  "journalingPrompts": [
    {
      "theme": "Theme of this prompt",
      "prompt": "The actual journaling question (specific to their chart)",
      "depth": "surface | medium | deep"
    }
  ],
  "practicalPractices": ["Practice 1 aligned with their Authority", "Practice 2", "Practice 3"],
  "compassionStatement": "A gentle reminder about self-compassion specific to their patterns"
}`;
}

function buildGlimpsePrompt(data: ShadowData, userName: string): string {
  return `You are a compassionate guide helping ${userName} glimpse their shadow patterns.

KEY DATA:
- HD Type: ${data.hdType}
- Not-Self Theme: ${data.notSelfTheme}
- Undefined Centers: ${data.undefinedCenters.map(c => c.center).join(", ")}
- 12th House Sign: ${data.twelfthHouse.sign}

Write a compelling 2-3 sentence overview of their shadow theme that creates curiosity for deeper exploration.
Be warm and non-judgmental—shadow work is about integration, not fixing.

Return ONLY valid JSON:
{
  "shadowTheme": "A 4-6 word essence",
  "overview": "2-3 sentences about their core shadow landscape"
}`;
}

// ─── Cache Key ────────────────────────────────────────────────────────────

const SHADOW_EPOCH = new Date("2000-01-03T00:00:00.000Z");

// ─── Generation Functions ─────────────────────────────────────────────────

export async function generateShadowInsight(
  userId: string,
  birthProfile: BirthProfile
): Promise<ShadowInsight> {
  const data = await analyzeShadow(userId, birthProfile);
  const userName = birthProfile.birthName.split(" ")[0];
  
  const prompt = buildShadowPrompt(data, userName);
  
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
  const parsed = JSON.parse(clean) as Omit<ShadowInsight, "generatedAt">;
  
  if (!parsed.shadowTheme || !parsed.overview || !Array.isArray(parsed.journalingPrompts)) {
    throw new Error("Gemini response missing required fields");
  }
  
  const insight: ShadowInsight = { ...parsed, generatedAt: new Date().toISOString() };
  
  await db.insight.upsert({
    where: {
      userId_type_periodDate: { userId, type: InsightType.HEALTH, periodDate: SHADOW_EPOCH },
    },
    create: {
      userId,
      type: InsightType.HEALTH,
      periodDate: SHADOW_EPOCH,
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

export async function generateGlimpseShadowInsight(
  userId: string,
  birthProfile: BirthProfile
): Promise<GlimpseShadowInsight> {
  const data = await analyzeShadow(userId, birthProfile);
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
  return JSON.parse(clean) as GlimpseShadowInsight;
}

// ─── Cache Retrieval ──────────────────────────────────────────────────────

export async function getShadowInsight(userId: string): Promise<ShadowInsight | null> {
  const row = await db.insight.findUnique({
    where: {
      userId_type_periodDate: { userId, type: InsightType.HEALTH, periodDate: SHADOW_EPOCH },
    },
  });
  
  if (!row) return null;
  
  try {
    return JSON.parse(row.content) as ShadowInsight;
  } catch {
    return null;
  }
}

export async function getOrGenerateShadowInsight(
  userId: string,
  birthProfile: BirthProfile,
  forceRegenerate = false
): Promise<ShadowInsight> {
  if (!forceRegenerate) {
    const cached = await getShadowInsight(userId);
    if (cached) return cached;
  }
  
  return generateShadowInsight(userId, birthProfile);
}

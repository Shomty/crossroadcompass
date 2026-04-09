/**
 * lib/reports/natalMultiDomainReportService.ts
 * Generates a multi-domain natal synthesis report using Gemini.
 * Ported from test/03-report-generator.ts — Anthropic replaced with Gemini.
 * Server-only. Never import from a client component.
 *
 * AI provider: Gemini (always). The user's CosmicChat model preference does NOT
 * affect report generation — reports always use the configured Gemini model.
 */

import type { VedicChartCalculations, WesternChartCalculations, ZodiacSign } from "openastrology-library";
import type {
  NatalAstroReport,
  NatalReportConfig,
  NatalReportSection,
  NatalSynthesisResult,
  NatalLifeDomain,
  NatalConvergenceLevel,
  ArchetypeMapping,
  ThemeConvergence,
} from "@/types/natal-report";
import {
  DOMAIN_AUTHORITIES,
  DOMAIN_TITLES,
  DOMAIN_RELEVANT_THEMES,
  DOMAIN_RELEVANT_PLANETS,
  WORD_BUDGETS,
  NAKSHATRA_DATA,
} from "@/lib/astro/natalReportKnowledge";
import { geminiGenerate } from "@/lib/ai/geminiClient";
import { db } from "@/lib/db";
import type { BirthProfile } from "@prisma/client";

// ─── Public Entry Points ──────────────────────────────────────────────────────

/**
 * Cache-aware wrapper: returns stored report if birth data hasn't changed,
 * otherwise generates fresh via LLM and persists to DB.
 */
export async function getOrCreateNatalReport(
  userId: string,
  birthProfile: BirthProfile,
  vedic: VedicChartCalculations,
  western: WesternChartCalculations,
  synthesis: NatalSynthesisResult,
  config: NatalReportConfig
): Promise<NatalAstroReport> {
  const stored = birthProfile.natalReportData as NatalAstroReport | null;
  const storedVersion = birthProfile.natalReportProfileVersion;
  const currentVersion = birthProfile.profileVersion;

  if (stored && storedVersion === currentVersion) {
    return stored;
  }

  const report = await generateNatalReport(vedic, western, synthesis, config);

  await db.birthProfile.update({
    where: { userId },
    data: {
      natalReportData: report as object,
      natalReportProfileVersion: currentVersion,
    },
  });

  return report;
}

export async function generateNatalReport(
  vedic: VedicChartCalculations,
  western: WesternChartCalculations,
  synthesis: NatalSynthesisResult,
  config: NatalReportConfig
): Promise<NatalAstroReport> {
  const domains = resolveDomains(config.scope);
  const systemPrompt = buildSystemPrompt(config.depth);
  const globalContext = buildGlobalContext(vedic, western, synthesis);

  // Parallel for non-timing domains; sequential for timing (timing_current must precede timing_forecast)
  const timingDomains: NatalLifeDomain[] = ["timing_current", "timing_forecast"];
  const parallelDomains = domains.filter((d) => !timingDomains.includes(d));
  const sequentialDomains = domains.filter((d) => timingDomains.includes(d));

  const [parallelSections, sequentialSections] = await Promise.all([
    Promise.all(
      parallelDomains.map((domain) =>
        generateSection(domain, vedic, western, synthesis, config, systemPrompt, globalContext)
      )
    ),
    (async () => {
      const results: NatalReportSection[] = [];
      for (const domain of sequentialDomains) {
        results.push(
          await generateSection(domain, vedic, western, synthesis, config, systemPrompt, globalContext)
        );
      }
      return results;
    })(),
  ]);

  // Re-order sections to match original domain order
  const allSections = [...parallelSections, ...sequentialSections];
  const ordered = domains.map((d) => allSections.find((s) => s.domain === d)).filter(Boolean) as NatalReportSection[];

  const overallNarrative = await generateOverallNarrative(vedic, western, synthesis, config.depth, systemPrompt);

  return {
    sections: ordered,
    overallNarrative,
    generatedAt: new Date().toISOString(),
    config,
    metadata: {
      convergenceScore: calculateConvergenceScore(synthesis),
      overallCoherence: synthesis.overallCoherence,
      keyTensions: synthesis.keyTensions,
      gestaltSummary: synthesis.gestaltSummary,
    },
  };
}

// ─── Section Generator ────────────────────────────────────────────────────────

async function generateSection(
  domain: NatalLifeDomain,
  vedic: VedicChartCalculations,
  western: WesternChartCalculations,
  synthesis: NatalSynthesisResult,
  config: NatalReportConfig,
  systemPrompt: string,
  globalContext: string
): Promise<NatalReportSection> {
  const authority = DOMAIN_AUTHORITIES[domain];
  const convergences = synthesis.convergences.filter((c) =>
    isDomainRelevantTheme(domain, c.theme)
  );
  const archetypes = synthesis.archetypes.filter((a) =>
    isDomainRelevantPlanet(domain, a.planet)
  );
  const wordBudget = WORD_BUDGETS[domain][config.depth];
  const depthInstruction = buildDepthInstruction(config.depth, domain);
  const toneInstruction = buildToneInstruction(domain);
  const topConvergence = getMostRelevantConvergence(convergences);

  const userMessage = buildSectionUserMessage({
    domain,
    authority,
    convergence: convergences,
    archetypes,
    rawAstrological: {
      western: serializeWesternForDomain(domain, western),
      jyotish: serializeJyotishForDomain(domain, vedic),
    },
    wordBudget,
    depthInstruction,
    toneInstruction,
  }, globalContext);

  const raw = await geminiGenerate("pro", userMessage, systemPrompt);
  const parsed = parseLLMResponse(raw);

  return {
    domain,
    title: DOMAIN_TITLES[domain],
    narrative: parsed.narrative,
    keyInsights: parsed.keyInsights,
    convergenceLevel: topConvergence,
  };
}

// ─── Overall Narrative ────────────────────────────────────────────────────────

async function generateOverallNarrative(
  vedic: VedicChartCalculations,
  western: WesternChartCalculations,
  synthesis: NatalSynthesisResult,
  depth: NatalReportConfig["depth"],
  systemPrompt: string
): Promise<string> {
  const moonNakshatra = vedic.planets.moon.nakshatra;
  const nakshatraEntry = NAKSHATRA_DATA[moonNakshatra];

  const userMessage = `Write a 3-4 paragraph opening statement for this person's natal synthesis report.

GESTALT: ${synthesis.gestaltSummary}

OVERALL COHERENCE: ${synthesis.overallCoherence}

HIGHEST CONVERGENCES:
${synthesis.convergences
  .filter((c) => c.convergenceLevel === "high")
  .map((c) => `- ${c.theme}: ${c.unifiedStatement}`)
  .join("\n")}

KEY TENSIONS:
${synthesis.keyTensions.length > 0 ? synthesis.keyTensions.map((t) => `- ${t}`).join("\n") : "None identified."}

Moon Nakshatra: ${nakshatraEntry?.displayName ?? moonNakshatra} (${nakshatraEntry?.motivation ?? "Dharma"} motivation)
Western Ascendant: ${western.ascendant.sign}
Vedic Lagna: ${vedic.ascendant.sign}

Depth: ${depth}

Write 3-4 flowing paragraphs that serve as the opening soul statement for this report. 
Return plain text only, no JSON.`;

  const raw = await geminiGenerate("pro", userMessage, systemPrompt);
  return parseLLMResponse(raw).narrative;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(depth: NatalReportConfig["depth"]): string {
  const depthInstructions: Record<NatalReportConfig["depth"], string> = {
    deep: "Write with psychological depth and philosophical precision. Use archetypal language. Do not oversimplify. Assume the reader is intelligent and introspective.",
    balanced: "Write clearly and meaningfully. Balance depth with accessibility. Avoid jargon but do not dumb down. The reader is curious and open-minded.",
    accessible: "Write warmly and clearly. Use plain language. Keep insights concrete and actionable. The reader is new to astrology but genuinely interested in self-understanding.",
  };

  return `You are a master astrologer and depth psychologist specializing in the synthesis of Western astrology, Jyotish (Vedic astrology), and Jungian psychology.

Your role is to generate one section of a comprehensive personal astrology report. You draw on:
- Western astrology interpreted through a Liz Greene / Jungian psychological lens
- Jyotish interpreted through Nakshatra wisdom and the dharmic framework of Rudhyar
- The synthesis layer already provided to you, which has analyzed convergences between both systems

WRITING PRINCIPLES:
- ${depthInstructions[depth]}
- Never produce a list of disconnected traits. Write as a flowing, coherent narrative.
- Ground abstract concepts in psychological reality.
- When systems converge, write with confidence. When they diverge, name it honestly as two valid perspectives.
- Avoid fortune-telling language. Write in terms of tendencies, patterns, and potentials.
- Do not repeat astrological raw data verbatim. Interpret it. The data is context, not content.
- Integrate shadow alongside strength — both are essential for a truthful portrait.
- The tone should feel like a wise, caring friend who knows both astrology and depth psychology deeply.

OUTPUT FORMAT:
Return a JSON object with exactly these fields:
{
  "narrative": "The full section narrative as flowing paragraphs",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"]
}
keyInsights should be 3-5 concise distillations of the most important points. Each should be 1-2 sentences.
Do not include any text outside the JSON object.`;
}

// ─── Global Context Builder ───────────────────────────────────────────────────

function buildGlobalContext(
  vedic: VedicChartCalculations,
  western: WesternChartCalculations,
  synthesis: NatalSynthesisResult
): string {
  const moonNakshatra = vedic.planets.moon.nakshatra;
  const nakshatraEntry = NAKSHATRA_DATA[moonNakshatra];
  const wSun = western.planets.sun;
  const wMoon = western.planets.moon;
  const yogaNames = vedic.yogas.filter((y) => y.strength === "Strong").map((y) => y.name).join(", ") || "none";

  return `WESTERN CHART SUMMARY:
- Sun: ${wSun.sign} house ${wSun.house}${wSun.isRetrograde ? " (Rx)" : ""}
- Moon: ${wMoon.sign} house ${wMoon.house}${wMoon.isRetrograde ? " (Rx)" : ""}
- Ascendant: ${western.ascendant.sign}
- Chart patterns: ${western.patterns.map((p) => p.type).join(", ") || "none"}

JYOTISH CHART SUMMARY:
- Lagna: ${vedic.ascendant.sign}
- Moon Nakshatra: ${nakshatraEntry?.displayName ?? moonNakshatra} (${nakshatraEntry?.motivation ?? ""} motivation, ${nakshatraEntry?.guna ?? ""} guna)
- Strong Yogas: ${yogaNames}

SYNTHESIS:
- Overall coherence: ${synthesis.overallCoherence}
- Convergence score: ${calculateConvergenceScore(synthesis)}/100
- Gestalt: ${synthesis.gestaltSummary}
${synthesis.keyTensions.length > 0 ? `- Tensions: ${synthesis.keyTensions.join("; ")}` : ""}`;
}

// ─── Domain Context Serializers ───────────────────────────────────────────────

function serializeWesternForDomain(
  domain: NatalLifeDomain,
  western: WesternChartCalculations
): string {
  const p = western.planets;
  const mcSign = western.houses[10]?.sign ?? western.ascendant.sign;
  const keyAspects = western.aspects
    .filter((a) => a.type === "conjunction" || a.type === "opposition" || a.type === "square")
    .slice(0, 5)
    .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}°)`)
    .join("; ");

  const serializers: Partial<Record<NatalLifeDomain, string>> = {
    soul_purpose: `Sun: ${p.sun.sign} house ${p.sun.house}. Patterns: ${western.patterns.map((pt) => pt.type).join(", ") || "none"}`,
    core_psychology: `Sun: ${p.sun.sign} h${p.sun.house}. Moon: ${p.moon.sign} h${p.moon.house}. Asc: ${western.ascendant.sign}. Key aspects: ${keyAspects}`,
    shadow_and_growth: `Pluto: ${p.pluto.sign} h${p.pluto.house}. Chiron: ${p.chiron.sign} h${p.chiron.house}. Saturn: ${p.saturn.sign} h${p.saturn.house}. 12th: ${getWHousePlanets(western, 12)}. 8th: ${getWHousePlanets(western, 8)}`,
    relationships_inner: `Venus: ${p.venus.sign} h${p.venus.house}. Moon: ${p.moon.sign} h${p.moon.house}. 7th: ${getWHousePlanets(western, 7)}`,
    relationships_karmic: `7th: ${getWHousePlanets(western, 7)}. Venus: ${p.venus.sign} h${p.venus.house}. Saturn: ${p.saturn.sign} h${p.saturn.house}`,
    career_dharma: `10th: ${getWHousePlanets(western, 10)}. MC: ${mcSign}. Saturn: ${p.saturn.sign} h${p.saturn.house}. Sun: ${p.sun.sign} h${p.sun.house}`,
    timing_current: `Saturn: ${p.saturn.sign} h${p.saturn.house}. Jupiter: ${p.jupiter.sign} h${p.jupiter.house}`,
    timing_forecast: `Jupiter: ${p.jupiter.sign} h${p.jupiter.house}. Saturn: ${p.saturn.sign} h${p.saturn.house}`,
    spirituality: `Neptune: ${p.neptune.sign} h${p.neptune.house}. 12th: ${getWHousePlanets(western, 12)}. Chiron: ${p.chiron.sign} h${p.chiron.house}`,
  };
  return serializers[domain] ?? "No specific Western data for this domain.";
}

function serializeJyotishForDomain(
  domain: NatalLifeDomain,
  vedic: VedicChartCalculations
): string {
  const moonNakshatra = vedic.planets.moon.nakshatra;
  const nakshatraEntry = NAKSHATRA_DATA[moonNakshatra];
  const rahu = vedic.planets.rahu;
  const ketu = vedic.planets.ketu;

  // Current dasha
  const now = new Date();
  const currentDasha = vedic.dashas.vimshottari.dashaPeriods.find(
    (d) => new Date(d.startDate) <= now && now <= new Date(d.endDate)
  );
  const currentAntardasha = currentDasha?.subPeriods?.find(
    (d) => new Date(d.startDate) <= now && now <= new Date(d.endDate)
  );
  // Upcoming major dasha
  const upcomingDasha = vedic.dashas.vimshottari.dashaPeriods.find(
    (d) => new Date(d.startDate) > now
  );

  const strongYogas = vedic.yogas
    .filter((y) => ["Raja", "Dhana"].includes(y.type) && y.strength === "Strong")
    .map((y) => y.name)
    .join(", ") || "none";

  const serializers: Partial<Record<NatalLifeDomain, string>> = {
    soul_purpose: `Lagna: ${vedic.ascendant.sign}. Moon Nakshatra: ${nakshatraEntry?.displayName ?? moonNakshatra} (pada ${vedic.planets.moon.nakshatraPada}), deity: ${nakshatraEntry?.deity ?? "unknown"}, motivation: ${nakshatraEntry?.motivation ?? "unknown"}. Strong Yogas: ${strongYogas}`,
    core_psychology: `Moon: ${vedic.planets.moon.sign} h${vedic.planets.moon.house} (${nakshatraEntry?.displayName ?? moonNakshatra}, ${nakshatraEntry?.guna ?? ""} guna). Lagna: ${vedic.ascendant.sign}`,
    shadow_and_growth: `Rahu: ${rahu.sign} h${rahu.house} (${NAKSHATRA_DATA[rahu.nakshatra]?.displayName ?? rahu.nakshatra}). Ketu: ${ketu.sign} h${ketu.house} (${NAKSHATRA_DATA[ketu.nakshatra]?.displayName ?? ketu.nakshatra}). Saturn: ${vedic.planets.saturn.sign} h${vedic.planets.saturn.house} (${vedic.planets.saturn.dignity})`,
    relationships_inner: `Venus: ${vedic.planets.venus.sign} h${vedic.planets.venus.house} (${vedic.planets.venus.dignity}, ${NAKSHATRA_DATA[vedic.planets.venus.nakshatra]?.displayName ?? vedic.planets.venus.nakshatra}). 7th: ${getVHousePlanets(vedic, 7)}. Moon: ${vedic.planets.moon.sign}`,
    relationships_karmic: `Rahu: ${rahu.sign} h${rahu.house}. Ketu: ${ketu.sign} h${ketu.house}. Venus: ${vedic.planets.venus.sign} (${vedic.planets.venus.dignity})`,
    career_dharma: `10th: ${getVHousePlanets(vedic, 10)}. Sun: ${vedic.planets.sun.sign} h${vedic.planets.sun.house} (${vedic.planets.sun.dignity}). Raja/Dhana Yogas: ${strongYogas}`,
    timing_current: `Current Dasha: ${currentDasha ? capitalize(String(currentDasha.planet)) : "unknown"} (until ${currentDasha ? new Date(currentDasha.endDate).toLocaleDateString() : "unknown"}). Antardasha: ${currentAntardasha ? capitalize(String(currentAntardasha.planet)) : "unknown"}`,
    timing_forecast: `Upcoming Dasha: ${upcomingDasha ? capitalize(String(upcomingDasha.planet)) : "none"} starting ${upcomingDasha ? new Date(upcomingDasha.startDate).toLocaleDateString() : "N/A"}. Next antardasha sequence: ${currentDasha?.subPeriods?.slice(0, 3).map((a) => capitalize(String(a.planet))).join(" → ") ?? "N/A"}`,
    spirituality: `Ketu: ${ketu.sign} h${ketu.house} (${NAKSHATRA_DATA[ketu.nakshatra]?.displayName ?? ketu.nakshatra}). 12th: ${getVHousePlanets(vedic, 12)}. Moon motivation: ${nakshatraEntry?.motivation ?? "unknown"}`,
  };
  return serializers[domain] ?? "No specific Jyotish data for this domain.";
}

// ─── User Message Builder ─────────────────────────────────────────────────────

interface SectionCtx {
  domain: NatalLifeDomain;
  authority: (typeof DOMAIN_AUTHORITIES)[NatalLifeDomain];
  convergence: ThemeConvergence[];
  archetypes: ArchetypeMapping[];
  rawAstrological: { western: string; jyotish: string };
  wordBudget: number;
  depthInstruction: string;
  toneInstruction: string;
}

function buildSectionUserMessage(ctx: SectionCtx, globalContext: string): string {
  const convergenceSummary =
    ctx.convergence.length > 0
      ? ctx.convergence
          .map((c) => `[${c.convergenceLevel.toUpperCase()}] ${c.theme}: ${c.unifiedStatement}${c.divergenceNote ? ` | Note: ${c.divergenceNote}` : ""}`)
          .join("\n")
      : "No convergence data for this domain.";

  const archetypeSummary =
    ctx.archetypes.length > 0
      ? ctx.archetypes
          .map((a) => `${a.planet}: Archetype="${a.jungianArchetype}" | Shadow="${a.shadowExpression}" | Integrated="${a.integratedExpression}"${a.nakshatraDeity ? ` | Deity=${a.nakshatraDeity}` : ""}`)
          .join("\n")
      : "No archetype data for this domain.";

  return `GLOBAL CONTEXT:
${globalContext}

---
SECTION: ${DOMAIN_TITLES[ctx.domain]}
AUTHORITY: Primary=${ctx.authority.primaryAuthority}, Supporting=${ctx.authority.supportingAuthority}
RATIONALE: ${ctx.authority.rationale}

WESTERN DATA: ${ctx.rawAstrological.western}

JYOTISH DATA: ${ctx.rawAstrological.jyotish}

CONVERGENCES:
${convergenceSummary}

ARCHETYPES:
${archetypeSummary}

DEPTH: ${ctx.depthInstruction}
TONE: ${ctx.toneInstruction}
TARGET: ~${ctx.wordBudget} words

Return valid JSON only.`;
}

// ─── Response Parser ──────────────────────────────────────────────────────────

function parseLLMResponse(raw: string): { narrative: string; keyInsights: string[] } {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { narrative: raw, keyInsights: [] };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDepthInstruction(
  depth: NatalReportConfig["depth"],
  domain: NatalLifeDomain
): string {
  const base =
    depth === "deep"
      ? "Go deep. Use archetypal language and psychological precision."
      : depth === "balanced"
      ? "Balance depth with clarity. Meaningful without excessive jargon."
      : "Clear and accessible. Concrete and warm over abstract.";

  const extra: Partial<Record<NatalLifeDomain, string>> = {
    shadow_and_growth: "Name the shadow directly but with compassion.",
    timing_current: "Ground this in the present moment.",
    timing_forecast: "Be specific about themes, not events.",
    spirituality: "Honor the mystery. Do not reduce spiritual material to jargon.",
  };

  return `${base} ${extra[domain] ?? ""}`.trim();
}

function buildToneInstruction(domain: NatalLifeDomain): string {
  const tones: Record<NatalLifeDomain, string> = {
    soul_purpose: "Reverent, affirming, expansive.",
    core_psychology: "Precise, warm, insightful.",
    shadow_and_growth: "Honest, compassionate, courageous.",
    relationships_inner: "Gentle, perceptive, non-judgmental.",
    relationships_karmic: "Thoughtful, grounded, karmic but not fatalistic.",
    career_dharma: "Grounded, practical, dharmic.",
    timing_current: "Present-tense, grounded, balanced.",
    timing_forecast: "Forward-looking but measured.",
    spirituality: "Reverent, spacious, non-dogmatic.",
  };
  return tones[domain];
}

function calculateConvergenceScore(synthesis: NatalSynthesisResult): number {
  const scores = synthesis.convergences.map((c) =>
    c.convergenceLevel === "high" ? 100
    : c.convergenceLevel === "medium" ? 65
    : c.convergenceLevel === "low" ? 35
    : 0
  );
  return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
}

function resolveDomains(scope: NatalReportConfig["scope"]): NatalLifeDomain[] {
  const map: Record<string, NatalLifeDomain[]> = {
    full: ["soul_purpose", "core_psychology", "shadow_and_growth", "relationships_inner", "relationships_karmic", "career_dharma", "timing_current", "timing_forecast", "spirituality"],
    soul: ["soul_purpose", "spirituality"],
    psychology: ["core_psychology", "shadow_and_growth"],
    relationships: ["relationships_inner", "relationships_karmic"],
    career: ["career_dharma"],
    timing: ["timing_current", "timing_forecast"],
    shadow: ["shadow_and_growth"],
  };
  return [...new Set(scope.flatMap((s) => map[s] ?? ["soul_purpose"]))];
}

function getMostRelevantConvergence(
  convergences: ThemeConvergence[]
): NatalConvergenceLevel {
  if (convergences.length === 0) return "medium";
  const order: NatalConvergenceLevel[] = ["high", "medium", "low", "divergent"];
  return convergences.reduce(
    (best, c) =>
      order.indexOf(c.convergenceLevel) < order.indexOf(best) ? c.convergenceLevel : best,
    "low" as NatalConvergenceLevel
  );
}

function isDomainRelevantTheme(domain: NatalLifeDomain, theme: string): boolean {
  const keywords = DOMAIN_RELEVANT_THEMES[domain] ?? [];
  return keywords.some((k) => theme.toLowerCase().includes(k.toLowerCase()));
}

function isDomainRelevantPlanet(domain: NatalLifeDomain, planet: string): boolean {
  return DOMAIN_RELEVANT_PLANETS[domain]?.includes(planet) ?? false;
}

function getWHousePlanets(western: WesternChartCalculations, house: number): string {
  const planets = Object.values(western.planets).filter((p) => p.house === house);
  return planets.length > 0 ? planets.map((p) => p.name).join(", ") : "empty";
}

function getVHousePlanets(vedic: VedicChartCalculations, house: number): string {
  return Object.entries(vedic.planets)
    .filter(([, p]) => p.house === house)
    .map(([name, p]) => `${capitalize(name)} (${p.dignity ?? ""})`)
    .join(", ") || "empty";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

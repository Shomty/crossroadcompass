/**
 * lib/ai/transitReadingService.ts
 * Generates a concise Vedic transit reading using Gemini.
 *
 * Compares the user's natal Rasi chart against today's planetary positions
 * using Parasara Hora Shastra principles:
 *   - Transit of planets over natal houses (Gochara)
 *   - Transit relative to natal Moon (Chandra Rasi)
 *   - Key timing signals from dasha lord transits
 *   - Natural benefic/malefic classifications
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import type { VedicChart, VedicPlanet } from "@/lib/astro/types";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { KV_TTL } from "@/lib/kv/keys";

let _gemini: GoogleGenerativeAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return _gemini;
}

/** KV key for a user's cached transit reading (one per day) */
function transitReadingKey(userId: string, date: string) {
  return `transit-reading:${userId}:${date}`;
}

export interface TransitPlanetLine {
  planet: string;
  natalSign: string;
  transitSign: string;
  transitHouseFromMoon: number | null;
  quality: "favorable" | "neutral" | "challenging";
  note: string;
}

export interface TransitReading {
  headline: string;
  overview: string;
  keyTransits: TransitPlanetLine[];
  guidance: string;
  generatedAt: string;
}

function formatPlanets(planets: VedicPlanet[] | undefined): string {
  if (!planets?.length) return "unavailable";
  return planets
    .map((p) => `${p.name}: ${p.sign ?? "?"} house ${p.house ?? "?"}${p.isRetrograde ? " (R)" : ""}`)
    .join(", ");
}

function buildTransitPrompt(
  natal: VedicChart,
  transit: VedicChart,
  dashaLord: string | null,
  userName: string,
  today: string
): string {
  const natalPlanets = formatPlanets(natal.planets);
  const transitPlanets = formatPlanets(transit.planets);
  const moonSign = natal.moonSign ?? natal.ascendant?.sign ?? "unknown";
  const ascendant = natal.ascendant ? `${natal.ascendant.sign} ${natal.ascendant.degree?.toFixed(1) ?? ""}°` : "unknown";

  return `You are a Vedic astrologer trained in Parasara Hora Shastra. Generate a concise, practical transit reading.

Date: ${today}
Native: ${userName}
Natal Ascendant (Lagna): ${ascendant}
Natal Moon Sign (Chandra Rasi): ${moonSign}
Active Mahadasha Lord: ${dashaLord ?? "unknown"}

NATAL PLANETARY POSITIONS (Rasi chart):
${natalPlanets}

TODAY'S PLANETARY POSITIONS (Gochara transits):
${transitPlanets}

Instructions:
- Apply Parasara Hora Gochara rules: judge transits FROM natal Moon sign (Chandra Rasi)
- Identify 3-5 key planets whose transit today is most significant
- Note: Saturn and Jupiter transits are long-term; Sun, Moon, Mars are daily/weekly
- Natural benefics: Jupiter, Venus, Mercury (when not afflicted)
- Natural malefics: Saturn, Mars, Rahu, Ketu, Sun
- If the dasha lord is transiting a favorable house from Moon, amplify positive themes
- Keep tone practical, warm, non-alarmist. No fatalistic language.

Return ONLY valid JSON (no markdown fences):
{
  "headline": "4-6 word theme for today",
  "overview": "2-3 sentences: overall energy of today's transits for this native, referencing Moon sign and dasha",
  "keyTransits": [
    {
      "planet": "planet name",
      "natalSign": "natal sign",
      "transitSign": "current sign",
      "transitHouseFromMoon": <integer house number from moon or null>,
      "quality": "favorable|neutral|challenging",
      "note": "one sentence on what this transit means practically"
    }
  ],
  "guidance": "one actionable sentence for today based on the most significant transit"
}`;
}

export async function generateTransitReading(
  userId: string,
  natal: VedicChart,
  transit: VedicChart,
  dashaLord: string | null,
  userName: string
): Promise<TransitReading> {
  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const cacheKey = transitReadingKey(userId, today);
  const cached = await kvGet<TransitReading>(cacheKey);
  if (cached) return cached;

  const model = gemini().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.75, maxOutputTokens: 8192 },
  });
  const prompt = buildTransitPrompt(natal, transit, dashaLord, userName, today);

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  if (!raw) throw new Error("Gemini returned empty transit reading");

  // Strip markdown fences as a safety net even with responseMimeType set
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<TransitReading, "generatedAt">;
  const reading: TransitReading = { ...parsed, generatedAt: new Date().toISOString() };

  // Cache for the rest of the day
  await kvSet(cacheKey, reading, KV_TTL.TRANSIT_SECONDS);
  return reading;
}

export async function getCachedTransitReading(
  userId: string
): Promise<TransitReading | null> {
  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return kvGet<TransitReading>(transitReadingKey(userId, today));
}

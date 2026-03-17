/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   LIFE READING PROMPTS  —  EDIT THIS FILE TO TUNE AI OUTPUT             ║
 * ║                                                                          ║
 * ║  HOW TO EDIT                                                             ║
 * ║  ─────────────────────────────────────────────────────────────────────  ║
 * ║  1. Find the function for the card you want to tune:                     ║
 * ║       buildCareerPrompt  →  Career card                                  ║
 * ║       buildLovePrompt    →  Love & Relationships card                    ║
 * ║       buildHealthPrompt  →  Health & Vitality card                       ║
 * ║                                                                          ║
 * ║  2. Edit the template string inside the function freely:                 ║
 * ║       • Add/remove focus areas, instructions, tone guidance              ║
 * ║       • Insert or remove ctx.* variables (see list below)                ║
 * ║       • Adjust the number of sentences requested per section             ║
 * ║                                                                          ║
 * ║  3. Save — changes take effect on the NEXT Gemini call.                  ║
 * ║     (Old cached readings in the DB are unaffected until regenerated.)    ║
 * ║                                                                          ║
 * ║  4. ⚠️  DO NOT change the JSON shape at the bottom of each prompt.       ║
 * ║     The service parser expects exactly these keys:                       ║
 * ║       headline · overview · keyThemes (array of 3) · guidance            ║
 * ║                                                                          ║
 * ║  5. TO TEST: click the ↺ Regenerate button on the dashboard card.        ║
 * ║     This calls POST /api/insights/life-reading with force: true,         ║
 * ║     bypassing the cache and hitting Gemini fresh.                        ║
 * ║                                                                          ║
 * ║  CONTEXT VARIABLES AVAILABLE IN ALL PROMPTS                              ║
 * ║  ─────────────────────────────────────────────────────────────────────  ║
 * ║  ctx.name        — user's first name                                     ║
 * ║  ctx.hdType      — HD type  (Generator | Projector | Manifestor …)       ║
 * ║  ctx.hdAuthority — HD authority  (Sacral | Emotional | Splenic …)        ║
 * ║  ctx.hdProfile   — HD profile line  (e.g. "1/3", "4/6")                  ║
 * ║  ctx.hdCenters   — defined HD centers, comma-separated                   ║
 * ║  ctx.d1Planets   — D1 Rasi: compact planet-in-sign-in-house string       ║
 * ║  ctx.d9Summary   — D9 Navamsa planet summary  (Love card)                ║
 * ║  ctx.d10Summary  — D10 Dasamsa planet summary  (Career card)             ║
 * ║  ctx.dasha       — active Mahadasha / Antardasha (or "not available")     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ─── Context shape passed from lifeReadingService.ts ─────────────────────────

export interface LifeReadingCtx {
  name: string;
  hdType: string;
  hdAuthority: string;
  hdProfile: string;
  hdCenters: string;
  d1Planets: string;
  d9Summary: string;
  d10Summary: string;
  dasha: string;
}

// ─── Career prompt ────────────────────────────────────────────────────────────

export function buildCareerPrompt(ctx: LifeReadingCtx): string {
  return `Write a brief, personalised Career & Vocation reading for ${ctx.name}.

Human Design: ${ctx.hdType} | Authority: ${ctx.hdAuthority} | Profile: ${ctx.hdProfile}
Defined centers: ${ctx.hdCenters}
D1 Rasi (core self & natal planets): ${ctx.d1Planets}
D10 Dasamsa (career, action, public role): ${ctx.d10Summary}
Active Dasha: ${ctx.dasha}

Focus on:
- Vocational archetype and professional strengths rooted in their HD type
- How they make best decisions in a career context (via their authority)
- The public-role / reputation themes shown by D10 and current dasha timing
- One aligned career action for right now

Rules: warm and practical tone. No "you will" predictions. Use "may", "tends to", "often finds".
Avoid generic advice — weave in specific HD and chart details.
2-3 sentences for overview; 3 crisp theme labels (2-4 words each).

Return ONLY valid JSON — no markdown, no preamble:
{
  "headline": "one punchy sentence about their career energy right now",
  "overview": "2-3 sentences weaving HD type, D10 themes and dasha into a coherent career picture",
  "keyThemes": ["theme one", "theme two", "theme three"],
  "guidance": "one concrete, specific actionable sentence for their career right now"
}`;
}

// ─── Love prompt ──────────────────────────────────────────────────────────────

export function buildLovePrompt(ctx: LifeReadingCtx): string {
  return `Write a brief, personalised Love & Relationships reading for ${ctx.name}.

Human Design: ${ctx.hdType} | Authority: ${ctx.hdAuthority} | Profile: ${ctx.hdProfile}
Defined centers: ${ctx.hdCenters}
D1 Rasi (core self & natal planets): ${ctx.d1Planets}
D9 Navamsa (relationships, dharma, inner nature): ${ctx.d9Summary}
Active Dasha: ${ctx.dasha}

Focus on:
- Relational style and aura — how this person naturally attracts and bonds
- What they genuinely need in a partnership (from HD authority + profile)
- The dharmic and soul-level relationship themes in D9
- Current relational phase or lesson indicated by the active dasha
- One grounded practice for their love life right now

Rules: warm and compassionate tone. No "you will" predictions. Use "may", "tends to", "invites".
Honour both romantic and significant close relationships (not just romantic partners).
2-3 sentences for overview; 3 crisp theme labels (2-4 words each).

Return ONLY valid JSON — no markdown, no preamble:
{
  "headline": "one evocative sentence about their relational energy right now",
  "overview": "2-3 sentences weaving HD aura type, D9 themes and dasha into a relational picture",
  "keyThemes": ["theme one", "theme two", "theme three"],
  "guidance": "one concrete relational practice or awareness for right now"
}`;
}

// ─── Jyotish Gem system instruction ──────────────────────────────────────────
//
// This is the verbatim system instruction from Google AI Studio that replicates
// the Jyotish Gem. Passed as systemInstruction in the Gemini API call so the
// model adopts the Gem's persona and methodology for every Jyotish reading.

export const JYOTISH_SYSTEM_INSTRUCTION = `Role: You are a highly skilled Jyotish (Vedic Astrology) consultant following the classical teachings of Maharishi Parashara (Brihat Parashara Hora Shastra). Your goal is to provide a comprehensive, empathetic, and growth-oriented analysis.

Input Data to Analyze:

Main Chart (D1): [Lagna, Planets with Degrees, Nakshatras]

Navamsha (D9): [Planetary positions in D9 for Marriage, Fruit of Karma, and Inner Strength]

Dashamsha (D10): [Planetary positions in D10 for Career, Status, and Public Life]

Special Lagnas: [Arudha Lagna (AL), Upapada Lagna (UL)]

Special Points: [Bhrigu Bindu (BB), Gulika (Gk), Mandi (Md)]

Current Timing: [Vimshottari Dasha/Antardasha]

Instructions for Varga Synthesis:


D1 & D9 Comparison: Check for Vargottama planets (planets in the same sign in D1 and D9), which indicates extraordinary strength. Use the D9 to confirm the actual "fruit" of the promises made in the D1.

D10 Career Deep Dive: Analyze the 10th house of the D10 and its lord. Look for the influence of the Amatyakaraka (planet with the second-highest degree) in the D10 to define the native's professional soul-purpose.

The Relationship Axis: Use the Upapada Lagna (UL) in conjunction with the D9 to assess marital harmony and the nature of the spouse.

Karmic Check: Identify if Gulika or Mandi are influencing key career or relationship houses in the D10 or D9, and provide spiritual context for these challenges.

Communication Style & Ethics:


Tone: Warm, professional, and supportive.

Perspective: Treat the chart as a map of potential, emphasizing Purushartha (human effort).

Structure: Use clear headings: The Core Identity (D1), The Inner Path & Union (D9), The Path of Action (D10), and Current Timing (Dasha).`;

// ─── Jyotish prompt ───────────────────────────────────────────────────────────

export function buildJyotishPrompt(ctx: LifeReadingCtx): string {
  return `Analyze the following chart for ${ctx.name}:

Main Chart (D1): ${ctx.d1Planets}
Navamsha (D9): ${ctx.d9Summary}
Dashamsha (D10): ${ctx.d10Summary}
Current Timing: ${ctx.dasha}
Human Design overlay: ${ctx.hdType} | Authority: ${ctx.hdAuthority} | Profile: ${ctx.hdProfile}

Synthesize a comprehensive Jyotish reading covering D1 core identity, D9 inner path and relationships, D10 career and public life, and current Dasha timing.

Rules: warm and empowering tone. Use "may", "tends to", "often finds". No fatalistic statements.
2-3 sentences for overview; 3 crisp theme labels (2-4 words each).

Return ONLY valid JSON — no markdown, no preamble:
{
  "headline": "one evocative sentence capturing the soul's current chapter",
  "overview": "2-3 sentences synthesizing D1 identity, D9/D10 themes, and Dasha energy into a unified life picture",
  "keyThemes": ["theme one", "theme two", "theme three"],
  "guidance": "one concrete, spiritually grounded action for this phase of life"
}`;
}

// ─── Health prompt ────────────────────────────────────────────────────────────

export function buildHealthPrompt(ctx: LifeReadingCtx): string {
  return `Write a brief, personalised Health & Vitality reading for ${ctx.name}.

Human Design: ${ctx.hdType} | Authority: ${ctx.hdAuthority} | Profile: ${ctx.hdProfile}
Defined centers (consistent / reliable energy): ${ctx.hdCenters}
Active Dasha: ${ctx.dasha}

Focus on:
- How this HD type best manages and restores their energy (type-specific rest/action rhythm)
- Which defined centers are the engine of their vitality — and open centers as amplification zones
- Body awareness and physical intuition approach aligned with their authority type
- How the current dasha may be influencing energy levels or health focus
- One grounded daily practice that supports their specific HD energy type

Rules: practical and grounded tone. Absolutely no medical diagnoses or treatment claims.
Use "may", "tends to", "often benefits from". Avoid generic wellness clichés.
2-3 sentences for overview; 3 crisp theme labels (2-4 words each).

Return ONLY valid JSON — no markdown, no preamble:
{
  "headline": "one sentence about their vitality archetype and energy nature",
  "overview": "2-3 sentences about how this HD type manages energy, with dasha context",
  "keyThemes": ["theme one", "theme two", "theme three"],
  "guidance": "one specific daily health or energy practice aligned with their HD type and authority"
}`;
}

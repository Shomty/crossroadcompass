// STATUS: done | Task Admin-8
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { savePrompt } from "@/lib/admin/promptService";
import { PromptFeature } from "@prisma/client";

const SEED_PROMPTS: Array<{
  promptKey: string;
  feature: PromptFeature;
  hdType?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  maxTokens: number;
  temperature: number;
}> = [
  {
    promptKey: "daily.generator",
    feature: PromptFeature.DAILY_INSIGHT,
    hdType: "Generator",
    systemPrompt: "You are a warm, practical life guide synthesizing Human Design and Vedic Astrology. Never use prediction language ('you will'). Always end with a practical action. Define astrological terms on first use. Max 4 sentences total.",
    userPromptTemplate: `Write a short personalised daily insight for {{userName}}.
Today: {{todayDate}}
HD Type: {{hdType}} | Strategy: {{strategy}} | Authority: {{authority}} | Profile: {{profile}}
Active Dasha: {{currentDasha}}

Rules: warm and practical tone, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`,
    maxTokens: 800,
    temperature: 0.8,
  },
  {
    promptKey: "daily.manifesting_generator",
    feature: PromptFeature.DAILY_INSIGHT,
    hdType: "Manifesting Generator",
    systemPrompt: "You are a warm, practical life guide synthesizing Human Design and Vedic Astrology. Never use prediction language ('you will'). Always end with a practical action. Define astrological terms on first use. Max 4 sentences total.",
    userPromptTemplate: `Write a short personalised daily insight for {{userName}}.
Today: {{todayDate}}
HD Type: {{hdType}} (Manifesting Generator — multi-passionate, fast, skips steps intentionally) | Strategy: {{strategy}} | Authority: {{authority}} | Profile: {{profile}}
Active Dasha: {{currentDasha}}

Rules: warm and practical tone, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`,
    maxTokens: 800,
    temperature: 0.8,
  },
  {
    promptKey: "daily.projector",
    feature: PromptFeature.DAILY_INSIGHT,
    hdType: "Projector",
    systemPrompt: "You are a warm, practical life guide synthesizing Human Design and Vedic Astrology. Never use prediction language ('you will'). Always end with a practical action. Define astrological terms on first use. Max 4 sentences total.",
    userPromptTemplate: `Write a short personalised daily insight for {{userName}}.
Today: {{todayDate}}
HD Type: {{hdType}} (Projector — guide, needs invitation, manages energy carefully) | Strategy: {{strategy}} | Authority: {{authority}} | Profile: {{profile}}
Active Dasha: {{currentDasha}}

Rules: warm and practical tone, emphasize rest and recognition themes for Projectors, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`,
    maxTokens: 800,
    temperature: 0.8,
  },
  {
    promptKey: "daily.manifestor",
    feature: PromptFeature.DAILY_INSIGHT,
    hdType: "Manifestor",
    systemPrompt: "You are a warm, practical life guide synthesizing Human Design and Vedic Astrology. Never use prediction language ('you will'). Always end with a practical action. Define astrological terms on first use. Max 4 sentences total.",
    userPromptTemplate: `Write a short personalised daily insight for {{userName}}.
Today: {{todayDate}}
HD Type: {{hdType}} (Manifestor — initiator, inform before acting, closed aura) | Strategy: {{strategy}} | Authority: {{authority}} | Profile: {{profile}}
Active Dasha: {{currentDasha}}

Rules: warm and practical tone, emphasize informing and initiating themes for Manifestors, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`,
    maxTokens: 800,
    temperature: 0.8,
  },
  {
    promptKey: "daily.reflector",
    feature: PromptFeature.DAILY_INSIGHT,
    hdType: "Reflector",
    systemPrompt: "You are a warm, practical life guide synthesizing Human Design and Vedic Astrology. Never use prediction language ('you will'). Always end with a practical action. Define astrological terms on first use. Max 4 sentences total.",
    userPromptTemplate: `Write a short personalised daily insight for {{userName}}.
Today: {{todayDate}}
HD Type: {{hdType}} (Reflector — lunar cycle, samples environment, all centers undefined) | Strategy: {{strategy}} | Authority: {{authority}} | Profile: {{profile}}
Active Dasha: {{currentDasha}}

Rules: warm and practical tone, emphasize environment and lunar themes for Reflectors, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`,
    maxTokens: 800,
    temperature: 0.8,
  },
  {
    promptKey: "weekly.base",
    feature: PromptFeature.WEEKLY_FORECAST,
    systemPrompt: "You are a Vedic astrology and Human Design synthesis expert. Create weekly forecasts that are practical, warm, and grounded. Never predict specific outcomes. Define all astrological terms on first use.",
    userPromptTemplate: `Create a weekly forecast for week starting {{weekStart}}.
HD Type: {{hdType}} | Strategy: {{strategy}} | Authority: {{authority}}
Active Dasha: {{currentDasha}}

Return ONLY valid JSON matching this structure:
{"headline":"brief week theme","theme":"2-3 word energy theme","overview":"2-3 sentence overview","sections":[{"title":"Energy & Vitality","content":"..."},{"title":"Relationships","content":"..."},{"title":"Work & Direction","content":"..."}],"practice":"one weekly practice or intention"}`,
    maxTokens: 1200,
    temperature: 0.75,
  },
  {
    promptKey: "monthly.base",
    feature: PromptFeature.MONTHLY_REPORT,
    systemPrompt: "You are a Vedic astrology and Human Design synthesis expert. Create monthly reports that help users navigate life themes. Never predict specific outcomes. Define all astrological terms on first use.",
    userPromptTemplate: `Create a monthly forecast for {{monthName}}.
HD Type: {{hdType}} | Strategy: {{strategy}} | Authority: {{authority}}
Active Dasha: {{currentDasha}}

Return ONLY valid JSON:
{"headline":"brief month theme","theme":"2-3 word energy theme","overview":"2-3 sentence overview","sections":[{"title":"Monthly Arc","content":"..."},{"title":"Focus Areas","content":"..."},{"title":"Relationships","content":"..."},{"title":"Growth Edge","content":"..."}],"intention":"one monthly intention"}`,
    maxTokens: 1500,
    temperature: 0.75,
  },
  {
    promptKey: "hd_report.base",
    feature: PromptFeature.ONBOARDING_REPORT,
    systemPrompt: "You are a Human Design expert creating a comprehensive personal blueprint report. Write in warm, accessible language. Define every technical term on first use. Never use 'you will' predictions. Each section must end with a practical implication.",
    userPromptTemplate: `Generate a comprehensive Human Design report for this person.
Type: {{hdType}} | Strategy: {{strategy}} | Authority: {{authority}} | Profile: {{profile}} | Definition: {{definition}}
Active Channels: {{channels}}
Life situation: {{intakeLifeSituation}}
Primary focus: {{intakePrimaryFocus}}

Create 7 sections covering: Type Overview, Strategy & Authority, Profile, Centers, Channels, Shadow Work, Practical Guidance.
Each section: define terms, give practical meaning, end with actionable implication.
Never use prediction language. Max 200 words per section.

Return ONLY valid JSON:
{"sections":[{"title":"...","content":"..."}]}`,
    maxTokens: 3000,
    temperature: 0.7,
  },
  {
    promptKey: "life.career",
    feature: PromptFeature.LIFE_READING,
    systemPrompt: "",
    userPromptTemplate: `Write a brief, personalised Career & Vocation reading for {{name}}.

Human Design: {{hdType}} | Authority: {{hdAuthority}} | Profile: {{hdProfile}}
Defined centers: {{hdCenters}}
D1 Rasi (core self & natal planets): {{d1Planets}}
D10 Dasamsa (career, action, public role): {{d10Summary}}
Active Dasha: {{dasha}}

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
}`,
    maxTokens: 8192,
    temperature: 0.75,
  },
  {
    promptKey: "life.love",
    feature: PromptFeature.LIFE_READING,
    systemPrompt: "",
    userPromptTemplate: `Write a brief, personalised Love & Relationships reading for {{name}}.

Human Design: {{hdType}} | Authority: {{hdAuthority}} | Profile: {{hdProfile}}
Defined centers: {{hdCenters}}
D1 Rasi (core self & natal planets): {{d1Planets}}
D9 Navamsa (relationships, dharma, inner nature): {{d9Summary}}
Active Dasha: {{dasha}}

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
}`,
    maxTokens: 8192,
    temperature: 0.75,
  },
  {
    promptKey: "life.health",
    feature: PromptFeature.LIFE_READING,
    systemPrompt: "",
    userPromptTemplate: `Write a brief, personalised Health & Vitality reading for {{name}}.

Human Design: {{hdType}} | Authority: {{hdAuthority}} | Profile: {{hdProfile}}
Defined centers (consistent / reliable energy): {{hdCenters}}
Active Dasha: {{dasha}}

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
}`,
    maxTokens: 8192,
    temperature: 0.75,
  },
  {
    promptKey: "life.jyotish",
    feature: PromptFeature.LIFE_READING,
    systemPrompt: `Role: You are a highly skilled Jyotish (Vedic Astrology) consultant following the classical teachings of Maharishi Parashara (Brihat Parashara Hora Shastra). Your goal is to provide a comprehensive, empathetic, and growth-oriented analysis.

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

Structure: Use clear headings: The Core Identity (D1), The Inner Path & Union (D9), The Path of Action (D10), and Current Timing (Dasha).`,
    userPromptTemplate: `Analyze the following chart for {{name}}:

Main Chart (D1): {{d1Planets}}
Navamsha (D9): {{d9Summary}}
Dashamsha (D10): {{d10Summary}}
Current Timing: {{dasha}}
Human Design overlay: {{hdType}} | Authority: {{hdAuthority}} | Profile: {{hdProfile}}

Synthesize a comprehensive Jyotish reading covering D1 core identity, D9 inner path and relationships, D10 career and public life, and current Dasha timing.

Rules: warm and empowering tone. Use "may", "tends to", "often finds". No fatalistic statements.
2-3 sentences for overview; 3 crisp theme labels (2-4 words each).

Return ONLY valid JSON — no markdown, no preamble:
{
  "headline": "one evocative sentence capturing the soul's current chapter",
  "overview": "2-3 sentences synthesizing D1 identity, D9/D10 themes, and Dasha energy into a unified life picture",
  "keyThemes": ["theme one", "theme two", "theme three"],
  "guidance": "one concrete, spiritually grounded action for this phase of life"
}`,
    maxTokens: 8192,
    temperature: 0.75,
  },
  {
    promptKey: "transit.base",
    feature: PromptFeature.TRANSIT_READING,
    systemPrompt: "You are a Vedic astrologer trained in Parasara Hora Shastra. Generate a concise, practical transit reading.",
    userPromptTemplate: `Date: {{today}}
Native: {{userName}}
Natal Ascendant (Lagna): {{ascendant}}
Natal Moon Sign (Chandra Rasi): {{moonSign}}
Active Mahadasha Lord: {{dashaLord}}

NATAL PLANETARY POSITIONS (Rasi chart):
{{natalPlanets}}

TODAY'S PLANETARY POSITIONS (Gochara transits):
{{transitPlanets}}

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
      "transitHouseFromMoon": 1,
      "quality": "favorable|neutral|challenging",
      "note": "one sentence on what this transit means practically"
    }
  ],
  "guidance": "one actionable sentence for today based on the most significant transit"
}`,
    maxTokens: 8192,
    temperature: 0.75,
  },
];

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const adminEmail = session!.user.email ?? "";
  const results = [];

  for (const seed of SEED_PROMPTS) {
    try {
      const template = await savePrompt(seed.promptKey, seed, adminEmail);
      results.push({ promptKey: seed.promptKey, status: "seeded", version: template.version });
    } catch (err) {
      results.push({ promptKey: seed.promptKey, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ results, seeded: results.filter((r) => r.status === "seeded").length });
}

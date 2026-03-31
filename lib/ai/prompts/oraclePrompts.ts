/**
 * Crossroads Oracle™ — Gemini user prompt only (no API calls, no lib/ai/* imports).
 */

import type { OracleContext, OracleTheme } from "@/types/oracle";

const PLANET_ARCHETYPE: Record<string, string> = {
  Sun: "Soul, authority, father-figures, vitality, leadership",
  Moon: "Mind, emotion, mother-figures, belonging, instinct",
  Mars: "Drive, courage, conflict, initiation, will",
  Mercury: "Communication, intellect, commerce, discernment",
  Jupiter: "Wisdom, expansion, grace, dharma, teaching",
  Venus: "Beauty, relationships, pleasure, values, refinement",
  Saturn: "Discipline, karma, delay, mastery through time",
  Rahu: "Obsession, ambition, the unfamiliar, hunger for experience",
  Ketu: "Detachment, spirituality, past patterns, release",
};

const THEME_FRAMING: Record<OracleTheme, string> = {
  IDENTITY: "Who am I becoming versus who I was conditioned to be?",
  CAREER: "What is my work in the world, not only my job title?",
  LOVE: "What patterns in connection am I ready to examine with honesty?",
  FEAR: "What is this fear protecting, and what might gently release it?",
  LOSS: "What might this loss be making room for in the next chapter?",
};

function capPlanet(p: string): string {
  const t = p.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function archetypeFor(planet: string): string {
  const key = capPlanet(planet);
  return PLANET_ARCHETYPE[key] ?? "mixed life themes";
}

function themeQuestion(theme: OracleTheme): string {
  return THEME_FRAMING[theme];
}

/**
 * Assemble the full Crossroads Oracle prompt from structured context.
 */
export function buildOraclePrompt(ctx: OracleContext): string {
  const maha = capPlanet(ctx.mahadasha.planet);
  const antarFull = ctx.antardasha.label;
  const antarPlanet = capPlanet(ctx.antardasha.planet);
  const retro =
    ctx.transits.retrogradePlanets.length > 0
      ? ctx.transits.retrogradePlanets.join(", ")
      : "none noted";
  const notable = ctx.transits.notableTransit ?? "Focus on Moon and Sun signs as the daily emotional and vitality backdrop.";

  return `You are a skilled Jyotishi writing for Crossroads Compass. You combine Vimśottari Dasha timing with current transits and a user-chosen life theme. Write in warm, specific, psychologically grounded English.

CONTENT RULES (non-negotiable):
- No prediction language: avoid "you will", "this will cause", "expect"; prefer "this period tends to bring", "you may notice", "many people find during".
- No vague mysticism: avoid "the universe is telling you", "your destiny"; prefer "your chart suggests", "this combination often correlates with".
- Define graha terms on first use in each section, e.g. "Saturn (discipline, delay, mastery through effort)" once per section where relevant.
- End every section (cosmicContext, psychologicalPattern, whyNow) with a sentence that gives the reader agency: something they can do, try, or consider.
- concreteSteps must be concrete actions (e.g. "Spend 10 minutes listing three…"), not vague "reflect on your values".
- Avoid saccharine words: skip "beautiful", "amazing", "incredible", "powerful journey".
- Do not give medical, legal, or financial instructions.

USER CONTEXT:
- Birth: ${ctx.birthProfile.dateOfBirth} local time ${ctx.birthProfile.timeOfBirth}, ${ctx.birthProfile.placeOfBirth}. Gender: ${ctx.birthProfile.gender}.

DASHA TIMING:
- Mahadasha: ${maha} — archetypal themes: ${archetypeFor(ctx.mahadasha.planet)}. Period ${ctx.mahadasha.startDate} → ${ctx.mahadasha.endDate}. About ${ctx.mahadasha.yearsRemaining} year(s) remain in this Mahadasha (approximate).
- Antardasha: ${antarFull} — the sub-period planet is ${antarPlanet}, adding: ${archetypeFor(ctx.antardasha.planet)}. Period ${ctx.antardasha.startDate} → ${ctx.antardasha.endDate}. About ${ctx.antardasha.monthsRemaining} month(s) remain in this Antardasha (approximate).

THEME THE USER CHOSE: ${ctx.theme}
Frame it as a question the cosmos is inviting them to sit with, not a problem to fix:
"${themeQuestion(ctx.theme)}"

CURRENT TRANSITS (sidereal / gochara snapshot):
- Moon in ${ctx.transits.moonSign} (mind, mood, day-to-day rhythm)
- Sun in ${ctx.transits.sunSign} (vitality, visibility, purpose-tone)
- Retrograde grahas now: ${retro}
- Notable line: ${notable}

TASK:
Return ONLY valid JSON (no markdown fences). Use double-quoted keys and strings. Do not use unescaped double quotes inside string values.
Shape:
{
  "cosmicContext": "2–3 sentences tying Mahadasha + Antardasha + transits to the theme. Last sentence = agency.",
  "psychologicalPattern": "2–3 sentences on why this theme may feel alive now given the chart timing (no fatalism). Last sentence = agency.",
  "whyNow": "1–2 sentences on why this Antardasha/transit window highlights the theme. Last sentence = agency.",
  "concreteSteps": ["step 1 specific action", "step 2 specific action", "step 3 specific action"]
}

concreteSteps must contain exactly three non-empty strings. Max about 3 sentences each for the first three fields.`;
}

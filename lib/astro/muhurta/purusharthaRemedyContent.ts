/**
 * Static remedy copy for red-score Puruṣārtha slots (PDF / CMS hook later).
 */

export type PurusharthaRemedyFocus = "lowSavMoon" | "naidhanaTara" | "generalRed";

export function remedyFocusForRedScore(
  score: number,
  savMoonSignPoints: number | null,
  taraNumber: number | null
): PurusharthaRemedyFocus {
  if (score >= 45) return "generalRed";
  if (savMoonSignPoints !== null && savMoonSignPoints < 20) return "lowSavMoon";
  if (taraNumber === 7) return "naidhanaTara";
  return "generalRed";
}

export interface PurusharthaRemedyPayload {
  title: string;
  body: string;
  sourceNote: string;
  resonanceCopy: string;
}

const RESONANCE =
  "Performing this remedy improves your internal resonance, effectively adding +15 points to this hour.";

export function getPurusharthaRemedyPayload(focus: PurusharthaRemedyFocus): PurusharthaRemedyPayload {
  switch (focus) {
    case "lowSavMoon":
      return {
        title: "Stabilize vitality (low SAV Moon sign)",
        body: "The Mahāmr̥tyuñjaya mantra supports health, resilience, and steadiness when the collective bindus on the Moon’s sign are thin. Chant with a calm breath and clear intention.",
        sourceNote: "From your affirmations & mantras collection (e.g. p. 102 in the uploaded book).",
        resonanceCopy: RESONANCE,
      };
    case "naidhanaTara":
      return {
        title: "Protection and surmounting obstacles",
        body: "Use an affirmation for protection and clearing obstacles—steady repetition through the hour shifts inner tone without denying the sky’s warning.",
        sourceNote: "Draw from Chapter 1 of your affirmations document: themes of protection and surmounting obstacles.",
        resonanceCopy: RESONANCE,
      };
    default:
      return {
        title: "Puruṣārtha boost",
        body: "Combine breath, a short mantra or affirmation you trust, and one concrete gentle action. Effort and sincerity move the window toward growth even when the sky is tight.",
        sourceNote: "Pair with your personal mantra or affirmation library when available.",
        resonanceCopy: RESONANCE,
      };
  }
}

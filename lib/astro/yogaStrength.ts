/**
 * openastrology-library uses Yoga.strength: 'Weak' | 'Moderate' | 'Strong'.
 * Some serialized payloads may still carry legacy numeric 0–1 values — handle both.
 */
import type { Yoga } from "openastrology-library";

export type YogaStrengthLabel = "Strong" | "Moderate" | "Mild";

/** Sort key: higher = stronger (3…0). */
export function yogaStrengthRank(strength: Yoga["strength"] | number | undefined): number {
  if (typeof strength === "number" && !Number.isNaN(strength)) {
    if (strength >= 0.8) return 3;
    if (strength >= 0.5) return 2;
    return 1;
  }
  if (strength === "Strong") return 3;
  if (strength === "Moderate") return 2;
  if (strength === "Weak") return 1;
  return 0;
}

/** UI chip label — library "Weak" maps to "Mild" for the three-tier badge. */
export function yogaStrengthLabel(strength: Yoga["strength"] | number | undefined): YogaStrengthLabel {
  if (typeof strength === "number" && !Number.isNaN(strength)) {
    if (strength >= 0.8) return "Strong";
    if (strength >= 0.5) return "Moderate";
    return "Mild";
  }
  if (strength === "Strong") return "Strong";
  if (strength === "Moderate") return "Moderate";
  return "Mild";
}

export function compareYogasByStrength(a: Yoga, b: Yoga): number {
  const diff = yogaStrengthRank(b.strength) - yogaStrengthRank(a.strength);
  if (diff !== 0) return diff;
  return a.name.localeCompare(b.name);
}

export function pickStrongestYoga(yogas: Yoga[]): Yoga | null {
  if (yogas.length === 0) return null;
  return [...yogas].sort(compareYogasByStrength)[0] ?? null;
}

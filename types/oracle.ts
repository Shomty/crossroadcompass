/**
 * Crossroads Oracle™ — types only (not re-exported from types/index.ts).
 */

/** User-selected life area for the reading. */
export type OracleTheme = "IDENTITY" | "CAREER" | "LOVE" | "FEAR" | "LOSS";

export const ORACLE_THEMES: readonly OracleTheme[] = [
  "IDENTITY",
  "CAREER",
  "LOVE",
  "FEAR",
  "LOSS",
] as const;

export function isOracleTheme(value: unknown): value is OracleTheme {
  return typeof value === "string" && (ORACLE_THEMES as readonly string[]).includes(value);
}

/** Everything assembled for the Gemini prompt (no chart geometry). */
export interface OracleContext {
  userId: string;
  birthProfile: {
    /** ISO calendar date (YYYY-MM-DD) of birth */
    dateOfBirth: string;
    /** Local time HH:mm */
    timeOfBirth: string;
    /** City, country */
    placeOfBirth: string;
    gender: string;
  };
  mahadasha: {
    planet: string;
    startDate: string;
    endDate: string;
    yearsRemaining: number;
  };
  antardasha: {
    /** e.g. "Saturn/Venus" */
    label: string;
    /** Antardasha planet only */
    planet: string;
    startDate: string;
    endDate: string;
    monthsRemaining: number;
  };
  transits: {
    moonSign: string;
    sunSign: string;
    retrogradePlanets: string[];
    notableTransit: string | null;
  };
  theme: OracleTheme;
}

/** Structured reading returned to the client and cached in KV. */
export interface OracleReading {
  theme: OracleTheme;
  cosmicContext: string;
  psychologicalPattern: string;
  whyNow: string;
  /** Exactly three actionable steps */
  concreteSteps: readonly [string, string, string];
  dashaLabel: string;
  generatedAt: string;
  cacheKey: string;
}

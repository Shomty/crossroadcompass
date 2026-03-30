/**
 * lib/env.ts
 * Single source of truth for all environment variables.
 * Validated at startup with Zod — throws a clear error if anything is missing.
 * Import `env` from here everywhere. Never access process.env directly.
 * See copilot-instructions section 20 for the full variable reference.
 */

import { z } from "zod";

// Coerce empty strings to undefined so optional fields in .env.local may be
// left blank (VAR=) without triggering a validation error.
const opt = (schema: z.ZodString) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
const optWithDefault = (schema: z.ZodString, fallback: string) =>
  z.preprocess(
    (v) => (v === "" ? undefined : v),
    schema.optional().default(fallback)
  );

export const envSchema = z.object({
  // Swiss Ephemeris data files path — used by both openhumandesign-library and openastrology-library
  EPHE_PATH: z.string().default("./ephe"),

  // Database
  DATABASE_URL: z.string().min(1),

  // Stripe (AC-02) — optional until task #11 (real Stripe) is implemented
  // Mock payment service is used while these are absent.
  STRIPE_SECRET_KEY: opt(z.string().min(1)),
  STRIPE_WEBHOOK_SECRET: opt(z.string().min(1)),

  // Email via Resend
  RESEND_API_KEY: opt(z.string().min(1)),

  // Auth (NextAuth v5)
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),

  // Google OAuth — optional; when absent the Google button is hidden
  GOOGLE_CLIENT_ID: opt(z.string().min(1)),
  GOOGLE_CLIENT_SECRET: opt(z.string().min(1)),

  // Supabase (storage for PDF reports) — optional locally, required in prod
  SUPABASE_URL: opt(z.string().url()),
  SUPABASE_SERVICE_KEY: opt(z.string().min(1)),

  // Upstash Redis (KV cache for chart data) — optional locally (KV degrades gracefully)
  UPSTASH_REDIS_REST_URL: opt(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: opt(z.string().min(1)),

  // Cron authentication (required in deployment; route fails closed when missing)
  CRON_SECRET: opt(z.string().min(1)),

  // Gemini AI — required in production (admin reports / generation)
  GEMINI_API_KEY: opt(z.string().min(1)),
  GEMINI_MODEL: optWithDefault(z.string().min(1), "gemini-2.5-flash"),

  /// Bypass purchase check on POST /api/reports/generate when session email matches
  ADMIN_EMAIL: opt(z.string().email()),

  /// Bank transfer details (admin payments — email only; optional until used)
  BANK_ACCOUNT_NAME: opt(z.string().min(1)),
  BANK_IBAN: opt(z.string().min(1)),
  BANK_BIC: opt(z.string().min(1)),
  BANK_REFERENCE_PREFIX: z.preprocess(
    (v) => (v === "" || v === undefined ? "CC" : v),
    z.string().min(1).default("CC")
  ),

  // App URL — defaults to NEXTAUTH_URL when absent
  APP_URL: z.string().url().optional(),

  // App
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export function parseEnv(source: NodeJS.ProcessEnv) {
  const base = envSchema.safeParse(source);

  if (!base.success) {
    console.error(
      "❌  Missing or invalid environment variables:\n",
      base.error.flatten().fieldErrors
    );
    throw new Error(
      "Invalid environment configuration — check your .env.local file."
    );
  }

  const data = base.data;
  // `next build` sets NODE_ENV=production but should not fail CI/local builds
  // when deploy-only secrets are absent; enforce at runtime (`next start` / server).
  // Use `source` (not only process.env) so tests and isolated parses behave correctly.
  const isNextProductionBuild =
    source.NEXT_PHASE === "phase-production-build";
  if (data.NODE_ENV === "production" && !isNextProductionBuild) {
    const prodIssues: string[] = [];
    if (!data.GEMINI_API_KEY) prodIssues.push("GEMINI_API_KEY");
    if (!data.ADMIN_EMAIL) prodIssues.push("ADMIN_EMAIL");
    if (prodIssues.length) {
      console.error(
        "❌  Production requires:\n",
        prodIssues.join(", ")
      );
      throw new Error(
        `Invalid environment configuration — missing: ${prodIssues.join(", ")}`
      );
    }
  }

  return data;
}

export const env = parseEnv(process.env);

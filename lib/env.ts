/**
 * lib/env.ts
 * Single source of truth for all environment variables.
 * Validated at startup with Zod — throws a clear error if anything is missing.
 * Import `env` from here everywhere. Never access process.env directly.
 * See copilot-instructions section 20 for the full variable reference.
 */

// STATUS: done | Task R.3

import { z } from "zod";

// Coerce empty strings to undefined so optional fields in .env.local may be
// left blank (VAR=) without triggering a validation error.
const opt = (schema: z.ZodString) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  // Vedic Astrology API (external, paid — section 16.1)
  VEDIC_API_URL: z.string().url(),
  VEDIC_API_KEY: z.string().min(1),

  // Human Design ephemeris files (section 16.2)
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

  // Cron authentication (set in Vercel → optional locally)
  CRON_SECRET: opt(z.string().min(1)),

  // Gemini AI — required for report generation
  GEMINI_API_KEY: z.string().min(1),
  /** Default: Gemini 3.1 Flash-Lite Preview (text). Override with e.g. gemini-3-flash-preview. */
  GEMINI_MODEL: z.string().default("gemini-3.1-flash-lite-preview"),
  ADMIN_EMAIL: z.string().email().default("shomty@hotmail.com"),

  // App URL — defaults to NEXTAUTH_URL when absent
  APP_URL: z.string().url().optional(),

  // App
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌  Missing or invalid environment variables:\n",
    parsed.error.flatten().fieldErrors
  );
  throw new Error(
    "Invalid environment configuration — check your .env.local file."
  );
}

export const env = parsed.data;

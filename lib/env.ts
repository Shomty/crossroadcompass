/**
 * lib/env.ts
 * Single source of truth for all environment variables.
 * Validated at startup with Zod — throws a clear error if anything is missing.
 * Import `env` from here everywhere. Never access process.env directly.
 * See copilot-instructions section 20 for the full variable reference.
 */

import { z } from "zod";

const envSchema = z.object({
  // Vedic Astrology API (external — section 16.1). Optional until API access is restored.
  VEDIC_API_URL: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  VEDIC_API_KEY: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

  // OpenAI — for HD report generation
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Google Gemini — for HD report generation
  GEMINI_API_KEY: z.string().min(1),

  // Human Design ephemeris files (section 16.2)
  EPHE_PATH: z.string().default("./ephe"),

  // Database
  DATABASE_URL: z.string().min(1),

  // Stripe (AC-02) — optional until task #11 (real Stripe) is implemented
  // Mock payment service is used while these are absent.
  STRIPE_SECRET_KEY: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

  // Email via Resend — optional in dev (magic link URL printed to console)
  RESEND_API_KEY: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

  // ─── OAuth providers (all optional — only enabled when both ID + SECRET are set) ───
  GOOGLE_CLIENT_ID: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  GITHUB_ID: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  GITHUB_SECRET: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  FACEBOOK_CLIENT_ID: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  FACEBOOK_CLIENT_SECRET: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  APPLE_ID: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
  APPLE_SECRET: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

  // ─── Cron ─────────────────────────────────────────────────────────────────
  // Secret token Vercel sends with every scheduled cron invocation.
  CRON_SECRET: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

  // App public URL — used to generate dashboard links in emails
  APP_URL: z.string().url().default("http://localhost:3000"),

  // Auth (NextAuth v5)
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),

  // Supabase (storage for PDF reports) — optional; not needed for HD-only flow
  SUPABASE_URL: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  SUPABASE_SERVICE_KEY: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

  // Upstash Redis (KV cache for chart data) — optional in dev; cache is skipped when absent
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),

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

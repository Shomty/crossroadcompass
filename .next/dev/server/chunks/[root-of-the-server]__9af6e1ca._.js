module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
/**
 * lib/db.ts
 * Prisma client singleton. Safe for use in Next.js serverless functions
 * (avoids "too many connections" in development hot-reload).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$better$2d$sqlite3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-better-sqlite3/dist/index.mjs [app-route] (ecmascript)");
;
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    adapter: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$better$2d$sqlite3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaBetterSqlite3"]({
        url: process.env.DATABASE_URL ?? "file:./prisma/dev.db"
    }),
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error",
        "warn"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = db;
}
}),
"[project]/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
/**
 * lib/auth.ts
 * NextAuth v5 configuration.
 * Email/password only at launch (AC-01 — no social login required at MVP).
 * Uses Prisma adapter for session + account persistence.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/prisma-adapter/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$resend$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/resend.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$resend$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/core/providers/resend.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
;
const { handlers, auth, signIn, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    adapter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$prisma$2d$adapter$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaAdapter"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"]),
    session: {
        strategy: "database"
    },
    providers: [
        // Magic-link email auth via Resend — no password needed at MVP
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$resend$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            from: "Crossroads Compass <hello@crossroadscompass.com>"
        })
    ],
    pages: {
        signIn: "/login",
        verifyRequest: "/check-email",
        error: "/auth-error"
    },
    callbacks: {
        session ({ session, user }) {
            // Attach DB user id to the session so API routes can use it
            session.user.id = user.id;
            return session;
        }
    }
});
}),
"[project]/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>env
]);
/**
 * lib/env.ts
 * Single source of truth for all environment variables.
 * Validated at startup with Zod — throws a clear error if anything is missing.
 * Import `env` from here everywhere. Never access process.env directly.
 * See copilot-instructions section 20 for the full variable reference.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
// Coerce empty strings to undefined so optional fields in .env.local may be
// left blank (VAR=) without triggering a validation error.
const opt = (schema)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((v)=>v === "" ? undefined : v, schema.optional());
const envSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    // Vedic Astrology API (external, paid — section 16.1)
    VEDIC_API_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    VEDIC_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    // Human Design ephemeris files (section 16.2)
    EPHE_PATH: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default("./ephe"),
    // Database
    DATABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    // Stripe (AC-02) — optional until task #11 (real Stripe) is implemented
    // Mock payment service is used while these are absent.
    STRIPE_SECRET_KEY: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    STRIPE_WEBHOOK_SECRET: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    // Email via Resend
    RESEND_API_KEY: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    // Auth (NextAuth v5)
    AUTH_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    NEXTAUTH_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    // Supabase (storage for PDF reports) — optional locally, required in prod
    SUPABASE_URL: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url()),
    SUPABASE_SERVICE_KEY: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    // Upstash Redis (KV cache for chart data) — optional locally (KV degrades gracefully)
    UPSTASH_REDIS_REST_URL: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url()),
    UPSTASH_REDIS_REST_TOKEN: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    // Cron authentication (set in Vercel → optional locally)
    CRON_SECRET: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    // Gemini AI — optional locally; AI features degrade gracefully when absent
    GEMINI_API_KEY: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    // App URL — defaults to NEXTAUTH_URL when absent
    APP_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional(),
    // App
    NODE_ENV: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "development",
        "test",
        "production"
    ]).default("development")
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌  Missing or invalid environment variables:\n", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration — check your .env.local file.");
}
const env = parsed.data;
}),
"[project]/lib/astro/hdCalculator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HDCalculationError",
    ()=>HDCalculationError,
    "calculateHDChart",
    ()=>calculateHDChart
]);
// STATUS: done | Task 3.2
/**
 * lib/astro/hdCalculator.ts
 * Wrapper around openhumandesign-library.
 * Runs entirely server-side — no network calls.
 * See copilot-instructions section 16.2.
 *
 * LICENSE PENDING: Swiss Ephemeris commercial license required before launch.
 * openhumandesign-library defaults to AGPL-3.0. For commercial use, requires
 * LGPL-3.0 option which requires a Swiss Ephemeris professional license from
 * Astrodienst AG. Store proof in /docs/licenses/ before go-live.
 * See copilot-instructions section 16.3.
 */ // LICENSE PENDING
var __TURBOPACK__imported__module__$5b$externals$5d2f$openhumandesign$2d$library__$5b$external$5d$__$28$openhumandesign$2d$library$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$openhumandesign$2d$library$29$__ = __turbopack_context__.i("[externals]/openhumandesign-library [external] (openhumandesign-library, cjs, [project]/node_modules/openhumandesign-library)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
;
;
class HDCalculationError extends Error {
    cause;
    constructor(message, cause){
        super(message), this.cause = cause;
        this.name = "HDCalculationError";
    }
}
function calculateHDChart(birthInfo) {
    try {
        const chart = __TURBOPACK__imported__module__$5b$externals$5d2f$openhumandesign$2d$library__$5b$external$5d$__$28$openhumandesign$2d$library$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$openhumandesign$2d$library$29$__["HumanDesignCalculator"].calculateHumanDesignChart(birthInfo, {
            ephePath: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].EPHE_PATH
        });
        return {
            type: chart.type,
            strategy: chart.strategy,
            signature: chart.signature,
            notSelfTheme: chart.notSelfTheme,
            authority: chart.authority,
            profile: chart.profile,
            definition: chart.definition,
            incarnationCross: chart.incarnationCross,
            definedCenters: chart.definedCenters,
            undefinedCenters: chart.undefinedCenters,
            activeChannels: chart.activeChannels,
            activeGates: chart.activeGates,
            variables: chart.variables,
            personality: chart.personality,
            design: chart.design,
            designDate: chart.designDate instanceof Date ? chart.designDate.toISOString() : String(chart.designDate)
        };
    } catch (err) {
        throw new HDCalculationError("Human Design chart calculation failed. Check ephemeris files and birth data.", err);
    }
}
}),
"[project]/lib/astro/vedicApiClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VedicApiError",
    ()=>VedicApiError,
    "fetchDailyTransits",
    ()=>fetchDailyTransits,
    "fetchDashaTimeline",
    ()=>fetchDashaTimeline,
    "fetchVedicNatalChart",
    ()=>fetchVedicNatalChart
]);
/**
 * lib/astro/vedicApiClient.ts
 * Raw HTTP client for the Vedic Astrology external API.
 * THIS IS THE ONLY FILE THAT MAY CALL THE VEDIC API.
 * No other file in the codebase may import fetch against this endpoint directly.
 * See copilot-instructions section 16.1.
 *
 * Rate-limit awareness: every call costs money. All callers must check the
 * DB cache first. This file has no caching logic — that lives in chartService,
 * transitService, and dashaService.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
;
class VedicApiError extends Error {
    status;
    body;
    constructor(status, body){
        super(`Vedic API error ${status}`), this.status = status, this.body = body;
        this.name = "VedicApiError";
    }
}
// ─── Core fetch wrapper ───────────────────────────────────────────────────
async function vedicFetch(path, body) {
    const url = `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].VEDIC_API_URL}${path}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Key is sent server-side only; never exposed to the client
            "X-Api-Key": __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].VEDIC_API_KEY
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        // Log status server-side only — never surface the key or raw body to client
        const text = await res.text();
        console.error(`[VedicAPI] ${res.status} on ${path}:`, text);
        throw new VedicApiError(res.status, text);
    }
    return res.json();
}
async function fetchVedicNatalChart(params) {
    const raw = await vedicFetch("/birth-charts", {
        birthInfo: params
    });
    return {
        rawResponse: raw
    };
}
async function fetchDailyTransits(params) {
    // DECISION NEEDED: confirm endpoint path and payload schema
    const raw = await vedicFetch("/transits", params);
    return {
        rawResponse: raw,
        date: params.date
    };
}
async function fetchDashaTimeline(params) {
    // DECISION NEEDED: confirm endpoint path and payload schema
    const raw = await vedicFetch("/dashas", params);
    // DECISION NEEDED: map raw API response to DashaPeriod[] once shape known
    return raw;
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/kv/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kv",
    ()=>kv
]);
// STATUS: done | Task 2.1
/**
 * lib/kv/client.ts
 * Single KV (Redis) client instance for the entire application.
 * No other file instantiates a Redis client.
 * Uses Upstash Redis REST API — compatible with edge and serverless runtimes.
 *
 * When UPSTASH_REDIS_REST_URL / TOKEN are absent (local dev without Redis),
 * `kv` is null and all helpers in kv/helpers.ts short-circuit gracefully.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@upstash/redis/nodejs.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
;
;
const kv = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].UPSTASH_REDIS_REST_URL && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].UPSTASH_REDIS_REST_TOKEN ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Redis"]({
    url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].UPSTASH_REDIS_REST_URL,
    token: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].UPSTASH_REDIS_REST_TOKEN
}) : null;
}),
"[project]/lib/kv/helpers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kvDelete",
    ()=>kvDelete,
    "kvDeleteMany",
    ()=>kvDeleteMany,
    "kvGet",
    ()=>kvGet,
    "kvSet",
    ()=>kvSet
]);
// STATUS: done | Task 2.3
/**
 * lib/kv/helpers.ts
 * Typed get/set/delete wrappers around the KV client.
 * All functions handle Redis errors gracefully:
 *   - Log server-side only
 *   - kvGet returns null on miss or error — caller decides what to do
 *   - kvSet/kvDelete/kvDeleteMany never throw to caller
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/client.ts [app-route] (ecmascript)");
;
const kvWarnedKeys = new Set();
function logKvIssue(operation, key, err) {
    const isFetchError = err instanceof TypeError && typeof err.message === "string" && err.message.toLowerCase().includes("fetch failed");
    // During local/dev outages, treat KV as an optional cache and avoid
    // surfacing noisy console errors in the Next.js error overlay.
    if (isFetchError) {
        const warnKey = `${operation}:${key}`;
        if (!kvWarnedKeys.has(warnKey)) {
            kvWarnedKeys.add(warnKey);
            console.warn(`[KV] ${operation} unavailable for key "${key}" (network issue). Falling back without cache.`);
        }
        return;
    }
    console.error(`[KV] ${operation} failed for key "${key}":`, err);
}
async function kvGet(key) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"]) return null;
    try {
        const value = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].get(key);
        return value ?? null;
    } catch (err) {
        logKvIssue("kvGet", key, err);
        return null;
    }
}
async function kvSet(key, value, ttlSeconds) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"]) return;
    try {
        if (ttlSeconds !== undefined) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].set(key, value, {
                ex: ttlSeconds
            });
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].set(key, value);
        }
    } catch (err) {
        logKvIssue("kvSet", key, err);
    }
}
async function kvDelete(key) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"]) return;
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].del(key);
    } catch (err) {
        logKvIssue("kvDelete", key, err);
    }
}
async function kvDeleteMany(keys) {
    if (keys.length === 0) return;
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"]) return;
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].del(...keys);
    } catch (err) {
        const key = keys.join(", ");
        logKvIssue("kvDeleteMany", key, err);
    }
}
}),
"[project]/lib/kv/keys.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// STATUS: done | Task 2.2
/**
 * lib/kv/keys.ts
 * Typed KV key builders and TTL constants.
 * No Redis calls here — only key construction.
 */ __turbopack_context__.s([
    "KV_TTL",
    ()=>KV_TTL,
    "kvKeys",
    ()=>kvKeys
]);
const kvKeys = {
    vedicChart: (userId)=>`chart:vedic:${userId}`,
    hdChart: (userId)=>`chart:hd:${userId}`,
    dashas: (userId)=>`chart:dashas:${userId}`,
    /** date must be YYYY-MM-DD */ transit: (userId, date)=>`transit:${userId}:${date}`,
    /** Prefix for scanning all transit keys for a user */ transitPrefix: (userId)=>`transit:${userId}:`
};
const KV_TTL = {
    /** 24 hours in seconds — transits auto-expire */ TRANSIT_SECONDS: 86_400,
    /** No TTL — natal charts are permanent until explicitly invalidated */ NATAL_CHART: undefined,
    /** No TTL — dashas are permanent until birth data changes */ DASHAS: undefined
};
}),
"[project]/lib/astro/chartService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// STATUS: done | Tasks 3.3, 3.4, 3.5
/**
 * lib/astro/chartService.ts
 * Orchestrator: KV cache-check → calculate/fetch → store in KV → return.
 * All callers use the public functions below.
 * Nothing else calls the HD library or Vedic API directly.
 *
 * Caching:
 *   HD chart    — KV, no TTL, invalidated when birth data changes (3.3)
 *   Vedic chart — KV, no TTL, invalidated when birth data changes (3.3)
 *   Transits    — see transitService.ts (3.6)
 */ __turbopack_context__.s([
    "getOrCreateHDChart",
    ()=>getOrCreateHDChart,
    "getOrCreateVedicChart",
    ()=>getOrCreateVedicChart,
    "invalidateChartCache",
    ()=>invalidateChartCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$hdCalculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/hdCalculator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/vedicApiClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/keys.ts [app-route] (ecmascript)");
;
;
;
;
// ─── Helpers ─────────────────────────────────────────────────────────────
/** Convert a Prisma BirthProfile to the BirthInfo shape the HD library expects (UTC). */ function profileToBirthInfo(profile) {
    const d = new Date(profile.birthDate);
    return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        // Use noon (12:00) when birth time is unknown — partial profile per OB-04
        hour: profile.birthTimeKnown ? profile.birthHour ?? 12 : 12,
        minute: profile.birthTimeKnown ? profile.birthMinute ?? 0 : 0,
        second: 0,
        latitude: profile.latitude,
        longitude: profile.longitude
    };
}
async function invalidateChartCache(userId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvDeleteMany"])([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].hdChart(userId),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].dashas(userId)
    ]);
}
async function getOrCreateHDChart(userId, birthProfile) {
    const cached = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvGet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].hdChart(userId));
    if (cached !== null) return cached;
    const birthInfo = profileToBirthInfo(birthProfile);
    const chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$hdCalculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateHDChart"])(birthInfo);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvSet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].hdChart(userId), chart, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KV_TTL"].NATAL_CHART);
    return chart;
}
async function getOrCreateVedicChart(userId, birthProfile) {
    const cached = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvGet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId));
    if (cached !== null) return cached;
    // Build payload matching VedicBirthChartRequest (types.ts)
    const d = new Date(birthProfile.birthDate);
    const dateOfBirth = [
        d.getUTCFullYear(),
        String(d.getUTCMonth() + 1).padStart(2, "0"),
        String(d.getUTCDate()).padStart(2, "0")
    ].join("-");
    const hour = birthProfile.birthTimeKnown ? birthProfile.birthHour ?? 12 : 12;
    const minute = birthProfile.birthTimeKnown ? birthProfile.birthMinute ?? 0 : 0;
    const timeOfBirth = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const location = [
        birthProfile.birthCity,
        birthProfile.birthCountry
    ].filter(Boolean).join(", ");
    const genderMap = {
        male: "male",
        female: "female",
        other: "other",
        prefer_not_to_say: "other"
    };
    const gender = genderMap[birthProfile.gender ?? ""] ?? "other";
    const chart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchVedicNatalChart"])({
        dateOfBirth,
        timeOfBirth,
        location,
        isTimeApproximate: !birthProfile.birthTimeKnown,
        gender,
        name: birthProfile.birthName
    });
    const chartData = chart;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvSet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId), chartData, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KV_TTL"].NATAL_CHART);
    return chartData;
}
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/promises [external] (node:stream/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/promises", () => require("node:stream/promises"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/lib/ai/dailyInsightService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateDailyInsight",
    ()=>generateDailyInsight,
    "getTodaysDailyInsight",
    ()=>getTodaysDailyInsight
]);
/**
 * lib/ai/dailyInsightService.ts
 * Generates a personalised daily insight using Gemini.
 * Incorporates: HD chart identity + active Mahadasha/Antardasha + today's date context.
 * Stored as an Insight row with type "DAILY" and periodDate = today.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/node/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
let _gemini = null;
function gemini() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    if (!_gemini) _gemini = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
        apiKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GEMINI_API_KEY
    });
    return _gemini;
}
function buildDailyPrompt(chart, dasha, today, userName) {
    const name = userName ?? "the user";
    const dateStr = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    const dashaLine = dasha ? `Active Dasha: ${dasha.mahadasha}${dasha.antardasha ? ` / ${dasha.antardasha}` : ""} mahadasha` : "";
    return `Write a short personalised daily insight for ${name}.
Today: ${dateStr}
HD Type: ${chart.type} | Strategy: ${chart.strategy} | Authority: ${chart.authority} | Profile: ${chart.profile}
${dashaLine}

Rules: warm and practical tone, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`;
}
async function generateDailyInsight(userId, chart, userName) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // Get active Dasha context
    const now = new Date();
    const [activeMaha, activeAntar] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findFirst({
            where: {
                userId,
                level: "MAHADASHA",
                startDate: {
                    lte: now
                },
                endDate: {
                    gte: now
                }
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findFirst({
            where: {
                userId,
                level: "ANTARDASHA",
                startDate: {
                    lte: now
                },
                endDate: {
                    gte: now
                }
            }
        })
    ]);
    const dashaCtx = activeMaha ? {
        mahadasha: activeMaha.planetName,
        antardasha: activeAntar ? activeAntar.planetName.split("/")[1] ?? null : null,
        mahadashaEnds: activeMaha.endDate.toISOString()
    } : null;
    const prompt = buildDailyPrompt(chart, dashaCtx, today, userName);
    const result = await gemini().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.8,
            maxOutputTokens: 4096
        }
    });
    const raw = result.text;
    if (!raw) throw new Error("Gemini returned empty response");
    // Strip any markdown fences if present
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean);
    const insight = {
        ...parsed,
        generatedAt: new Date().toISOString()
    };
    // Store — upsert so re-generation on same day overwrites
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.upsert({
        where: {
            userId_type_periodDate: {
                userId,
                type: "DAILY",
                periodDate: today
            }
        },
        create: {
            userId,
            type: "DAILY",
            periodDate: today,
            content: JSON.stringify(insight),
            reviewedByConsultant: false
        },
        update: {
            content: JSON.stringify(insight),
            generatedAt: new Date()
        }
    });
    return insight;
}
async function getTodaysDailyInsight(userId) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.findFirst({
        where: {
            userId,
            type: "DAILY",
            periodDate: {
                gte: today,
                lt: tomorrow
            }
        },
        orderBy: {
            generatedAt: "desc"
        }
    });
    if (!row) return null;
    return JSON.parse(row.content);
}
}),
"[project]/lib/email/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "sendEmail",
    ()=>sendEmail
]);
// STATUS: done | Task 7.1
/**
 * lib/email/client.ts
 * Configured Resend client + typed sendEmail wrapper.
 * Dev fallback: if RESEND_API_KEY is not set, renders the email as HTML
 * and logs it to the console rather than throwing.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/resend/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$components$2f$node_modules$2f40$react$2d$email$2f$render$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/components/node_modules/@react-email/render/dist/node/index.mjs [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$components$2f$node_modules$2f40$react$2d$email$2f$render$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$components$2f$node_modules$2f40$react$2d$email$2f$render$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const resend = process.env.RESEND_API_KEY ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resend"](process.env.RESEND_API_KEY) : null;
const FROM_ADDRESS = "Crossroads Compass <hello@crossroadscompass.com>";
async function sendEmail(options) {
    try {
        if (!resend) {
            // Dev mode — print rendered HTML to console instead of sending.
            const html = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$components$2f$node_modules$2f40$react$2d$email$2f$render$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["render"])(options.react);
            console.log(`\n📧 EMAIL (dev mode — not sent):`);
            console.log(`  To:      ${options.to}`);
            console.log(`  Subject: ${options.subject}`);
            console.log(`  Preview: ${html.slice(0, 200).replace(/\s+/g, " ")}…\n`);
            return;
        }
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: options.to,
            subject: options.subject,
            react: options.react
        });
        if (error) {
            console.error("[email/client] Resend error:", error);
        }
    } catch (err) {
        // Email failure must never break user-facing flows.
        console.error("[email/client] Unexpected error:", err);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/email/templates/DailyInsightEmail.tsx [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DailyInsightEmail",
    ()=>DailyInsightEmail,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-route] (ecmascript)");
// STATUS: done | Task 7.3
/**
 * lib/email/templates/DailyInsightEmail.tsx
 * Daily insight delivery email.
 * Rating links use GET requests so they work from any email client
 * without requiring JavaScript.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$body$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/body/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$button$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/button/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$container$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/container/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$head$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/head/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$heading$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/heading/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$hr$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/hr/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$html$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/html/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$link$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/link/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$preview$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/preview/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/section/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$text$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-email/text/dist/index.mjs [app-route] (ecmascript)");
;
;
const STARS = [
    "★",
    "★★",
    "★★★",
    "★★★★",
    "★★★★★"
];
const LABELS = [
    "Not useful",
    "Somewhat useful",
    "Useful",
    "Very useful",
    "Spot on"
];
function DailyInsightEmail({ insightContent, insightId, dashboardUrl }) {
    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
    const ratingBase = `${dashboardUrl.replace(/\/$/, "")}/api/insights/rate`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$html$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Html"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$head$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Head"], {}, void 0, false, {
                fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$preview$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Preview"], {
                children: [
                    insightContent.slice(0, 100),
                    "…"
                ]
            }, void 0, true, {
                fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$body$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Body"], {
                style: body,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$container$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Container"], {
                    style: container,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Section"], {
                            style: headerSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$text$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Text"], {
                                    style: eyebrow,
                                    children: "✦ Your Daily Guidance"
                                }, void 0, false, {
                                    fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$text$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Text"], {
                                    style: dateText,
                                    children: today
                                }, void 0, false, {
                                    fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Section"], {
                            style: insightSection,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$text$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Text"], {
                                style: insightText,
                                children: insightContent
                            }, void 0, false, {
                                fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                lineNumber: 60,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$hr$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hr"], {
                            style: divider
                        }, void 0, false, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Section"], {
                            style: ratingSection,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$heading$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Heading"], {
                                    style: ratingHeading,
                                    children: "How accurate was this?"
                                }, void 0, false, {
                                    fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                    lineNumber: 67,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$text$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Text"], {
                                    style: ratingSubtext,
                                    children: "Tap a rating — it helps refine your guidance."
                                }, void 0, false, {
                                    fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Section"], {
                                    style: starsRow,
                                    children: [
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map((rating)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$link$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Link"], {
                                            href: `${ratingBase}?insightId=${insightId}&rating=${rating}`,
                                            style: starLink,
                                            title: LABELS[rating - 1],
                                            children: STARS[rating - 1]
                                        }, rating, false, {
                                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                            lineNumber: 71,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$hr$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Hr"], {
                            style: divider
                        }, void 0, false, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Section"], {
                            style: ctaSection,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$button$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Button"], {
                                href: dashboardUrl,
                                style: button,
                                children: "Open Dashboard"
                            }, void 0, false, {
                                fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$section$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Section"], {
                            style: footer,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$text$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Text"], {
                                style: footerText,
                                children: [
                                    "© ",
                                    new Date().getFullYear(),
                                    " Crossroads Compass ·",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$email$2f$link$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Link"], {
                                        href: "https://crossroadscompass.com",
                                        style: link,
                                        children: "crossroadscompass.com"
                                    }, void 0, false, {
                                        fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/lib/email/templates/DailyInsightEmail.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = DailyInsightEmail;
// ─── Styles ──────────────────────────────────────────────────────────────────
const body = {
    backgroundColor: "#0d1220",
    fontFamily: "'Instrument Sans', -apple-system, sans-serif",
    margin: 0,
    padding: 0
};
const container = {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "40px 24px"
};
const headerSection = {
    marginBottom: "24px"
};
const eyebrow = {
    fontSize: "11px",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "#c8873a",
    margin: "0 0 4px 0"
};
const dateText = {
    fontSize: "13px",
    color: "#6b6b6b",
    margin: 0
};
const insightSection = {
    margin: "24px 0",
    padding: "24px",
    borderLeft: "2px solid rgba(200, 135, 58, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.02)"
};
const insightText = {
    fontSize: "16px",
    lineHeight: 1.75,
    color: "#f2ead8",
    margin: 0,
    fontStyle: "italic"
};
const divider = {
    borderColor: "rgba(200, 135, 58, 0.15)",
    margin: "28px 0"
};
const ratingSection = {
    marginBottom: "8px"
};
const ratingHeading = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#f2ead8",
    margin: "0 0 4px 0"
};
const ratingSubtext = {
    fontSize: "12px",
    color: "#6b6b6b",
    margin: "0 0 16px 0"
};
const starsRow = {
    display: "flex",
    gap: "16px"
};
const starLink = {
    fontSize: "22px",
    color: "#c8873a",
    textDecoration: "none",
    marginRight: "12px"
};
const ctaSection = {
    marginBottom: "32px"
};
const button = {
    display: "inline-block",
    backgroundColor: "transparent",
    color: "#c8873a",
    padding: "12px 28px",
    borderRadius: "2px",
    border: "1px solid #c8873a",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textDecoration: "none"
};
const footer = {
    marginTop: "32px"
};
const footerText = {
    fontSize: "12px",
    color: "#6b6b6b",
    margin: 0
};
const link = {
    color: "#c8873a",
    textDecoration: "none"
};
}),
"[project]/app/api/insights/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * app/api/insights/generate/route.ts
 * POST /api/insights/generate
 * Generates today's daily insight for the authenticated user.
 * Idempotent — returns existing insight if already generated today.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$chartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/chartService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$dailyInsightService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/dailyInsightService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$templates$2f$DailyInsightEmail$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email/templates/DailyInsightEmail.tsx [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
async function POST() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user?.id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const userId = session.user.id;
    const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].birthProfile.findUnique({
        where: {
            userId
        }
    });
    if (!profile) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No birth profile found. Complete onboarding first."
        }, {
            status: 404
        });
    }
    try {
        // Return existing insight if already generated today
        const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$dailyInsightService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTodaysDailyInsight"])(userId);
        if (existing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                insight: existing,
                cached: true
            });
        }
        const chart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$chartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrCreateHDChart"])(userId, profile);
        const insight = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$dailyInsightService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDailyInsight"])(userId, chart, profile.birthName);
        // Send daily email for freshly generated insights (fire-and-forget)
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                id: userId
            },
            select: {
                email: true
            }
        });
        const row = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.findFirst({
            where: {
                userId,
                type: "DAILY"
            },
            orderBy: {
                generatedAt: "desc"
            },
            select: {
                id: true
            }
        });
        if (user?.email && row) {
            const appUrl = (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].APP_URL ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NEXTAUTH_URL).replace(/\/$/, "");
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendEmail"])({
                to: user.email,
                subject: `✦ Your Daily Guidance · ${new Date().toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                })}`,
                react: /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$templates$2f$DailyInsightEmail$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DailyInsightEmail"], {
                    insightContent: insight.insight,
                    insightId: row.id,
                    dashboardUrl: `${appUrl}/dashboard`
                })
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            insight,
            cached: false
        });
    } catch (err) {
        console.error("[insights/generate] failed:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Insight generation failed. Please try again."
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9af6e1ca._.js.map
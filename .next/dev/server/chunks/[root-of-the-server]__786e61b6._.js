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
"[project]/lib/astro/dashaService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentDasha",
    ()=>getCurrentDasha,
    "getOrFetchDashas",
    ()=>getOrFetchDashas,
    "storeDashasFromChart",
    ()=>storeDashasFromChart
]);
/**
 * lib/astro/dashaService.ts
 * Dasha extraction and DB cache layer.
 * Caching rule (section 18.4): fetch once; valid for years.
 * Dashas are embedded in the Vedic birth chart response (chartD1.dashas.vimshottari).
 * They are extracted and stored in the Dasha table after chart generation.
 * Rows are deleted atomically when birth data changes (via invalidateChartCache).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
async function storeDashasFromChart(userId, chart) {
    const periods = chart.chartD1?.dashas?.vimshottari?.dashaPeriods;
    if (!periods?.length) return;
    const rows = [];
    for (const mahadasha of periods){
        rows.push({
            userId,
            startDate: new Date(mahadasha.startDate),
            endDate: new Date(mahadasha.endDate),
            planetName: mahadasha.planet,
            level: "MAHADASHA"
        });
        for (const antardasha of mahadasha.subPeriods ?? []){
            rows.push({
                userId,
                startDate: new Date(antardasha.startDate),
                endDate: new Date(antardasha.endDate),
                planetName: `${mahadasha.planet}/${antardasha.planet}`,
                level: "ANTARDASHA"
            });
        }
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$transaction([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.deleteMany({
            where: {
                userId
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.createMany({
            data: rows
        })
    ]);
}
async function getOrFetchDashas(userId) {
    const twelveMonthsFromNow = new Date();
    twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
    const coverage = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findFirst({
        where: {
            userId,
            endDate: {
                gte: twelveMonthsFromNow
            }
        }
    });
    if (coverage) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findMany({
            where: {
                userId
            },
            orderBy: {
                startDate: "asc"
            }
        });
    }
    // Not yet populated — chart generation will call storeDashasFromChart
    return [];
}
async function getCurrentDasha(userId) {
    const now = new Date();
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findFirst({
        where: {
            userId,
            startDate: {
                lte: now
            },
            endDate: {
                gte: now
            },
            level: "MAHADASHA"
        }
    });
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$dashaService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/dashaService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/keys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
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
    if (cached !== null) {
        // Chart is cached — but dashas may not have been stored yet (e.g. if a previous
        // fire-and-forget store raced or failed). Check and backfill if needed.
        const dashaCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.count({
            where: {
                userId
            }
        });
        if (dashaCount === 0) {
            const rawResponse = cached.rawResponse;
            if (rawResponse) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$dashaService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeDashasFromChart"])(userId, rawResponse);
            }
        }
        return cached;
    }
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
    // Await dasha storage — must complete before caller queries the dasha table
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$dashaService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeDashasFromChart"])(userId, chart.rawResponse);
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
"[project]/lib/ai/forecastService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateMonthlyForecast",
    ()=>generateMonthlyForecast,
    "generateWeeklyForecast",
    ()=>generateWeeklyForecast,
    "getMonthStart",
    ()=>getMonthStart,
    "getThisMonthsForecast",
    ()=>getThisMonthsForecast,
    "getThisWeeksForecast",
    ()=>getThisWeeksForecast,
    "getWeekStart",
    ()=>getWeekStart
]);
/**
 * lib/ai/forecastService.ts
 * Generates weekly and monthly forecasts using Gemini.
 * Combines HD chart identity + active Dasha + period date context.
 * Stored as Insight rows: type WEEKLY (Monday of week) or MONTHLY (1st of month).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/node/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
let _gemini = null;
function gemini() {
    if (!_gemini) _gemini = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
        apiKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GEMINI_API_KEY ?? ""
    });
    return _gemini;
}
function getWeekStart(from = new Date()) {
    const d = new Date(from);
    const day = d.getUTCDay(); // 0=Sun, 1=Mon...
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
function getMonthStart(from = new Date()) {
    const d = new Date(from);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
// ─── Prompt builders ─────────────────────────────────────────────────────────
function buildWeeklyPrompt(chart, mahadasha, antardasha, weekStart, userName) {
    const name = userName ?? "the user";
    const weekOf = weekStart.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    const dashaLine = mahadasha ? `Active Dasha: ${mahadasha} Mahadasha${antardasha ? ` / ${antardasha} Antardasha` : ""}` : "";
    return `Write a personalised weekly forecast for ${name}.
Week of: ${weekOf}
HD Type: ${chart.type} | Strategy: ${chart.strategy} | Authority: ${chart.authority} | Profile: ${chart.profile}
${dashaLine}
Defined centers: ${chart.definedCenters.join(", ") || "none"}

Rules: practical and grounded, no "you will" predictions, use "may", "tends to", "notice". Warm tone.

Return ONLY valid JSON matching this exact shape:
{
  "headline": "one punchy sentence headline for this week",
  "theme": "2-4 word energy theme (e.g. Clarity & Focus)",
  "overview": "2-3 sentences overview of the week's energy for this person's HD type and active dasha",
  "sections": [
    { "title": "Energy & Body", "body": "2-3 sentences specific to their HD type and dasha" },
    { "title": "Relationships & Aura", "body": "2-3 sentences about social/relational energy this week" },
    { "title": "Work & Purpose", "body": "2-3 sentences about work, decisions, and purpose this week" }
  ],
  "practice": "one concrete weekly practice or focus (1-2 sentences)"
}`;
}
function buildMonthlyPrompt(chart, mahadasha, antardasha, monthStart, userName) {
    const name = userName ?? "the user";
    const monthName = monthStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
    const dashaLine = mahadasha ? `Active Dasha: ${mahadasha} Mahadasha${antardasha ? ` / ${antardasha} Antardasha` : ""} (planetary themes influence the month)` : "";
    return `Write a personalised monthly forecast for ${name}.
Month: ${monthName}
HD Type: ${chart.type} | Strategy: ${chart.strategy} | Authority: ${chart.authority} | Profile: ${chart.profile}
${dashaLine}
Defined centers: ${chart.definedCenters.join(", ") || "none"}

Rules: forward-looking but not predictive, use "may", "tends to", "invites". Warm and practical tone.

Return ONLY valid JSON matching this exact shape:
{
  "headline": "one sentence headline for this month",
  "theme": "2-4 word monthly theme",
  "overview": "3-4 sentences about the month's overall energy arc for this person",
  "sections": [
    { "title": "Energy Arc", "body": "how their energy may ebb and flow through the month (2-3 sentences)" },
    { "title": "Key Focus Areas", "body": "2-3 areas to pay attention to this month, specific to their type and dasha" },
    { "title": "Relationships", "body": "relational themes this month for their aura type (2-3 sentences)" },
    { "title": "Growth Edge", "body": "where growth and challenge may show up (2-3 sentences)" }
  ],
  "intention": "one intention or question to hold for the entire month"
}`;
}
async function generateWeeklyForecast(userId, chart, userName) {
    const weekStart = getWeekStart();
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
    const mahaName = activeMaha ? capitalize(activeMaha.planetName) : null;
    const antarName = activeAntar ? capitalize(activeAntar.planetName.split("/")[1] ?? "") : null;
    const prompt = buildWeeklyPrompt(chart, mahaName, antarName, weekStart, userName);
    const result = await gemini().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.75,
            maxOutputTokens: 8192
        }
    });
    const raw = result.text;
    if (!raw) throw new Error("Gemini returned empty response");
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean);
    const forecast = {
        ...parsed,
        generatedAt: new Date().toISOString()
    };
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.upsert({
        where: {
            userId_type_periodDate: {
                userId,
                type: "WEEKLY",
                periodDate: weekStart
            }
        },
        create: {
            userId,
            type: "WEEKLY",
            periodDate: weekStart,
            content: JSON.stringify(forecast),
            reviewedByConsultant: false
        },
        update: {
            content: JSON.stringify(forecast),
            generatedAt: new Date()
        }
    });
    return forecast;
}
async function getThisWeeksForecast(userId) {
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.findFirst({
        where: {
            userId,
            type: "WEEKLY",
            periodDate: {
                gte: weekStart,
                lt: weekEnd
            }
        },
        orderBy: {
            generatedAt: "desc"
        }
    });
    if (!row) return null;
    try {
        return JSON.parse(row.content);
    } catch  {
        return null;
    }
}
async function generateMonthlyForecast(userId, chart, userName) {
    const monthStart = getMonthStart();
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
    const mahaName = activeMaha ? capitalize(activeMaha.planetName) : null;
    const antarName = activeAntar ? capitalize(activeAntar.planetName.split("/")[1] ?? "") : null;
    const prompt = buildMonthlyPrompt(chart, mahaName, antarName, monthStart, userName);
    const result = await gemini().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.75,
            maxOutputTokens: 8192
        }
    });
    const raw = result.text;
    if (!raw) throw new Error("Gemini returned empty response");
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean);
    const forecast = {
        ...parsed,
        generatedAt: new Date().toISOString()
    };
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.upsert({
        where: {
            userId_type_periodDate: {
                userId,
                type: "MONTHLY",
                periodDate: monthStart
            }
        },
        create: {
            userId,
            type: "MONTHLY",
            periodDate: monthStart,
            content: JSON.stringify(forecast),
            reviewedByConsultant: false
        },
        update: {
            content: JSON.stringify(forecast),
            generatedAt: new Date()
        }
    });
    return forecast;
}
async function getThisMonthsForecast(userId) {
    const monthStart = getMonthStart();
    const monthEnd = new Date(monthStart);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insight.findFirst({
        where: {
            userId,
            type: "MONTHLY",
            periodDate: {
                gte: monthStart,
                lt: monthEnd
            }
        },
        orderBy: {
            generatedAt: "desc"
        }
    });
    if (!row) return null;
    try {
        return JSON.parse(row.content);
    } catch  {
        return null;
    }
}
// ─── Helper ───────────────────────────────────────────────────────────────────
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
}),
"[project]/app/api/insights/generate/weekly/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * app/api/insights/generate/weekly/route.ts
 * POST /api/insights/generate/weekly
 * Generates this week's forecast for the authenticated user.
 * Idempotent — returns cached forecast if already generated this week.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$chartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/chartService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$forecastService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/forecastService.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user?.id) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    const userId = session.user.id;
    const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].birthProfile.findUnique({
        where: {
            userId
        }
    });
    if (!profile) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "No birth profile found."
    }, {
        status: 404
    });
    try {
        const existing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$forecastService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getThisWeeksForecast"])(userId);
        if (existing) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            forecast: existing,
            cached: true
        });
        const chart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$chartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrCreateHDChart"])(userId, profile);
        const forecast = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$forecastService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateWeeklyForecast"])(userId, chart, profile.birthName);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            forecast,
            cached: false
        });
    } catch (err) {
        console.error("[insights/generate/weekly] failed:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Forecast generation failed. Please try again."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__786e61b6._.js.map
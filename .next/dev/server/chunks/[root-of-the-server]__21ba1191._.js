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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/google.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/core/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
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
        // Google OAuth
        ...process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            })
        ] : [],
        // Magic-link email auth via Resend
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
    // Google OAuth — optional; when absent the Google button is hidden
    GOOGLE_CLIENT_ID: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    GOOGLE_CLIENT_SECRET: opt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
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
    const envelope = await vedicFetch("/birth-charts", {
        birthInfo: params,
        chartStyle: "north_indian",
        ayanamsa: "lahiri",
        houseSystem: "equal"
    });
    return {
        rawResponse: envelope.data
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
    // ── Layer 1: KV hot cache ────────────────────────────────────────────────
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
    // ── Layer 2: DB durable store ────────────────────────────────────────────
    // Survives KV eviction; only re-fetched from the paid API when profileVersion changes.
    const dbProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].birthProfile.findUnique({
        where: {
            userId
        },
        select: {
            chartDataVedic: true,
            vedicProfileVersion: true,
            profileVersion: true
        }
    });
    if (dbProfile?.chartDataVedic != null && dbProfile.vedicProfileVersion === dbProfile.profileVersion) {
        const chartData = dbProfile.chartDataVedic;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvSet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId), chartData, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KV_TTL"].NATAL_CHART);
        const dashaCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.count({
            where: {
                userId
            }
        });
        if (dashaCount === 0) {
            const rawResponse = chartData.rawResponse;
            if (rawResponse) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$dashaService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeDashasFromChart"])(userId, rawResponse);
        }
        return chartData;
    }
    // ── Layer 3: Vedic API (paid — only on true cache miss) ──────────────────
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
    // Persist to DB — survives KV eviction; only re-fetched when profileVersion changes
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].birthProfile.update({
        where: {
            userId
        },
        data: {
            chartDataVedic: chartData,
            vedicProfileVersion: birthProfile.profileVersion
        }
    });
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvSet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId), chartData, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KV_TTL"].NATAL_CHART);
    return chartData;
}
}),
"[project]/lib/astro/transitChartService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * lib/astro/transitChartService.ts
 * Fetches today's planetary positions (transit chart) for a given user.
 *
 * Strategy:
 *   - Calls POST /api/v1/birth-charts with today's date/time and the user's
 *     birth location — this returns current planetary positions.
 *   - Result cached in KV for 24h (one entry per user per calendar day).
 *   - If the API is unavailable, returns null so callers can degrade gracefully.
 */ __turbopack_context__.s([
    "getTodayTransitChart",
    ()=>getTodayTransitChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/keys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/vedicApiClient.ts [app-route] (ecmascript)");
;
;
;
function pad2(n) {
    return n.toString().padStart(2, "0");
}
async function getTodayTransitChart(userId, profile) {
    // Date key in user's timezone: YYYY-MM-DD
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: profile.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
    const cacheKey = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].transit(userId, today);
    const cached = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvGet"])(cacheKey);
    if (cached !== null) return cached;
    // Resolve city/country from birth profile
    const location = [
        profile.birthCity,
        profile.birthCountry
    ].filter(Boolean).join(", ");
    // Build current time for the transit call
    const now = new Date();
    const timeOfBirth = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    try {
        const chart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchVedicNatalChart"])({
            dateOfBirth: today,
            timeOfBirth,
            location,
            isTimeApproximate: false,
            gender: profile.gender ?? "male",
            name: "transit"
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvSet"])(cacheKey, chart, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KV_TTL"].TRANSIT_SECONDS);
        return chart;
    } catch (err) {
        console.error("[transitChartService] API call failed:", err);
        return null;
    }
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
"[project]/lib/ai/transitReadingService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateTransitReading",
    ()=>generateTransitReading,
    "getCachedTransitReading",
    ()=>getCachedTransitReading
]);
/**
 * lib/ai/transitReadingService.ts
 * Generates a concise Vedic transit reading using Gemini.
 *
 * Compares the user's natal Rasi chart against today's planetary positions
 * using Parasara Hora Shastra principles:
 *   - Transit of planets over natal houses (Gochara)
 *   - Transit relative to natal Moon (Chandra Rasi)
 *   - Key timing signals from dasha lord transits
 *   - Natural benefic/malefic classifications
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/node/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/keys.ts [app-route] (ecmascript)");
;
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
/** KV key for a user's cached transit reading (one per day) */ function transitReadingKey(userId, date) {
    return `transit-reading:${userId}:${date}`;
}
function formatPlanets(planets) {
    if (!planets?.length) return "unavailable";
    return planets.map((p)=>`${p.name}: ${p.sign ?? "?"} house ${p.house ?? "?"}${p.isRetrograde ? " (R)" : ""}`).join(", ");
}
function buildTransitPrompt(natal, transit, dashaLord, userName, today) {
    const natalD1 = natal.rawResponse.chartD1;
    const transitD1 = transit.rawResponse.chartD1;
    const natalPlanets = formatPlanets(natalD1.planets);
    const transitPlanets = formatPlanets(transitD1.planets);
    const moonPlanet = natalD1.planets.find((p)=>p.name === "moon");
    const moonSign = moonPlanet?.sign ?? natalD1.ascendant?.sign ?? "unknown";
    const ascendant = natalD1.ascendant ? `${natalD1.ascendant.sign} ${natalD1.ascendant.degree?.toFixed(1) ?? ""}°` : "unknown";
    return `You are a Vedic astrologer trained in Parasara Hora Shastra. Generate a concise, practical transit reading.

Date: ${today}
Native: ${userName}
Natal Ascendant (Lagna): ${ascendant}
Natal Moon Sign (Chandra Rasi): ${moonSign}
Active Mahadasha Lord: ${dashaLord ?? "unknown"}

NATAL PLANETARY POSITIONS (Rasi chart):
${natalPlanets}

TODAY'S PLANETARY POSITIONS (Gochara transits):
${transitPlanets}

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
      "transitHouseFromMoon": <integer house number from moon or null>,
      "quality": "favorable|neutral|challenging",
      "note": "one sentence on what this transit means practically"
    }
  ],
  "guidance": "one actionable sentence for today based on the most significant transit"
}`;
}
async function generateTransitReading(userId, natal, transit, dashaLord, userName, location) {
    const today = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
    const cacheKey = transitReadingKey(userId, today);
    const cached = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvGet"])(cacheKey);
    if (cached) return cached;
    // Build all-planets snapshot from raw transit chart
    const allPlanets = (transit.rawResponse.chartD1.planets ?? []).map((p)=>({
            name: p.name,
            sign: p.sign ?? "?",
            house: p.house ?? null,
            degree: p.degree ?? 0,
            degreeFmt: p.degreeDMSFormatted ?? "",
            nakshatra: p.nakshatra ?? "",
            isRetrograde: p.isRetrograde ?? false
        }));
    const prompt = buildTransitPrompt(natal, transit, dashaLord, userName, today);
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
    if (!raw) throw new Error("Gemini returned empty transit reading");
    // Strip markdown fences as a safety net even with responseMimeType set
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean);
    const reading = {
        ...parsed,
        generatedAt: new Date().toISOString(),
        location,
        allPlanets
    };
    // Cache for the rest of the day
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvSet"])(cacheKey, reading, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KV_TTL"].TRANSIT_SECONDS);
    return reading;
}
async function getCachedTransitReading(userId) {
    const today = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvGet"])(transitReadingKey(userId, today));
}
}),
"[project]/app/api/transit/reading/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
/**
 * app/api/transit/reading/route.ts
 * GET /api/transit/reading
 *
 * Returns today's transit reading for the authenticated user:
 *   1. Loads user's natal Vedic chart (from cache/DB)
 *   2. Fetches/caches today's transit chart (birth-charts API with today's date)
 *   3. Generates and caches a Gemini AI reading based on Parasara Hora
 *
 * Cached in KV — Gemini is called at most once per user per day.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$chartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/chartService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$transitChartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/transitChartService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$transitReadingService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai/transitReadingService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user?.id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const userId = session.user.id;
    // Check for a cached reading first (avoid all downstream calls)
    const cached = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$transitReadingService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedTransitReading"])(userId);
    if (cached) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reading: cached,
            source: "cache"
        });
    }
    // Load birth profile
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
    // Load natal chart
    let natalChart;
    try {
        const raw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$chartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrCreateVedicChart"])(userId, profile);
        natalChart = raw;
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Could not load your natal chart. Please try again."
        }, {
            status: 502
        });
    }
    // Fetch today's transit chart (KV-cached per day)
    const transitChart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$transitChartService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTodayTransitChart"])(userId, profile);
    if (!transitChart) {
        console.error("[transit/reading] Transit chart unavailable for userId:", userId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Transit chart unavailable. Please try again later."
        }, {
            status: 503
        });
    }
    // Get active dasha lord for context
    const now = new Date();
    const activeMaha = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findFirst({
        where: {
            userId,
            level: "MAHADASHA",
            startDate: {
                lte: now
            },
            endDate: {
                gte: now
            }
        },
        select: {
            planetName: true
        }
    });
    const dashaLord = activeMaha?.planetName ?? null;
    // Generate AI reading
    const userName = session.user.name ?? session.user.email?.split("@")[0] ?? "the native";
    const location = [
        profile.birthCity,
        profile.birthCountry
    ].filter(Boolean).join(", ") || "Unknown location";
    try {
        const reading = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2f$transitReadingService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateTransitReading"])(userId, natalChart, transitChart, dashaLord, userName, location);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reading,
            source: "generated"
        });
    } catch (err) {
        console.error("[transit/reading] Gemini error:", err instanceof Error ? err.message : err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Could not generate transit reading. Please try again."
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__21ba1191._.js.map
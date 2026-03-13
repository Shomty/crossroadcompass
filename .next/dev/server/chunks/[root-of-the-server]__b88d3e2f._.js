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
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
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
"[project]/app/api/admin/debug-dasha/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
/**
 * GET /api/admin/debug-dasha
 * Temporary admin-only diagnostic endpoint.
 * Checks Vedic chart cache + dasha DB state, then forces a fresh Vedic API call.
 * Only accessible to shomty@hotmail.com.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/kv/keys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/vedicApiClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$dashaService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/astro/dashaService.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const runtime = "nodejs";
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    if (session?.user?.email !== "shomty@hotmail.com") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Forbidden"
        }, {
            status: 403
        });
    }
    const userId = session.user.id;
    const now = new Date();
    // ── 1. DB state
    const birthProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].birthProfile.findUnique({
        where: {
            userId
        },
        select: {
            id: true,
            birthName: true,
            birthCity: true,
            birthCountry: true,
            birthDate: true,
            birthTimeKnown: true,
            birthHour: true,
            birthMinute: true,
            latitude: true,
            longitude: true,
            gender: true,
            profileVersion: true
        }
    });
    const dashaCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.count({
        where: {
            userId
        }
    });
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
        }
    });
    // ── 2. KV cache state
    const kvCached = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvGet"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId));
    // ── 3. Force fresh Vedic API call and capture raw response structure
    let vedicResult = "error";
    let vedicError = null;
    let newDashaCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawResponseSample = null;
    if (birthProfile) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvDelete"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$kv$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kvKeys"].vedicChart(userId));
        try {
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
                other: "other"
            };
            const gender = genderMap[birthProfile.gender ?? ""] ?? "other";
            const requestPayload = {
                dateOfBirth,
                timeOfBirth,
                location,
                isTimeApproximate: !birthProfile.birthTimeKnown,
                gender,
                name: birthProfile.birthName
            };
            const chart = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchVedicNatalChart"])(requestPayload);
            const raw = chart.rawResponse;
            // Capture top-level keys and dasha path for diagnosis
            rawResponseSample = {
                topLevelKeys: Object.keys(raw ?? {}),
                chartD1Keys: raw?.chartD1 ? Object.keys(raw.chartD1) : "MISSING",
                hasChartD1: "chartD1" in (raw ?? {}),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                chartD1DashasKeys: raw?.chartD1?.dashas ? Object.keys(raw.chartD1.dashas) : "MISSING",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                vimshottariKeys: raw?.chartD1?.dashas?.vimshottari ? Object.keys(raw.chartD1.dashas.vimshottari) : "MISSING",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dashaPeriodsSample: raw?.chartD1?.dashas?.vimshottari?.dashaPeriods?.slice(0, 2) ?? "MISSING",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rawDashasValue: raw?.chartD1?.dashas ?? "NOT FOUND AT chartD1.dashas"
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$dashaService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeDashasFromChart"])(userId, raw);
            vedicResult = "success";
            newDashaCount = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.count({
                where: {
                    userId
                }
            });
        } catch (e) {
            if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$astro$2f$vedicApiClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VedicApiError"]) {
                vedicError = `HTTP ${e.status} — body: ${e.body}`;
            } else {
                vedicError = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
            }
        }
    }
    const newActiveMaha = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].dasha.findFirst({
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
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        userId,
        birthProfileExists: !!birthProfile,
        birthCity: birthProfile?.birthCity,
        profileVersion: birthProfile?.profileVersion,
        dashaCountBefore: dashaCount,
        activeMahaBefore: activeMaha?.planetName ?? null,
        kvCachedBefore: kvCached !== null,
        vedicApiFreshFetch: vedicResult,
        vedicApiError: vedicError,
        dashaCountAfter: newDashaCount,
        activeMahaAfter: newActiveMaha?.planetName ?? null,
        rawResponseSample,
        requestPayloadSent: birthProfile ? {
            dateOfBirth: (()=>{
                const d = new Date(birthProfile.birthDate);
                return [
                    d.getUTCFullYear(),
                    String(d.getUTCMonth() + 1).padStart(2, "0"),
                    String(d.getUTCDate()).padStart(2, "0")
                ].join("-");
            })(),
            location: [
                birthProfile.birthCity,
                birthProfile.birthCountry
            ].filter(Boolean).join(", "),
            gender: birthProfile.gender,
            name: birthProfile.birthName,
            birthTimeKnown: birthProfile.birthTimeKnown
        } : null,
        now: now.toISOString()
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b88d3e2f._.js.map
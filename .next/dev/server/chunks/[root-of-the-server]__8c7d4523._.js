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
"[project]/app/api/geocode/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * app/api/geocode/route.ts
 * Server-side geocoding proxy using Photon (photon.komoot.io) — free, no API key,
 * OpenStreetMap-based. Falls back to Nominatim if Photon fails.
 * Also resolves IANA timezone via geo-tz.
 */ __turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tz$2d$lookup$2f$tz$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tz-lookup/tz.js [app-route] (ecmascript)");
const runtime = "nodejs";
const dynamic = "force-dynamic";
;
;
function buildDisplayName(p) {
    const parts = [
        p.name,
        p.city,
        p.state,
        p.country
    ].filter((v, i, arr)=>v && arr.indexOf(v) === i // deduplicate
    );
    return parts.join(", ");
}
async function GET(req) {
    const lat = req.nextUrl.searchParams.get("lat");
    const lon = req.nextUrl.searchParams.get("lon");
    // ── Reverse geocode mode: ?lat=&lon= ───────────────────────────────────
    if (lat && lon) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&zoom=10&addressdetails=1`;
            const res = await fetch(url, {
                cache: "no-store",
                headers: {
                    "User-Agent": "CrossroadsCompass/1.0 (contact@crossroadscompass.com)"
                }
            });
            if (!res.ok) throw new Error(`Nominatim reverse HTTP ${res.status}`);
            const data = await res.json();
            const a = data.address ?? {};
            const city = a.city ?? a.town ?? a.village ?? a.county ?? "";
            const country = a.country ?? "";
            const displayName = [
                city,
                country
            ].filter(Boolean).join(", ") || data.display_name;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                displayName
            });
        } catch (e) {
            console.error("[geocode/reverse] error:", e);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Reverse geocoding failed"
            }, {
                status: 502
            });
        }
    }
    const q = req.nextUrl.searchParams.get("q");
    if (!q) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing query parameter q"
        }, {
            status: 400
        });
    }
    // ── Primary: Photon (Komoot) ────────────────────────────────────────────
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`;
        const res = await fetch(url, {
            cache: "no-store"
        });
        if (res.ok) {
            const data = await res.json();
            const features = data.features ?? [];
            if (features.length > 0) {
                const places = features.map((f)=>{
                    const [lon, lat] = f.geometry.coordinates;
                    return {
                        displayName: buildDisplayName(f.properties),
                        lat,
                        lon,
                        timezone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tz$2d$lookup$2f$tz$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(lat, lon) ?? "UTC"
                    };
                });
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    places
                });
            }
        }
    } catch (e) {
        console.error("[geocode] Photon error:", e);
    // Fall through to Nominatim
    }
    // ── Fallback: Nominatim (OpenStreetMap) ────────────────────────────────
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, {
            cache: "no-store",
            headers: {
                "User-Agent": "CrossroadsCompass/1.0 (contact@crossroadscompass.com)"
            }
        });
        if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
        const results = await res.json();
        const places = results.map((r)=>{
            const lat = parseFloat(r.lat);
            const lon = parseFloat(r.lon);
            return {
                displayName: r.display_name,
                lat,
                lon,
                timezone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tz$2d$lookup$2f$tz$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(lat, lon) ?? "UTC"
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            places
        });
    } catch (e) {
        console.error("[geocode] Nominatim error:", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Geocoding service unavailable. Please try again."
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8c7d4523._.js.map
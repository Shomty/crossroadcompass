module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

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
"[project]/components/onboarding/BirthDataForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BirthDataForm",
    ()=>BirthDataForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * components/onboarding/BirthDataForm.tsx
 * 2-step birth data form — Auric Root design system.
 *
 * Step 1 — Personal details: name · date of birth · time of birth · gender
 * Step 2 — Place of birth (Nominatim geocoding)
 *
 * Used on: /onboarding (new users) and /settings/profile (edit mode).
 * In edit mode pass `initialValues` and `isEdit=true`; form submits PATCH
 * instead of POST and calls `onSuccess` instead of redirecting.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
// ─── Step indicator ───────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "2.5rem"
        },
        children: Array.from({
            length: total
        }, (_, i)=>{
            const num = i + 1;
            const done = num < current;
            const active = num === current;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.6rem",
                            letterSpacing: "0.1em",
                            border: active ? "1px solid var(--amber)" : done ? "1px solid rgba(200,135,58,0.4)" : "1px solid rgba(200,135,58,0.15)",
                            background: active ? "rgba(200,135,58,0.12)" : "transparent",
                            color: active ? "var(--amber)" : done ? "var(--amber)" : "var(--mist)",
                            opacity: done ? 0.6 : 1,
                            transition: "all 0.2s"
                        },
                        children: done ? "✓" : `0${num}`
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 73,
                        columnNumber: 13
                    }, this),
                    i < total - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 32,
                            height: 1,
                            background: done ? "rgba(200,135,58,0.35)" : "rgba(200,135,58,0.1)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 88,
                        columnNumber: 15
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 72,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
// ─── Field wrapper ────────────────────────────────────────────────────────
function Field({ label, children, error }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                children: label
            }, void 0, false, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            children,
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "field-error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 104,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
// ─── Gender radio chips ───────────────────────────────────────────────────
const GENDERS = [
    {
        value: "male",
        label: "Male"
    },
    {
        value: "female",
        label: "Female"
    },
    {
        value: "other",
        label: "Other"
    },
    {
        value: null,
        label: "Prefer not to say"
    }
];
function GenderChips({ value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "0.5rem"
        },
        children: GENDERS.map((g)=>{
            const selected = value === g.value;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>onChange(g.value),
                style: {
                    padding: "0.4rem 0.9rem",
                    borderRadius: 2,
                    border: selected ? "1px solid var(--amber)" : "1px solid rgba(200,135,58,0.2)",
                    background: selected ? "rgba(200,135,58,0.12)" : "transparent",
                    color: selected ? "var(--amber)" : "var(--mist)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s"
                },
                children: g.label
            }, String(g.value), false, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 124,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
        lineNumber: 120,
        columnNumber: 5
    }, this);
}
function BirthDataForm({ initialValues, isEdit = false, onSuccess }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Build initial city label for edit mode
    const initialCityLabel = initialValues?.cityLabel ?? (initialValues?.birthCity ? `${initialValues.birthCity}, ${initialValues.birthCountry ?? ""}`.trim().replace(/,$/, "") : "");
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        birthName: initialValues?.birthName ?? "",
        birthDate: initialValues?.birthDate ?? "",
        birthTimeKnown: initialValues?.birthTimeKnown ?? true,
        birthHour: initialValues?.birthHour != null ? String(initialValues.birthHour) : "",
        birthMinute: initialValues?.birthMinute != null ? String(initialValues.birthMinute) : "",
        gender: initialValues?.gender ?? null,
        cityQuery: initialCityLabel,
        selectedPlace: initialValues?.latitude != null ? {
            displayName: initialCityLabel,
            lat: initialValues.latitude,
            lon: initialValues.longitude ?? 0,
            timezone: initialValues.timezone ?? ""
        } : null
    });
    // Geocoding state
    const [geoResults, setGeoResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [geoLoading, setGeoLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [geoError, setGeoError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    function update(key, value) {
        setForm((prev)=>({
                ...prev,
                [key]: value
            }));
    }
    // ── Geocode search ──────────────────────────────────────────────────────
    const searchCity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!form.cityQuery.trim()) return;
        setGeoLoading(true);
        setGeoError(null);
        setGeoResults([]);
        try {
            const res = await fetch(`/api/geocode?q=${encodeURIComponent(form.cityQuery)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Geocoding failed");
            setGeoResults(data.places ?? []);
            if (!data.places?.length) setGeoError("No results — try a more specific city name.");
        } catch  {
            setGeoError("Could not search for this location. Please try again.");
        } finally{
            setGeoLoading(false);
        }
    }, [
        form.cityQuery
    ]);
    // ── Submit ──────────────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!form.selectedPlace) return;
        setSubmitting(true);
        setError(null);
        const payload = {
            birthName: form.birthName.trim(),
            birthDate: form.birthDate,
            birthTimeKnown: form.birthTimeKnown,
            birthHour: form.birthTimeKnown && form.birthHour !== "" ? parseInt(form.birthHour) : null,
            birthMinute: form.birthTimeKnown && form.birthMinute !== "" ? parseInt(form.birthMinute) : null,
            gender: form.gender,
            birthCity: form.selectedPlace.displayName.split(",")[0].trim(),
            birthCountry: form.selectedPlace.displayName.split(",").at(-1)?.trim() ?? "",
            latitude: form.selectedPlace.lat,
            longitude: form.selectedPlace.lon,
            timezone: form.selectedPlace.timezone
        };
        try {
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch("/api/birth-profile", {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Something went wrong.");
                setSubmitting(false);
                return;
            }
            // Trigger HD report + all insights (fire-and-forget)
            void fetch("/api/report/generate", {
                method: "POST"
            });
            void fetch("/api/insights/generate", {
                method: "POST"
            });
            void fetch("/api/insights/generate/weekly", {
                method: "POST"
            });
            void fetch("/api/insights/generate/monthly", {
                method: "POST"
            });
            setSubmitting(false);
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/report");
            }
        } catch  {
            setError("Network error. Please check your connection and try again.");
            setSubmitting(false);
        }
    }
    // ── Validation ──────────────────────────────────────────────────────────
    const step1Valid = form.birthName.trim().length > 0 && form.birthDate !== "" && (!form.birthTimeKnown || form.birthHour !== "" && form.birthMinute !== "");
    const step2Valid = form.selectedPlace !== null;
    // ── Common input/select style ───────────────────────────────────────────
    const inputStyle = {};
    // ── Render ──────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "card",
        style: {
            width: "100%",
            maxWidth: 480,
            padding: "2.5rem"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StepIndicator, {
                current: step,
                total: 2
            }, void 0, false, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 271,
                columnNumber: 7
            }, this),
            step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                style: {
                                    marginBottom: "0.5rem"
                                },
                                children: "Step 1 of 2"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "1.3rem",
                                    fontWeight: 400,
                                    color: "var(--cream)",
                                    margin: 0
                                },
                                children: "Personal details"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 278,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 276,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                        label: "Full name",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: form.birthName,
                            onChange: (e)=>update("birthName", e.target.value),
                            placeholder: "e.g. Milosh Markovic",
                            autoFocus: true,
                            style: inputStyle
                        }, void 0, false, {
                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                            lineNumber: 284,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 283,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                        label: "Date of birth",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "date",
                            value: form.birthDate,
                            onChange: (e)=>update("birthDate", e.target.value),
                            max: new Date().toISOString().split("T")[0],
                            style: {
                                colorScheme: "dark"
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                            lineNumber: 295,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 294,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "0.5rem"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            margin: 0
                                        },
                                        children: "Time of birth"
                                    }, void 0, false, {
                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                        lineNumber: 307,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>update("birthTimeKnown", !form.birthTimeKnown),
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "relative",
                                                    width: 28,
                                                    height: 16,
                                                    borderRadius: 8,
                                                    background: form.birthTimeKnown ? "var(--amber)" : "rgba(200,135,58,0.2)",
                                                    transition: "background 0.2s"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "absolute",
                                                        top: 2,
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: "50%",
                                                        background: "var(--cosmos)",
                                                        transition: "left 0.2s",
                                                        left: form.birthTimeKnown ? 14 : 2
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                lineNumber: 313,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: "0.58rem",
                                                    letterSpacing: "0.1em",
                                                    color: "var(--mist)",
                                                    textTransform: "uppercase"
                                                },
                                                children: form.birthTimeKnown ? "Known" : "Unknown"
                                            }, void 0, false, {
                                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                lineNumber: 326,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                        lineNumber: 308,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 306,
                                columnNumber: 13
                            }, this),
                            form.birthTimeKnown ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: "0.75rem"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: form.birthHour,
                                            onChange: (e)=>update("birthHour", e.target.value),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "Hour"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 21
                                                }, this),
                                                Array.from({
                                                    length: 24
                                                }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: i,
                                                        children: String(i).padStart(2, "0")
                                                    }, i, false, {
                                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 23
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                            lineNumber: 334,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                        lineNumber: 333,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: form.birthMinute,
                                            onChange: (e)=>update("birthMinute", e.target.value),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "Minute"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 21
                                                }, this),
                                                Array.from({
                                                    length: 60
                                                }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: i,
                                                        children: String(i).padStart(2, "0")
                                                    }, i, false, {
                                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                                        lineNumber: 345,
                                                        columnNumber: 23
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                            lineNumber: 342,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                        lineNumber: 341,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 332,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "0.65rem",
                                    letterSpacing: "0.08em",
                                    color: "var(--mist)",
                                    lineHeight: 1.65,
                                    padding: "0.75rem 1rem",
                                    border: "1px solid rgba(200,135,58,0.15)",
                                    borderRadius: 2,
                                    margin: 0
                                },
                                children: "Without a birth time, some chart elements may be approximate. We'll use noon as a default."
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 351,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 305,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    marginBottom: "0.25rem",
                                    display: "block"
                                },
                                children: "Gender"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 366,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "0.6rem",
                                    letterSpacing: "0.08em",
                                    color: "var(--mist)",
                                    marginBottom: "0.25rem"
                                },
                                children: "Used to personalise your report language"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GenderChips, {
                                value: form.gender,
                                onChange: (v)=>update("gender", v)
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 370,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 365,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setStep(2),
                        disabled: !step1Valid,
                        className: "btn-primary",
                        style: {
                            marginTop: "0.5rem"
                        },
                        children: "Continue →"
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 373,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 275,
                columnNumber: 9
            }, this),
            step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                style: {
                                    marginBottom: "0.5rem"
                                },
                                children: "Step 2 of 2"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 389,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "1.3rem",
                                    fontWeight: 400,
                                    color: "var(--cream)",
                                    margin: 0
                                },
                                children: "Place of birth"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 390,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 388,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                        label: "City or town",
                        error: geoError ?? undefined,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: "0.5rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: form.cityQuery,
                                    onChange: (e)=>{
                                        update("cityQuery", e.target.value);
                                        update("selectedPlace", null);
                                    },
                                    onKeyDown: (e)=>e.key === "Enter" && searchCity(),
                                    placeholder: "e.g. Belgrade, Serbia",
                                    style: {
                                        flex: 1
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                    lineNumber: 397,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: searchCity,
                                    disabled: geoLoading || !form.cityQuery.trim(),
                                    className: "btn-ghost",
                                    style: {
                                        flexShrink: 0,
                                        padding: "0 1rem"
                                    },
                                    children: geoLoading ? "…" : "Search"
                                }, void 0, false, {
                                    fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                    lineNumber: 405,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                            lineNumber: 396,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 395,
                        columnNumber: 11
                    }, this),
                    geoResults.length > 0 && !form.selectedPlace && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: "0.58rem",
                                    letterSpacing: "0.12em",
                                    color: "var(--mist)",
                                    textTransform: "uppercase"
                                },
                                children: "Select your location"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 420,
                                columnNumber: 15
                            }, this),
                            geoResults.map((place, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        update("selectedPlace", place);
                                        update("cityQuery", place.displayName.split(",").slice(0, 3).join(","));
                                        setGeoResults([]);
                                    },
                                    style: {
                                        textAlign: "left",
                                        padding: "0.75rem 1rem",
                                        border: "1px solid rgba(200,135,58,0.15)",
                                        borderRadius: 2,
                                        background: "transparent",
                                        cursor: "pointer",
                                        transition: "border-color 0.15s, background 0.15s"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.borderColor = "rgba(200,135,58,0.4)";
                                        e.currentTarget.style.background = "rgba(200,135,58,0.05)";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.borderColor = "rgba(200,135,58,0.15)";
                                        e.currentTarget.style.background = "transparent";
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: "'Instrument Sans', sans-serif",
                                                fontSize: "0.85rem",
                                                color: "var(--cream)",
                                                fontWeight: 500
                                            },
                                            children: place.displayName.split(",")[0]
                                        }, void 0, false, {
                                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                            lineNumber: 441,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: "'Instrument Sans', sans-serif",
                                                fontSize: "0.8rem",
                                                color: "var(--mist)"
                                            },
                                            children: [
                                                " — ",
                                                place.displayName.split(",").slice(1, 3).join(",")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                            lineNumber: 444,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: "'DM Mono', monospace",
                                                fontSize: "0.58rem",
                                                letterSpacing: "0.08em",
                                                color: "var(--amber)",
                                                marginLeft: "0.5rem",
                                                opacity: 0.7
                                            },
                                            children: place.timezone
                                        }, void 0, false, {
                                            fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                            lineNumber: 447,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                    lineNumber: 424,
                                    columnNumber: 17
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 419,
                        columnNumber: 13
                    }, this),
                    form.selectedPlace && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "0.75rem 1rem",
                            borderRadius: 2,
                            border: "1px solid rgba(200,135,58,0.35)",
                            background: "rgba(200,135,58,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: "'Instrument Sans', sans-serif",
                                            fontSize: "0.85rem",
                                            color: "var(--cream)",
                                            fontWeight: 500
                                        },
                                        children: [
                                            "✓ ",
                                            form.selectedPlace.displayName.split(",").slice(0, 2).join(",")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                        lineNumber: 464,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: "0.58rem",
                                            letterSpacing: "0.08em",
                                            color: "var(--amber)",
                                            marginLeft: "0.5rem",
                                            opacity: 0.7
                                        },
                                        children: form.selectedPlace.timezone
                                    }, void 0, false, {
                                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                        lineNumber: 467,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 463,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    update("selectedPlace", null);
                                    update("cityQuery", "");
                                },
                                style: {
                                    background: "none",
                                    border: "none",
                                    color: "var(--mist)",
                                    fontSize: "0.75rem",
                                    cursor: "pointer"
                                },
                                children: "change"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 471,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 457,
                        columnNumber: 13
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: "0.8rem",
                            color: "#e07060",
                            border: "1px solid rgba(200,74,58,0.3)",
                            borderRadius: 2,
                            padding: "0.75rem 1rem",
                            background: "rgba(200,74,58,0.05)"
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 482,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: "0.75rem"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setStep(1),
                                className: "btn-ghost",
                                style: {
                                    flex: 1
                                },
                                children: "← Back"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 488,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleSubmit,
                                disabled: !step2Valid || submitting,
                                className: "btn-primary",
                                style: {
                                    flex: 2
                                },
                                children: submitting ? isEdit ? "Saving…" : "Building your chart…" : isEdit ? "Save changes" : "Generate my chart →"
                            }, void 0, false, {
                                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                                lineNumber: 491,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                        lineNumber: 487,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/onboarding/BirthDataForm.tsx",
                lineNumber: 387,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/onboarding/BirthDataForm.tsx",
        lineNumber: 270,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/layout/Nav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Nav",
    ()=>Nav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * components/layout/Nav.tsx
 * Fixed top navigation bar.
 * Logo: Cormorant Garamond + amber dot separator.
 * Links: mist color, hover gold.
 * CTA: amber border button.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const marketingLinks = [
    {
        label: "How It Works",
        href: "/#how-it-works"
    },
    {
        label: "Pricing",
        href: "/#pricing"
    }
];
const dashboardLinks = [
    {
        label: "My Chart",
        href: "/report"
    },
    {
        label: "My Profile",
        href: "/settings/profile"
    },
    {
        label: "Consultations",
        href: "/consultations"
    },
    {
        label: "Account",
        href: "/account"
    }
];
function Nav({ variant = "marketing" }) {
    const links = variant === "dashboard" ? dashboardLinks : marketingLinks;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.4rem 3rem",
            background: "linear-gradient(to bottom, rgba(13,18,32,0.95), transparent)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                style: {
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    src: "/crossroads-compass-logo-2.svg",
                    alt: "Crossroads Compass",
                    width: 200,
                    height: 62,
                    priority: true,
                    style: {
                        height: 42,
                        width: "auto"
                    }
                }, void 0, false, {
                    fileName: "[project]/components/layout/Nav.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/layout/Nav.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "2rem",
                    listStyle: "none"
                },
                className: "nav-links-list",
                children: [
                    links.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: link.href,
                                className: "nav-link",
                                children: link.label
                            }, void 0, false, {
                                fileName: "[project]/components/layout/Nav.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this)
                        }, link.href, false, {
                            fileName: "[project]/components/layout/Nav.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this)),
                    variant === "marketing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/login",
                            className: "nav-cta",
                            children: "Sign in"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Nav.tsx",
                            lineNumber: 80,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Nav.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/Nav.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/Nav.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__12fadc33._.js.map
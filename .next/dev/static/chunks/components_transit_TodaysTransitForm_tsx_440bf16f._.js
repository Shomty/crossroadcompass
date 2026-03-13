(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/transit/TodaysTransitForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TodaysTransitForm",
    ()=>TodaysTransitForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/transit/TodaysTransitForm.tsx
 * Today's Transit Chart — full client-side flow:
 * geolocation → city search fallback → submit → chart result
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function pad2(n) {
    return n.toString().padStart(2, "0");
}
function formatDate(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function formatTime(d) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function TodaysTransitForm({ userName }) {
    _s();
    const [location, setLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [locationSource, setLocationSource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [geoState, setGeoState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [geoError, setGeoError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showCitySearch, setShowCitySearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cityQuery, setCityQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cityResults, setCityResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [citySearching, setCitySearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [noResults, setNoResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitError, setSubmitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Live clock — initialised client-side only to avoid SSR/hydration mismatch
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TodaysTransitForm.useEffect": ()=>{
            setNow(new Date());
            const timer = setInterval({
                "TodaysTransitForm.useEffect.timer": ()=>setNow(new Date())
            }["TodaysTransitForm.useEffect.timer"], 1000);
            return ({
                "TodaysTransitForm.useEffect": ()=>clearInterval(timer)
            })["TodaysTransitForm.useEffect"];
        }
    }["TodaysTransitForm.useEffect"], []);
    // City search debounce
    const searchCities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TodaysTransitForm.useCallback[searchCities]": async (q)=>{
            if (q.length < 3) {
                setCityResults([]);
                setNoResults(false);
                return;
            }
            setCitySearching(true);
            setNoResults(false);
            try {
                const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
                const data = await res.json();
                const places = (data.places ?? []).map({
                    "TodaysTransitForm.useCallback[searchCities].places": (p)=>({
                            displayName: p.displayName,
                            lat: p.lat,
                            lon: p.lon
                        })
                }["TodaysTransitForm.useCallback[searchCities].places"]);
                setCityResults(places);
                setNoResults(places.length === 0);
            } catch  {
                setCityResults([]);
            } finally{
                setCitySearching(false);
            }
        }
    }["TodaysTransitForm.useCallback[searchCities]"], []);
    function handleCityQueryChange(val) {
        setCityQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(()=>searchCities(val), 300);
    }
    function selectCity(city) {
        setLocation(city.displayName);
        setLocationSource("manual");
        setShowCitySearch(false);
        setCityQuery("");
        setCityResults([]);
    }
    async function requestGeolocation() {
        setGeoState("requesting");
        setGeoError(null);
        if (!navigator.geolocation) {
            setGeoState("error");
            setGeoError("Geolocation is not supported by this browser.");
            setShowCitySearch(true);
            return;
        }
        const timeout = setTimeout(()=>{
            setGeoState("error");
            setGeoError("Location request timed out.");
            setShowCitySearch(true);
        }, 10000);
        navigator.geolocation.getCurrentPosition(async (pos)=>{
            clearTimeout(timeout);
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
                if (!res.ok) throw new Error("Reverse geocode failed");
                const data = await res.json();
                if (data.displayName) {
                    setLocation(data.displayName);
                    setLocationSource("geo");
                    setGeoState("granted");
                } else {
                    throw new Error("No city returned");
                }
            } catch  {
                setGeoState("error");
                setGeoError("Could not resolve your location name. Please enter your city manually.");
                setShowCitySearch(true);
            }
        }, (err)=>{
            clearTimeout(timeout);
            if (err.code === 1) {
                setGeoState("denied");
                setGeoError("Location access was denied. Please select your city manually.");
            } else {
                setGeoState("error");
                setGeoError("Could not get your location. Please enter your city manually.");
            }
            setShowCitySearch(true);
        }, {
            timeout: 9000,
            maximumAge: 60000
        });
    }
    function handleChangeLocation() {
        setLocation(null);
        setLocationSource(null);
        setShowCitySearch(true);
        setCityQuery("");
        setCityResults([]);
    }
    async function handleSubmit() {
        if (!location) return;
        setSubmitting(true);
        setSubmitError(null);
        setResult(null);
        try {
            const res = await fetch("/api/transit/today", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    location
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setSubmitError(data.error ?? "Chart generation failed. Please try again.");
            } else {
                setResult(data);
            }
        } catch  {
            setSubmitError("Network error. Please check your connection and try again.");
        } finally{
            setSubmitting(false);
        }
    }
    // ── Render ──────────────────────────────────────────────────────────────
    const mono = {
        fontFamily: "'DM Mono', monospace"
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const serif = {
        fontFamily: "'Cormorant Garamond', serif"
    };
    const sans = {
        fontFamily: "'Instrument Sans', sans-serif"
    };
    const eyebrow = {
        ...mono,
        fontSize: 9,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--amber)",
        marginBottom: 6
    };
    const label = {
        ...mono,
        fontSize: 8.5,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--mist)",
        marginBottom: 4
    };
    const value = {
        ...sans,
        fontSize: 14,
        color: "var(--cream)",
        lineHeight: 1.5
    };
    const planets = result && Array.isArray(result.chart.planets) ? result.chart.planets : [];
    const ascendant = result?.chart.ascendant;
    const currentDasha = result?.chart.currentDasha;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 560,
            margin: "0 auto"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "v2-card",
                style: {
                    marginBottom: 20
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: eyebrow,
                        children: "✦ Chart Details"
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px 24px",
                            marginBottom: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: label,
                                        children: "Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 213,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: value,
                                        children: userName
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 214,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: label,
                                        children: "Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: value,
                                        children: now ? formatDate(now) : '—'
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 218,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: label,
                                        children: "Time (live)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 221,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            ...value,
                                            ...mono,
                                            fontSize: 16,
                                            letterSpacing: "0.06em"
                                        },
                                        children: now ? formatTime(now) : '--:--:--'
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 222,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: label,
                                        children: "Location"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 225,
                                        columnNumber: 13
                                    }, this),
                                    location ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    ...value,
                                                    flex: 1
                                                },
                                                children: location
                                            }, void 0, false, {
                                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                lineNumber: 228,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleChangeLocation,
                                                style: {
                                                    ...mono,
                                                    fontSize: 8,
                                                    letterSpacing: "0.1em",
                                                    background: "none",
                                                    border: "none",
                                                    color: "var(--amber)",
                                                    cursor: "pointer",
                                                    padding: "3px 0",
                                                    textTransform: "uppercase",
                                                    flexShrink: 0,
                                                    marginTop: 2
                                                },
                                                children: "Change"
                                            }, void 0, false, {
                                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                lineNumber: 229,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            ...value,
                                            color: "var(--mist)",
                                            fontStyle: "italic"
                                        },
                                        children: "Not set"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 235,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 1,
                            background: "rgba(200,135,58,0.1)",
                            margin: "4px 0 16px"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 241,
                        columnNumber: 9
                    }, this),
                    !location && geoState === "idle" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...sans,
                                    fontSize: 12.5,
                                    color: "var(--mist)",
                                    lineHeight: 1.65,
                                    marginBottom: 14
                                },
                                children: "To generate your transit chart, we need your current location. Your location is only used for this chart and is not stored."
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: requestGeolocation,
                                style: {
                                    padding: "9px 20px",
                                    background: "rgba(200,135,58,0.06)",
                                    border: "1px solid rgba(200,135,58,0.28)",
                                    borderRadius: 2,
                                    color: "var(--gold)",
                                    ...sans,
                                    fontSize: 12.5,
                                    cursor: "pointer",
                                    letterSpacing: "0.06em"
                                },
                                children: "Detect My Location"
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 250,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowCitySearch(true),
                                style: {
                                    marginLeft: 10,
                                    background: "none",
                                    border: "none",
                                    color: "var(--mist)",
                                    ...sans,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 3
                                },
                                children: "Enter city manually"
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 256,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 245,
                        columnNumber: 11
                    }, this),
                    geoState === "requesting" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...sans,
                            fontSize: 12.5,
                            color: "var(--mist)",
                            fontStyle: "italic"
                        },
                        children: "Requesting location…"
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 266,
                        columnNumber: 11
                    }, this),
                    (geoState === "denied" || geoState === "error") && geoError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...sans,
                            fontSize: 12,
                            color: "rgba(200,100,60,0.9)",
                            marginBottom: 12,
                            lineHeight: 1.5
                        },
                        children: geoError
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 271,
                        columnNumber: 11
                    }, this),
                    (showCitySearch || geoState !== "idle" && geoState !== "requesting" && !location) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: location ? 0 : 4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...label,
                                    marginBottom: 8
                                },
                                children: "Search City"
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 279,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: cityQuery,
                                        onChange: (e)=>handleCityQueryChange(e.target.value),
                                        placeholder: "Type at least 3 characters…",
                                        style: {
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "9px 12px",
                                            background: "rgba(13,18,32,0.6)",
                                            border: "1px solid rgba(200,135,58,0.22)",
                                            borderRadius: 2,
                                            color: "var(--cream)",
                                            ...sans,
                                            fontSize: 13,
                                            outline: "none"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 281,
                                        columnNumber: 15
                                    }, this),
                                    citySearching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            position: "absolute",
                                            right: 10,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            ...mono,
                                            fontSize: 9,
                                            color: "var(--mist)"
                                        },
                                        children: "…"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 295,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 280,
                                columnNumber: 13
                            }, this),
                            cityResults.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                style: {
                                    listStyle: "none",
                                    margin: "4px 0 0",
                                    padding: 0,
                                    background: "rgba(13,18,32,0.95)",
                                    border: "1px solid rgba(200,135,58,0.18)",
                                    borderRadius: 2
                                },
                                children: cityResults.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>selectCity(c),
                                            style: {
                                                width: "100%",
                                                textAlign: "left",
                                                background: "none",
                                                border: "none",
                                                padding: "9px 12px",
                                                color: "var(--cream)",
                                                ...sans,
                                                fontSize: 13,
                                                cursor: "pointer",
                                                borderBottom: i < cityResults.length - 1 ? "1px solid rgba(200,135,58,0.08)" : "none"
                                            },
                                            children: c.displayName
                                        }, void 0, false, {
                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                            lineNumber: 302,
                                            columnNumber: 21
                                        }, this)
                                    }, i, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 301,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 299,
                                columnNumber: 15
                            }, this),
                            noResults && cityQuery.length >= 3 && !citySearching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...sans,
                                    fontSize: 12,
                                    color: "var(--mist)",
                                    marginTop: 6
                                },
                                children: "No cities found."
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 313,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 278,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            !result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "center",
                    marginBottom: 24
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleSubmit,
                    disabled: !location || submitting,
                    style: {
                        padding: "12px 36px",
                        background: location && !submitting ? "rgba(200,135,58,0.08)" : "rgba(200,135,58,0.03)",
                        border: `1px solid ${location && !submitting ? "rgba(200,135,58,0.45)" : "rgba(200,135,58,0.15)"}`,
                        borderRadius: 2,
                        ...sans,
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: location && !submitting ? "var(--gold)" : "var(--mist)",
                        cursor: location && !submitting ? "pointer" : "not-allowed",
                        transition: "all 0.2s"
                    },
                    children: submitting ? "Reading the stars…" : "Generate My Chart"
                }, void 0, false, {
                    fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                    lineNumber: 322,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                lineNumber: 321,
                columnNumber: 9
            }, this),
            submitError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "v2-card",
                style: {
                    marginBottom: 20,
                    borderColor: "rgba(200,80,60,0.25)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...sans,
                            fontSize: 13,
                            color: "rgba(220,100,80,0.9)",
                            marginBottom: 12,
                            lineHeight: 1.6
                        },
                        children: submitError
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 344,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSubmit,
                        style: {
                            ...sans,
                            fontSize: 12,
                            color: "var(--amber)",
                            background: "none",
                            border: "1px solid rgba(200,135,58,0.22)",
                            borderRadius: 2,
                            padding: "6px 16px",
                            cursor: "pointer"
                        },
                        children: "Try Again"
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 345,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                lineNumber: 343,
                columnNumber: 9
            }, this),
            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "v2-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: eyebrow,
                        children: "✦ Transit Chart Generated"
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 357,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "10px 20px",
                            marginBottom: 20
                        },
                        children: [
                            {
                                label: "Name",
                                val: result.meta.name
                            },
                            {
                                label: "Date",
                                val: result.meta.dateOfBirth
                            },
                            {
                                label: "Time",
                                val: result.meta.timeOfBirth
                            },
                            {
                                label: "Location",
                                val: result.meta.location
                            },
                            {
                                label: "Sun Sign",
                                val: result.chart.sunSign ?? "—"
                            },
                            {
                                label: "Moon Sign",
                                val: result.chart.moonSign ?? "—"
                            }
                        ].map(({ label: l, val })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: label,
                                        children: l
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 368,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: value,
                                        children: val ?? "—"
                                    }, void 0, false, {
                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                        lineNumber: 369,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, l, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 367,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 358,
                        columnNumber: 11
                    }, this),
                    ascendant ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: label,
                                children: "Ascendant"
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 377,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: value,
                                children: `${ascendant.sign ?? "—"} ${ascendant.degree != null ? `${Number(ascendant.degree).toFixed(1)}°` : ""}`
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 378,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 376,
                        columnNumber: 13
                    }, this) : null,
                    planets.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...label,
                                    marginTop: 16,
                                    marginBottom: 8
                                },
                                children: "Planetary Positions"
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 386,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    overflowX: "auto"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: {
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        ...sans,
                                        fontSize: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    "Planet",
                                                    "Sign",
                                                    "House",
                                                    "Degree"
                                                ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            ...mono,
                                                            fontSize: 8,
                                                            letterSpacing: "0.14em",
                                                            textTransform: "uppercase",
                                                            color: "var(--amber)",
                                                            textAlign: "left",
                                                            padding: "4px 8px 8px 0",
                                                            borderBottom: "1px solid rgba(200,135,58,0.12)"
                                                        },
                                                        children: h
                                                    }, h, false, {
                                                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                        lineNumber: 392,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                lineNumber: 390,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                            lineNumber: 389,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: planets.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        borderBottom: "1px solid rgba(200,135,58,0.06)"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                color: "var(--cream)",
                                                                padding: "6px 8px 6px 0",
                                                                textTransform: "capitalize"
                                                            },
                                                            children: String(p.name ?? "—")
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                            lineNumber: 399,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                color: "var(--mist)",
                                                                padding: "6px 8px 6px 0"
                                                            },
                                                            children: String(p.sign ?? p.rashi ?? "—")
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                color: "var(--mist)",
                                                                padding: "6px 8px 6px 0"
                                                            },
                                                            children: p.house != null ? String(p.house) : "—"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                            lineNumber: 401,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                color: "var(--mist)",
                                                                padding: "6px 8px 6px 0"
                                                            },
                                                            children: p.degree != null ? `${Number(p.degree).toFixed(1)}°` : "—"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                            lineNumber: 402,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                            lineNumber: 396,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                    lineNumber: 388,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 387,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 385,
                        columnNumber: 13
                    }, this) : null,
                    currentDasha ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 20,
                            padding: "12px 16px",
                            background: "rgba(200,135,58,0.04)",
                            border: "1px solid rgba(200,135,58,0.12)",
                            borderRadius: 2
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...mono,
                                    fontSize: 8,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    color: "var(--amber)",
                                    marginBottom: 6
                                },
                                children: "Current Dasha"
                            }, void 0, false, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 413,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...sans,
                                    fontSize: 13,
                                    color: "var(--cream)",
                                    lineHeight: 1.6
                                },
                                children: [
                                    String(currentDasha.planetName ?? currentDasha.planet ?? "—"),
                                    " Mahadasha",
                                    currentDasha.startDate ? ` · ${String(currentDasha.startDate).slice(0, 10)} – ${String(currentDasha.endDate ?? "").slice(0, 10)}` : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                                lineNumber: 414,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 412,
                        columnNumber: 13
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 16,
                            textAlign: "right"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setResult(null);
                                setSubmitError(null);
                            },
                            style: {
                                ...sans,
                                fontSize: 11,
                                color: "var(--mist)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                letterSpacing: "0.06em"
                            },
                            children: "↺ Generate Again"
                        }, void 0, false, {
                            fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                            lineNumber: 422,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                        lineNumber: 421,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/transit/TodaysTransitForm.tsx",
                lineNumber: 356,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/transit/TodaysTransitForm.tsx",
        lineNumber: 206,
        columnNumber: 5
    }, this);
}
_s(TodaysTransitForm, "44mrXyYwova5fMYa6iiOQOfUhvo=");
_c = TodaysTransitForm;
var _c;
__turbopack_context__.k.register(_c, "TodaysTransitForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_transit_TodaysTransitForm_tsx_440bf16f._.js.map
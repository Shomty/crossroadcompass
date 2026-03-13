(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/report/DashboardReport.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardReport",
    ()=>DashboardReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/report/DashboardReport.tsx
 * V2: Summary box + accordion sections matching the v2 dashboard design.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const GEM_ICON = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    style: {
        flexShrink: 0,
        transition: "color 0.25s"
    },
    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
    }, void 0, false, {
        fileName: "[project]/components/report/DashboardReport.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0))
}, void 0, false, {
    fileName: "[project]/components/report/DashboardReport.tsx",
    lineNumber: 20,
    columnNumber: 3
}, ("TURBOPACK compile-time value", void 0));
function AccordionItem({ section, index, isOpen, onToggle }) {
    const paragraphs = section.content.split(/\n\n+/).filter(Boolean);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `accordion-item-v2${isOpen ? " open" : ""}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "accordion-trigger-v2",
                onClick: onToggle,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: isOpen ? "var(--gold)" : "var(--mist)",
                            flexShrink: 0,
                            transition: "color 0.25s"
                        },
                        children: GEM_ICON
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            flex: 1,
                            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                            fontSize: 13.5,
                            fontWeight: 400,
                            color: isOpen ? "var(--cream)" : "var(--mist)",
                            letterSpacing: "0.01em",
                            transition: "color 0.25s"
                        },
                        children: section.title
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        size: 14,
                        style: {
                            color: isOpen ? "var(--gold)" : "var(--mist)",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s, color 0.25s",
                            flexShrink: 0
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/report/DashboardReport.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "accordion-body-v2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: "0 18px 18px 44px"
                    },
                    children: paragraphs.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                fontSize: 13,
                                lineHeight: 1.7,
                                color: "var(--mist)",
                                marginTop: i > 0 ? 10 : 0
                            },
                            children: p
                        }, i, false, {
                            fileName: "[project]/components/report/DashboardReport.tsx",
                            lineNumber: 63,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/report/DashboardReport.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/report/DashboardReport.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/report/DashboardReport.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = AccordionItem;
function DashboardReport() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [report, setReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [generating, setGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [openIndex, setOpenIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const loadReport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DashboardReport.useCallback[loadReport]": async ()=>{
            try {
                const res = await fetch("/api/report/latest");
                if (res.status === 401) {
                    router.push("/login");
                    return;
                }
                if (res.status === 404) {
                    setReport(null);
                    setLoading(false);
                    return;
                }
                if (!res.ok) throw new Error("Failed to load report");
                const data = await res.json();
                setReport(data.report ?? null);
            } catch  {
                setError("Failed to load your report.");
            } finally{
                setLoading(false);
            }
        }
    }["DashboardReport.useCallback[loadReport]"], [
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardReport.useEffect": ()=>{
            loadReport();
        }
    }["DashboardReport.useEffect"], [
        loadReport
    ]);
    // Auto-generate on mount when no report exists — user never needs to click manually
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardReport.useEffect": ()=>{
            if (!loading && !report && !generating && !error) {
                void generate();
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DashboardReport.useEffect"], [
        loading,
        report
    ]);
    async function generate() {
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch("/api/report/generate", {
                method: "POST"
            });
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            if (!res.ok) throw new Error("generation failed");
            const data = await res.json();
            setReport(data.report);
            setOpenIndex(0);
        } catch  {
            setError("Report generation failed. Please try again.");
        } finally{
            setGenerating(false);
        }
    }
    if (loading || !report && !error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                textAlign: "center",
                padding: "2.5rem 1rem"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "1px solid var(--border-lit)",
                        background: "var(--gold-glow)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.25rem"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                        size: 20,
                        color: "var(--gold)",
                        style: {
                            animation: "spin 1s linear infinite"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/report/DashboardReport.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontFamily: "Cinzel, serif",
                        fontSize: 20,
                        color: "var(--cream)",
                        marginBottom: 8
                    },
                    children: "Your Human Design Report"
                }, void 0, false, {
                    fileName: "[project]/components/report/DashboardReport.tsx",
                    lineNumber: 141,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 13,
                        color: "var(--mist)",
                        lineHeight: 1.6,
                        maxWidth: 340,
                        margin: "0 auto"
                    },
                    children: loading ? "Loading…" : "Preparing your personalised report…"
                }, void 0, false, {
                    fileName: "[project]/components/report/DashboardReport.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/report/DashboardReport.tsx",
            lineNumber: 130,
            columnNumber: 7
        }, this);
    }
    if (!report && error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                textAlign: "center",
                padding: "2.5rem 1rem"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: 12,
                        color: "#f87171",
                        marginBottom: "1rem"
                    },
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/report/DashboardReport.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: generate,
                    disabled: generating,
                    style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "10px 22px",
                        background: "transparent",
                        border: "1px solid var(--border-lit)",
                        borderRadius: 10,
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        color: generating ? "var(--mist)" : "var(--gold)",
                        cursor: generating ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                    },
                    children: generating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                size: 14,
                                style: {
                                    animation: "spin 1s linear infinite"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/report/DashboardReport.tsx",
                                lineNumber: 175,
                                columnNumber: 15
                            }, this),
                            "Generating…"
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "12",
                                        cy: "12",
                                        r: "10"
                                    }, void 0, false, {
                                        fileName: "[project]/components/report/DashboardReport.tsx",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "12",
                                        y1: "8",
                                        x2: "12",
                                        y2: "16"
                                    }, void 0, false, {
                                        fileName: "[project]/components/report/DashboardReport.tsx",
                                        lineNumber: 182,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "8",
                                        y1: "12",
                                        x2: "16",
                                        y2: "12"
                                    }, void 0, false, {
                                        fileName: "[project]/components/report/DashboardReport.tsx",
                                        lineNumber: 183,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/report/DashboardReport.tsx",
                                lineNumber: 180,
                                columnNumber: 15
                            }, this),
                            "Try Again"
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/components/report/DashboardReport.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/report/DashboardReport.tsx",
            lineNumber: 153,
            columnNumber: 7
        }, this);
    }
    const genDate = new Date(report.generatedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 10
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: "rgba(13,18,37,0.75)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "22px 22px 18px",
                    backdropFilter: "blur(20px)",
                    position: "relative",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 1,
                            background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.07) 50%, transparent 90%)",
                            pointerEvents: "none"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 9,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: "var(--gold)"
                            },
                            children: "Your Human Design"
                        }, void 0, false, {
                            fileName: "[project]/components/report/DashboardReport.tsx",
                            lineNumber: 215,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontFamily: "Cinzel, serif",
                            fontSize: 15.5,
                            fontWeight: 400,
                            lineHeight: 1.75,
                            color: "var(--cream)",
                            marginBottom: 18
                        },
                        children: report.summary
                    }, void 0, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: 14,
                            borderTop: "1px solid var(--border)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9.5,
                                    letterSpacing: "0.08em",
                                    color: "var(--mist)"
                                },
                                children: [
                                    "Generated ",
                                    genDate
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/report/DashboardReport.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: generate,
                                disabled: generating,
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    background: "none",
                                    border: "none",
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9.5,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: generating ? "var(--mist)" : "var(--mist)",
                                    cursor: generating ? "not-allowed" : "pointer",
                                    transition: "color 0.2s"
                                },
                                onMouseEnter: (e)=>e.currentTarget.style.color = "var(--gold)",
                                onMouseLeave: (e)=>e.currentTarget.style.color = "var(--mist)",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        size: 12,
                                        style: generating ? {
                                            animation: "spin 1s linear infinite"
                                        } : {}
                                    }, void 0, false, {
                                        fileName: "[project]/components/report/DashboardReport.tsx",
                                        lineNumber: 252,
                                        columnNumber: 13
                                    }, this),
                                    "Regenerate"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/report/DashboardReport.tsx",
                                lineNumber: 237,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/report/DashboardReport.tsx",
                lineNumber: 199,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                },
                children: report.sections.map((section, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AccordionItem, {
                        section: section,
                        index: i,
                        isOpen: openIndex === i,
                        onToggle: ()=>setOpenIndex(openIndex === i ? -1 : i)
                    }, i, false, {
                        fileName: "[project]/components/report/DashboardReport.tsx",
                        lineNumber: 261,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/report/DashboardReport.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/report/DashboardReport.tsx",
        lineNumber: 197,
        columnNumber: 5
    }, this);
}
_s(DashboardReport, "4KOUGjZJeYP9sq2OFNvBjEkSry8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = DashboardReport;
var _c, _c1;
__turbopack_context__.k.register(_c, "AccordionItem");
__turbopack_context__.k.register(_c1, "DashboardReport");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/HumanDesignTypeCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HumanDesignTypeCard",
    ()=>HumanDesignTypeCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/dashboard/HumanDesignTypeCard.tsx
 * Human Design type card — flip on click to show details.
 * FRONTEND.md: amber/gold only, Cormorant/DM Mono/Instrument Sans,
 * border-radius ≤3px, no box-shadow, no colour backgrounds.
 *
 * Flip impl: content swaps at midpoint of a scaleX(0→1) animation
 * so height is always determined by content (no absolute-position hacks).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const TYPES = {
    "generator": {
        name: "Generator",
        glyph: "◉",
        purpose: "HERE TO BUILD",
        strategyShort: "Wait to respond",
        strategy: "Let life bring things to you — wait for something to respond to, then check your gut before committing.",
        question: "Am I doing work I love?",
        key: "Your energy is magnetic when you are genuinely lit up. Honour what makes your gut say yes.",
        desc: "Generators carry the life force of the planet. With a defined Sacral centre you have sustainable energy for work you love. Satisfaction is your signal that you are on the right path.",
        aura: "Open & Enveloping"
    },
    "manifesting generator": {
        name: "Manifesting Generator",
        glyph: "◉",
        purpose: "HERE TO BUILD & LEAD",
        strategyShort: "Respond, then inform",
        strategy: "Respond first, then inform others before acting. Skipping steps is fine — go back when something is missed.",
        question: "Am I following my excitement?",
        key: "You are built for speed and variety. Dropping something that no longer lights you up is not failure — it is correct.",
        desc: "Manifesting Generators combine Sacral energy with an initiating motor connected to the Throat. Fast, multi-passionate, and efficient — designed to find the shortest path and iterate freely.",
        aura: "Open & Enveloping"
    },
    "projector": {
        name: "Projector",
        glyph: "◈",
        purpose: "HERE TO GUIDE",
        strategyShort: "Wait for the invitation",
        strategy: "Wait for recognition and an invitation before sharing your wisdom, entering new work, or starting new relationships.",
        question: "Am I being recognised for my gifts?",
        key: "Your seeing is your gift. Rest is not laziness — it is how you maintain the clarity others seek from you.",
        desc: "Projectors are the natural guides of the new world — designed to direct and optimise the energy of others. Your focused aura sees deeply into systems and people. Success follows true recognition.",
        aura: "Focused & Absorbing"
    },
    "manifestor": {
        name: "Manifestor",
        glyph: "✦",
        purpose: "HERE TO INITIATE",
        strategyShort: "Inform before acting",
        strategy: "Inform the people who will be affected by your actions before you act — this dissolves resistance and protects your energy.",
        question: "What impact do I want to have?",
        key: "You are rare. You can initiate without waiting. Your power grows when you keep the people around you informed.",
        desc: "Manifestors are initiators — one of the few types designed to act on impulse without waiting. Your closed aura creates a natural boundary that protects your creative force. Peace is your signature.",
        aura: "Closed & Repelling"
    },
    "reflector": {
        name: "Reflector",
        glyph: "☽",
        purpose: "HERE TO ASSESS",
        strategyShort: "Wait a lunar cycle",
        strategy: "Wait a full 28-day lunar cycle before making major decisions, sampling different environments and perspectives as you go.",
        question: "Am I surrounded by the right people?",
        key: "You reflect the health of your community back to it. Environment is everything — who you spend time with shapes how you feel.",
        desc: "Reflectors are the rarest type (roughly 1%). With all centres undefined you sample and mirror the energy around you. Surprise and delight are your signatures when you are in the right place.",
        aura: "Resistant & Sampling"
    }
};
const FALLBACK = TYPES["generator"];
function HumanDesignTypeCard({ hdType, hdStrategy, hdAuthority, hdProfile }) {
    _s();
    const [typeKey, setTypeKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(hdType ? hdType.toLowerCase().trim() : null);
    const [authority, setAuthority] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(hdAuthority ?? null);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(hdProfile ?? null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(!hdType);
    // Flip state: "front" | "flipping-out" | "back" | "flipping-in"
    const [face, setFace] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("front");
    const [animating, setAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const nextFace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])("front");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HumanDesignTypeCard.useEffect": ()=>{
            if (hdType) return;
            fetch("/api/hd-chart").then({
                "HumanDesignTypeCard.useEffect": (r)=>r.json()
            }["HumanDesignTypeCard.useEffect"]).then({
                "HumanDesignTypeCard.useEffect": (json)=>{
                    if (json?.chart) {
                        setTypeKey((json.chart.type ?? "").toLowerCase().trim());
                        setAuthority(json.chart.authority ?? null);
                        setProfile(json.chart.profile ?? null);
                    }
                }
            }["HumanDesignTypeCard.useEffect"]).catch({
                "HumanDesignTypeCard.useEffect": ()=>{}
            }["HumanDesignTypeCard.useEffect"]).finally({
                "HumanDesignTypeCard.useEffect": ()=>setLoading(false)
            }["HumanDesignTypeCard.useEffect"]);
        }
    }["HumanDesignTypeCard.useEffect"], [
        hdType
    ]);
    function handleFlip() {
        if (animating) return;
        nextFace.current = face === "front" ? "back" : "front";
        setAnimating(true);
        // After scaleX → 0, swap content, then scaleX → 1
        setTimeout(()=>{
            setFace(nextFace.current);
            setTimeout(()=>setAnimating(false), 220);
        }, 220);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: "12px 0",
                opacity: 0.45
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "var(--amber)",
                    letterSpacing: "0.12em"
                },
                children: "Reading chart…"
            }, void 0, false, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 137,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
            lineNumber: 136,
            columnNumber: 7
        }, this);
    }
    const type = typeKey && TYPES[typeKey] ? TYPES[typeKey] : FALLBACK;
    const strategyText = hdStrategy ?? type.strategy;
    const isFlippingOut = animating && nextFace.current !== face;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        .hd-card-wrap {
          cursor: pointer;
          user-select: none;
          transition: transform 0.22s ease;
        }
        .hd-card-wrap:hover .hd-flip-hint { opacity: 0.7 !important; }
        .hd-anim-out { animation: hdFlipOut 0.22s ease forwards; }
        .hd-anim-in  { animation: hdFlipIn  0.22s ease forwards; }
        @keyframes hdFlipOut {
          from { transform: scaleX(1); opacity: 1; }
          to   { transform: scaleX(0); opacity: 0; }
        }
        @keyframes hdFlipIn {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `hd-card-wrap${isFlippingOut ? " hd-anim-out" : animating ? " hd-anim-in" : ""}`,
                onClick: handleFlip,
                children: [
                    face === "front" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Front, {
                        type: type
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 174,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Back, {
                        type: type,
                        authority: authority,
                        profile: profile,
                        strategyText: strategyText
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hd-flip-hint",
                        style: {
                            marginTop: 18,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--amber)",
                            opacity: 0.3,
                            transition: "opacity 0.2s"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: face === "front" ? "↻" : "↺"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 186,
                                columnNumber: 11
                            }, this),
                            face === "front" ? "Tap for details" : "Tap to go back"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(HumanDesignTypeCard, "8T6sF+1WkXYoeVd7uqCxAj9+5qY=");
_c = HumanDesignTypeCard;
// ─── Front face ───────────────────────────────────────────────────────────────
function Front({ type }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "relative"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-hidden": true,
                style: {
                    position: "absolute",
                    top: -8,
                    right: -4,
                    fontFamily: "Cinzel, serif",
                    fontSize: 120,
                    lineHeight: 1,
                    color: "rgba(200,135,58,0.07)",
                    pointerEvents: "none",
                    userSelect: "none",
                    letterSpacing: "-0.02em"
                },
                children: type.glyph
            }, void 0, false, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative",
                    zIndex: 1
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "var(--amber)",
                            opacity: 0.7,
                            marginBottom: 12
                        },
                        children: "Your Human Design"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "baseline",
                            gap: 10,
                            marginBottom: 3,
                            flexWrap: "wrap"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "Cinzel, serif",
                                    fontSize: 22,
                                    color: "var(--amber)",
                                    lineHeight: 1
                                },
                                children: type.glyph
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 219,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "Cinzel, serif",
                                    fontSize: 32,
                                    fontWeight: 300,
                                    color: "var(--cream)",
                                    letterSpacing: "0.03em",
                                    lineHeight: 1
                                },
                                children: type.name
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            color: "var(--mist)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 16,
                            opacity: 0.55
                        },
                        children: type.aura
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 1,
                            background: "linear-gradient(to right, rgba(200,135,58,0.35), transparent)",
                            marginBottom: 16
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 238,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "inline-block",
                            border: "1px solid rgba(200,135,58,0.35)",
                            borderRadius: 2,
                            padding: "3px 12px",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            letterSpacing: "0.18em",
                            color: "var(--amber)",
                            marginBottom: 14
                        },
                        children: type.purpose
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 241,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "var(--amber)",
                                    opacity: 0.6,
                                    marginBottom: 4
                                },
                                children: "Strategy"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 252,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                    fontSize: 13,
                                    color: "var(--mist)",
                                    lineHeight: 1.6
                                },
                                children: type.strategyShort
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 257,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 251,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "Cinzel, serif",
                            fontSize: 14,
                            fontStyle: "italic",
                            color: "var(--gold)",
                            lineHeight: 1.5
                        },
                        children: [
                            '"',
                            type.question,
                            '"'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
        lineNumber: 198,
        columnNumber: 5
    }, this);
}
_c1 = Front;
// ─── Back face ────────────────────────────────────────────────────────────────
function Back({ type, authority, profile, strategyText }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    opacity: 0.7,
                    marginBottom: 12
                },
                children: [
                    "Profile Details — ",
                    type.name
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 285,
                columnNumber: 7
            }, this),
            (authority || profile) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 28,
                    marginBottom: 14
                },
                children: [
                    authority && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "var(--amber)",
                                    opacity: 0.6,
                                    marginBottom: 3
                                },
                                children: "Authority"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 296,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                    fontSize: 13,
                                    color: "var(--cream)"
                                },
                                children: authority
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 297,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 295,
                        columnNumber: 13
                    }, this),
                    profile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "var(--amber)",
                                    opacity: 0.6,
                                    marginBottom: 3
                                },
                                children: "Profile"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 302,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                    fontSize: 13,
                                    color: "var(--cream)"
                                },
                                children: profile
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                                lineNumber: 303,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 301,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 293,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 1,
                    background: "linear-gradient(to right, rgba(200,135,58,0.35), transparent)",
                    marginBottom: 14
                }
            }, void 0, false, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--amber)",
                            opacity: 0.6,
                            marginBottom: 4
                        },
                        children: "Strategy"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                            fontSize: 12.5,
                            color: "var(--mist)",
                            lineHeight: 1.65
                        },
                        children: strategyText
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 315,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--amber)",
                            opacity: 0.6,
                            marginBottom: 4
                        },
                        children: "Key Insight"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 320,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                            fontSize: 12.5,
                            color: "var(--mist)",
                            lineHeight: 1.65
                        },
                        children: type.key
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 319,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 12,
                    color: "var(--mist)",
                    lineHeight: 1.7,
                    opacity: 0.8
                },
                children: type.desc
            }, void 0, false, {
                fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/HumanDesignTypeCard.tsx",
        lineNumber: 283,
        columnNumber: 5
    }, this);
}
_c2 = Back;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "HumanDesignTypeCard");
__turbopack_context__.k.register(_c1, "Front");
__turbopack_context__.k.register(_c2, "Back");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/ForecastCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForecastCard",
    ()=>ForecastCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/dashboard/ForecastCard.tsx
 * Displays weekly and monthly forecasts with a tab toggle.
 * Shows generate button when no forecast exists.
 * FRONTEND.md: amber/gold, Cormorant/DM Mono/Instrument Sans, no box-shadow.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
// ─── Styles ───────────────────────────────────────────────────────────────────
const eyebrow = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "var(--amber)"
};
const headline = {
    fontFamily: "Cinzel, serif",
    fontSize: 22,
    fontWeight: 300,
    color: "var(--cream)",
    lineHeight: 1.3,
    margin: "8px 0 4px"
};
const themePill = {
    display: "inline-block",
    border: "1px solid rgba(200,135,58,0.35)",
    borderRadius: 2,
    padding: "2px 10px",
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.16em",
    color: "var(--amber)",
    marginBottom: 14
};
const divider = {
    height: 1,
    background: "linear-gradient(to right, rgba(200,135,58,0.3), transparent)",
    margin: "14px 0"
};
const overview = {
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    fontSize: 13,
    color: "var(--mist)",
    lineHeight: 1.7,
    marginBottom: 16
};
const sectionTitle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "var(--amber)",
    marginBottom: 4
};
const sectionBody = {
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    fontSize: 12.5,
    color: "var(--mist)",
    lineHeight: 1.65,
    marginBottom: 14
};
const practiceBox = {
    marginTop: 4,
    padding: "10px 14px",
    background: "rgba(200,135,58,0.05)",
    border: "1px solid rgba(200,135,58,0.2)",
    borderRadius: 2,
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    fontSize: 12.5,
    color: "var(--gold)",
    lineHeight: 1.6
};
const generateBtn = {
    marginTop: 14,
    padding: "9px 20px",
    background: "linear-gradient(135deg, rgba(200,135,58,0.12), rgba(200,135,58,0.04))",
    border: "1px solid rgba(200,135,58,0.4)",
    borderRadius: 2,
    color: "var(--amber)",
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    fontSize: 12,
    cursor: "pointer",
    letterSpacing: "0.06em"
};
const tabBtn = (active)=>({
        padding: "4px 14px",
        background: active ? "rgba(200,135,58,0.12)" : "transparent",
        border: `1px solid ${active ? "rgba(200,135,58,0.4)" : "rgba(200,135,58,0.15)"}`,
        borderRadius: 2,
        color: active ? "var(--amber)" : "var(--mist)",
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.2s"
    });
function ForecastCard({ initialWeekly, initialMonthly, isPaid, weekLabel, monthLabel }) {
    _s();
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("weekly");
    const [weekly, setWeekly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialWeekly);
    const [monthly, setMonthly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialMonthly);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Auto-generate weekly forecast on first load if missing
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForecastCard.useEffect": ()=>{
            if (!initialWeekly && isPaid) {
                setTab("weekly");
                void ({
                    "ForecastCard.useEffect": async ()=>{
                        setLoading(true);
                        try {
                            const res = await fetch("/api/insights/generate/weekly", {
                                method: "POST"
                            });
                            const data = await res.json();
                            if (res.ok) setWeekly(data.forecast);
                        } finally{
                            setLoading(false);
                        }
                    }
                })["ForecastCard.useEffect"]();
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ForecastCard.useEffect"], []);
    // Auto-generate monthly forecast on first load if missing (runs in background, no tab switch)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForecastCard.useEffect": ()=>{
            if (!initialMonthly && isPaid) {
                void ({
                    "ForecastCard.useEffect": async ()=>{
                        try {
                            const res = await fetch("/api/insights/generate/monthly", {
                                method: "POST"
                            });
                            const data = await res.json();
                            if (res.ok) setMonthly(data.forecast);
                        } catch  {}
                    }
                })["ForecastCard.useEffect"]();
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ForecastCard.useEffect"], []);
    async function generate() {
        setLoading(true);
        setError(null);
        const url = tab === "weekly" ? "/api/insights/generate/weekly" : "/api/insights/generate/monthly";
        try {
            const res = await fetch(url, {
                method: "POST"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            if (tab === "weekly") setWeekly(data.forecast);
            else setMonthly(data.forecast);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally{
            setLoading(false);
        }
    }
    const current = tab === "weekly" ? weekly : monthly;
    const label = tab === "weekly" ? weekLabel : monthLabel;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: eyebrow,
                            children: [
                                "Forecast · ",
                                label
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/dashboard/ForecastCard.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: tabBtn(tab === "weekly"),
                                onClick: ()=>setTab("weekly"),
                                children: "Weekly"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: tabBtn(tab === "monthly"),
                                onClick: ()=>setTab("monthly"),
                                children: "Monthly"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            isPaid ? current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForecastContent, {
                forecast: current,
                type: tab
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 176,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...overview,
                            opacity: 0.45,
                            fontStyle: "italic",
                            marginBottom: 0
                        },
                        children: [
                            "Your ",
                            tab,
                            " forecast is ready to generate…"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 179,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: generate,
                        disabled: loading,
                        style: generateBtn,
                        children: loading ? "Generating…" : `✦ Generate ${tab === "weekly" ? "Weekly" : "Monthly"} Forecast`
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 182,
                        columnNumber: 13
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            marginTop: 8,
                            fontSize: 12,
                            color: "rgba(220,80,80,0.8)"
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 185,
                        columnNumber: 23
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 178,
                columnNumber: 11
            }, this) : // Free tier — blurred preview + upgrade CTA
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            filter: "blur(5px)",
                            userSelect: "none",
                            pointerEvents: "none",
                            opacity: 0.5
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: headline,
                                children: "A week of deeper integration awaits you"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: themePill,
                                children: "Clarity & Momentum"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 193,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: overview,
                                children: "This week carries a distinct energy of consolidation. Your defined centres are amplified by the current dasha themes, creating moments of unusual clarity in decision-making."
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: sectionTitle,
                                children: "Energy & Body"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: sectionBody,
                                children: "Your sacral energy peaks mid-week. Honour rest on the bookends."
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 199,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: sectionTitle,
                                children: "Relationships & Aura"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: sectionBody,
                                children: "Your aura is particularly receptive to new connections this week."
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 10,
                                    color: "var(--amber)",
                                    letterSpacing: "0.12em",
                                    opacity: 0.8
                                },
                                children: "CORE & VIP MEMBERS"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                    fontSize: 13,
                                    color: "var(--mist)",
                                    textAlign: "center",
                                    maxWidth: 280,
                                    lineHeight: 1.5
                                },
                                children: "Unlock weekly and monthly personalised forecasts"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 211,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/subscribe",
                                style: {
                                    padding: "8px 20px",
                                    border: "1px solid rgba(200,135,58,0.5)",
                                    borderRadius: 2,
                                    color: "var(--amber)",
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 10,
                                    letterSpacing: "0.14em",
                                    textDecoration: "none",
                                    background: "rgba(200,135,58,0.08)"
                                },
                                children: "Upgrade to Core →"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/ForecastCard.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 190,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/ForecastCard.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_s(ForecastCard, "miO3FVDTTuB+HPZ6yY8bwRc3/uU=");
_c = ForecastCard;
// ─── Forecast content renderer ────────────────────────────────────────────────
function ForecastContent({ forecast, type }) {
    const practiceLabel = type === "weekly" ? "Weekly Practice" : "Monthly Intention";
    const practiceText = type === "weekly" ? forecast.practice : forecast.intention;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                style: headline,
                children: forecast.headline
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: themePill,
                children: forecast.theme
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 240,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: overview,
                children: forecast.overview
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: divider
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this),
            forecast.sections.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: sectionTitle,
                            children: s.title
                        }, void 0, false, {
                            fileName: "[project]/components/dashboard/ForecastCard.tsx",
                            lineNumber: 245,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: sectionBody,
                            children: s.body
                        }, void 0, false, {
                            fileName: "[project]/components/dashboard/ForecastCard.tsx",
                            lineNumber: 246,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/components/dashboard/ForecastCard.tsx",
                    lineNumber: 244,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: divider
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    marginBottom: 6
                },
                children: practiceLabel
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 250,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: practiceBox,
                children: practiceText
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ForecastCard.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/ForecastCard.tsx",
        lineNumber: 238,
        columnNumber: 5
    }, this);
}
_c1 = ForecastContent;
var _c, _c1;
__turbopack_context__.k.register(_c, "ForecastCard");
__turbopack_context__.k.register(_c1, "ForecastContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/DashaCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashaCard",
    ()=>DashaCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/dashboard/DashaCard.tsx
 * Flip card — front: Dasha stats, back: AI-generated insight for this period.
 * Click anywhere to flip. Insight is fetched lazily on first flip.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const PLANET_COLOR_2 = {
    sun: "#FF8C00",
    moon: "#E8E0FF",
    mars: "#300000",
    mercury: "#B0E0FF",
    jupiter: "#4B7BCC",
    venus: "#60C080",
    saturn: "#303030",
    rahu: "#220044",
    ketu: "#663300"
};
function DashaCard({ activeMaha, activeAntar, mahaRemainingDays, mahaProgress, planetGlyph, planetColor, frontContent }) {
    _s();
    const [flipped, setFlipped] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [insight, setInsight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fetched, setFetched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [apiError, setApiError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Animated visual progress (0 → mahaProgress)
    const [animatedProgress, setAnimatedProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Antardasha orbit dot color
    const antarDotColor = PLANET_COLOR_2[activeAntar?.planetName?.toLowerCase().split("/")[0] ?? ""] ?? "rgba(255,255,255,0.25)";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashaCard.useEffect": ()=>{
            if (mahaProgress == null) {
                setAnimatedProgress(null);
                return;
            }
            // Start from 0 so CSS transitions are visible
            setAnimatedProgress(0);
            const id = window.requestAnimationFrame({
                "DashaCard.useEffect.id": ()=>{
                    setAnimatedProgress(mahaProgress);
                }
            }["DashaCard.useEffect.id"]);
            return ({
                "DashaCard.useEffect": ()=>window.cancelAnimationFrame(id)
            })["DashaCard.useEffect"];
        }
    }["DashaCard.useEffect"], [
        mahaProgress
    ]);
    async function fetchInsight() {
        setLoading(true);
        setApiError(null);
        try {
            const res = await fetch("/api/insights/dasha", {
                method: "POST"
            });
            const data = await res.json();
            if (!res.ok) {
                console.error("[DashaCard] API error", res.status, data);
                setApiError(`${res.status}: ${data.error ?? "Unknown error"}`);
            } else {
                setInsight(data.insight ?? null);
            }
        } catch (err) {
            console.error("[DashaCard] fetch failed", err);
            setApiError("Network error");
        } finally{
            setFetched(true);
            setLoading(false);
        }
    }
    async function handleFlip() {
        const next = !flipped;
        setFlipped(next);
        if (next && !fetched) {
            await fetchInsight();
        }
    }
    const mahaName = activeMaha ? activeMaha.planetName.charAt(0).toUpperCase() + activeMaha.planetName.slice(1) : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        .dasha-flip-inner { transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1); transform-style: preserve-3d; }
        .dasha-flip-inner.flipped { transform: rotateY(180deg); }
        .dasha-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .dasha-back { transform: rotateY(180deg); }
        @keyframes dashaPulse {
          0%,100% { opacity:0.5 } 50% { opacity:1 }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dashaGlyphPulse {
          0%,100% { opacity: 0.72; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.1); }
        }
      `
            }, void 0, false, {
                fileName: "[project]/components/dashboard/DashaCard.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    perspective: 900,
                    width: "100%",
                    height: "100%",
                    cursor: activeMaha ? "pointer" : "default"
                },
                onClick: activeMaha ? handleFlip : undefined,
                title: activeMaha ? flipped ? "See period stats" : "See AI insight" : undefined,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `dasha-flip-inner${flipped ? " flipped" : ""}`,
                    style: {
                        position: "relative",
                        width: "100%",
                        height: "100%"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "dasha-face",
                            style: {
                                position: "absolute",
                                inset: 0
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative",
                                    zIndex: 1,
                                    height: "100%"
                                },
                                children: [
                                    activeMaha && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "relative",
                                            height: 150,
                                            marginBottom: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    zIndex: 2
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 40,
                                                        lineHeight: 1,
                                                        fontFamily: "Cinzel, serif",
                                                        color: planetColor,
                                                        userSelect: "none",
                                                        display: "inline-block",
                                                        animation: "dashaGlyphPulse 3s ease-in-out infinite",
                                                        filter: `drop-shadow(0 0 12px ${planetColor}99)`
                                                    },
                                                    children: planetGlyph
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 146,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 145,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "absolute",
                                                    width: 80,
                                                    height: 80,
                                                    top: "50%",
                                                    left: "50%",
                                                    marginTop: -40,
                                                    marginLeft: -40,
                                                    borderRadius: "50%",
                                                    border: "1px solid rgba(255,255,255,0.07)",
                                                    animation: "orbitSpin 8s linear infinite"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "absolute",
                                                        bottom: -5,
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        background: antarDotColor,
                                                        boxShadow: `0 0 8px 3px ${antarDotColor}99`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 160,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "absolute",
                                                    width: 130,
                                                    height: 130,
                                                    top: "50%",
                                                    left: "50%",
                                                    marginTop: -65,
                                                    marginLeft: -65,
                                                    borderRadius: "50%",
                                                    border: "1px solid rgba(255,255,255,0.07)",
                                                    animation: "orbitSpin 18s linear infinite reverse"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "absolute",
                                                        top: "50%",
                                                        right: -6.5,
                                                        transform: "translateY(-50%)",
                                                        width: 13,
                                                        height: 13,
                                                        borderRadius: "50%",
                                                        background: planetColor,
                                                        boxShadow: `0 0 12px 4px ${planetColor}99`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 179,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashaCard.tsx",
                                        lineNumber: 142,
                                        columnNumber: 17
                                    }, this),
                                    frontContent,
                                    activeMaha && mahaProgress != null && animatedProgress != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        },
                                        children: [
                                            (()=>{
                                                const r = 14, circ = 2 * Math.PI * r;
                                                const dash = animatedProgress / 100 * circ;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: 36,
                                                    height: 36,
                                                    viewBox: "0 0 36 36",
                                                    style: {
                                                        flexShrink: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                            cx: 18,
                                                            cy: 18,
                                                            r: r,
                                                            fill: "none",
                                                            stroke: "rgba(212,175,55,0.1)",
                                                            strokeWidth: 2
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                            lineNumber: 209,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                            cx: 18,
                                                            cy: 18,
                                                            r: r,
                                                            fill: "none",
                                                            stroke: "rgba(212,175,55,0.55)",
                                                            strokeWidth: 2,
                                                            strokeDasharray: `${dash} ${circ}`,
                                                            strokeLinecap: "round",
                                                            transform: "rotate(-90 18 18)",
                                                            style: {
                                                                transition: "stroke-dasharray 0.6s ease"
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                            lineNumber: 210,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                            x: 18,
                                                            y: 22,
                                                            textAnchor: "middle",
                                                            fontSize: 7,
                                                            fill: "rgba(212,175,55,0.7)",
                                                            fontFamily: "'DM Mono',monospace",
                                                            children: [
                                                                mahaProgress,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                            lineNumber: 222,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 208,
                                                    columnNumber: 23
                                                }, this);
                                            })(),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "tap-insight-pill",
                                                        style: {
                                                            fontFamily: "'DM Mono', monospace",
                                                            fontSize: 8,
                                                            letterSpacing: "0.12em",
                                                            color: "var(--amber)",
                                                            textTransform: "uppercase",
                                                            padding: "3px 10px",
                                                            borderRadius: 20,
                                                            border: "1px solid rgba(200,135,58,0.25)",
                                                            background: "rgba(200,135,58,0.04)"
                                                        },
                                                        children: "tap for insight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 9,
                                                            color: "var(--amber)",
                                                            opacity: 0.6
                                                        },
                                                        children: "↺"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 235,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/DashaCard.tsx",
                                        lineNumber: 202,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                lineNumber: 138,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "dasha-face dasha-back",
                            style: {
                                position: "absolute",
                                inset: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "absolute",
                                        top: 12,
                                        right: 16,
                                        opacity: 0.06,
                                        pointerEvents: "none",
                                        fontSize: 88,
                                        lineHeight: 1,
                                        fontFamily: "serif",
                                        color: planetColor,
                                        userSelect: "none"
                                    },
                                    children: planetGlyph
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                    lineNumber: 249,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative",
                                        zIndex: 1,
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: 14
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        fontFamily: "'DM Mono', monospace",
                                                        fontSize: 9,
                                                        letterSpacing: "0.18em",
                                                        textTransform: "uppercase",
                                                        color: "var(--amber)",
                                                        opacity: 0.7
                                                    },
                                                    children: [
                                                        mahaName,
                                                        " · Insight"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 255,
                                                    columnNumber: 17
                                                }, this),
                                                mahaProgress != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: "'DM Mono', monospace",
                                                        fontSize: 9,
                                                        color: "var(--mist)",
                                                        letterSpacing: "0.06em"
                                                    },
                                                    children: [
                                                        mahaProgress,
                                                        "% complete"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                            lineNumber: 254,
                                            columnNumber: 15
                                        }, this),
                                        mahaProgress != null && animatedProgress != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                height: 2,
                                                background: "rgba(212,175,95,0.1)",
                                                borderRadius: 2,
                                                marginBottom: 16,
                                                overflow: "hidden"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    height: "100%",
                                                    width: `${animatedProgress}%`,
                                                    background: "linear-gradient(90deg, rgba(212,175,95,0.5), rgba(212,175,95,0.85))",
                                                    borderRadius: 2,
                                                    transition: "width 0.6s ease"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 268,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                            lineNumber: 267,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                flex: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center"
                                            },
                                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontFamily: "Cinzel, serif",
                                                    fontSize: 16,
                                                    fontStyle: "italic",
                                                    color: "var(--cream)",
                                                    opacity: 0.45,
                                                    lineHeight: 1.8,
                                                    animation: "dashaPulse 1.8s ease-in-out infinite"
                                                },
                                                children: "Reading the stars…"
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 283,
                                                columnNumber: 19
                                            }, this) : insight ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontFamily: "Cinzel, serif",
                                                    fontSize: 16,
                                                    fontStyle: "italic",
                                                    fontWeight: 300,
                                                    color: "var(--cream)",
                                                    lineHeight: 1.8
                                                },
                                                children: insight
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 287,
                                                columnNumber: 19
                                            }, this) : apiError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontFamily: "'DM Mono', monospace",
                                                            fontSize: 10,
                                                            color: "var(--amber)",
                                                            opacity: 0.7,
                                                            lineHeight: 1.65,
                                                            marginBottom: 10
                                                        },
                                                        children: "Could not load insight. Please try again."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                        lineNumber: 292,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            setFetched(false);
                                                            fetchInsight();
                                                        },
                                                        style: {
                                                            fontFamily: "'DM Mono', monospace",
                                                            fontSize: 9,
                                                            letterSpacing: "0.1em",
                                                            textTransform: "uppercase",
                                                            color: "var(--gold)",
                                                            background: "none",
                                                            border: "1px solid rgba(212,175,95,0.3)",
                                                            borderRadius: 4,
                                                            padding: "4px 10px",
                                                            cursor: "pointer"
                                                        },
                                                        children: "Retry"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                        lineNumber: 295,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 291,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                                    fontSize: 12,
                                                    color: "var(--mist)",
                                                    lineHeight: 1.65
                                                },
                                                children: "No Dasha data yet. Complete your birth profile to receive your planetary insight."
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                lineNumber: 303,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                            lineNumber: 281,
                                            columnNumber: 15
                                        }, this),
                                        mahaRemainingDays != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 14,
                                                borderTop: "1px solid rgba(212,175,95,0.1)",
                                                paddingTop: 10,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: "'DM Mono', monospace",
                                                        fontSize: 9,
                                                        color: "var(--mist)",
                                                        letterSpacing: "0.06em"
                                                    },
                                                    children: [
                                                        mahaRemainingDays.toLocaleString(),
                                                        " days remaining"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: "'DM Mono', monospace",
                                                        fontSize: 8,
                                                        letterSpacing: "0.12em",
                                                        color: "var(--amber)",
                                                        opacity: 0.4,
                                                        textTransform: "uppercase"
                                                    },
                                                    children: "tap to flip ↺"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                                            lineNumber: 311,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                                    lineNumber: 252,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/dashboard/DashaCard.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/dashboard/DashaCard.tsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/DashaCard.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(DashaCard, "kTa/phKtFJh6Q/xFMwCfO8k+lAQ=");
_c = DashaCard;
var _c;
__turbopack_context__.k.register(_c, "DashaCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/TransitCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TransitCard",
    ()=>TransitCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/dashboard/TransitCard.tsx
 * Today's Vedic Transit Reading — auto-fetches on mount.
 * Displays Gemini AI reading based on Parasara Hora analysis of
 * natal Rasi chart vs today's planetary positions (Gochara).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const PLANET_GLYPHS = {
    sun: "☉",
    moon: "☽",
    mars: "♂",
    mercury: "☿",
    jupiter: "♃",
    venus: "♀",
    saturn: "♄",
    rahu: "☊",
    ketu: "☋"
};
const QUALITY_COLOR = {
    favorable: "var(--gold)",
    neutral: "var(--mist)",
    challenging: "rgba(220,120,60,0.85)"
};
const QUALITY_LABEL = {
    favorable: "Favorable",
    neutral: "Neutral",
    challenging: "Challenging"
};
function TransitCard() {
    _s();
    const [reading, setReading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TransitCard.useEffect": ()=>{
            fetchReading();
        }
    }["TransitCard.useEffect"], []);
    async function fetchReading() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/transit/reading");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Could not load transit reading.");
            } else {
                setReading(data.reading);
            }
        } catch  {
            setError("Network error. Please refresh.");
        } finally{
            setLoading(false);
        }
    }
    const mono = {
        fontFamily: "'DM Mono', monospace"
    };
    const sans = {
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"
    };
    const serif = {
        fontFamily: "Cinzel, serif"
    };
    // ── Loading ────────────────────────────────────────────────────────────
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: "8px 0"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        ...mono,
                        fontSize: 9,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--amber)",
                        marginBottom: 10
                    },
                    children: "✦ Today's Transits"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        ...serif,
                        fontSize: 16,
                        fontStyle: "italic",
                        color: "var(--mist)",
                        animation: "dashaPulse 1.8s ease-in-out infinite"
                    },
                    children: "Reading the sky…"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/dashboard/TransitCard.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this);
    }
    // ── Error ──────────────────────────────────────────────────────────────
    if (error || !reading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: "8px 0"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        ...mono,
                        fontSize: 9,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--amber)",
                        marginBottom: 10
                    },
                    children: "✦ Today's Transits"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        ...sans,
                        fontSize: 13,
                        color: "rgba(220,100,80,0.85)",
                        marginBottom: 12,
                        lineHeight: 1.6
                    },
                    children: error ?? "Transit reading unavailable."
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: fetchReading,
                    style: {
                        ...sans,
                        fontSize: 11.5,
                        color: "var(--amber)",
                        background: "none",
                        border: "1px solid rgba(200,135,58,0.22)",
                        borderRadius: 2,
                        padding: "5px 14px",
                        cursor: "pointer",
                        letterSpacing: "0.06em"
                    },
                    children: "Try Again"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/dashboard/TransitCard.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this);
    }
    // ── Result ─────────────────────────────────────────────────────────────
    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    }).format(new Date());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 18,
                    flexWrap: "wrap",
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...mono,
                                    fontSize: 9,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: "var(--amber)",
                                    marginBottom: 6
                                },
                                children: "✦ Today's Transits"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    ...serif,
                                    fontSize: "clamp(18px, 2.5vw, 24px)",
                                    fontWeight: 300,
                                    color: "var(--cream)",
                                    lineHeight: 1.15,
                                    margin: 0
                                },
                                children: reading.headline
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            reading.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    ...mono,
                                    fontSize: 8,
                                    color: "var(--mist)",
                                    marginTop: 5,
                                    letterSpacing: "0.1em"
                                },
                                children: [
                                    "◎ ",
                                    reading.location
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            ...mono,
                            fontSize: 8.5,
                            color: "var(--mist)",
                            letterSpacing: "0.08em",
                            marginTop: 4,
                            flexShrink: 0
                        },
                        children: today
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    ...sans,
                    fontSize: 13.5,
                    color: "var(--mist)",
                    lineHeight: 1.75,
                    marginBottom: 22
                },
                children: reading.overview
            }, void 0, false, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 1,
                    background: "rgba(200,135,58,0.1)",
                    marginBottom: 20
                }
            }, void 0, false, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    ...mono,
                    fontSize: 8.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    marginBottom: 12
                },
                children: "Key Planetary Movements"
            }, void 0, false, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                },
                children: reading.keyTransits.map((t, i)=>{
                    const glyph = PLANET_GLYPHS[t.planet.toLowerCase()] ?? "·";
                    const isOpen = expanded === t.planet;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setExpanded(isOpen ? null : t.planet),
                                style: {
                                    width: "100%",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "10px 0",
                                    borderBottom: "1px solid rgba(200,135,58,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            ...serif,
                                            fontSize: 18,
                                            color: QUALITY_COLOR[t.quality],
                                            width: 22,
                                            flexShrink: 0,
                                            textAlign: "center"
                                        },
                                        children: glyph
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                                        lineNumber: 143,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            minWidth: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    ...sans,
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    color: "var(--cream)",
                                                    textTransform: "capitalize"
                                                },
                                                children: t.planet
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                lineNumber: 148,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    ...mono,
                                                    fontSize: 9,
                                                    color: "var(--mist)",
                                                    marginLeft: 8,
                                                    letterSpacing: "0.06em"
                                                },
                                                children: [
                                                    t.natalSign,
                                                    " → ",
                                                    t.transitSign,
                                                    t.transitHouseFromMoon !== null ? ` · H${t.transitHouseFromMoon} from ☽` : ""
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                lineNumber: 151,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                                        lineNumber: 147,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            ...mono,
                                            fontSize: 7.5,
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            color: QUALITY_COLOR[t.quality],
                                            padding: "2px 7px",
                                            border: `1px solid ${QUALITY_COLOR[t.quality]}44`,
                                            borderRadius: 2,
                                            flexShrink: 0
                                        },
                                        children: QUALITY_LABEL[t.quality]
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                                        lineNumber: 157,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            ...mono,
                                            fontSize: 9,
                                            color: "var(--amber)",
                                            transition: "transform 0.2s",
                                            transform: isOpen ? "rotate(180deg)" : "none",
                                            flexShrink: 0
                                        },
                                        children: "▾"
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                lineNumber: 133,
                                columnNumber: 15
                            }, this),
                            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: "8px 0 12px 32px",
                                    borderBottom: "1px solid rgba(200,135,58,0.06)"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        ...sans,
                                        fontSize: 12.5,
                                        color: "var(--mist)",
                                        lineHeight: 1.7,
                                        margin: 0
                                    },
                                    children: t.note
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                    lineNumber: 172,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                lineNumber: 171,
                                columnNumber: 17
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 132,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    padding: "14px 16px",
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
                        children: "Today's Guidance"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...sans,
                            fontSize: 13.5,
                            color: "var(--cream)",
                            lineHeight: 1.7,
                            margin: 0
                        },
                        children: reading.guidance
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 183,
                columnNumber: 7
            }, this),
            reading.allPlanets?.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 1,
                            background: "rgba(200,135,58,0.1)",
                            margin: "24px 0 18px"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            ...mono,
                            fontSize: 8.5,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--amber)",
                            marginBottom: 14
                        },
                        children: "All Planetary Positions"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 196,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            overflowX: "auto"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            style: {
                                width: "100%",
                                borderCollapse: "collapse",
                                ...mono,
                                fontSize: 11
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            "Planet",
                                            "Sign",
                                            "House",
                                            "Degree",
                                            "Nakshatra",
                                            ""
                                        ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: "left",
                                                    padding: "4px 10px 8px 0",
                                                    fontSize: 7.5,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    color: "var(--amber)",
                                                    fontWeight: 400,
                                                    borderBottom: "1px solid rgba(200,135,58,0.12)"
                                                },
                                                children: h
                                            }, h, false, {
                                                fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                lineNumber: 204,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                                        lineNumber: 202,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: reading.allPlanets.map((p, i)=>{
                                        const glyph = PLANET_GLYPHS[p.name.toLowerCase()] ?? "·";
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                borderBottom: "1px solid rgba(200,135,58,0.04)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: "7px 10px 7px 0",
                                                        color: "var(--cream)"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                ...serif,
                                                                fontSize: 14,
                                                                marginRight: 6
                                                            },
                                                            children: glyph
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                            lineNumber: 216,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                ...sans,
                                                                fontSize: 12,
                                                                textTransform: "capitalize"
                                                            },
                                                            children: p.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                            lineNumber: 217,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: "7px 10px 7px 0",
                                                        color: "var(--cream)",
                                                        ...sans,
                                                        fontSize: 12,
                                                        textTransform: "capitalize"
                                                    },
                                                    children: p.sign
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: "7px 10px 7px 0",
                                                        color: "var(--mist)",
                                                        fontSize: 11
                                                    },
                                                    children: p.house ?? "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                    lineNumber: 220,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: "7px 10px 7px 0",
                                                        color: "var(--mist)",
                                                        fontSize: 11
                                                    },
                                                    children: p.degreeFmt || `${p.degree?.toFixed(1)}°`
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: "7px 10px 7px 0",
                                                        color: "var(--mist)",
                                                        fontSize: 10,
                                                        textTransform: "capitalize"
                                                    },
                                                    children: p.nakshatra?.replace(/_/g, " ") ?? "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: "7px 0 7px 0",
                                                        color: "rgba(220,120,60,0.7)",
                                                        fontSize: 9
                                                    },
                                                    children: p.isRetrograde ? "℞" : ""
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/components/dashboard/TransitCard.tsx",
                                            lineNumber: 214,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                                    lineNumber: 210,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/dashboard/TransitCard.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/TransitCard.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 14,
                    display: "flex",
                    justifyContent: "flex-end"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: fetchReading,
                    style: {
                        ...mono,
                        fontSize: 8,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--mist)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 0"
                    },
                    children: "↺ Refresh"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/TransitCard.tsx",
                    lineNumber: 239,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/TransitCard.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/TransitCard.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
_s(TransitCard, "UcYtf9m5HavjB8tx8F0WNTkgUq0=");
_c = TransitCard;
var _c;
__turbopack_context__.k.register(_c, "TransitCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/CosmicGuidanceCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CosmicGuidanceCard",
    ()=>CosmicGuidanceCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * components/dashboard/CosmicGuidanceCard.tsx
 * Renders the Cosmic Guidance card.
 * If no insight is passed, auto-triggers POST /api/insights/generate on mount.
 * Parses the stored JSON content and renders structured fields.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
function parseContentSafe(content) {
    try {
        return JSON.parse(content);
    } catch  {
        return null;
    }
}
// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ insightId, initial }) {
    _s();
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial ?? 0);
    const [hover, setHover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial !== null);
    async function handleRate(r) {
        if (submitted) return;
        setRating(r);
        setSubmitted(true);
        try {
            await fetch("/api/insights/rate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    insightId,
                    rating: r
                })
            });
        } catch  {}
    }
    const display = submitted ? rating : hover || rating;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 8.5,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--mist)"
                },
                children: "Accuracy"
            }, void 0, false, {
                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: 3
                },
                children: [
                    1,
                    2,
                    3,
                    4,
                    5
                ].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleRate(r),
                        onMouseEnter: ()=>!submitted && setHover(r),
                        onMouseLeave: ()=>!submitted && setHover(0),
                        style: {
                            background: "none",
                            border: "none",
                            padding: "2px 1px",
                            fontSize: 18,
                            lineHeight: 1,
                            cursor: submitted ? "default" : "pointer",
                            color: display >= r ? "#f5d76e" : "rgba(201,168,76,0.16)",
                            textShadow: display >= r ? "0 0 6px rgba(212,175,55,0.5)" : "none",
                            transition: "color 0.15s, text-shadow 0.15s"
                        },
                        title: submitted ? `Rated ${rating}/5` : `Rate ${r}`,
                        "aria-label": `${r} star`,
                        children: "★"
                    }, r, false, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            submitted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 8.5,
                    color: "var(--amber)",
                    letterSpacing: "0.1em"
                },
                children: "Saved"
            }, void 0, false, {
                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                lineNumber: 79,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(StarRating, "14JecYGDDqpYjWcCyFheY39b96s=");
_c = StarRating;
function CosmicGuidanceCard({ initialInsight }) {
    _s1();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CosmicGuidanceCard.useState": ()=>{
            if (!initialInsight) return null;
            const parsed = parseContentSafe(initialInsight.content);
            return parsed ? {
                id: initialInsight.id,
                parsed,
                accuracyRating: initialInsight.accuracyRating
            } : null;
        }
    }["CosmicGuidanceCard.useState"]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialInsight === null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CosmicGuidanceCard.useEffect": ()=>{
            if (initialInsight !== null) return;
            let cancelled = false;
            async function generate() {
                try {
                    const res = await fetch("/api/insights/generate", {
                        method: "POST"
                    });
                    if (!res.ok) {
                        const d = await res.json().catch({
                            "CosmicGuidanceCard.useEffect.generate": ()=>({})
                        }["CosmicGuidanceCard.useEffect.generate"]);
                        if (!cancelled) setError(d.error ?? "Generation failed");
                        return;
                    }
                    const data = await res.json();
                    const raw = data?.insight;
                    if (!cancelled && raw) {
                        setState({
                            id: data.id ?? "new",
                            parsed: {
                                summary: raw.summary,
                                insight: raw.insight,
                                action: raw.action,
                                energyTheme: raw.energyTheme
                            },
                            accuracyRating: null
                        });
                    }
                } finally{
                    if (!cancelled) setLoading(false);
                }
            }
            void generate();
            return ({
                "CosmicGuidanceCard.useEffect": ()=>{
                    cancelled = true;
                }
            })["CosmicGuidanceCard.useEffect"];
        }
    }["CosmicGuidanceCard.useEffect"], [
        initialInsight
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass-card dash-col-8 animate-enter animate-enter-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "dash-card-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "dash-section-title",
                                children: "Cosmic Guidance"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "dash-section-subtitle",
                                children: "Today's personal navigation"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    state?.parsed.energyTheme ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            border: "1px solid rgba(201,168,76,0.25)",
                            borderRadius: 2,
                            padding: "3px 10px",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 8.5,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "var(--amber)"
                        },
                        children: state.parsed.energyTheme
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "dash-sparkle",
                        children: "✦"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                },
                children: [
                    1,
                    2,
                    3
                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 16,
                            borderRadius: 6,
                            background: "rgba(212,175,95,0.08)",
                            animation: "pulse 1.8s ease-in-out infinite",
                            animationDelay: `${i * 0.12}s`,
                            width: i === 3 ? "60%" : "100%"
                        }
                    }, i, false, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 149,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this) : state ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    state.parsed.insight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontFamily: "Cinzel, serif",
                            fontSize: "clamp(16px, 1.8vw, 22px)",
                            fontWeight: 400,
                            fontStyle: "italic",
                            lineHeight: 1.65,
                            color: "var(--cream)",
                            marginBottom: 22,
                            letterSpacing: "0.01em"
                        },
                        children: [
                            "“",
                            state.parsed.insight,
                            "”"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 155,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "v2-ornament",
                        style: {
                            marginBottom: 18
                        },
                        children: "✦"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, this),
                    state.parsed.action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "12px 16px",
                            borderLeft: "2px solid rgba(201,168,76,0.35)",
                            background: "rgba(201,168,76,0.04)",
                            borderRadius: "0 6px 6px 0"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 8,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: "var(--amber)",
                                    display: "block",
                                    marginBottom: 5
                                },
                                children: "Today's Focus"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                                lineNumber: 175,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                    fontSize: 13,
                                    color: "var(--cream)",
                                    lineHeight: 1.6
                                },
                                children: state.parsed.action
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                                lineNumber: 178,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 169,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StarRating, {
                        insightId: state.id,
                        initial: state.accuracyRating
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "dash-empty",
                children: error ?? "Could not generate guidance right now. Please refresh."
            }, void 0, false, {
                fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
                lineNumber: 187,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/CosmicGuidanceCard.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
_s1(CosmicGuidanceCard, "vZ7FuLdyNu4eSnT3uc3aztUHtK4=");
_c1 = CosmicGuidanceCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "StarRating");
__turbopack_context__.k.register(_c1, "CosmicGuidanceCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_a951f266._.js.map
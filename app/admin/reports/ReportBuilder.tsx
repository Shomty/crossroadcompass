"use client";
// STATUS: done | Admin Custom Report Builder

import React, { useState, useEffect } from "react";
import type {
  ReportVariable,
  CustomReportOutput,
  ReportSection,
} from "@/types";
import { REPORT_TEMPLATE_VARIABLE_KEYS } from "@/lib/reports/reportTemplateVariableKeys";

// ─── Variable metadata (mirrored client-side to avoid a server import) ────────

type VariableMeta = {
  label: string;
  description: string;
  dataSource: "hd" | "vedic" | "dasha" | "transit" | "ai" | "manual";
};

const VARIABLE_META: Record<ReportVariable, VariableMeta> = {
  hd_type_strategy:     { label: "HD Type & Strategy",       description: "Human Design type, strategy, signature, and not-self theme",               dataSource: "hd" },
  hd_authority:         { label: "HD Authority",             description: "Decision-making authority and how to apply it",                            dataSource: "hd" },
  hd_profile:           { label: "HD Profile",               description: "Profile lines and their life-role archetype",                              dataSource: "hd" },
  hd_defined_centers:   { label: "HD Defined Centers",       description: "Which energy centers are consistently defined (fixed)",                    dataSource: "hd" },
  hd_incarnation_cross: { label: "HD Incarnation Cross",     description: "Life purpose cross type and gate numbers",                                 dataSource: "hd" },
  vedic_natal_overview: { label: "Vedic Natal Overview",     description: "Key placements from the Vedic natal chart (lagna, planets, nakshatras)",  dataSource: "vedic" },
  current_dasha:        { label: "Current Dasha Period",     description: "Active Mahadasha and Antardasha planetary periods",                        dataSource: "dasha" },
  dasha_guidance:       { label: "Dasha Guidance",           description: "AI narrative: how the current dasha tends to influence this person",       dataSource: "ai" },
  active_transits:      { label: "Active Transits",          description: "Today's planetary transits and their house positions",                     dataSource: "transit" },
  sade_sati_status:     { label: "Sade Sati Status",         description: "Whether Saturn is in 12th, 1st, or 2nd from natal moon",                  dataSource: "vedic" },
  career_purpose_theme: { label: "Career & Purpose Theme",   description: "AI narrative: work and purpose patterns from HD cross and Vedic chart",   dataSource: "ai" },
  relationship_theme:   { label: "Relationship Theme",       description: "AI narrative: how HD wiring shapes relationship dynamics",                 dataSource: "ai" },
  shadow_growth_theme:  { label: "Shadow & Growth Theme",    description: "AI narrative: not-self patterns and the growth edge through them",         dataSource: "ai" },
  monthly_focus:        { label: "Monthly Focus",            description: "AI narrative: energetic theme and opportunity for this calendar month",    dataSource: "ai" },
  custom_note:          { label: "Consultant's Note",        description: "A personalised note written by the consultant for this report",            dataSource: "manual" },
};

const ALL_VARIABLES = Object.keys(VARIABLE_META) as ReportVariable[];

const SOURCE_BADGE_COLORS: Record<VariableMeta["dataSource"], string> = {
  hd:     "#1c2340",
  vedic:  "#1c2340",
  dasha:  "#1c2340",
  transit: "#1c2340",
  ai:     "#2e1f0f",
  manual: "#1a1a2e",
};

const SOURCE_BADGE_TEXT: Record<VariableMeta["dataSource"], string> = {
  hd:     "#6080c0",
  vedic:  "#6080c0",
  dasha:  "#6080c0",
  transit: "#6080c0",
  ai:     "#c8873a",
  manual: "#8060a0",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserMatch {
  id: string;
  email: string;
  tier: string;
}

interface InspectDataSource {
  available: boolean;
  preview: Record<string, unknown> | null;
}

interface InspectData {
  vars: Record<string, string>;
  vedicFull?: Record<string, unknown> | null;
  dataSources: {
    hd:      InspectDataSource;
    vedic:   InspectDataSource;
    dashas:  InspectDataSource;
    transit: InspectDataSource;
  };
}

const DEFAULT_SYSTEM_PROMPT =
`You are a thoughtful consultant synthesising Human Design and Vedic Astrology.
Rules: never use "you will" / "this will cause" / prediction language.
Use warm, practical language. Define technical terms on first use.
200–300 words. Return plain text only. No markdown. No bullet points.`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportBuilder() {
  // Shared state
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMatch | null>(null);
  const [searchError, setSearchError] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"preview" | "email" | "pdf">("preview");

  // Preset mode state
  const [selectedVars, setSelectedVars] = useState<ReportVariable[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [report, setReport] = useState<CustomReportOutput | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  // ─── Shared Handlers ────────────────────────────────────────────────────────

  async function handleUserSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setSelectedUser(null);
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      const users: UserMatch[] = data.items ?? [];
      if (users.length === 0) {
        setSearchError("No user found matching that email.");
      } else {
        setSelectedUser(users[0]);
      }
    } catch {
      setSearchError("Search failed. Check network connection.");
    } finally {
      setSearchLoading(false);
    }
  }

  // ─── Preset Handlers ────────────────────────────────────────────────────────

  function toggleVariable(v: ReportVariable) {
    setSelectedVars((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      return [...prev, v];
    });
  }

  async function handleGenerate() {
    if (!selectedUser || selectedVars.length === 0 || !reportTitle.trim()) return;
    setGenerating(true);
    setGenerateError("");
    setReport(null);
    setSent(false);

    try {
      const res = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          title: reportTitle.trim(),
          variables: selectedVars,
          customNote: customNote || undefined,
          deliveryMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error ?? "Generation failed");
        return;
      }
      setReport(data.report);
    } catch {
      setGenerateError("Network error during generation.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRetrySection(variable: ReportVariable) {
    if (!selectedUser || !report) return;
    setGenerateError("");

    try {
      const res = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          title: reportTitle.trim(),
          variables: [variable],
          customNote: variable === "custom_note" ? customNote : undefined,
          deliveryMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) return;
      const newSection: ReportSection = data.report.sections[0];
      if (!newSection) return;
      setReport((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.variable === variable ? newSection : s
          ),
        };
      });
    } catch {
      // silent
    }
  }

  async function handleSend() {
    if (!report) return;
    setSending(true);
    setSendError("");
    setSent(false);

    try {
      const res = await fetch("/api/admin/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error ?? "Send failed");
        return;
      }
      setSent(true);
    } catch {
      setSendError("Network error during send.");
    } finally {
      setSending(false);
    }
  }

  const canGenerate =
    !!selectedUser && selectedVars.length > 0 && !!reportTitle.trim();

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Mode Toggle ── */}
      <div style={{ display: "flex", gap: 0, borderRadius: 4, overflow: "hidden", border: "1px solid rgba(200,135,58,0.25)", alignSelf: "flex-start" }}>
        {(["preset", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? "rgba(200,135,58,0.15)" : "transparent",
              border: "none",
              borderRight: m === "preset" ? "1px solid rgba(200,135,58,0.25)" : "none",
              color: mode === m ? "#e8b96a" : "#606880",
              padding: "8px 20px",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              fontFamily: "var(--font-mono, 'DM Mono')",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {m === "preset" ? "Preset Variables" : "Custom Prompt"}
          </button>
        ))}
      </div>

      {/* ── 1. User Selector (shared) ── */}
      <Card>
        <SectionLabel>1. Select User</SectionLabel>
        <form onSubmit={handleUserSearch} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" disabled={searchLoading} style={secondaryButtonStyle}>
            {searchLoading ? "Searching…" : "Search"}
          </button>
        </form>

        {searchError && (
          <p style={{ color: "#e05050", fontSize: 12, marginTop: 8 }}>{searchError}</p>
        )}

        {selectedUser && (
          <div style={pillStyle}>
            <span style={{ color: "#e8b96a" }}>{selectedUser.email}</span>
            <span style={{ color: "#c8873a", fontSize: 10, marginLeft: 8 }}>{selectedUser.tier}</span>
            <button
              onClick={() => setSelectedUser(null)}
              style={{ background: "none", border: "none", color: "#606880", cursor: "pointer", marginLeft: 12, fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        )}
      </Card>

      {/* ── Mode-specific content ── */}
      {mode === "preset" ? (
        <>
          {/* ── 2. Variable Selector ── */}
          <Card>
            <SectionLabel>2. Select Variables ({selectedVars.length} selected)</SectionLabel>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
              marginTop: 12,
            }}>
              {ALL_VARIABLES.map((v) => {
                const meta = VARIABLE_META[v];
                const isSelected = selectedVars.includes(v);
                const selIndex = selectedVars.indexOf(v);
                return (
                  <div
                    key={v}
                    onClick={() => toggleVariable(v)}
                    style={{
                      ...varCardStyle,
                      border: isSelected
                        ? "1px solid #e8b96a"
                        : "1px solid rgba(200,135,58,0.2)",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {isSelected && (
                      <span style={{
                        position: "absolute", top: 8, right: 8,
                        background: "#e8b96a", color: "#0d1220",
                        borderRadius: "50%", width: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {selIndex + 1}
                      </span>
                    )}
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: isSelected ? "#e8b96a" : "#a0a8c0",
                      marginBottom: 4, paddingRight: isSelected ? 20 : 0,
                    }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#606880", lineHeight: 1.4, marginBottom: 6 }}>
                      {meta.description}
                    </div>
                    <span style={{
                      fontSize: 9, letterSpacing: "0.15em",
                      background: SOURCE_BADGE_COLORS[meta.dataSource],
                      color: SOURCE_BADGE_TEXT[meta.dataSource],
                      padding: "2px 6px", borderRadius: 2,
                      textTransform: "uppercase" as const,
                    }}>
                      {meta.dataSource}
                    </span>

                    {v === "custom_note" && isSelected && (
                      <textarea
                        value={customNote}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCustomNote(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Write your personalised note here…"
                        rows={4}
                        style={{ ...inputStyle, marginTop: 10, resize: "vertical", width: "100%", boxSizing: "border-box" as const }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── 3. Report Title ── */}
          <Card>
            <SectionLabel>3. Report Title</SectionLabel>
            <input
              type="text"
              placeholder="e.g. Saturn Return Reading — March 2026"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              style={{ ...inputStyle, marginTop: 8, width: "100%", boxSizing: "border-box" as const }}
            />
          </Card>

          {/* ── 4. Delivery Mode ── */}
          <Card>
            <SectionLabel>4. Delivery Mode</SectionLabel>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {(["preview", "email", "pdf"] as const).map((dm) => {
                const isPdf = dm === "pdf";
                return (
                  <label
                    key={dm}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      cursor: isPdf ? "default" : "pointer",
                      opacity: isPdf ? 0.4 : 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      value={dm}
                      checked={deliveryMode === dm}
                      disabled={isPdf}
                      onChange={() => !isPdf && setDeliveryMode(dm)}
                      style={{ accentColor: "#e8b96a" }}
                    />
                    <span style={{ fontSize: 13, color: "#a0a8c0", textTransform: "capitalize" as const }}>
                      {dm === "pdf" ? "PDF" : dm.charAt(0).toUpperCase() + dm.slice(1)}
                    </span>
                    {isPdf && (
                      <span style={{
                        fontSize: 9, background: "#2e1f0f", color: "#c8873a",
                        padding: "1px 6px", borderRadius: 2, letterSpacing: "0.1em",
                      }}>
                        COMING SOON
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </Card>

          {/* ── 5. Generate Button ── */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              style={canGenerate && !generating ? primaryButtonStyle : disabledButtonStyle}
            >
              {generating ? "Generating report…" : "Generate Report"}
            </button>
            {generateError && (
              <p style={{ color: "#e05050", fontSize: 12, marginTop: 8 }}>{generateError}</p>
            )}
          </div>

          {/* ── 6. Preview Panel ── */}
          {report && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <SectionLabel>Preview: {report.config.title}</SectionLabel>
                  <p style={{ fontSize: 11, color: "#606880", margin: "4px 0 0" }}>
                    {report.userEmail} · {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>
                {deliveryMode === "email" && (
                  <div>
                    {sent ? (
                      <span style={{ color: "#40c080", fontSize: 12 }}>✓ Sent to {report.userEmail}</span>
                    ) : (
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        style={sending ? disabledButtonStyle : primaryButtonStyle}
                      >
                        {sending ? "Sending…" : "Send to User"}
                      </button>
                    )}
                    {sendError && (
                      <p style={{ color: "#e05050", fontSize: 12, marginTop: 6 }}>{sendError}</p>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {report.sections.map((section) => {
                  const isError = section.content === "Could not generate this section. Please try again.";
                  return (
                    <div
                      key={section.variable}
                      style={{
                        padding: "16px 20px",
                        background: isError ? "rgba(224,80,80,0.05)" : "rgba(255,255,255,0.02)",
                        borderLeft: `2px solid ${isError ? "rgba(224,80,80,0.3)" : "rgba(200,135,58,0.3)"}`,
                        borderRadius: "0 4px 4px 0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{
                          fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const,
                          color: isError ? "#e05050" : "#c8873a", fontWeight: 600,
                        }}>
                          {section.label}
                        </div>
                        {isError && (
                          <button
                            onClick={() => handleRetrySection(section.variable)}
                            style={secondaryButtonStyle}
                          >
                            Retry section
                          </button>
                        )}
                      </div>
                      <pre style={{
                        fontSize: 13, color: isError ? "#e05050" : "#f0dca0",
                        lineHeight: 1.7, margin: 0,
                        whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
                        fontFamily: "var(--font-body, 'Instrument Sans'), sans-serif",
                      }}>
                        {section.content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      ) : (
        <CustomPromptBuilder
          selectedUser={selectedUser}
          deliveryMode={deliveryMode}
          setDeliveryMode={setDeliveryMode}
        />
      )}
    </div>
  );
}

// ─── CustomPromptBuilder ──────────────────────────────────────────────────────

interface CustomPromptBuilderProps {
  selectedUser: UserMatch | null;
  deliveryMode: "preview" | "email" | "pdf";
  setDeliveryMode: (m: "preview" | "email" | "pdf") => void;
}

function CustomPromptBuilder({ selectedUser, deliveryMode, setDeliveryMode }: CustomPromptBuilderProps) {
  const [sectionTitle, setSectionTitle]     = useState("");
  const [systemPrompt, setSystemPrompt]     = useState(DEFAULT_SYSTEM_PROMPT);
  const [userPrompt, setUserPrompt]         = useState("");
  const [varInsertTarget, setVarInsertTarget] = useState<"user" | "system">("user");
  const [temperature, setTemperature]       = useState(0.75);
  const [maxTokens, setMaxTokens]           = useState(1000);

  const [inspectData, setInspectData]       = useState<InspectData | null>(null);
  const [inspecting, setInspecting]         = useState(false);
  const [inspectError, setInspectError]     = useState("");

  // Auto-fetch inspect data when user is selected
  useEffect(() => {
    if (!selectedUser) {
      setInspectData(null);
      return;
    }
    let cancelled = false;
    setInspecting(true);
    setInspectError("");
    fetch(`/api/admin/reports/inspect?userId=${encodeURIComponent(selectedUser.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setInspectError(data.error);
        else setInspectData(data);
      })
      .catch(() => {
        if (!cancelled) setInspectError("Failed to load user data.");
      })
      .finally(() => {
        if (!cancelled) setInspecting(false);
      });
    return () => { cancelled = true; };
  }, [selectedUser]);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [expandedComposed, setExpandedComposed] = useState(false);

  const [testOutput, setTestOutput]         = useState("");
  const [composedPrompt, setComposedPrompt] = useState("");
  const [testVars, setTestVars]             = useState<Record<string, string>>({});
  const [testing, setTesting]               = useState(false);
  const [testError, setTestError]           = useState("");
  const [testPassed, setTestPassed]         = useState(false);

  const [savedReport, setSavedReport]       = useState<CustomReportOutput | null>(null);
  const [sending, setSending]               = useState(false);
  const [sent, setSent]                     = useState(false);
  const [sendError, setSendError]           = useState("");

  async function handleTest() {
    if (!selectedUser || !userPrompt.trim() || !sectionTitle.trim()) return;
    setTesting(true);
    setTestError("");
    setTestOutput("");
    setTestPassed(false);

    try {
      const res = await fetch("/api/admin/reports/custom-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          sectionTitle: sectionTitle.trim(),
          systemPrompt,
          userPrompt,
          temperature,
          maxTokens,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestError(data.error ?? "Test failed");
        return;
      }
      setTestOutput(data.output ?? "");
      setComposedPrompt(data.composedPrompt ?? "");
      setTestVars(data.vars ?? {});
      setTestPassed(true);
    } catch {
      setTestError("Network error during test.");
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    if (!testOutput || !selectedUser) return;
    const now = new Date();
    const report: CustomReportOutput = {
      config: {
        userId: selectedUser.id,
        title: sectionTitle,
        variables: ["custom_note"],
        deliveryMode,
      },
      sections: [{ variable: "custom_note", label: sectionTitle, content: testOutput }],
      generatedAt: now,
      userEmail: selectedUser.email,
    };
    setSavedReport(report);
    setSent(false);
  }

  async function handleSend() {
    if (!savedReport) return;
    setSending(true);
    setSendError("");
    setSent(false);
    try {
      const res = await fetch("/api/admin/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: savedReport }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error ?? "Send failed");
        return;
      }
      setSent(true);
    } catch {
      setSendError("Network error during send.");
    } finally {
      setSending(false);
    }
  }

  function toggleSource(key: string) {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const canTest = !!selectedUser && !!sectionTitle.trim() && !!userPrompt.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Section title ── */}
      <Card>
        <SectionLabel>2. Section Title</SectionLabel>
        <input
          type="text"
          placeholder="e.g. Saturn Return Synthesis"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          style={{ ...inputStyle, marginTop: 8, width: "100%", boxSizing: "border-box" as const }}
        />
      </Card>

      {/* ── System prompt ── */}
      <Card>
        <SectionLabel>3. System Prompt</SectionLabel>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          style={{ ...inputStyle, marginTop: 8, width: "100%", boxSizing: "border-box" as const, resize: "vertical" }}
        />
      </Card>

      {/* ── User prompt ── */}
      <Card>
        <SectionLabel>4. User Prompt</SectionLabel>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          rows={8}
          placeholder={`Write your prompt here. Use {{variables}} to inject real user data.\n\nExample: "Describe how {{hd_type}} energy (strategy: {{hd_strategy}}) interacts with the current {{current_mahadasha}} Mahadasha period..."`}
          style={{ ...inputStyle, marginTop: 8, width: "100%", boxSizing: "border-box" as const, resize: "vertical" }}
        />
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, color: "#606880", marginBottom: 6, letterSpacing: "0.08em" }}>
            TEMPLATE VARIABLES
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 8,
              fontSize: 11,
              color: "#a0a8c0",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#606880" }}>Insert into:</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="varTarget"
                checked={varInsertTarget === "user"}
                onChange={() => setVarInsertTarget("user")}
              />
              User prompt
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="varTarget"
                checked={varInsertTarget === "system"}
                onChange={() => setVarInsertTarget("system")}
              />
              System prompt
            </label>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap" as const,
              gap: 6,
              maxHeight: 240,
              overflowY: "auto",
              padding: "4px 0",
            }}
          >
            {REPORT_TEMPLATE_VARIABLE_KEYS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  const token = `{{${v}}}`;
                  if (varInsertTarget === "user") {
                    setUserPrompt((prev) => prev + token);
                  } else {
                    setSystemPrompt((prev) => prev + token);
                  }
                }}
                title={`Insert {{${v}}}`}
                style={{
                  background: "rgba(96,128,192,0.08)",
                  border: "1px solid rgba(96,128,192,0.2)",
                  borderRadius: 3,
                  color: "#6080c0",
                  fontSize: 9,
                  padding: "3px 6px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono, 'DM Mono')",
                }}
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Parameters ── */}
      <Card>
        <SectionLabel>5. Parameters</SectionLabel>
        <div style={{ display: "flex", gap: 32, marginTop: 12, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#a0a8c0", marginBottom: 6 }}>
              Temperature: <span style={{ color: "#e8b96a" }}>{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ accentColor: "#c8873a", width: 160 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#a0a8c0", marginBottom: 6 }}>Max Tokens</div>
            <input
              type="number"
              min={100}
              max={4000}
              step={100}
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 1000)}
              style={{ ...inputStyle, width: 100 }}
            />
          </div>
        </div>
      </Card>

      {/* ── Inspect Data ── */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <SectionLabel>6. User Data</SectionLabel>
          {inspecting && (
            <span style={{ fontSize: 11, color: "#606880", fontFamily: "var(--font-mono, 'DM Mono')" }}>
              Loading…
            </span>
          )}
        </div>

        {inspectError && (
          <p style={{ color: "#e05050", fontSize: 12 }}>{inspectError}</p>
        )}

        {!selectedUser && !inspectData && (
          <p style={{ fontSize: 12, color: "#606880" }}>Select a user first to inspect their data.</p>
        )}

        {inspectData && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Data source cards */}
            {(["hd", "vedic", "dashas", "transit"] as const).map((src) => {
              const ds = inspectData.dataSources[src];
              const isExpanded = expandedSources.has(src);
              const previewStr = ds.preview
                ? JSON.stringify(ds.preview, null, 2)
                : null;
              const truncated = previewStr && previewStr.length > 400
                ? previewStr.slice(0, 400) + "\n…"
                : previewStr;

              return (
                <div
                  key={src}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${ds.available ? "rgba(64,192,128,0.2)" : "rgba(224,80,80,0.15)"}`,
                    borderRadius: 4,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                    onClick={() => toggleSource(src)}
                  >
                    <span style={{
                      fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const,
                      background: ds.available ? "rgba(64,192,128,0.1)" : "rgba(224,80,80,0.1)",
                      color: ds.available ? "#40c080" : "#e05050",
                      border: `1px solid ${ds.available ? "rgba(64,192,128,0.3)" : "rgba(224,80,80,0.25)"}`,
                      padding: "2px 6px", borderRadius: 2,
                    }}>
                      {ds.available ? "available" : "not available"}
                    </span>
                    <span style={{ fontSize: 11, color: "#a0a8c0", fontFamily: "var(--font-mono, 'DM Mono')" }}>
                      {src.toUpperCase()}
                    </span>
                    {src === "vedic" && ds.available && inspectData.vedicFull && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const block = [
                            "[VEDIC CHART DATA]",
                            "",
                            JSON.stringify(inspectData.vedicFull, null, 2),
                          ].join("\n");
                          setUserPrompt((prev) => (prev ? prev + "\n\n" + block : block));
                        }}
                        style={{
                          marginLeft: "auto",
                          background: "rgba(200,135,58,0.1)",
                          border: "1px solid rgba(200,135,58,0.3)",
                          borderRadius: 3,
                          color: "#c8873a",
                          fontSize: 10,
                          padding: "3px 9px",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono, 'DM Mono')",
                          letterSpacing: "0.08em",
                        }}
                      >
                        ↓ Paste Vedic
                      </button>
                    )}
                    <span style={{ marginLeft: src === "vedic" && ds.available && inspectData.vedicFull ? 8 : "auto", color: "#606880", fontSize: 11 }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {isExpanded && truncated && (
                    <pre style={{
                      marginTop: 10, fontSize: 11, color: "#8090b0",
                      whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
                      fontFamily: "var(--font-mono, 'DM Mono')", lineHeight: 1.5,
                    }}>
                      {truncated}
                    </pre>
                  )}
                  {isExpanded && !ds.available && (
                    <p style={{ marginTop: 8, fontSize: 11, color: "#606880" }}>
                      No data cached in KV for this source.
                    </p>
                  )}
                </div>
              );
            })}

            {/* Vars table + paste button */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(200,135,58,0.15)",
              borderRadius: 4,
              padding: "10px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
                  Resolved variables
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const v = inspectData.vars;
                    const block = [
                      "[USER CHART DATA]",
                      "",
                      "Human Design:",
                      `  Type: ${v.hd_type || "—"} | Strategy: ${v.hd_strategy || "—"} | Authority: ${v.hd_authority || "—"}`,
                      `  Profile: ${v.hd_profile || "—"} | Signature: ${v.hd_signature || "—"} | Not-Self: ${v.hd_not_self_theme || "—"}`,
                      `  Defined Centers: ${v.hd_defined_centers || "—"}`,
                      `  Undefined Centers: ${v.hd_undefined_centers || "—"}`,
                      `  Incarnation Cross: ${v.hd_incarnation_cross_type || "—"} — ${v.hd_incarnation_cross_gates || "—"}`,
                      "",
                      "Current Planetary Period:",
                      `  Mahadasha: ${v.current_mahadasha || "—"} | Antardasha: ${v.current_antardasha || "—"}`,
                      "",
                      `Today: ${v.today_date || "—"}`,
                      `User: ${v.user_email || "—"}`,
                    ].join("\n");
                    setUserPrompt((prev) => (prev ? prev + "\n\n" + block : block));
                  }}
                  style={{
                    background: "rgba(200,135,58,0.1)",
                    border: "1px solid rgba(200,135,58,0.3)",
                    borderRadius: 3,
                    color: "#c8873a",
                    fontSize: 10,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono, 'DM Mono')",
                    letterSpacing: "0.08em",
                  }}
                >
                  ↓ Paste into Prompt
                </button>
              </div>
              <div style={{ fontSize: 10, color: "#606880", marginBottom: 10, lineHeight: 1.4 }}>
                Click a {"{{token}}"} to append to the {varInsertTarget} prompt (set target under “Template variables” above).
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                {Object.entries(inspectData.vars).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const token = `{{${k}}}`;
                        if (varInsertTarget === "user") {
                          setUserPrompt((prev) => prev + token);
                        } else {
                          setSystemPrompt((prev) => prev + token);
                        }
                      }}
                      title={`Insert {{${k}}} into ${varInsertTarget} prompt`}
                      style={{
                        fontSize: 10,
                        color: "#6080c0",
                        fontFamily: "var(--font-mono, 'DM Mono')",
                        background: "rgba(96,128,192,0.12)",
                        border: "1px solid rgba(96,128,192,0.25)",
                        borderRadius: 3,
                        padding: "2px 6px",
                        cursor: "pointer",
                      }}
                    >
                      {`{{${k}}}`}
                    </button>
                    <span style={{ fontSize: 11, color: v ? "#f0dca0" : "#606880", wordBreak: "break-word" as const }}>
                      {v || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Test with Gemini ── */}
      <div>
        <button
          onClick={handleTest}
          disabled={!canTest || testing}
          style={canTest && !testing ? primaryButtonStyle : disabledButtonStyle}
        >
          {testing ? "Testing with Gemini…" : "Test with Gemini"}
        </button>
        {testError && (
          <p style={{ color: "#e05050", fontSize: 12, marginTop: 8 }}>{testError}</p>
        )}
      </div>

      {/* ── Test Output ── */}
      {testOutput && (
        <Card>
          <SectionLabel>Test Output — {sectionTitle || "Custom Section"}</SectionLabel>
          <pre style={{
            fontSize: 13, color: "#f0dca0", lineHeight: 1.7, margin: "12px 0 0",
            whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
            fontFamily: "var(--font-body, 'Instrument Sans'), sans-serif",
          }}>
            {testOutput}
          </pre>

          {/* Collapsible composed prompt debug panel */}
          <div
            style={{ marginTop: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setExpandedComposed((v) => !v)}
          >
            <span style={{ fontSize: 10, color: "#606880", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              Composed Prompt
            </span>
            <span style={{ color: "#606880", fontSize: 11 }}>{expandedComposed ? "▲" : "▼"}</span>
          </div>
          {expandedComposed && (
            <pre style={{
              marginTop: 8, fontSize: 11, color: "#8090b0",
              background: "rgba(0,0,0,0.15)", borderRadius: 3, padding: "10px 12px",
              whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
              fontFamily: "var(--font-mono, 'DM Mono')", lineHeight: 1.5,
            }}>
              {composedPrompt}
            </pre>
          )}
          {Object.keys(testVars).length > 0 && expandedComposed && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: "#606880", marginBottom: 6, letterSpacing: "0.08em" }}>INJECTED VARS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px" }}>
                {Object.entries(testVars).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <code style={{ fontSize: 10, color: "#6080c0", fontFamily: "var(--font-mono, 'DM Mono')" }}>{`{{${k}}}`}</code>
                    <span style={{ fontSize: 11, color: "#f0dca0" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── Save Report ── */}
      {testPassed && (
        <div>
          <button
            onClick={handleSave}
            style={primaryButtonStyle}
          >
            Save Report
          </button>
        </div>
      )}

      {/* ── Delivery ── */}
      {savedReport && (
        <Card>
          <SectionLabel>Report Ready</SectionLabel>
          <p style={{ fontSize: 12, color: "#a0a8c0", margin: "8px 0 16px" }}>
            Section "{savedReport.sections[0]?.label}" ready for delivery to{" "}
            <span style={{ color: "#e8b96a" }}>{savedReport.userEmail}</span>
          </p>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {(["preview", "email", "pdf"] as const).map((dm) => {
              const isPdf = dm === "pdf";
              return (
                <label
                  key={dm}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: isPdf ? "default" : "pointer",
                    opacity: isPdf ? 0.4 : 1,
                  }}
                >
                  <input
                    type="radio"
                    name="customDeliveryMode"
                    value={dm}
                    checked={deliveryMode === dm}
                    disabled={isPdf}
                    onChange={() => !isPdf && setDeliveryMode(dm)}
                    style={{ accentColor: "#e8b96a" }}
                  />
                  <span style={{ fontSize: 13, color: "#a0a8c0", textTransform: "capitalize" as const }}>
                    {dm === "pdf" ? "PDF" : dm.charAt(0).toUpperCase() + dm.slice(1)}
                  </span>
                  {isPdf && (
                    <span style={{
                      fontSize: 9, background: "#2e1f0f", color: "#c8873a",
                      padding: "1px 6px", borderRadius: 2, letterSpacing: "0.1em",
                    }}>
                      COMING SOON
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {deliveryMode === "email" && (
            <div>
              {sent ? (
                <span style={{ color: "#40c080", fontSize: 12 }}>✓ Sent to {savedReport.userEmail}</span>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  style={sending ? disabledButtonStyle : primaryButtonStyle}
                >
                  {sending ? "Sending…" : "Send to User"}
                </button>
              )}
              {sendError && (
                <p style={{ color: "#e05050", fontSize: 12, marginTop: 6 }}>{sendError}</p>
              )}
            </div>
          )}
          {deliveryMode === "preview" && (
            <p style={{ fontSize: 12, color: "#606880" }}>
              Preview mode — report generated above. Switch to Email to deliver.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(200,135,58,0.15)",
      borderRadius: 6,
      padding: "20px 24px",
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono, 'DM Mono')",
      fontSize: 11,
      color: "#c8873a",
      letterSpacing: "0.1em",
      marginBottom: 4,
      textTransform: "uppercase" as const,
    }}>
      {children}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(200,135,58,0.25)",
  borderRadius: 4,
  padding: "8px 12px",
  color: "#f0dca0",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  flex: 1,
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  marginTop: 10,
  background: "rgba(232,185,106,0.06)",
  border: "1px solid rgba(232,185,106,0.2)",
  borderRadius: 20,
  padding: "5px 14px",
  fontSize: 12,
};

const varCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  borderRadius: 4,
  padding: "12px 14px",
  userSelect: "none" as const,
};

const primaryButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #c8873a",
  color: "#c8873a",
  borderRadius: 3,
  padding: "10px 20px",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  fontFamily: "var(--font-mono, 'DM Mono')",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(200,135,58,0.3)",
  color: "#a0a8c0",
  borderRadius: 3,
  padding: "6px 12px",
  fontSize: 11,
  cursor: "pointer",
  fontFamily: "var(--font-mono, 'DM Mono')",
};

const disabledButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  opacity: 0.35,
  cursor: "default",
};

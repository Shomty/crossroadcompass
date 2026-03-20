"use client";
// STATUS: done | Task Admin-9

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface TemplateData {
  id: string;
  systemPrompt: string;
  userPromptTemplate: string;
  bannedPhrases: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  version: number;
}

interface HistoryEntry {
  id: string;
  version: number;
  savedAt: string;
  savedBy: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

interface Props {
  promptKey: string;
  initialTemplate: TemplateData;
  history: HistoryEntry[];
  variableNames: string[];
}

const SAMPLE_VALUES: Record<string, string> = {
  hdType: "Generator",
  strategy: "To Respond",
  authority: "Sacral",
  profile: "1/3",
  currentDasha: "Saturn Mahadasha",
  todayDate: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  userName: "Alex",
  weekStart: "Monday, March 17, 2026",
  monthName: "March 2026",
  definition: "Single Definition",
  channels: "Channel of Initiation (51-25)",
  intakeLifeSituation: "Career transition",
  intakePrimaryFocus: "Finding purpose",
  d1Houses: "Scorpio ascendant",
  d9Houses: "Venus in Pisces",
  d10Houses: "Jupiter in career house",
  d1Chart: "Scorpio ascendant, Saturn in 10th",
  d9Chart: "Navamsha Venus strong",
  d10Chart: "Dashamsha Jupiter prominent",
  definedCenters: "Sacral, Spleen",
};

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `[${key}]`);
}

export function PromptEditor({ promptKey, initialTemplate, history: initialHistory, variableNames }: Props) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [varInsertTarget, setVarInsertTarget] = useState<"system" | "user">("user");
  const [history, setHistory] = useState(initialHistory);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [preview, setPreview] = useState(() =>
    interpolate(initialTemplate.userPromptTemplate, Object.fromEntries(variableNames.map((k) => [k, SAMPLE_VALUES[k] ?? `[${k}]`])))
  );

  const updatePreview = useCallback((tmpl: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const vars = Object.fromEntries(variableNames.map((k) => [k, SAMPLE_VALUES[k] ?? `[${k}]`]));
      setPreview(interpolate(tmpl, vars));
    }, 300);
  }, [variableNames]);

  const handleUserTemplateChange = (val: string) => {
    setTemplate((prev) => ({ ...prev, userPromptTemplate: val }));
    updatePreview(val);
  };

  const validateBannedPhrases = (): string[] => {
    const banned = template.bannedPhrases.split(",").map((p) => p.trim()).filter(Boolean);
    return banned.filter((phrase) =>
      template.systemPrompt.toLowerCase().includes(phrase.toLowerCase()) ||
      template.userPromptTemplate.toLowerCase().includes(phrase.toLowerCase())
    );
  };

  const handleSave = async () => {
    const violations = validateBannedPhrases();
    if (violations.length > 0) {
      setError(`Banned phrases found in template: ${violations.join(", ")}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prompts/${encodeURIComponent(promptKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setTemplate((prev) => ({ ...prev, version: data.template.version }));
      setHistory((prev) => [{
        id: Date.now().toString(),
        version: data.template.version,
        savedAt: new Date().toISOString(),
        savedBy: "you",
        systemPrompt: template.systemPrompt,
        userPromptTemplate: template.userPromptTemplate,
      }, ...prev]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestOutput(null);
    try {
      const res = await fetch(`/api/admin/prompts/${encodeURIComponent(promptKey)}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: template.systemPrompt,
          userPromptTemplate: template.userPromptTemplate,
          temperature: template.temperature,
          maxTokens: template.maxTokens,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Test failed");
      setTestOutput(data.output ?? "No output");
      setShowTestModal(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setTesting(false);
    }
  };

  const insertVariableIntoTemplate = (name: string) => {
    const token = `{{${name}}}`;
    if (varInsertTarget === "user") {
      const next = template.userPromptTemplate + token;
      setTemplate((prev) => ({ ...prev, userPromptTemplate: next }));
      updatePreview(next);
    } else {
      setTemplate((prev) => ({ ...prev, systemPrompt: prev.systemPrompt + token }));
    }
  };

  const handleRollback = async (version: number) => {
    if (!confirm(`Rollback to version ${version}?`)) return;
    try {
      const res = await fetch(`/api/admin/prompts/${encodeURIComponent(promptKey)}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rollback failed");
      router.refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(13,18,32,0.7)",
    border: "1px solid rgba(200,135,58,0.2)",
    borderRadius: 6,
    color: "#c8d0e8",
    fontFamily: "var(--font-mono, 'DM Mono')",
    fontSize: 12,
    lineHeight: 1.6,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontFamily: "var(--font-mono, 'DM Mono')",
    fontSize: 10,
    color: "#c8873a",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
    display: "block",
  };

  return (
    <div>
      {/* Two-panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Left: edit panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>System Prompt</label>
            <textarea
              value={template.systemPrompt}
              onChange={(e) => setTemplate((prev) => ({ ...prev, systemPrompt: e.target.value }))}
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={labelStyle}>User Prompt Template</label>
            <textarea
              value={template.userPromptTemplate}
              onChange={(e) => handleUserTemplateChange(e.target.value)}
              rows={12}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Banned Phrases (comma-separated)</label>
            <input
              type="text"
              value={template.bannedPhrases}
              onChange={(e) => setTemplate((prev) => ({ ...prev, bannedPhrases: e.target.value }))}
              placeholder="you will, guaranteed, definitely..."
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Max Tokens</label>
              <input
                type="number"
                value={template.maxTokens}
                onChange={(e) => setTemplate((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 800 }))}
                min={100}
                max={8000}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Temperature: {template.temperature.toFixed(2)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={template.temperature}
                onChange={(e) => setTemplate((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                style={{ width: "100%", accentColor: "#c8873a" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Active</label>
            <input
              type="checkbox"
              checked={template.isActive}
              onChange={(e) => setTemplate((prev) => ({ ...prev, isActive: e.target.checked }))}
              style={{ accentColor: "#c8873a", width: 16, height: 16 }}
            />
          </div>

          {error && (
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#E8705A", padding: "8px 12px", background: "rgba(232,112,90,0.1)", borderRadius: 6, border: "1px solid rgba(232,112,90,0.3)" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#80D4A0", padding: "8px 12px", background: "rgba(128,212,160,0.1)", borderRadius: 6, border: "1px solid rgba(128,212,160,0.3)" }}>
              Saved successfully · v{template.version}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 12,
                padding: "10px 20px",
                background: "rgba(200,135,58,0.2)",
                border: "1px solid rgba(200,135,58,0.5)",
                borderRadius: 6,
                color: "#e8b96a",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 12,
                padding: "10px 20px",
                background: "rgba(28,35,64,0.8)",
                border: "1px solid rgba(200,135,58,0.2)",
                borderRadius: 6,
                color: "#a0a8c0",
                cursor: testing ? "not-allowed" : "pointer",
                opacity: testing ? 0.6 : 1,
              }}
            >
              {testing ? "Running..." : "Run Test"}
            </button>
          </div>
        </div>

        {/* Right: preview panel */}
        <div>
          <div style={{
            background: "rgba(28,35,64,0.5)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 8,
            padding: 16,
            position: "sticky",
            top: 20,
          }}>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>
              VARIABLES — click to append to prompt
            </div>

            {variableNames.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginBottom: 10,
                    fontSize: 11,
                    color: "#a0a8c0",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#606880" }}>Insert into:</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="promptVarTarget"
                      checked={varInsertTarget === "user"}
                      onChange={() => setVarInsertTarget("user")}
                    />
                    User template
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="promptVarTarget"
                      checked={varInsertTarget === "system"}
                      onChange={() => setVarInsertTarget("system")}
                    />
                    System prompt
                  </label>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {variableNames.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariableIntoTemplate(v)}
                      title={`Append {{${v}}} to ${varInsertTarget} prompt`}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        textAlign: "left",
                        fontFamily: "var(--font-mono, 'DM Mono')",
                        fontSize: 10,
                        color: "#404860",
                        background: "rgba(200,135,58,0.06)",
                        border: "1px solid rgba(200,135,58,0.15)",
                        borderRadius: 4,
                        padding: "6px 8px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ color: "#c8873a", flexShrink: 0 }}>{`{{${v}}}`}</span>
                      <span style={{ color: "#606880", overflow: "hidden", textOverflow: "ellipsis" }}>
                        = &quot;{SAMPLE_VALUES[v] ?? `[${v}]`}&quot;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 11,
              color: "#8090b0",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 12,
              maxHeight: 400,
              overflowY: "auto",
            }}>
              {preview}
            </div>
          </div>
        </div>
      </div>

      {/* Version history */}
      {history.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.15em", marginBottom: 12 }}>
            VERSION HISTORY
          </div>
          <div style={{
            background: "rgba(28,35,64,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            {history.map((h, i) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  gap: 16,
                }}
              >
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#e8b96a", width: 40 }}>v{h.version}</span>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", flex: 1 }}>
                  {new Date(h.savedAt).toLocaleString()} by {h.savedBy}
                </span>
                {h.version !== template.version && (
                  <button
                    onClick={() => handleRollback(h.version)}
                    style={{
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 10,
                      color: "#a0a8c0",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 4,
                      padding: "3px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Rollback
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test output modal */}
      {showTestModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowTestModal(false)}
        >
          <div
            style={{
              background: "#0d1220",
              border: "1px solid rgba(200,135,58,0.3)",
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 16 }}>
              TEST OUTPUT (sample data)
            </div>
            <pre style={{
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 12,
              color: "#c8d0e8",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              margin: 0,
            }}>
              {testOutput}
            </pre>
            <button
              onClick={() => setShowTestModal(false)}
              style={{
                marginTop: 20,
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 11,
                padding: "8px 16px",
                background: "rgba(200,135,58,0.1)",
                border: "1px solid rgba(200,135,58,0.3)",
                borderRadius: 6,
                color: "#e8b96a",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

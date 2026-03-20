"use client";
// STATUS: done | Admin report catalog

import React, { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReportCategory } from "@/types";
import { REPORT_TEMPLATE_VARIABLE_KEYS } from "@/lib/reports/reportTemplateVariableKeys";

const CATEGORIES: ReportCategory[] = [
  "LIFE_PURPOSE",
  "CAREER",
  "RELATIONSHIPS",
  "SHADOW_WORK",
  "TIMING",
  "HEALTH",
  "FINANCE",
  "CUSTOM",
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono, 'DM Mono')",
  fontSize: 10,
  color: "#c8873a",
  letterSpacing: "0.12em",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(200,135,58,0.25)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#e8e0d0",
  fontFamily: "var(--font-body, 'Instrument Sans')",
  fontSize: 14,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
};

export type ReportProductFormInitial = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: ReportCategory;
  priceUsd: number;
  isActive: boolean;
  sortOrder: number;
  coverImageUrl: string;
  geminiPrompt: string;
  estimatedWordCount: number;
};

const DEFAULT_INITIAL: ReportProductFormInitial = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  category: "CUSTOM",
  priceUsd: 4900,
  isActive: true,
  sortOrder: 0,
  coverImageUrl: "",
  geminiPrompt: `You are a deeply skilled Vedic astrologer and Human Design analyst.

The user is a {{hd_type}} with {{hd_authority}} Authority and a {{hd_profile}} profile.
Their Vedic Lagna is {{lagna}}, Moon Sign is in {{moon_sign}}, and they are currently in their {{current_dasha}} Mahadasha period.

Write a comprehensive, warm report for {{user_name}}.

Use markdown headings. Never say "you will". Use "you may notice", "this pattern tends to".
Aim for clear, personalized sections.`,
  estimatedWordCount: 2000,
};

function dollarsFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function centsFromDollars(d: string): number {
  const n = Number.parseFloat(d);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

interface TestUser {
  id: string;
  email: string;
  tier?: string;
}

export default function ReportProductForm({
  mode,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<ReportProductFormInitial>;
}) {
  const router = useRouter();
  const base = { ...DEFAULT_INITIAL, ...initial };

  const [slug, setSlug] = useState(base.slug);
  const [title, setTitle] = useState(base.title);
  const [subtitle, setSubtitle] = useState(base.subtitle);
  const [description, setDescription] = useState(base.description);
  const [category, setCategory] = useState<ReportCategory>(base.category);
  const [priceDollars, setPriceDollars] = useState(dollarsFromCents(base.priceUsd));
  const [isActive, setIsActive] = useState(base.isActive);
  const [sortOrder, setSortOrder] = useState(String(base.sortOrder));
  const [coverImageUrl, setCoverImageUrl] = useState(base.coverImageUrl);
  const [geminiPrompt, setGeminiPromptRaw] = useState(base.geminiPrompt);
  const geminiPromptRef = useRef<HTMLTextAreaElement>(null);
  const geminiCaretRef = useRef<{ start: number; end: number }>({
    start: base.geminiPrompt.length,
    end: base.geminiPrompt.length,
  });

  const setGeminiPrompt = (v: string) => {
    setGeminiPromptRaw(v);
    setPassedFingerprint(null);
  };

  const syncGeminiCaretFromEl = () => {
    const el = geminiPromptRef.current;
    if (!el) return;
    geminiCaretRef.current = {
      start: el.selectionStart,
      end: el.selectionEnd,
    };
  };

  /** Insert {{key}} at the last known selection (caret chips steal focus; ref is updated on blur/select/key). */
  const insertGeminiVariable = (varKey: string) => {
    const token = `{{${varKey}}}`;
    let { start, end } = geminiCaretRef.current;
    const len = geminiPrompt.length;
    start = Math.max(0, Math.min(start, len));
    end = Math.max(0, Math.min(end, len));
    const next = geminiPrompt.slice(0, start) + token + geminiPrompt.slice(end);
    const caret = start + token.length;
    geminiCaretRef.current = { start: caret, end: caret };
    flushSync(() => {
      setGeminiPrompt(next);
    });
    requestAnimationFrame(() => {
      const ta = geminiPromptRef.current;
      if (!ta) return;
      ta.focus();
      try {
        ta.setSelectionRange(caret, caret);
      } catch {
        /* ignore */
      }
    });
  };

  const [estimatedWordCount, setEstimatedWordCount] = useState(
    String(base.estimatedWordCount)
  );

  const [testUserSearch, setTestUserSearch] = useState("");
  const [testUserSearchLoading, setTestUserSearchLoading] = useState(false);
  const [testUserSearchErr, setTestUserSearchErr] = useState("");
  const [testUser, setTestUser] = useState<TestUser | null>(null);

  const [testingReport, setTestingReport] = useState(false);
  const [testReportErr, setTestReportErr] = useState("");
  const [testReportPreview, setTestReportPreview] = useState("");
  const [testReportMeta, setTestReportMeta] = useState<{
    wordCount: number;
    durationMs: number;
    model: string;
    truncated?: boolean;
  } | null>(null);
  const [passedFingerprint, setPassedFingerprint] = useState<string | null>(
    null
  );

  const promptFingerprint = useMemo(
    () =>
      `${testUser?.id ?? ""}\n${geminiPrompt.trim()}`,
    [testUser?.id, geminiPrompt]
  );

  const canSave =
    !!testUser &&
    passedFingerprint !== null &&
    passedFingerprint === promptFingerprint &&
    geminiPrompt.trim().length > 0;

  async function findTestUser() {
    if (!testUserSearch.trim()) return;
    setTestUserSearchLoading(true);
    setTestUserSearchErr("");
    setTestUser(null);
    setPassedFingerprint(null);
    setTestReportPreview("");
    setTestReportMeta(null);
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(testUserSearch.trim())}`
      );
      const data = (await res.json()) as { items?: TestUser[] };
      const users = data.items ?? [];
      if (users.length === 0) {
        setTestUserSearchErr("No user found for that email.");
      } else {
        setTestUser({
          id: users[0].id,
          email: users[0].email ?? "",
          tier: users[0].tier,
        });
      }
    } catch {
      setTestUserSearchErr("Search failed.");
    } finally {
      setTestUserSearchLoading(false);
    }
  }

  async function handleTestReportGeneration() {
    if (!testUser || !geminiPrompt.trim()) return;
    setTestingReport(true);
    setTestReportErr("");
    setTestReportPreview("");
    setTestReportMeta(null);
    setPassedFingerprint(null);
    try {
      const res = await fetch("/api/admin/report-products/test-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: testUser.id,
          geminiPrompt: geminiPrompt.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        hint?: string;
        preview?: string;
        wordCount?: number;
        durationMs?: number;
        model?: string;
        truncated?: boolean;
      };
      if (!res.ok) {
        const parts = [data.error ?? "Test failed.", data.hint].filter(Boolean);
        setTestReportErr(parts.join("\n\n"));
        return;
      }
      setTestReportPreview(data.preview ?? "");
      setTestReportMeta({
        wordCount: data.wordCount ?? 0,
        durationMs: data.durationMs ?? 0,
        model: data.model ?? "",
        truncated: data.truncated === true,
      });
      setPassedFingerprint(
        `${testUser.id}\n${geminiPrompt.trim()}`
      );
    } catch {
      setTestReportErr("Network error during test.");
    } finally {
      setTestingReport(false);
    }
  }

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!canSave) {
      setErr(
        "Run “Test report generation” successfully for a sample user before saving. Change the prompt or user? Run the test again."
      );
      return;
    }

    setSaving(true);

    const sortN = Number.parseInt(sortOrder, 10);
    const wordsN = Number.parseInt(estimatedWordCount, 10);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() ? subtitle.trim() : null,
      description: description.trim(),
      category,
      priceUsd: centsFromDollars(priceDollars),
      isActive,
      sortOrder: Number.isNaN(sortN) ? 0 : sortN,
      coverImageUrl: coverImageUrl.trim() ? coverImageUrl.trim() : null,
      geminiPrompt: geminiPrompt.trim(),
      estimatedWordCount: Number.isNaN(wordsN) ? 2000 : wordsN,
    };

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/report-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { error?: string; details?: unknown };
        if (!res.ok) {
          setErr(data.error ?? "Save failed");
          setSaving(false);
          return;
        }
        router.push("/admin/report-products");
        router.refresh();
        return;
      }

      if (!productId) {
        setErr("Missing product id");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/report-products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Update failed");
        setSaving(false);
        return;
      }
      router.push("/admin/report-products");
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Link
          href="/admin/report-products"
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            color: "#6080c0",
            textDecoration: "none",
          }}
        >
          ← Back to catalog
        </Link>
      </div>

      {err && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            background: "rgba(180,40,40,0.15)",
            border: "1px solid rgba(255,100,100,0.35)",
            color: "#ffb0b0",
            fontSize: 13,
          }}
        >
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={sectionStyle}>
          <label style={labelStyle}>SLUG (URL)</label>
          <input
            style={inputStyle}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="shadow-work-deep-dive"
            required
          />
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#606880" }}>
            Lowercase, digits, hyphens only. Must stay unique.
          </p>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>CATEGORY</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.split("_").join(" ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>TITLE</label>
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>SUBTITLE (OPTIONAL)</label>
        <input
          style={inputStyle}
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          maxLength={300}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>DESCRIPTION (MARKETPLACE CARD)</label>
        <textarea
          style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <div style={sectionStyle}>
          <label style={labelStyle}>PRICE (USD)</label>
          <input
            style={inputStyle}
            type="number"
            min={0}
            step={0.01}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            required
          />
        </div>
        <div style={sectionStyle}>
          <label style={labelStyle}>SORT ORDER</label>
          <input
            style={inputStyle}
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
        <div style={{ ...sectionStyle, display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontFamily: "var(--font-body, 'Instrument Sans')",
              fontSize: 14,
              color: "#a0a8c0",
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active (visible on /reports)
          </label>
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>COVER IMAGE URL (OPTIONAL)</label>
        <input
          style={inputStyle}
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://"
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>ESTIMATED WORD COUNT</label>
        <input
          style={inputStyle}
          type="number"
          min={100}
          value={estimatedWordCount}
          onChange={(e) => setEstimatedWordCount(e.target.value)}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>GEMINI SYSTEM PROMPT</label>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#606880" }}>
          Place the cursor (or select text) where you want a token, then click a variable below.
          Insertion uses that position even though the chip briefly moves focus — values are filled when
          the report runs.
        </p>
        <textarea
          ref={geminiPromptRef}
          style={{ ...inputStyle, minHeight: 280, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
          value={geminiPrompt}
          onChange={(e) => {
            const v = e.target.value;
            setGeminiPrompt(v);
            const el = e.target;
            geminiCaretRef.current = {
              start: Math.min(el.selectionStart, v.length),
              end: Math.min(el.selectionEnd, v.length),
            };
          }}
          onSelect={syncGeminiCaretFromEl}
          onKeyUp={syncGeminiCaretFromEl}
          onClick={syncGeminiCaretFromEl}
          onBlur={syncGeminiCaretFromEl}
          required
        />
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            border: "1px solid rgba(200,135,58,0.2)",
            background: "rgba(200,135,58,0.04)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 10,
              color: "#c8873a",
              letterSpacing: "0.12em",
              marginBottom: 10,
            }}
          >
            CLICK TO ADD TO GEMINI SYSTEM PROMPT
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {REPORT_TEMPLATE_VARIABLE_KEYS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertGeminiVariable(v)}
                title={`Insert {{${v}}} into Gemini system prompt`}
                style={{
                  background: "rgba(200,135,58,0.14)",
                  border: "1px solid rgba(200,135,58,0.35)",
                  borderRadius: 6,
                  color: "#e8c078",
                  fontSize: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono, 'DM Mono')",
                }}
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          ...sectionStyle,
          padding: 20,
          borderRadius: 12,
          border: "1px solid rgba(96,128,192,0.3)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <label style={labelStyle}>PRE-SAVE: TEST WITH REAL USER DATA</label>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#606880" }}>
          Uses the same pipeline as live report generation: interpolate placeholders, then Gemini with
          full chart context. You must get a successful test for the current prompt + user before save is
          enabled.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ ...inputStyle, flex: "1 1 220px", minWidth: 180 }}
            placeholder="User email (partial match)"
            value={testUserSearch}
            onChange={(e) => setTestUserSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void findTestUser();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void findTestUser()}
            disabled={testUserSearchLoading}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(96,128,192,0.35)",
              background: "rgba(96,128,192,0.12)",
              color: "#8ec0ff",
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 11,
              cursor: testUserSearchLoading ? "wait" : "pointer",
            }}
          >
            {testUserSearchLoading ? "…" : "FIND USER"}
          </button>
        </div>
        {testUserSearchErr && (
          <p style={{ color: "#e09090", fontSize: 12, marginTop: 8 }}>{testUserSearchErr}</p>
        )}
        {testUser && (
          <p style={{ marginTop: 10, fontSize: 13, color: "#a0dcc0" }}>
            Sample user: <strong>{testUser.email}</strong>
            {testUser.tier ? ` · ${testUser.tier}` : ""}
          </p>
        )}
        <button
          type="button"
          onClick={handleTestReportGeneration}
          disabled={testingReport || !testUser || !geminiPrompt.trim()}
          style={{
            marginTop: 14,
            padding: "12px 20px",
            borderRadius: 8,
            border: "1px solid rgba(110,201,138,0.45)",
            background:
              testingReport || !testUser || !geminiPrompt.trim()
                ? "rgba(255,255,255,0.04)"
                : "rgba(110,201,138,0.12)",
            color: "#6ec98a",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            letterSpacing: "0.08em",
            cursor:
              testingReport || !testUser || !geminiPrompt.trim()
                ? "not-allowed"
                : "pointer",
          }}
        >
          {testingReport ? "RUNNING GEMINI TEST…" : "TEST REPORT GENERATION"}
        </button>
        {testReportErr && (
          <p
            style={{
              color: "#e09090",
              fontSize: 13,
              marginTop: 12,
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
            }}
          >
            {testReportErr}
          </p>
        )}
        {testReportMeta && (
          <p style={{ fontSize: 11, color: "#606880", marginTop: 8, fontFamily: "var(--font-mono, 'DM Mono')" }}>
            {testReportMeta.model} · {testReportMeta.wordCount} words · {testReportMeta.durationMs}ms
            {testReportMeta.truncated ? " · context truncated for test" : ""}
          </p>
        )}
        {testReportPreview && (
          <div
            style={{
              marginTop: 10,
              maxHeight: 200,
              overflowY: "auto",
              padding: 12,
              borderRadius: 8,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 12,
              color: "#c8c0b0",
              whiteSpace: "pre-wrap",
            }}
          >
            {testReportPreview}
          </div>
        )}
        {canSave ? (
          <p style={{ marginTop: 14, fontSize: 12, color: "#6ec98a" }}>
            ✓ Test passed for this prompt and user — you can save.
          </p>
        ) : (
          <p style={{ marginTop: 14, fontSize: 12, color: "#a08060" }}>
            Save is locked until “Test report generation” succeeds for the current Gemini prompt and sample
            user.
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={saving || !canSave}
          style={{
            padding: "12px 24px",
            borderRadius: 8,
            border: "1px solid rgba(200,135,58,0.45)",
            background:
              saving || !canSave ? "rgba(255,255,255,0.04)" : "rgba(200,135,58,0.2)",
            color: saving || !canSave ? "rgba(232,185,106,0.4)" : "#e8b96a",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            letterSpacing: "0.08em",
            cursor: saving ? "wait" : !canSave ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "SAVING…" : mode === "create" ? "CREATE PRODUCT" : "SAVE CHANGES"}
        </button>
        <Link
          href="/admin/report-products"
          style={{
            padding: "12px 24px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#8088a0",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            textDecoration: "none",
            alignSelf: "center",
          }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

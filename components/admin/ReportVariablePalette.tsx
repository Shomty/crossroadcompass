"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { ReportTemplateVariableKey } from "@/lib/reports/reportTemplateVariableKeys";
import {
  REPORT_TEMPLATE_VARIABLE_KEYS,
  groupKeysForPalette,
  getVariablePaletteMeta,
} from "@/lib/reports/reportVariableMetadata";

const chipStyle: CSSProperties = {
  background: "rgba(200,135,58,0.14)",
  border: "1px solid rgba(200,135,58,0.35)",
  borderRadius: 6,
  color: "#e8c078",
  fontSize: 10,
  padding: "6px 10px",
  cursor: "pointer",
  fontFamily: "var(--font-mono, 'DM Mono')",
  textAlign: "left",
};

export function ReportVariablePalette({
  onInsert,
}: {
  onInsert: (key: ReportTemplateVariableKey) => void;
}) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(
    () => groupKeysForPalette(REPORT_TEMPLATE_VARIABLE_KEYS, search),
    [search]
  );

  return (
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
        VARIABLE PALETTE — SEARCH & CLICK TO INSERT
      </div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by name (e.g. Gulika, Prāṇapada, AK, GL)…"
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(200,135,58,0.25)",
          background: "rgba(0,0,0,0.35)",
          color: "#e8e0d0",
          fontFamily: "var(--font-body, 'Instrument Sans')",
          fontSize: 13,
        }}
      />
      <div
        style={{
          maxHeight: 420,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {grouped.map(({ group, keys }) => (
          <section key={group}>
            <div
              style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 9,
                color: "#8088a8",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              {group.toUpperCase()} ({keys.length})
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {keys.map((k) => {
                const { label } = getVariablePaletteMeta(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onInsert(k)}
                    title={label}
                    style={chipStyle}
                  >
                    <div>{`{{${k}}}`}</div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#7080a0",
                        marginTop: 4,
                        maxWidth: 200,
                        whiteSpace: "normal",
                        fontFamily: "var(--font-body, 'Instrument Sans')",
                        lineHeight: 1.25,
                      }}
                    >
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

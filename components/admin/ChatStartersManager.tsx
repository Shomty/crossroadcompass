"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  label: string;
  message: string;
  sortOrder: number;
  enabled: boolean;
};

export function ChatStartersManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    setRows(initial);
  }, [initial]);
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    router.refresh();
  };

  const handleAdd = async () => {
    setError(null);
    const m = message.trim();
    if (!m) {
      setError("Message is required.");
      return;
    }
    const r = await fetch("/api/admin/chat-starters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim(), message: m }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(typeof j.error === "string" ? j.error : "Save failed");
      return;
    }
    if (j.starter) setRows((prev) => [...prev, j.starter]);
    setLabel("");
    setMessage("");
    refresh();
  };

  const patch = async (id: string, patchBody: Partial<Row>) => {
    setBusyId(id);
    setError(null);
    const r = await fetch(`/api/admin/chat-starters/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    const j = await r.json();
    setBusyId(null);
    if (!r.ok) {
      setError(typeof j.error === "string" ? j.error : "Update failed");
      return;
    }
    if (j.starter) {
      setRows((prev) => prev.map((x) => (x.id === id ? j.starter : x)));
    }
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this starter?")) return;
    setBusyId(id);
    setError(null);
    const r = await fetch(`/api/admin/chat-starters/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!r.ok) {
      setError("Delete failed");
      return;
    }
    setRows((prev) => prev.filter((x) => x.id !== id));
    refresh();
  };

  return (
    <div>
      {error ? (
        <p
          style={{
            color: "#e07060",
            fontFamily: "var(--font-body, 'Instrument Sans')",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      ) : null}

      <div
        style={{
          overflowX: "auto",
          border: "1px solid rgba(200,135,58,0.2)",
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            color: "#a0a8c0",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(200,135,58,0.2)" }}>
              <th style={{ textAlign: "left", padding: 10 }}>Order</th>
              <th style={{ textAlign: "left", padding: 10 }}>Label</th>
              <th style={{ textAlign: "left", padding: 10 }}>Message</th>
              <th style={{ textAlign: "left", padding: 10 }}>On</th>
              <th style={{ padding: 10 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: 10, verticalAlign: "top" }}>
                  <input
                    type="number"
                    defaultValue={row.sortOrder}
                    style={{
                      width: 56,
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(200,135,58,0.25)",
                      color: "#e8d4a8",
                      borderRadius: 6,
                      padding: "4px 6px",
                    }}
                    onBlur={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (Number.isNaN(n) || n === row.sortOrder) return;
                      void patch(row.id, { sortOrder: n });
                    }}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: "top", maxWidth: 160 }}>
                  <textarea
                    defaultValue={row.label}
                    rows={2}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(200,135,58,0.25)",
                      color: "#e8d4a8",
                      borderRadius: 6,
                      padding: 6,
                      fontSize: 11,
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v === row.label) return;
                      void patch(row.id, { label: v });
                    }}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: "top", minWidth: 220 }}>
                  <textarea
                    defaultValue={row.message}
                    rows={3}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(200,135,58,0.25)",
                      color: "#e8d4a8",
                      borderRadius: 6,
                      padding: 6,
                      fontSize: 11,
                    }}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (!v || v === row.message) return;
                      void patch(row.id, { message: v });
                    }}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: "top" }}>
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    disabled={busyId === row.id}
                    onChange={(e) => {
                      void patch(row.id, { enabled: e.target.checked });
                    }}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: "top" }}>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => { void remove(row.id); }}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(200,80,60,0.4)",
                      color: "#c87060",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          border: "1px solid rgba(200,135,58,0.2)",
          borderRadius: 12,
          padding: 16,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            color: "#c8873a",
            letterSpacing: "0.08em",
          }}
        >
          ADD STARTER
        </p>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-body, 'Instrument Sans')",
            fontSize: 12,
            color: "#8088a0",
            marginBottom: 4,
          }}
        >
          Label (optional — shown on button; falls back to message)
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            marginBottom: 12,
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(200,135,58,0.25)",
            color: "#e8d4a8",
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 13,
          }}
        />
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-body, 'Instrument Sans')",
            fontSize: 12,
            color: "#8088a0",
            marginBottom: 4,
          }}
        >
          Message (sent to the model when the user taps the starter)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            maxWidth: 560,
            marginBottom: 12,
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(200,135,58,0.25)",
            color: "#e8d4a8",
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 13,
          }}
        />
        <button
          type="button"
          onClick={() => { void handleAdd(); }}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid rgba(200,135,58,0.45)",
            background: "rgba(200,135,58,0.15)",
            color: "#e8b96a",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          CREATE
        </button>
      </div>
    </div>
  );
}

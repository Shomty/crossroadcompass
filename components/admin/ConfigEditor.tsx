"use client";
// STATUS: done | Task Admin-12

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FlagItem { key: string; value: boolean }
interface ConfigItem { key: string; value: string }

interface Props {
  flags: FlagItem[];
  configs: ConfigItem[];
}

export function ConfigEditor({ flags: initialFlags, configs: initialConfigs }: Props) {
  const router = useRouter();
  const [flags, setFlags] = useState(initialFlags);
  const [configs, setConfigs] = useState(initialConfigs);
  const [pendingFlag, setPendingFlag] = useState<{ key: string; newValue: boolean } | null>(null);
  const [pendingConfig, setPendingConfig] = useState<{ key: string; newValue: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const saveFlag = async (key: string, value: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Save failed");
      setFlags((prev) => prev.map((f) => f.key === key ? { ...f, value } : f));
      setPendingFlag(null);
      setMessage({ type: "success", text: `${key} set to ${value}` });
      setTimeout(() => { setMessage(null); router.refresh(); }, 2000);
    } catch {
      setMessage({ type: "error", text: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const saveConfig = async (key: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Save failed");
      setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, value } : c));
      setPendingConfig(null);
      setMessage({ type: "success", text: `${key} updated` });
      setTimeout(() => { setMessage(null); router.refresh(); }, 2000);
    } catch {
      setMessage({ type: "error", text: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const sectionLabel = (text: string) => (
    <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 12 }}>
      {text}
    </div>
  );

  return (
    <div>
      {message && (
        <div style={{
          marginBottom: 16,
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 11,
          color: message.type === "success" ? "#80D4A0" : "#E8705A",
          padding: "8px 12px",
          background: message.type === "success" ? "rgba(128,212,160,0.08)" : "rgba(232,112,90,0.08)",
          borderRadius: 6,
          border: `1px solid ${message.type === "success" ? "rgba(128,212,160,0.3)" : "rgba(232,112,90,0.3)"}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Feature Flags */}
      <div style={{ marginBottom: 32 }}>
        {sectionLabel("Feature Flags")}
        <div style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          {flags.map((flag, i) => {
            const pending = pendingFlag?.key === flag.key ? pendingFlag.newValue : null;
            const displayValue = pending !== null ? pending : flag.value;

            return (
              <div key={flag.key} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                gap: 16,
              }}>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#c8d0e8", flex: 1 }}>{flag.key}</span>

                {pending !== null ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#c8873a" }}>
                      {flag.value ? "true" : "false"} → {pending ? "true" : "false"}
                    </span>
                    <button
                      onClick={() => saveFlag(flag.key, pending)}
                      disabled={saving}
                      style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, padding: "4px 12px", background: "rgba(200,135,58,0.2)", border: "1px solid rgba(200,135,58,0.5)", borderRadius: 4, color: "#e8b96a", cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setPendingFlag(null)}
                      style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, padding: "4px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "#606880", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingFlag({ key: flag.key, newValue: !displayValue })}
                    style={{
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 11,
                      padding: "4px 12px",
                      background: displayValue ? "rgba(128,212,160,0.12)" : "rgba(232,112,90,0.08)",
                      border: `1px solid ${displayValue ? "rgba(128,212,160,0.3)" : "rgba(232,112,90,0.3)"}`,
                      borderRadius: 4,
                      color: displayValue ? "#80D4A0" : "#E8705A",
                      cursor: "pointer",
                      minWidth: 60,
                    }}
                  >
                    {displayValue ? "ON" : "OFF"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Config */}
      <div>
        {sectionLabel("System Config")}
        <div style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          {configs.map((cfg, i) => {
            const isPending = pendingConfig?.key === cfg.key;

            return (
              <div key={cfg.key} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                gap: 16,
              }}>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#c8d0e8", flex: 1 }}>{cfg.key}</span>

                {isPending ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={pendingConfig!.newValue}
                      onChange={(e) => setPendingConfig({ key: cfg.key, newValue: e.target.value })}
                      style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(200,135,58,0.3)", borderRadius: 4, color: "#c8d0e8", padding: "4px 8px", fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, width: 100, outline: "none" }}
                    />
                    <button
                      onClick={() => saveConfig(cfg.key, pendingConfig!.newValue)}
                      disabled={saving}
                      style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, padding: "4px 12px", background: "rgba(200,135,58,0.2)", border: "1px solid rgba(200,135,58,0.5)", borderRadius: 4, color: "#e8b96a", cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setPendingConfig(null)}
                      style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, padding: "4px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "#606880", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingConfig({ key: cfg.key, newValue: cfg.value })}
                    style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#e8b96a", background: "transparent", border: "1px solid rgba(232,185,106,0.2)", borderRadius: 4, padding: "4px 12px", cursor: "pointer" }}
                  >
                    {cfg.value}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

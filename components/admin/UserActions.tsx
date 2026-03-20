"use client";
// STATUS: done | Task Admin-10

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userEmail: string;
  currentTier: string;
}

export function UserActions({ userId, userEmail, currentTier }: Props) {
  const router = useRouter();
  const [tierModal, setTierModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [tierReason, setTierReason] = useState("");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInvalidateCache = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/invalidate-cache`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setMessage({ type: "success", text: "Chart cache invalidated" });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Cache invalidation failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, reason: tierReason }),
      });
      if (!res.ok) throw new Error("Failed");
      setTierModal(false);
      setMessage({ type: "success", text: `Tier changed to ${selectedTier}` });
      setTimeout(() => { setMessage(null); router.refresh(); }, 2000);
    } catch {
      setMessage({ type: "error", text: "Tier change failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerInsight = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/trigger-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DAILY" }),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage({ type: "success", text: "Daily insight triggered" });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Insight trigger failed" });
    } finally {
      setLoading(false);
    }
  };

  const btnStyle = {
    fontFamily: "var(--font-mono, 'DM Mono')",
    fontSize: 11,
    padding: "8px 14px",
    background: "rgba(28,35,64,0.8)",
    border: "1px solid rgba(200,135,58,0.2)",
    borderRadius: 6,
    color: "#a0a8c0",
    cursor: "pointer" as const,
  };

  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>ACTIONS</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{ ...btnStyle, color: "#e8b96a", borderColor: "rgba(232,185,106,0.3)" }} onClick={() => setTierModal(true)}>
          Change Tier
        </button>
        <button style={btnStyle} onClick={handleInvalidateCache} disabled={loading}>
          Invalidate Cache
        </button>
        <button style={btnStyle} onClick={handleTriggerInsight} disabled={loading}>
          Trigger Insight
        </button>
        <button style={{ ...btnStyle, color: "#E8705A", borderColor: "rgba(232,112,90,0.3)" }} onClick={() => setDeleteModal(true)}>
          Delete User
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: 10,
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 11,
          color: message.type === "success" ? "#80D4A0" : "#E8705A",
          padding: "6px 12px",
          background: message.type === "success" ? "rgba(128,212,160,0.08)" : "rgba(232,112,90,0.08)",
          borderRadius: 6,
          border: `1px solid ${message.type === "success" ? "rgba(128,212,160,0.3)" : "rgba(232,112,90,0.3)"}`,
          display: "inline-block",
        }}>
          {message.text}
        </div>
      )}

      {/* Tier Modal */}
      {tierModal && (
        <Modal onClose={() => setTierModal(false)}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#c8873a", marginBottom: 16, letterSpacing: "0.1em" }}>
            CHANGE TIER
          </div>
          <div style={{ marginBottom: 12 }}>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(200,135,58,0.3)", borderRadius: 6, color: "#c8d0e8", padding: "8px 12px", fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, width: "100%", outline: "none" }}
            >
              <option value="FREE">FREE</option>
              <option value="CORE">CORE</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={tierReason}
              onChange={(e) => setTierReason(e.target.value)}
              style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(200,135,58,0.2)", borderRadius: 6, color: "#c8d0e8", padding: "8px 12px", fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, width: "100%", outline: "none", boxSizing: "border-box" as const }}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleTierChange} disabled={loading} style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "8px 16px", background: "rgba(200,135,58,0.2)", border: "1px solid rgba(200,135,58,0.5)", borderRadius: 6, color: "#e8b96a", cursor: "pointer" }}>
              Confirm
            </button>
            <button onClick={() => setTierModal(false)} style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#606880", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal onClose={() => setDeleteModal(false)}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#E8705A", marginBottom: 12, letterSpacing: "0.1em" }}>
            DELETE USER — IRREVERSIBLE
          </div>
          <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#a0a8c0", marginBottom: 12 }}>
            Type <strong style={{ color: "#f0dca0" }}>{userEmail}</strong> to confirm deletion.
          </p>
          <input
            type="text"
            placeholder={userEmail}
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            style={{ background: "rgba(13,18,32,0.8)", border: "1px solid rgba(232,112,90,0.3)", borderRadius: 6, color: "#c8d0e8", padding: "8px 12px", fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, width: "100%", outline: "none", boxSizing: "border-box" as const, marginBottom: 16 }}
          />
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", marginBottom: 16 }}>
            ⚠ This will permanently delete the user and all their data. Use the API to confirm deletion.
          </div>
          <button onClick={() => setDeleteModal(false)} style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#606880", cursor: "pointer" }}>
            Cancel
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#0d1220", border: "1px solid rgba(200,135,58,0.3)", borderRadius: 12, padding: 24, width: 360, maxWidth: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

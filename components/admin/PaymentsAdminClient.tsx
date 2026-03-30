"use client";

import { useState } from "react";

const SAMPLE_ROWS = [
  { id: "u_demo1", email: "client@example.com", amount: "—", status: "Sample" },
  { id: "u_demo2", email: "vip@example.com", amount: "—", status: "Sample" },
];

export function PaymentsAdminClient() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function sendBank(userId: string) {
    const to = email.trim();
    if (!to) {
      setMsg("Enter recipient email above");
      return;
    }
    setLoading(userId);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/payments/${userId}/bank-instructions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: to }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Failed");
      }
      setMsg("Email sent (or logged in dev).");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div
        style={{
          padding: "14px 18px",
          background: "rgba(200,135,58,0.12)",
          border: "1px solid rgba(200,135,58,0.3)",
          borderRadius: 8,
          marginBottom: 24,
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 12,
          color: "#e8b96a",
        }}
      >
        Payment management coming soon. Bank transfer instructions are available now.
      </div>

      <h1 style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 28, color: "#e8b96a", margin: "0 0 8px", fontWeight: 400 }}>
        Payments
      </h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", display: "block", marginBottom: 6 }}>
          Recipient email for bank instructions
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="payer@example.com"
          style={{
            width: 320,
            maxWidth: "100%",
            padding: "8px 12px",
            background: "rgba(13,18,32,0.85)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
          }}
        />
      </div>

      {msg ? (
        <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#a0a8c0" }}>{msg}</p>
      ) : null}

      <div
        style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 100px 140px 160px",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(200,135,58,0.15)",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 10,
            color: "#c8873a",
            letterSpacing: "0.08em",
          }}
        >
          <div>User</div>
          <div>Email</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {SAMPLE_ROWS.map((row, i) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 100px 140px 160px",
              padding: "10px 16px",
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              alignItems: "center",
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 11,
              color: "#a0a8c0",
            }}
          >
            <div>{row.id}</div>
            <div>{row.email}</div>
            <div>{row.amount}</div>
            <div>{row.status}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled
                title="Coming soon"
                style={{ opacity: 0.4, fontSize: 10, padding: "4px 8px", cursor: "not-allowed" }}
              >
                Refund
              </button>
              <button
                type="button"
                disabled
                title="Coming soon"
                style={{ opacity: 0.4, fontSize: 10, padding: "4px 8px", cursor: "not-allowed" }}
              >
                Charge
              </button>
              <button
                type="button"
                disabled={loading === row.id}
                onClick={() => void sendBank(row.id)}
                style={{
                  fontSize: 10,
                  padding: "4px 8px",
                  background: "rgba(200,135,58,0.2)",
                  border: "1px solid rgba(200,135,58,0.4)",
                  borderRadius: 4,
                  color: "#e8b96a",
                  cursor: "pointer",
                }}
              >
                {loading === row.id ? "…" : "Send bank details"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

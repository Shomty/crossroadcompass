"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  impersonatedEmail: string;
};

export function ImpersonationBanner({ impersonatedEmail }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function exit() {
    setPending(true);
    try {
      await fetch("/api/auth/impersonate-exit", { method: "POST" });
      router.push("/admin/users");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      role="status"
      style={{
        padding: "10px 16px",
        background: "rgba(200, 135, 58, 0.15)",
        borderBottom: "1px solid rgba(200, 135, 58, 0.35)",
        fontFamily: "var(--font-mono, 'DM Mono'), monospace",
        fontSize: 12,
        color: "#e8b96a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span>
        Viewing as <strong style={{ color: "#f0dcc4" }}>{impersonatedEmail}</strong> — Exit
        impersonation to return to admin.
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => void exit()}
        style={{
          padding: "6px 14px",
          borderRadius: 6,
          border: "1px solid rgba(200, 135, 58, 0.5)",
          background: "rgba(13, 18, 32, 0.9)",
          color: "#e8b96a",
          cursor: pending ? "wait" : "pointer",
          fontSize: 11,
          letterSpacing: "0.08em",
        }}
      >
        {pending ? "…" : "Exit impersonation"}
      </button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImpersonateUserButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/users/${userId}/impersonate`, {
            method: "POST",
          });
          if (res.ok) {
            router.push("/dashboard");
            router.refresh();
          }
        } finally {
          setLoading(false);
        }
      }}
      style={{
        fontFamily: "var(--font-mono, 'DM Mono')",
        fontSize: 10,
        padding: "4px 8px",
        background: "rgba(200,135,58,0.15)",
        border: "1px solid rgba(200,135,58,0.35)",
        borderRadius: 4,
        color: "#e8b96a",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "…" : "Login as"}
    </button>
  );
}

/**
 * app/auth-error/page.tsx
 * Auth error page — Auric Root design.
 */

import Link from "next/link";
import type { SearchParams } from "next/dist/server/request/search-params";

const MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You don't have permission to sign in.",
  Verification: "The sign-in link has expired or has already been used. Please request a new one.",
  Default: "An unexpected error occurred. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const code = typeof params.error === "string" ? params.error : "Default";
  const message = MESSAGES[code] ?? MESSAGES.Default;

  return (
    <div
      className="content-layer"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.5rem",
          color: "#c84a3a",
          marginBottom: "1.5rem",
        }}
        aria-hidden
      >
        ✦
      </div>

      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 300,
          color: "var(--cream)",
          marginBottom: "1rem",
        }}
      >
        Sign-in error
      </h1>

      <p
        style={{
          maxWidth: 380,
          fontSize: "0.95rem",
          color: "var(--mist)",
          lineHeight: 1.75,
          marginBottom: "2.5rem",
        }}
      >
        {message}
      </p>

      <Link href="/login" className="btn-primary">
        Back to sign in
      </Link>
    </div>
  );
}

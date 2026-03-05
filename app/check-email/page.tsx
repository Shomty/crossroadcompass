/**
 * app/check-email/page.tsx
 * Post magic-link confirmation — Auric Root design.
 */

import Link from "next/link";

export default function CheckEmailPage() {
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
          fontSize: "3rem",
          color: "var(--amber)",
          marginBottom: "1.5rem",
          lineHeight: 1,
        }}
        aria-hidden
      >
        ☽
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
        Check your inbox
      </h1>

      <p
        style={{
          maxWidth: 380,
          fontSize: "0.95rem",
          color: "var(--mist)",
          lineHeight: 1.75,
          marginBottom: "2rem",
        }}
      >
        We sent a magic link to your email address. Click it to sign in — it expires in 10 minutes.
      </p>

      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          color: "var(--mist)",
          opacity: 0.5,
        }}
      >
        Didn&apos;t receive it? Check spam or{" "}
        <Link href="/login" style={{ color: "var(--amber)" }}>
          try again
        </Link>
      </p>
    </div>
  );
}

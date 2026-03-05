"use client";
/**
 * app/login/LoginForm.tsx
 * Client-side login form — receives list of enabled OAuth providers from server.
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SocialProviderId = "google" | "github" | "facebook" | "apple";

interface SocialProvider {
  id: SocialProviderId;
  label: string;
  icon: React.ReactNode;
}

// ─── Brand icons ──────────────────────────────────────────────────────────────

const PROVIDER_ICONS: Record<SocialProviderId, React.ReactNode> = {
  google: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" fill="#FFC107"/>
      <path d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.2 0-9.7-3.3-11.3-8H6.3C9.6 36.5 16.3 44 24 44z" fill="#4CAF50"/>
      <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C37.2 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" fill="#1976D2"/>
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.64.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.38.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
    </svg>
  ),
  apple: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
};

const ALL_PROVIDERS: SocialProvider[] = [
  { id: "google",   label: "Google",   icon: PROVIDER_ICONS.google },
  { id: "github",   label: "GitHub",   icon: PROVIDER_ICONS.github },
  { id: "facebook", label: "Facebook", icon: PROVIDER_ICONS.facebook },
  { id: "apple",    label: "Apple",    icon: PROVIDER_ICONS.apple },
];

// ─── Social button ────────────────────────────────────────────────────────────

function SocialButton({ id, label, icon }: SocialProvider) {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    await signIn(id, { callbackUrl: "/onboarding" });
  }
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(200,135,58,0.22)",
        borderRadius: 3,
        color: "var(--mist)",
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 13.5, cursor: loading ? "wait" : "pointer",
        transition: "border-color 0.18s, background 0.18s",
        opacity: loading ? 0.6 : 1,
        width: "100%",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,135,58,0.5)";
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,135,58,0.07)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,135,58,0.22)";
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {icon}
      <span>Continue with {label}</span>
    </button>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

interface Props {
  enabledProviders: SocialProviderId[];
  /** Dev-only: providers that have CLIENT_ID set but are missing the SECRET */
  missingSecret?: SocialProviderId[];
}

export function LoginForm({ enabledProviders, missingSecret = [] }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socialProviders = ALL_PROVIDERS.filter((p) => enabledProviders.includes(p.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const result = await signIn("resend", { email, redirect: false, callbackUrl: "/onboarding" });
    if (result?.error) { setError("Something went wrong. Please try again."); setLoading(false); return; }
    setSent(true); setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", color: "var(--amber)", marginBottom: "1rem" }} aria-hidden>✦</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 400, color: "var(--cream)", marginBottom: "0.75rem" }}>
          Check your inbox
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--mist)", lineHeight: 1.7 }}>
          We sent a magic link to <strong style={{ color: "var(--cream)" }}>{email}</strong>.
          Click it to sign in — it expires in 10 minutes.
        </p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--mist)", opacity: 0.6 }}>
          Didn&apos;t receive it?{" "}
          <button onClick={() => { setSent(false); setEmail(""); }} style={{ color: "var(--amber)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Welcome</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 300, color: "var(--cream)", marginBottom: "0.5rem", lineHeight: 1.2 }}>
        Sign in to your <em style={{ color: "var(--gold)", fontStyle: "italic" }}>chart</em>
      </h2>
      <p style={{ fontSize: "0.85rem", color: "var(--mist)", marginBottom: "2rem", lineHeight: 1.7 }}>
        Choose how you&apos;d like to continue.
      </p>

      {/* ── Social buttons (only shown if provider is configured) ── */}
      {socialProviders.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {socialProviders.map((p) => <SocialButton key={p.id} {...p} />)}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(200,135,58,0.15)" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mist)", opacity: 0.5 }}>
              or email
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(200,135,58,0.15)" }} />
          </div>
        </>
      )}

      {/* ── Dev: show which providers need setup ── */}
      {missingSecret.length > 0 && (
        <div style={{ marginBottom: 18, padding: "10px 13px", border: "1px solid rgba(220,160,40,0.3)", borderRadius: 3, background: "rgba(220,160,40,0.05)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#d4a020", marginBottom: 6 }}>
            ◈ Dev — OAuth setup needed
          </p>
          {missingSecret.map((id) => (
            <p key={id} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(220,160,40,0.8)", marginBottom: 2, lineHeight: 1.5 }}>
              {id.toUpperCase()}_CLIENT_SECRET missing in .env
            </p>
          ))}
        </div>
      )}

      {/* ── Email / magic link ── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" required autoFocus value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className={error ? "error" : ""} />
          {error && <p className="field-error">{error}</p>}
        </div>
        <button type="submit" disabled={loading || !email} className="btn-primary" style={{ marginTop: "0.25rem" }}>
          {loading ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {/* Dev-only bypass */}
      {process.env.NODE_ENV === "development" && (
        <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(200,135,58,0.15)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", color: "var(--amber)", opacity: 0.7, marginBottom: "0.75rem", textTransform: "uppercase" }}>
            ◈ Dev shortcut
          </p>
          <a href="/api/dev-signin?email=shomty%40hotmail.com" className="btn-ghost" style={{ display: "block", textAlign: "center", fontSize: "0.8rem" }}>
            Sign in as shomty@hotmail.com
          </a>
        </div>
      )}

      <p style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.15em", color: "var(--mist)", opacity: 0.5 }}>
        By signing in you agree to our{" "}
        <Link href="/privacy" style={{ color: "var(--amber)" }}>Privacy Policy</Link>
      </p>
    </>
  );
}

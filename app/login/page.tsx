/**
 * app/login/page.tsx — Server component.
 * Checks which OAuth providers are configured and passes list to the client form.
 */

import Link from "next/link";
import { LoginForm, type SocialProviderId } from "./LoginForm";

export default function LoginPage() {
  const enabledProviders: SocialProviderId[] = [];
  const missingSecret: SocialProviderId[] = [];
  const isDev = process.env.NODE_ENV === "development";

  // Google
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    enabledProviders.push("google");
  } else if (isDev && process.env.GOOGLE_CLIENT_ID) {
    missingSecret.push("google");
  }

  // GitHub
  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    enabledProviders.push("github");
  } else if (isDev && process.env.GITHUB_ID) {
    missingSecret.push("github");
  }

  // Facebook
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    enabledProviders.push("facebook");
  } else if (isDev && process.env.FACEBOOK_CLIENT_ID) {
    missingSecret.push("facebook");
  }

  // Apple
  if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
    enabledProviders.push("apple");
  } else if (isDev && process.env.APPLE_ID) {
    missingSecret.push("apple");
  }

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
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: "1.35rem",
          fontWeight: 600,
          color: "var(--gold)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          display: "flex",
          alignItems: "center",
          marginBottom: "3rem",
        }}
      >
        Crossroads
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 5, height: 5,
            borderRadius: "50%",
            background: "var(--amber)",
            margin: "0 0.35rem",
            verticalAlign: "middle",
          }}
        />
        Compass
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "2.5rem" }}>
        <LoginForm
          enabledProviders={enabledProviders}
          missingSecret={isDev ? missingSecret : []}
          isDev={isDev}
        />
      </div>
    </div>
  );
}

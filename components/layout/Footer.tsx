/**
 * components/layout/Footer.tsx
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(200, 135, 58, 0.12)",
        padding: "3rem 2rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--gold)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Auric
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--amber)",
              margin: "0 0.3rem",
              verticalAlign: "middle",
            }}
          />
          Root
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "mailto:hello@auricroot.com" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={{ fontSize: "0.75rem" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p
          style={{
            marginTop: "1.5rem",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: "var(--mist)",
            opacity: 0.5,
          }}
        >
          © {new Date().getFullYear()} Auric Root. For educational purposes only.
        </p>
      </div>
    </footer>
  );
}

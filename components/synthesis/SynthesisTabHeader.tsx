"use client";

/**
 * Centered card-style header — matches Shadow Work Portal header aesthetic.
 * Gradient background, centered amber eyebrow label, large Cinzel title.
 */

interface SynthesisTabHeaderProps {
  glyph: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SynthesisTabHeader({ eyebrow, title, subtitle }: SynthesisTabHeaderProps) {
  return (
    <div
      className="animate-enter"
      style={{
        textAlign: "center",
        padding: "2rem 1.5rem",
        background: "linear-gradient(180deg, rgba(46,31,15,0.3) 0%, rgba(13,18,32,0.4) 100%)",
        borderRadius: 16,
        border: "1px solid rgba(200,135,58,0.15)",
        marginBottom: 24,
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "rgba(200,135,58,0.8)",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 26,
          fontWeight: 400,
          color: "#f0dca0",
          margin: "0 0 0",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            lineHeight: 1.75,
            color: "rgba(240,220,160,0.72)",
            margin: "12px auto 0",
            maxWidth: 560,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

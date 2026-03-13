/**
 * components/onboarding/UnknownTimeNotice.tsx
 * Shown when user toggles "I don't know my birth time".
 */

export function UnknownTimeNotice() {
  return (
    <div
      style={{
        border: "1px solid rgba(200, 135, 58, 0.2)",
        borderRadius: 2,
        background: "rgba(200, 135, 58, 0.04)",
        padding: "0.75rem 1rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: "1rem",
          color: "var(--amber)",
          lineHeight: 1.5,
          flexShrink: 0,
        }}
        aria-hidden
      >
        ☽
      </span>
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: "0.8rem",
          color: "var(--mist)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        Without a birth time, some chart elements such as your defined centers
        and inner authority may be approximate. We&apos;ll use noon as a
        default — you can update this later if you find your time.
      </p>
    </div>
  );
}

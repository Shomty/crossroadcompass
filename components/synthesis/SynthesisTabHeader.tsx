"use client";

/**
 * Matches ChapterCard header row: 40px glyph, DM Mono eyebrow, Cinzel title.
 */

interface SynthesisTabHeaderProps {
  glyph: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SynthesisTabHeader({ glyph, eyebrow, title, subtitle }: SynthesisTabHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3.5" style={{ marginBottom: subtitle ? 12 : 0 }}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif text-lg text-[#c8873a]"
          style={{
            background: "rgba(200,135,58,0.08)",
            borderColor: "rgba(200,135,58,0.25)",
          }}
        >
          {glyph}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(200,135,58,0.6)",
              marginBottom: 3,
            }}
          >
            {eyebrow}
          </div>
          <h2
            className="font-normal"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 18,
              fontWeight: 400,
              color: "rgba(240,220,160,0.95)",
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
      </div>
      {subtitle ? (
        <p
          className="mt-3 text-sm"
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            lineHeight: 1.8,
            color: "rgba(240,220,160,0.72)",
            margin: 0,
            maxWidth: 640,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

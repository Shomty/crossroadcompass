/**
 * components/layout/SectionDivider.tsx
 * Amber gradient horizontal rule with a centered celestial glyph.
 */

interface SectionDividerProps {
  glyph?: string;
}

export function SectionDivider({ glyph = "☽" }: SectionDividerProps) {
  return (
    <div className="section-divider" style={{ margin: "0 auto", maxWidth: 1100 }}>
      <span className="section-divider-glyph" aria-hidden>{glyph}</span>
    </div>
  );
}

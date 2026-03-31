"use client";
// STATUS: done | FE-01

interface Props {
  variant: "north-indian" | "south-indian";
  onChange: (v: "north-indian" | "south-indian") => void;
}

/**
 * Toggle between North Indian diamond layout and South Indian square grid.
 */
export function ChartVariantToggle({ variant, onChange }: Props) {
  return (
    <div className="chart-variant-toggle">
      <button
        type="button"
        onClick={() => onChange("north-indian")}
        data-active={variant === "north-indian"}
      >
        North Indian
      </button>
      <button
        type="button"
        onClick={() => onChange("south-indian")}
        data-active={variant === "south-indian"}
      >
        South Indian
      </button>
    </div>
  );
}

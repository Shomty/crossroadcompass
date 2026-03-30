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
    <div className="flex gap-1 rounded border border-indigo-500/20 p-0.5">
      <button
        type="button"
        onClick={() => onChange("north-indian")}
        className={`rounded px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
          variant === "north-indian"
            ? "bg-indigo-600 text-white"
            : "text-[var(--mist)] hover:text-[var(--cream)]"
        }`}
      >
        North Indian
      </button>
      <button
        type="button"
        onClick={() => onChange("south-indian")}
        className={`rounded px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
          variant === "south-indian"
            ? "bg-indigo-600 text-white"
            : "text-[var(--mist)] hover:text-[var(--cream)]"
        }`}
      >
        South Indian
      </button>
    </div>
  );
}

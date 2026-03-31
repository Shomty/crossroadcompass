"use client";
/**
 * components/ui/Toggle.tsx
 * Canonical tab-style toggle.
 * Renders using the .chart-variant-toggle CSS class from globals.css.
 * DM Mono · uppercase · amber gradient active state.
 */

interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
}

interface ToggleProps<T extends string = string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Toggle<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
}: ToggleProps<T>) {
  return (
    <div className={`chart-variant-toggle ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-active={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

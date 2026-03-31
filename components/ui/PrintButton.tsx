"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({
  label = "Save as PDF",
  className = "",
}: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={["btn-ghost print-hide", className].filter(Boolean).join(" ")}
      aria-label="Print or save as PDF"
    >
      <Printer size={14} aria-hidden="true" />
      {label}
    </button>
  );
}

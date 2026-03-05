/**
 * components/ui/Button.tsx
 * Primary and ghost button variants following Auric Root design system.
 */

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={variant === "primary" ? `btn-primary ${className}` : `btn-ghost ${className}`}
      {...props}
    >
      {children}
      {variant === "ghost" && <span aria-hidden>→</span>}
    </button>
  );
}

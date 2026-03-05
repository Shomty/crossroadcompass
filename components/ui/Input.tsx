/**
 * components/ui/Input.tsx
 * Dark cosmos-styled form input.
 */

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={`${error ? "error" : ""} ${className}`}
      {...props}
    />
  );
}

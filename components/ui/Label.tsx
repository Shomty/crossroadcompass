/**
 * components/ui/Label.tsx
 * Canonical field label. DM Mono · uppercase · amber tint.
 * Applies ui-label base styles. Pass className to override specific properties.
 */

import type { LabelHTMLAttributes } from "react";

export function Label({ className = "", children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`ui-label ${className}`} {...props}>
      {children}
    </label>
  );
}

/**
 * components/ui/Label.tsx
 * DM Mono uppercase label for form fields.
 */

import type { LabelHTMLAttributes } from "react";

export function Label({ className = "", children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}

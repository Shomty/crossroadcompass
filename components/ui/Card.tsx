/**
 * components/ui/Card.tsx
 * Standard amber-bordered container.
 */

import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  featured?: boolean;
}

export function Card({ featured, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`${featured ? "card-featured" : "card"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

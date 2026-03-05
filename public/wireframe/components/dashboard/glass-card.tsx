import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-slate-800/30 backdrop-blur-sm rounded-2xl p-5 lg:p-6 border border-slate-700/30",
        className
      )}
    >
      {children}
    </div>
  );
}

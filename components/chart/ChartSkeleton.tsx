"use client";

import { V4GlassCard } from "@/components/v4/V4GlassCard";

/**
 * Loading state for chart tab content — matches PageLayout + V4GlassCard rhythm.
 */
export function ChartSkeleton() {
  return (
    <section className="chart-page animate-enter animate-enter-2">
      <div className="chart-page-tabs" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-lg bg-[rgba(200,135,58,0.1)]"
            style={{ animationDelay: `${i * 0.04}s` }}
          />
        ))}
      </div>
      <V4GlassCard>
        <div className="chart-page-panel">
          <div className="grid max-w-md grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-md bg-[rgba(200,135,58,0.08)]"
                style={{ animationDelay: `${(i % 8) * 0.05}s` }}
              />
            ))}
          </div>
        </div>
      </V4GlassCard>
    </section>
  );
}

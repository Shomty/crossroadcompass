// STATUS: done | Phase 4 Glimpse
/**
 * lib/analytics/glimpseEvents.ts
 * Lightweight client-side analytics for Glimpse conversion tracking.
 * All events are fire-and-forget — no blocking, no error throw.
 */

export type GlimpseEvent =
  | { type: "glimpse_view"; feature: string; pattern: string }
  | { type: "glimpse_cta_click"; feature: string; pattern: string }
  | { type: "glimpse_to_pricing"; feature: string }
  | { type: "glimpse_conversion"; feature: string; plan: string };

export function trackGlimpse(event: GlimpseEvent): void {
  // Queue on next tick to avoid blocking render
  setTimeout(() => {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.debug("[glimpse]", event);
      }

      // Persist to sessionStorage for in-session attribution
      const key = "glimpse_events";
      const existing = JSON.parse(sessionStorage.getItem(key) ?? "[]") as GlimpseEvent[];
      existing.push(event);
      // Keep last 100 events in session
      sessionStorage.setItem(key, JSON.stringify(existing.slice(-100)));

      // TODO: Replace with real analytics provider (PostHog, Segment, etc.)
      // Example: posthog.capture(event.type, event)
    } catch {
      // Silent fail — never block the UI for analytics
    }
  }, 0);
}

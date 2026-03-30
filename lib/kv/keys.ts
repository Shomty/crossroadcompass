// STATUS: done | Task 2.2 SP.12
/**
 * lib/kv/keys.ts
 * Typed KV key builders and TTL constants.
 * No Redis calls here — only key construction.
 */

export const kvKeys = {
  vedicChart: (userId: string) => `chart:vedic:${userId}`,
  hdChart:    (userId: string) => `chart:hd:${userId}`,
  dashas:     (userId: string) => `chart:dashas:${userId}`,
  /** date must be YYYY-MM-DD */
  transit:        (userId: string, date: string) => `transit:${userId}:${date}`,
  /** Prefix for scanning all transit keys for a user */
  transitPrefix:  (userId: string) => `transit:${userId}:`,
  /** Gemini AI reading cache (one per user per day) — date must be YYYY-MM-DD */
  transitReading: (userId: string, date: string) => `transit-reading:${userId}:${date}`,
  /** Vedic special points (V2 formulas) — permanent, invalidated when birth profile changes */
  specialPoints:  (userId: string) => `chart:specialpointsv2:${userId}`,
  /** @deprecated Pre–Mar 2026; swept in invalidateChartCache — remove after 2026-06-01 */
  specialPointsLegacy: (userId: string) => `chart:specialpoints:${userId}`,
  /** AI-generated insights for Vedic special points — permanent, invalidated with birth profile changes */
  specialPointsInsights: (userId: string) => `chart:specialpoints:insights:${userId}`,
  /** Extended Vedic special points — bumped for V2 Prāṇapada / Kaal Velas / GL night branch */
  extendedSpecialPoints: (userId: string) => `chart:specialpoints:ext:v3:${userId}`,
  /** @deprecated Pre–Mar 2026 extended payload */
  extendedSpecialPointsLegacy: (userId: string) => `chart:specialpoints:ext:v2:${userId}`,
  /** Divisional charts (D2–D60) derived from natal D1 */
  divisionalCharts: (userId: string) => `chart:divisional:${userId}`,
  /** Current dasha derived from natal chart */
  currentDasha:     (userId: string) => `chart:dasha:current:${userId}`,
  /** Parashara yoga detection (invalidated with chart / birth profile) */
  yogas:            (userId: string) => `chart:yogas:${userId}`,
} as const;

export const KV_TTL = {
  /** 24 hours in seconds — transits auto-expire */
  TRANSIT_SECONDS: 86_400,
  /** No TTL — natal charts are permanent until explicitly invalidated */
  NATAL_CHART: undefined,
  /** No TTL — dashas are permanent until birth data changes */
  DASHAS: undefined,
  /** No TTL — special points insights are permanent until birth data changes */
  SPECIAL_POINTS_INSIGHTS: undefined,
} as const;

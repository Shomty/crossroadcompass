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
  /** Today's Moon Gemini interpretation — local calendar YYYY-MM-DD in user's timezone */
  todayMoonReading: (userId: string, date: string) => `today-moon:${userId}:${date}`,
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
  /** Samudaya Ashtakavarga totals per sign — invalidated with chart */
  ashtakavarga:     (userId: string) => `chart:ashtakavarga:${userId}`,
  /** Personalized Muhurta response cache — start/end = YYYY-MM-DD */
  muhurtaPersonalized: (userId: string, startDate: string, endDate: string, intent: string) =>
    `muhurta:personalized:${userId}:${startDate}:${endDate}:${intent}`,
  // Chat
  chatRateLimit:    (userId: string) => `chat:ratelimit:${userId}`,
  /** @deprecated Migrated to chatThread; swept by chatSessions.migrateLegacy */
  chatHistory:      (userId: string) => `chat:history:${userId}`,
  chatActiveSession:(userId: string) => `chat:active:${userId}`,
  chatSessionsIndex:(userId: string) => `chat:sessions:${userId}`,
  chatThread:       (userId: string, sessionId: string) => `chat:thread:${userId}:${sessionId}`,
  chatContext:      (userId: string) => `chat:context:${userId}`,
  blueprintGlimpse: (userId: string) => `report:glimpse:${userId}`,
  chatPremiumLimit: (userId: string) => `chat:premium:ratelimit:${userId}`,
  /** Crossroads Oracle reading — theme + antardasha label (stable until sub-period changes) */
  oracleReading: (userId: string, theme: string, antardashaLabel: string) =>
    `oracle:${userId}:${theme}:${antardashaLabel}`,
  // Synthesis Engine (Phase 1)
  /** Western transits for a single day — tropical planets + aspects */
  westernTransit: (userId: string, date: string) => `western-transit:${userId}:${date}`,
  /** Prefix for scanning all Western transit keys for a user */
  westernTransitPrefix: (userId: string) => `western-transit:${userId}:`,
  /** Full Dasha timeline (120 years) — permanent, invalidated on profile change */
  dashaTimeline: (userId: string) => `dasha-timeline:${userId}`,
  /** Full synthesis result (Western + Vedic + merged) — 24h TTL */
  synthesis: (userId: string, dateRange: string) => `synthesis:${userId}:${dateRange}`,
  /** Western (tropical) natal chart — permanent, invalidated when birth data changes */
  westernNatalChart: (userId: string) => `chart:western:natal:${userId}`,
} as const;

export const KV_TTL_CHAT = {
  /** 24 hours — chat rate limit counters reset daily */
  RATE_LIMIT_SECONDS: 86_400,
  /** 7 days — persist conversation history across sessions */
  HISTORY_SECONDS: 7 * 24 * 60 * 60,
} as const;

export const KV_TTL = {
  /** 24 hours in seconds — transits auto-expire */
  TRANSIT_SECONDS: 86_400,
  /**
   * Cron pre-cache for Muhurta / multi-day transit reads (today + 30 days + buffer).
   * Worst-case work per cold user: 31 × kvGet + up to 31 × calculateChart — see
   * `lib/astro/transitPrecache.ts` cost notes.
   */
  TRANSIT_LOOKAHEAD_SECONDS: 32 * 24 * 60 * 60,
  /** No TTL — natal charts are permanent until explicitly invalidated */
  NATAL_CHART: undefined,
  /** No TTL — dashas are permanent until birth data changes */
  DASHAS: undefined,
  /** No TTL — special points insights are permanent until birth data changes */
  SPECIAL_POINTS_INSIGHTS: undefined,
  /** Personalized Muhurta windows — deterministic for chart + range + intent */
  MUHURTA_PERSONALIZED_SECONDS: 7 * 24 * 60 * 60,
  /** Oracle cache upper bound — actual TTL is min(time-to-antardasha-end, this) */
  ORACLE_READING_MAX_SECONDS: 30 * 24 * 60 * 60,
  /** Western transits (24h TTL, same as existing transit cache) */
  WESTERN_TRANSIT_SECONDS: 86_400,
  /** Full synthesis result (24h TTL) */
  SYNTHESIS_SECONDS: 86_400,
  /** Dasha timeline (permanent until profile change) */
  DASHA_TIMELINE: undefined,
} as const;

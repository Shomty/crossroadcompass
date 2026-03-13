/**
 * lib/astro/vedicApiClient.ts
 * Raw HTTP client for the Vedic Astrology external API.
 * THIS IS THE ONLY FILE THAT MAY CALL THE VEDIC API.
 * No other file in the codebase may import fetch against this endpoint directly.
 * See copilot-instructions section 16.1.
 *
 * Rate-limit awareness: every call costs money. All callers must check the
 * DB cache first. This file has no caching logic — that lives in chartService,
 * transitService, and dashaService.
 */

import { env } from "@/lib/env";
import { VedicChart, VedicBirthChartResponse, TransitData, DashaPeriod } from "@/lib/astro/types";

// ─── Error class ─────────────────────────────────────────────────────────

export class VedicApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Vedic API error ${status}`);
    this.name = "VedicApiError";
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────

async function vedicFetch<T>(path: string, body: unknown): Promise<T> {
  const url = `${env.VEDIC_API_URL}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Key is sent server-side only; never exposed to the client
      "X-Api-Key": env.VEDIC_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Log status server-side only — never surface the key or raw body to client
    const text = await res.text();
    console.error(`[VedicAPI] ${res.status} on ${path}:`, text);
    throw new VedicApiError(res.status, text);
  }

  return res.json() as Promise<T>;
}

// ─── Natal chart ─────────────────────────────────────────────────────────

// API response envelope — all endpoints wrap their payload in this shape
interface VedicApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
  requestId: string;
}

/**
 * Fetch the Vedic natal chart for a given birth profile.
 * Endpoint: POST /birth-charts
 * The API wraps the chart in { success, data, timestamp, requestId }.
 */
export async function fetchVedicNatalChart(params: {
  dateOfBirth: string;        // "YYYY-MM-DD"
  timeOfBirth: string;        // "HH:MM"
  location: string;           // "City, Country" — API geocodes internally
  isTimeApproximate: boolean;
  gender: "male" | "female" | "other";
  name: string;
}): Promise<VedicChart> {
  const envelope = await vedicFetch<VedicApiEnvelope<VedicBirthChartResponse>>("/birth-charts", {
    birthInfo: params,
    chartStyle: "north_indian",
    ayanamsa: "lahiri",
    houseSystem: "equal",
  });
  return { rawResponse: envelope.data };
}

// ─── Daily transits ───────────────────────────────────────────────────────

/**
 * Fetch today's transits for a given user's chart configuration.
 *
 * DECISION NEEDED: confirm endpoint path and payload schema with Milosh.
 */
export async function fetchDailyTransits(params: {
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  timezone?: string; // DECISION NEEDED: confirm Vedic API timezone format
}): Promise<TransitData> {
  // DECISION NEEDED: confirm endpoint path and payload schema
  const raw = await vedicFetch<unknown>("/transits", params);
  return {
    rawResponse: raw,
    date: params.date,
  };
}

// ─── Dasha timeline ───────────────────────────────────────────────────────

/**
 * Fetch the full dasha timeline for a birth chart.
 * Returns multi-year coverage so the result can be cached in the DB.
 *
 * DECISION NEEDED: confirm endpoint path and payload schema with Milosh.
 */
export async function fetchDashaTimeline(params: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone?: string; // DECISION NEEDED: confirm Vedic API timezone format
}): Promise<DashaPeriod[]> {
  // DECISION NEEDED: confirm endpoint path and payload schema
  const raw = await vedicFetch<unknown>("/dashas", params);

  // DECISION NEEDED: map raw API response to DashaPeriod[] once shape known
  return raw as DashaPeriod[];
}

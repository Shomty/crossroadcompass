/**
 * lib/astro/vedicApiClient.ts
 * Raw HTTP client for the Vedic Astrology external API.
 * THIS IS THE ONLY FILE THAT MAY CALL THE VEDIC API.
 * No other file in the codebase may import fetch against this endpoint directly.
 * See copilot-instructions section 16.1.
 *
 * Confirmed endpoint: POST /api/v1/birth-charts
 * Auth: X-Api-Key header
 * Response shape: { success: boolean, data: VedicBirthChartResponse }
 *
 * Rate-limit awareness: every call costs money. All callers must check the
 * DB cache first. This file has no caching logic — that lives in chartService,
 * transitService, and dashaService.
 */

import { env } from "@/lib/env";
import type { VedicChart, VedicBirthChartRequest, VedicBirthChartResponse } from "@/lib/astro/types";

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
  if (!env.VEDIC_API_URL || !env.VEDIC_API_KEY) {
    throw new VedicApiError(0, "Vedic API is not configured (VEDIC_API_URL / VEDIC_API_KEY missing)");
  }

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
    const text = await res.text();
    console.error(`[VedicAPI] ${res.status} on ${path}:`, text);
    throw new VedicApiError(res.status, text);
  }

  // Response is wrapped in { success: boolean, data: T }
  const json = await res.json() as { success: boolean; data: T };
  return json.data;
}

// ─── Birth chart (natal + dashas) ────────────────────────────────────────

/**
 * Fetch the Vedic birth chart.
 * Endpoint: POST /api/v1/birth-charts
 *
 * The response contains the full natal chart. Dasha and transit data
 * may be embedded in the response or require separate endpoints —
 * confirm once the API key is activated and map VedicChart fields accordingly.
 */
export async function fetchVedicNatalChart(
  params: VedicBirthChartRequest
): Promise<VedicChart> {
  const payload = {
    birthInfo: {
      dateOfBirth: params.dateOfBirth,         // "YYYY-MM-DD"
      timeOfBirth: params.timeOfBirth,         // "HH:MM"
      location: params.location,               // "City, Country"
      isTimeApproximate: params.isTimeApproximate,
      gender: params.gender,
      name: params.name,
    },
    chartStyle: "north_indian",
    ayanamsa: "lahiri",
    houseSystem: "equal",
    metadata: {},
  };

  const raw = await vedicFetch<VedicBirthChartResponse>("/birth-charts", payload);

  // Extract convenience fields from the raw response
  const d1 = raw.chartD1;
  const sun = d1.planets.find((p) => p.name === "sun");
  const moon = d1.planets.find((p) => p.name === "moon");
  const now = new Date();
  const currentDasha = d1.dashas?.vimshottari?.dashaPeriods?.find(
    (p) => new Date(p.startDate) <= now && new Date(p.endDate) >= now
  );

  return {
    rawResponse: raw,
    ascendant: d1.ascendant,
    sunSign: sun?.sign,
    moonSign: moon?.sign,
    currentDasha,
    planets: d1.planets,
  };
}

// ─── Daily transits ───────────────────────────────────────────────────────

/**
 * Fetch today's transits.
 * Transits are NOT embedded in /birth-charts — they require a separate endpoint.
 * Endpoint to be confirmed (e.g. POST /api/v1/transits). Not yet implemented.
 */
export async function fetchDailyTransits(_params: {
  date: string;       // YYYY-MM-DD
  location: string;   // "City, Country"
}): Promise<unknown> {
  throw new Error(
    "[VedicAPI] Transit endpoint not yet implemented."
  );
}

// ─── Dasha timeline ───────────────────────────────────────────────────────

/**
 * Dashas are embedded in the /birth-charts response (chartD1.dashas.vimshottari).
 * Use fetchVedicNatalChart + extract currentDasha from the returned VedicChart.
 * This function is a no-op stub kept for interface compatibility.
 */
export async function fetchDashaTimeline(
  _params: VedicBirthChartRequest
): Promise<unknown> {
  throw new Error(
    "[VedicAPI] Use fetchVedicNatalChart — dashas are embedded in chartD1.dashas."
  );
}

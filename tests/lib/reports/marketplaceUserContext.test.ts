import { describe, it, expect } from "vitest";
import { buildMarketplaceUserContextPayload } from "@/lib/reports/marketplaceUserContext";
import type { BuildReportTemplateVarsInput } from "@/lib/reports/reportTemplateVars";

const minimalInput = (): BuildReportTemplateVarsInput => ({
  hdData: null,
  vedicData: null,
  dashasData: [],
  transitData: null,
  birthProfile: {
    birthDate: new Date("1990-01-15"),
    birthTimeKnown: true,
    birthHour: 12,
    birthMinute: 0,
    birthCity: "NYC",
    birthCountry: "US",
    latitude: 40.7,
    longitude: -74,
    timezone: "America/New_York",
    birthName: "Test",
    gender: null,
    observationCity: null,
    observationLatitude: null,
    observationLongitude: null,
    intakeLifeSituation: null,
    intakePrimaryFocus: null,
    intakeWantsClarity: null,
  },
  userEmail: "u@example.com",
  currentMahadasha: "Jupiter",
  currentAntardasha: "Saturn",
  specialPoints: null,
  extendedSpecialPoints: null,
});

describe("buildMarketplaceUserContextPayload", () => {
  it("includes instructions and CHART_CONTEXT_JSON with birth", () => {
    const s = buildMarketplaceUserContextPayload(minimalInput());
    expect(s).toContain("=== CHART_CONTEXT_JSON ===");
    expect(s).toContain("u@example.com");
    expect(s).toContain("NYC");
  });

  it("embeds userEmail at top level of JSON", () => {
    const s = buildMarketplaceUserContextPayload(minimalInput());
    const idx = s.indexOf("=== CHART_CONTEXT_JSON ===");
    const jsonPart = s.slice(idx);
    expect(jsonPart).toContain('"userEmail"');
    expect(jsonPart).toContain("u@example.com");
  });
});

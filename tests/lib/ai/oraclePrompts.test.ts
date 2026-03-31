import { describe, it, expect } from "vitest";
import { buildOraclePrompt } from "@/lib/ai/prompts/oraclePrompts";
import type { OracleContext } from "@/types/oracle";

function baseCtx(theme: OracleContext["theme"]): OracleContext {
  return {
    userId: "u1",
    birthProfile: {
      dateOfBirth: "1990-05-15",
      timeOfBirth: "14:30",
      placeOfBirth: "Belgrade, Serbia",
      gender: "unspecified",
    },
    mahadasha: {
      planet: "Saturn",
      startDate: new Date("2020-01-01").toISOString(),
      endDate: new Date("2040-01-01").toISOString(),
      yearsRemaining: 10,
    },
    antardasha: {
      label: "Saturn/Venus",
      planet: "Venus",
      startDate: new Date("2024-01-01").toISOString(),
      endDate: new Date("2027-01-01").toISOString(),
      monthsRemaining: 18,
    },
    transits: {
      moonSign: "Cancer",
      sunSign: "Taurus",
      retrogradePlanets: ["Mercury"],
      notableTransit: "Jupiter in Gemini (R).",
    },
    theme,
  };
}

describe("buildOraclePrompt", () => {
  it("includes theme framing and JSON instruction", () => {
    const p = buildOraclePrompt(baseCtx("CAREER"));
    expect(p).toContain("CAREER");
    expect(p).toContain("concreteSteps");
    expect(p).toContain("cosmicContext");
    expect(p).toContain("Saturn");
    expect(p).toContain("Venus");
    expect(p).toContain("Mercury");
  });

  it("includes identity framing for IDENTITY theme", () => {
    const p = buildOraclePrompt(baseCtx("IDENTITY"));
    expect(p).toContain("IDENTITY");
    expect(p).toMatch(/becoming|conditioned/i);
  });
});

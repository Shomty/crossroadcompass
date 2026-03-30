import { describe, it, expect } from "vitest";
import {
  buildAp5VariableMap,
} from "@/lib/content/reportVariableResolver";
import { REPORT_VARIABLE_KEYS_AP5 } from "@/lib/content/reportVariableKeysAp5";
import type { BuildReportTemplateVarsInput } from "@/lib/reports/reportTemplateVars";

describe("reportVariableResolver AP.5 keys", () => {
  it("buildAp5VariableMap defines every AP.5 key as a non-empty string", () => {
    const input: BuildReportTemplateVarsInput = {
      hdData: null,
      vedicData: {
        ascendant: { signNumber: 4 },
        planets: {
          sun: { signNumber: 5 },
          moon: { signNumber: 6, nakshatra: "Rohini" },
          mars: { signNumber: 1 },
          mercury: { signNumber: 2 },
          jupiter: { signNumber: 3 },
          venus: { signNumber: 7 },
          saturn: { signNumber: 8 },
          rahu: { signNumber: 9 },
          ketu: { signNumber: 3 },
        },
      },
      dashasData: null,
      transitData: null,
      birthProfile: null,
      userEmail: "seeker@example.com",
      currentMahadasha: "Jupiter",
      currentAntardasha: "Saturn",
      specialPoints: null,
      extendedSpecialPoints: null,
    };

    const base: Record<string, string> = {
      current_mahadasha: "Jupiter",
      dasha_mahadasha_start: "2020-01-01",
      dasha_mahadasha_end: "2036-01-01",
      current_antardasha: "Saturn",
      dasha_antardasha_end: "2025-06-01",
      hd_type: "Generator",
      hd_strategy: "Wait",
      hd_authority: "Sacral",
      hd_profile: "2/4",
      hd_definition: "Single",
      hd_incarnation_cross_type: "Right Angle",
      hd_incarnation_cross_gates: "1-2-3-4",
      user_name: "Seeker",
      birth_location: "Belgrade, Serbia",
      lagna: "",
    };

    const map = buildAp5VariableMap(
      input,
      base,
      new Date(Date.UTC(1990, 4, 15))
    );

    for (const k of REPORT_VARIABLE_KEYS_AP5) {
      expect(map).toHaveProperty(k);
      expect(typeof map[k]).toBe("string");
      expect((map[k] as string).length).toBeGreaterThan(0);
    }

    expect(map.sun_sign).toBe("Leo");
    expect(map.lagna_sign).toBe("Cancer");
    expect(map.moon_nakshatra).toBe("Rohini");
  });
});

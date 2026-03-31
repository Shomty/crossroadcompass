import { describe, expect, it } from "vitest";
import {
  resolveScanIntervalMinutes,
  PURUSHARTHA_MAX_CHART_CALLS,
} from "@/lib/astro/muhurta/purusharthaMuhurtaService";

describe("resolveScanIntervalMinutes", () => {
  it("uses 5 min for short windows", () => {
    expect(resolveScanIntervalMinutes(6)).toBe(5);
  });

  it("widens step so slot count stays within cap", () => {
    const h = 24;
    const step = resolveScanIntervalMinutes(h);
    const slots = (h * 60) / step;
    expect(slots).toBeLessThanOrEqual(PURUSHARTHA_MAX_CHART_CALLS);
    expect(slots).toBe(72);
    expect(step).toBeGreaterThanOrEqual(5);
  });
});

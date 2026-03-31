import { describe, expect, it } from "vitest";
import { validateBirthInfoAllowFuture } from "@/lib/astro/openAstrologyAllowFutureBirth";
import type { BirthInfo } from "openastrology-library";

function base(): BirthInfo {
  return {
    name: "Test",
    dateOfBirth: "2030-06-15",
    timeOfBirth: "12:00",
    latitude: 0,
    longitude: 0,
    timezone: "UTC",
  };
}

describe("validateBirthInfoAllowFuture", () => {
  it("allows future calendar dates", () => {
    expect(() => validateBirthInfoAllowFuture(base())).not.toThrow();
  });

  it("still rejects pre-1800", () => {
    const b = base();
    b.dateOfBirth = "1799-12-31";
    expect(() => validateBirthInfoAllowFuture(b)).toThrow(/too far in the past/);
  });
});

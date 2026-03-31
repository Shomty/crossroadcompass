import { describe, it, expect } from "vitest";
import { extractOracleLooseFields } from "@/lib/ai/parseModelJsonObject";

describe("extractOracleLooseFields", () => {
  it("parses valid-shaped JSON string", () => {
    const raw = JSON.stringify({
      cosmicContext: "A",
      psychologicalPattern: "B",
      whyNow: "C",
      concreteSteps: ["one", "two", "three"],
    });
    const o = extractOracleLooseFields(raw);
    expect(o?.concreteSteps).toEqual(["one", "two", "three"]);
  });

  it("returns null when steps missing", () => {
    const raw = `{"cosmicContext":"A","psychologicalPattern":"B","whyNow":"C","concreteSteps":["a"]}`;
    expect(extractOracleLooseFields(raw)).toBeNull();
  });
});

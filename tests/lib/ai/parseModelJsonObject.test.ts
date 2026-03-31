import { describe, it, expect } from "vitest";
import {
  stripJsonFences,
  extractFirstJsonObjectSlice,
  parseModelJsonObject,
  extractJsonStringField,
  extractTodayMoonLooseFields,
} from "@/lib/ai/parseModelJsonObject";

describe("parseModelJsonObject", () => {
  it("parses plain JSON", () => {
    const o = parseModelJsonObject('{"headline":"H","body":"B"}');
    expect(o).toEqual({ headline: "H", body: "B" });
  });

  it("strips markdown fences", () => {
    const o = parseModelJsonObject('```json\n{"x":1}\n```');
    expect(o).toEqual({ x: 1 });
  });

  it("extracts first object when wrapped in prose", () => {
    const raw = 'Here you go:\n{"headline":"H","body":"B","daytimeFocus":"","caution":"","toneTags":[]}\nThanks';
    const o = parseModelJsonObject(raw);
    expect(o).toMatchObject({ headline: "H", body: "B" });
  });

  it("unwraps single-element object array", () => {
    const o = parseModelJsonObject('[{"headline":"H","body":"B"}]');
    expect(o).toEqual({ headline: "H", body: "B" });
  });

  it("returns null on garbage", () => {
    expect(parseModelJsonObject("not json")).toBeNull();
  });
});

describe("extractTodayMoonLooseFields", () => {
  it("recovers headline and body when JSON breaks later", () => {
    const raw = `{"headline":"Bright morning","body":"The Moon favors rest. Unclosed string breaks parse`;
    expect(parseModelJsonObject(raw)).toBeNull();
    const loose = extractTodayMoonLooseFields(raw);
    expect(loose?.headline).toBe("Bright morning");
    expect(loose?.body).toContain("Moon favors rest");
  });

  it("parses toneTags in loose mode", () => {
    const raw = `{"headline":"H","body":"B","daytimeFocus":"","caution":"","toneTags":["Calm","Soft"]}`;
    const loose = extractTodayMoonLooseFields(raw);
    expect(loose?.toneTags).toEqual(["Calm", "Soft"]);
  });
});

describe("extractJsonStringField", () => {
  it("skips false key matches", () => {
    const raw = '{"not_headline":"x","headline":"real","body":"b"}';
    expect(extractJsonStringField(raw, "headline")).toBe("real");
  });
});

describe("extractFirstJsonObjectSlice", () => {
  it("ignores braces inside strings", () => {
    const s = '{"a":"text { not } end"}';
    expect(extractFirstJsonObjectSlice(s)).toBe(s);
  });
});

describe("stripJsonFences", () => {
  it("removes opening and closing fences", () => {
    expect(stripJsonFences("```json\n{}\n```")).toBe("{}");
  });
});

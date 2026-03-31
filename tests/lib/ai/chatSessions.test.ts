import { describe, expect, it } from "vitest";
import {
  NEW_CHAT_TITLE,
  titleFromFirstUserMessage,
} from "@/lib/ai/chatSessions";

describe("titleFromFirstUserMessage", () => {
  it("returns NEW_CHAT_TITLE for empty", () => {
    expect(titleFromFirstUserMessage("   ")).toBe(NEW_CHAT_TITLE);
  });

  it("collapses whitespace and truncates long titles", () => {
    const long = "a".repeat(100);
    const t = titleFromFirstUserMessage(long);
    expect(t.length).toBeLessThanOrEqual(73);
    expect(t.endsWith("…")).toBe(true);
  });

  it("keeps short titles", () => {
    expect(titleFromFirstUserMessage("Dasha timing")).toBe("Dasha timing");
  });
});

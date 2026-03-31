import { describe, expect, it } from "vitest";
import {
  appendChatUserContextToSystemPrompt,
  formatReportVarsForChat,
} from "@/lib/ai/chatReportVariables";
import { starterButtonText } from "@/lib/ai/chatStarterShared";
import {
  REPORT_TEMPLATE_VARIABLE_KEYS,
  type ReportTemplateVariableKey,
} from "@/lib/reports/reportTemplateVariableKeys";

function emptyVars(): Record<ReportTemplateVariableKey, string> {
  const v = {} as Record<ReportTemplateVariableKey, string>;
  for (const k of REPORT_TEMPLATE_VARIABLE_KEYS) v[k] = "";
  return v;
}

describe("formatReportVarsForChat", () => {
  it("includes identity and vimshottari line", () => {
    const vars = emptyVars();
    vars.user_email = "a@b.co";
    vars.user_name = "seeker";
    vars.birth_name = "Test";
    vars.current_mahadasha = "Saturn";
    vars.current_antardasha = "Venus";
    vars.current_dasha = "Saturn Mahadasha / Venus Antardasha";
    vars.hd_type = "Projector";
    vars.vedic_json = '{"big":true}';

    const free = formatReportVarsForChat(vars, { tier: "FREE", maxChars: 50_000 });
    expect(free).toContain("Identity:");
    expect(free).toContain("a@b.co");
    expect(free).toContain("Current Vimshottari: Saturn Mahadasha, Venus Antardasha");
    expect(free).toContain("hd_type: Projector");
    expect(free).not.toContain("vedic_json:");
  });

  it("includes json fields for CORE tier", () => {
    const vars = emptyVars();
    vars.user_email = "x@y.z";
    vars.vedic_json = '{"ok":1}';

    const core = formatReportVarsForChat(vars, { tier: "CORE", maxChars: 50_000 });
    expect(core).toContain("vedic_json:");
  });

  it("truncates overall block to maxChars", () => {
    const vars = emptyVars();
    vars.user_email = "u@e.com";
    vars.sun_sign = "x".repeat(5000);

    const out = formatReportVarsForChat(vars, { tier: "FREE", maxChars: 800 });
    expect(out.length).toBeLessThanOrEqual(900);
    expect(out).toContain("[USER_CONTEXT truncated");
  });
});

describe("appendChatUserContextToSystemPrompt", () => {
  it("appends instruction and block", () => {
    const s = appendChatUserContextToSystemPrompt("RULES", "USER_CONTEXT\nx: 1");
    expect(s).toContain("RULES");
    expect(s).toContain("USER_CONTEXT");
    expect(s).toContain("factual data");
    expect(s).toContain("x: 1");
  });

  it("returns base when block empty", () => {
    expect(appendChatUserContextToSystemPrompt("BASE", "  ")).toBe("BASE");
  });
});

describe("starterButtonText", () => {
  it("uses label when set", () => {
    expect(
      starterButtonText({ id: "1", label: "Short", message: "Long message here" })
    ).toBe("Short");
  });

  it("falls back to message", () => {
    expect(starterButtonText({ id: "1", label: "", message: "Only" })).toBe("Only");
  });
});

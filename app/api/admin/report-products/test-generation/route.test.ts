import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextResponse } from "next/server";

const mockRequireAdminApi = vi.fn();
vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

const mockFindUnique = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    birthProfile: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
  },
}));

const mockLoadPromptParts = vi.fn();
vi.mock("@/lib/reports/marketplaceReportRunner", () => ({
  loadMarketplaceReportPromptParts: (...a: unknown[]) => mockLoadPromptParts(...a),
}));

const mockGenerate = vi.fn();
vi.mock("@/lib/gemini/client", () => ({
  generateReportWithGemini: (...a: unknown[]) => mockGenerate(...a),
  GeminiGenerationError: class extends Error {
    name = "GeminiGenerationError";
  },
}));

vi.mock("@/lib/env", () => ({
  env: {
    GEMINI_REPORT_MAX_OUTPUT_TOKENS: undefined,
  },
}));

describe("POST /api/admin/report-products/test-generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdminApi.mockResolvedValue({
      session: { user: { email: "a@b.com" } },
      error: null,
    });
    mockFindUnique.mockResolvedValue({ id: "bp1", userId: "u1" });
    mockLoadPromptParts.mockResolvedValue({
      ok: true,
      vars: { hd_type: "Generator" },
      systemPrompt: "interpolated system",
      userContext: "user ctx",
    });
    mockGenerate.mockResolvedValue({
      text: "Hello report",
      wordCount: 2,
      model: "gemini-x",
      durationMs: 100,
    });
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdminApi.mockResolvedValueOnce({
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ userId: "u1", geminiPrompt: "Hi {{hd_type}}" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when user has no birth profile", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ userId: "u1", geminiPrompt: "Hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with preview on success", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ userId: "u1", geminiPrompt: "Hi {{hd_type}}" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.preview).toBe("Hello report");
    expect(data.truncated).toBe(false);
    expect(mockLoadPromptParts).toHaveBeenCalledWith(
      "u1",
      "Hi {{hd_type}}",
      expect.objectContaining({ userId: "u1" })
    );
    expect(mockGenerate).toHaveBeenCalledWith(
      "interpolated system",
      "user ctx",
      expect.objectContaining({ maxOutputTokens: 2048 })
    );
  });
});

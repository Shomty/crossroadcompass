import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextResponse } from "next/server";

const mockRequireAdminApi = vi.fn();
vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

const mockTestGeminiConnection = vi.fn();
vi.mock("@/lib/gemini/client", () => ({
  testGeminiConnection: () => mockTestGeminiConnection(),
}));

describe("POST /api/admin/gemini/test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdminApi.mockResolvedValue({
      session: { user: { email: "admin@test.com" } },
      error: null,
    });
    mockTestGeminiConnection.mockResolvedValue({
      ok: true,
      model: "gemini-1.5-pro",
      durationMs: 42,
      preview: "PONG",
    });
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdminApi.mockResolvedValueOnce({
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });

    const req = new Request("http://localhost/api/admin/gemini/test", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockTestGeminiConnection).not.toHaveBeenCalled();
  });

  it("returns 200 with body when Gemini ping succeeds", async () => {
    const req = new Request("http://localhost/api/admin/gemini/test", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.preview).toBe("PONG");
    expect(mockTestGeminiConnection).toHaveBeenCalledOnce();
  });

  it("returns 502 when Gemini ping fails", async () => {
    mockTestGeminiConnection.mockResolvedValueOnce({
      ok: false,
      model: "gemini-1.5-pro",
      durationMs: 10,
      error: "API key invalid",
    });

    const req = new Request("http://localhost/api/admin/gemini/test", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("API key invalid");
  });
});

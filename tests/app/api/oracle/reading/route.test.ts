import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/oracle/reading/route";

const mockSession = vi.fn();
const mockReading = vi.fn();

vi.mock("@/lib/auth/helpers", () => ({
  getRequiredSession: () => mockSession(),
}));

vi.mock("@/lib/ai/crossroadsOracleService", () => ({
  getCrossroadsOracleReading: (...a: unknown[]) => mockReading(...a),
}));

describe("POST /api/oracle/reading", () => {
  beforeEach(() => {
    mockSession.mockReset();
    mockReading.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    mockSession.mockRejectedValue(new Error("Unauthenticated"));
    const req = new NextRequest("http://localhost/api/oracle/reading", {
      method: "POST",
      body: JSON.stringify({ theme: "CAREER" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when theme invalid", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } });
    const req = new NextRequest("http://localhost/api/oracle/reading", {
      method: "POST",
      body: JSON.stringify({ theme: "WRONG" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with reading", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } });
    mockReading.mockResolvedValue({
      theme: "CAREER",
      cosmicContext: "a",
      psychologicalPattern: "b",
      whyNow: "c",
      concreteSteps: ["1", "2", "3"],
      dashaLabel: "Saturn · Venus",
      generatedAt: new Date().toISOString(),
      cacheKey: "oracle:u1:CAREER:S-V",
    });
    const req = new NextRequest("http://localhost/api/oracle/reading", {
      method: "POST",
      body: JSON.stringify({ theme: "CAREER" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reading.theme).toBe("CAREER");
    expect(mockReading).toHaveBeenCalledWith("u1", "CAREER", false);
  });

  it("returns 412 for DASHA_NOT_READY", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } });
    mockReading.mockRejectedValue(new Error("DASHA_NOT_READY"));
    const req = new NextRequest("http://localhost/api/oracle/reading", {
      method: "POST",
      body: JSON.stringify({ theme: "LOVE" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(412);
  });
});

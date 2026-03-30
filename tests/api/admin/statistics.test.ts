import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "@/app/api/admin/statistics/route";

const mockRequireAdminApi = vi.fn();
vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

const mockComputeAdminStatistics = vi.fn();
vi.mock("@/lib/admin/adminStatistics", () => ({
  computeAdminStatistics: () => mockComputeAdminStatistics(),
}));

describe("GET /api/admin/statistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdminApi.mockResolvedValue({
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });
    const res = await GET(new Request("http://localhost/api/admin/statistics"));
    expect(res.status).toBe(403);
  });

  it("returns JSON payload from computeAdminStatistics", async () => {
    mockRequireAdminApi.mockResolvedValue({
      session: { user: { id: "a1" } },
      error: null,
    });
    mockComputeAdminStatistics.mockResolvedValue({
      mrr: 120,
      activeUsers: 10,
      freeCount: 3,
      seekerCount: 5,
      navigatorCount: 2,
      churnRate30d: 0,
      conversionRate: 0,
      sessionsBooked30d: 0,
      mrrTrend: [],
      insightOpenRate: 0,
      reportGeneratedCount: 0,
    });

    const res = await GET(new Request("http://localhost/api/admin/statistics"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mrr).toBe(120);
    expect(body.activeUsers).toBe(10);
  });
});

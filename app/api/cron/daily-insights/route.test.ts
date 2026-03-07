import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

vi.mock("@/lib/env", () => ({
  env: {
    CRON_SECRET: "test-cron-secret",
    APP_URL: "http://localhost:3000",
  },
}));

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    birthProfile: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    insight: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

const mockGetTodaysDailyInsight = vi.fn();
const mockGenerateDailyInsight = vi.fn();
vi.mock("@/lib/ai/dailyInsightService", () => ({
  getTodaysDailyInsight: (...args: unknown[]) => mockGetTodaysDailyInsight(...args),
  generateDailyInsight: (...args: unknown[]) => mockGenerateDailyInsight(...args),
}));

const mockGetOrCreateHDChart = vi.fn();
vi.mock("@/lib/astro/chartService", () => ({
  getOrCreateHDChart: (...args: unknown[]) => mockGetOrCreateHDChart(...args),
}));

vi.mock("@/lib/email/client", () => ({
  sendEmail: vi.fn(),
}));

describe("GET /api/cron/daily-insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
  });

  it("returns 401 when CRON_SECRET is set and Authorization header is missing", async () => {
    const req = new NextRequest("http://localhost/api/cron/daily-insights", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns 401 when CRON_SECRET is set and token does not match", async () => {
    const req = new NextRequest("http://localhost/api/cron/daily-insights", {
      method: "GET",
      headers: { authorization: "Bearer wrong-token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns 200 with empty summary when no profiles and token is valid", async () => {
    mockFindMany.mockResolvedValue([]);
    const req = new NextRequest("http://localhost/api/cron/daily-insights", {
      method: "GET",
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ total: 0, generated: 0, skipped: 0, errors: 0 });
    expect(mockFindMany).toHaveBeenCalled();
  });

  it("skips user when today's insight already exists", async () => {
    const profileIndex = {
      userId: "user1",
      birthName: "Test",
      user: { email: "test@example.com" },
    };
    mockFindMany.mockResolvedValue([profileIndex]);
    mockGetTodaysDailyInsight.mockResolvedValue({ summary: "Existing", insight: "...", action: "...", energyTheme: "...", generatedAt: "" });

    const req = new NextRequest("http://localhost/api/cron/daily-insights", {
      method: "GET",
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.skipped).toBe(1);
    expect(data.generated).toBe(0);
    expect(mockGenerateDailyInsight).not.toHaveBeenCalled();
  });

  it("generates insight and returns summary when profile exists and no insight yet", async () => {
    const profileIndex = {
      userId: "user1",
      birthName: "Test",
      user: { email: "test@example.com" },
    };
    const fullProfile = { id: "bp1", userId: "user1", birthName: "Test", birthDate: new Date(), birthTimeKnown: false, birthCity: "x", birthCountry: "y", latitude: 0, longitude: 0, timezone: "UTC", profileVersion: 1, chartDataHumanDesign: null, chartDataVedic: null, hdProfileVersion: null, vedicProfileVersion: null, gender: null, birthHour: null, birthMinute: null, intakeLifeSituation: null, intakePrimaryFocus: null, intakeWantsClarity: null };
    const fakeChart = { type: "Generator", strategy: "Wait", signature: "", notSelfTheme: "", authority: "Sacral", profile: "2/4", definition: "Single", incarnationCross: { type: "Right Angle", gates: { personalitySun: 1, personalityEarth: 2, designSun: 3, designEarth: 4 } }, definedCenters: [], undefinedCenters: [], activeChannels: [], activeGates: [], variables: { digestion: { arrow: "Left", color: 1, tone: 1, colorName: "" }, environment: { arrow: "Left", color: 1, tone: 1, colorName: "" }, perspective: { arrow: "Left", color: 1, tone: 1, colorName: "" }, motivation: { arrow: "Left", color: 1, tone: 1, colorName: "" } }, personality: [], design: [], designDate: "" };
    const insight = { summary: "S", insight: "I", action: "A", energyTheme: "E", generatedAt: new Date().toISOString() };

    mockFindMany.mockResolvedValue([profileIndex]);
    mockGetTodaysDailyInsight.mockResolvedValue(null);
    mockFindUnique.mockResolvedValue(fullProfile);
    mockGetOrCreateHDChart.mockResolvedValue(fakeChart);
    mockGenerateDailyInsight.mockResolvedValue(insight);
    mockFindFirst.mockResolvedValue({ id: "ins1" });

    const req = new NextRequest("http://localhost/api/cron/daily-insights", {
      method: "GET",
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.generated).toBe(1);
    expect(data.errors).toBe(0);
    expect(mockGenerateDailyInsight).toHaveBeenCalledWith("user1", fakeChart, "Test");
  });
});

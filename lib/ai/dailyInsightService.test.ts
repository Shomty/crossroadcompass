import { describe, it, expect, vi, beforeEach } from "vitest";
import type { HDChartData } from "@/types";

const mockDashaFindFirst = vi.fn();
const mockInsightUpsert = vi.fn();
const mockInsightFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    dasha: {
      findFirst: (...args: unknown[]) => mockDashaFindFirst(...args),
    },
    insight: {
      upsert: (...args: unknown[]) => mockInsightUpsert(...args),
      findFirst: (...args: unknown[]) => mockInsightFindFirst(...args),
    },
  },
}));

const mockGenerateContent = vi.fn();
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: (...args: unknown[]) => mockGenerateContent(...args),
    }),
  })),
}));

describe("dailyInsightService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashaFindFirst.mockResolvedValue(null);
  });

  const fakeChart: HDChartData = {
    type: "Generator",
    strategy: "Wait",
    signature: "test",
    notSelfTheme: "test",
    authority: "Sacral",
    profile: "2/4",
    definition: "Single",
    incarnationCross: { type: "Right Angle", gates: { personalitySun: 1, personalityEarth: 2, designSun: 3, designEarth: 4 } },
    definedCenters: [],
    undefinedCenters: [],
    activeChannels: [],
    activeGates: [],
    variables: {
      digestion: { arrow: "Left", color: 1, tone: 1, colorName: "calm" },
      environment: { arrow: "Left", color: 1, tone: 1, colorName: "passive" },
      perspective: { arrow: "Left", color: 1, tone: 1, colorName: "outer" },
      motivation: { arrow: "Left", color: 1, tone: 1, colorName: "peace" },
    },
    personality: [],
    design: [],
    designDate: new Date().toISOString(),
  };

  describe("generateDailyInsight", () => {
    it("returns parsed insight and upserts to DB", async () => {
      const json = JSON.stringify({
        summary: "Test summary",
        insight: "Test insight text.",
        action: "Take a rest.",
        energyTheme: "Calm",
      });
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => json },
      });
      mockInsightUpsert.mockResolvedValueOnce({});

      const { generateDailyInsight } = await import("./dailyInsightService");
      const result = await generateDailyInsight("user1", fakeChart, "Test User");

      expect(result.summary).toBe("Test summary");
      expect(result.insight).toBe("Test insight text.");
      expect(result.action).toBe("Take a rest.");
      expect(result.energyTheme).toBe("Calm");
      expect(result.generatedAt).toBeDefined();
      expect(mockInsightUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_type_periodDate: { userId: "user1", type: "DAILY", periodDate: expect.any(Date) } },
          create: expect.objectContaining({ userId: "user1", type: "DAILY" }),
          update: expect.objectContaining({ content: expect.any(String) }),
        })
      );
    });

    it("strips markdown code fences from Gemini response", async () => {
      const raw = "```json\n" + JSON.stringify({
        summary: "S",
        insight: "I",
        action: "A",
        energyTheme: "E",
      }) + "\n```";
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => raw },
      });
      mockInsightUpsert.mockResolvedValueOnce({});

      const { generateDailyInsight } = await import("./dailyInsightService");
      const result = await generateDailyInsight("user1", fakeChart, null);

      expect(result.summary).toBe("S");
      expect(result.energyTheme).toBe("E");
    });
  });

  describe("getTodaysDailyInsight", () => {
    it("returns null when no insight row exists", async () => {
      mockInsightFindFirst.mockResolvedValueOnce(null);
      const { getTodaysDailyInsight } = await import("./dailyInsightService");
      const result = await getTodaysDailyInsight("user1");
      expect(result).toBeNull();
    });

    it("returns parsed DailyInsight when row exists", async () => {
      const content = {
        summary: "Today's theme",
        insight: "Insight text.",
        action: "Action.",
        energyTheme: "Flow",
        generatedAt: new Date().toISOString(),
      };
      mockInsightFindFirst.mockResolvedValueOnce({
        id: "ins1",
        content: JSON.stringify(content),
      });
      const { getTodaysDailyInsight } = await import("./dailyInsightService");
      const result = await getTodaysDailyInsight("user1");
      expect(result).toEqual(content);
    });
  });
});

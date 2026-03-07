import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BirthProfile } from "@prisma/client";
import type { HDChartData } from "@/types";

const mockKvGet = vi.fn();
const mockKvSet = vi.fn();
const mockKvDeleteMany = vi.fn();

vi.mock("@/lib/kv/helpers", () => ({
  kvGet: (...args: unknown[]) => mockKvGet(...args),
  kvSet: (...args: unknown[]) => mockKvSet(...args),
  kvDeleteMany: (...args: unknown[]) => mockKvDeleteMany(...args),
}));

vi.mock("@/lib/kv/keys", () => ({
  kvKeys: {
    vedicChart: (userId: string) => `chart:vedic:${userId}`,
    hdChart: (userId: string) => `chart:hd:${userId}`,
    dashas: (userId: string) => `chart:dashas:${userId}`,
  },
  KV_TTL: { NATAL_CHART: undefined },
}));

const mockUpdate = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    birthProfile: {
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

const mockCalculateHDChart = vi.fn();
vi.mock("@/lib/astro/hdCalculator", () => ({
  calculateHDChart: (...args: unknown[]) => mockCalculateHDChart(...args),
}));

const mockFetchVedicNatalChart = vi.fn();
vi.mock("@/lib/astro/vedicApiClient", () => ({
  fetchVedicNatalChart: (...args: unknown[]) => mockFetchVedicNatalChart(...args),
}));

const mockStoreDashasFromChart = vi.fn();
vi.mock("@/lib/astro/dashaService", () => ({
  storeDashasFromChart: (...args: unknown[]) => mockStoreDashasFromChart(...args),
}));

describe("chartService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fakeHDChart: HDChartData = {
    type: "Generator",
    strategy: "Wait",
    signature: "test",
    notSelfTheme: "test",
    authority: "Sacral",
    profile: "2/4",
    definition: "Single",
    incarnationCross: {
      type: "Right Angle",
      gates: {
        personalitySun: 1,
        personalityEarth: 2,
        designSun: 3,
        designEarth: 4,
      },
    },
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

  const baseProfile = {
    id: "bp1",
    userId: "user1",
    birthDate: new Date("1990-01-15"),
    birthTimeKnown: true,
    birthHour: 12,
    birthMinute: 0,
    birthCity: "Belgrade",
    birthCountry: "Serbia",
    latitude: 44.8,
    longitude: 20.5,
    timezone: "Europe/Belgrade",
    birthName: "Test",
    gender: "other",
    profileVersion: 1,
    chartDataHumanDesign: null,
    chartDataVedic: null,
    hdProfileVersion: null,
    vedicProfileVersion: null,
    intakeLifeSituation: null,
    intakePrimaryFocus: null,
    intakeWantsClarity: null,
  } as BirthProfile;

  describe("invalidateChartCache", () => {
    it("calls kvDeleteMany with vedic, hd, and dashas keys for the user", async () => {
      const { invalidateChartCache } = await import("./chartService");
      await invalidateChartCache("user1");
      expect(mockKvDeleteMany).toHaveBeenCalledWith([
        "chart:vedic:user1",
        "chart:hd:user1",
        "chart:dashas:user1",
      ]);
    });
  });

  describe("getOrCreateHDChart", () => {
    it("returns cached chart from KV when present", async () => {
      mockKvGet.mockResolvedValueOnce(fakeHDChart);
      const { getOrCreateHDChart } = await import("./chartService");
      const result = await getOrCreateHDChart("user1", baseProfile);
      expect(result).toEqual(fakeHDChart);
      expect(mockCalculateHDChart).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns chart from DB when KV misses but profile has chartDataHumanDesign", async () => {
      mockKvGet.mockResolvedValueOnce(null);
      const profileWithChart = {
        ...baseProfile,
        chartDataHumanDesign: fakeHDChart as unknown as object,
      };
      const { getOrCreateHDChart } = await import("./chartService");
      const result = await getOrCreateHDChart("user1", profileWithChart);
      expect(result).toEqual(fakeHDChart);
      expect(mockKvSet).toHaveBeenCalled();
      expect(mockCalculateHDChart).not.toHaveBeenCalled();
    });

    it("calculates and persists when KV and DB both miss", async () => {
      mockKvGet.mockResolvedValueOnce(null);
      mockCalculateHDChart.mockReturnValueOnce(fakeHDChart);
      mockUpdate.mockResolvedValueOnce(undefined);
      mockKvSet.mockResolvedValueOnce(undefined);

      const { getOrCreateHDChart } = await import("./chartService");
      const result = await getOrCreateHDChart("user1", baseProfile);

      expect(result).toEqual(fakeHDChart);
      expect(mockCalculateHDChart).toHaveBeenCalledTimes(1);
      expect(mockKvSet).toHaveBeenCalledWith("chart:hd:user1", fakeHDChart, undefined);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { userId: "user1" },
        data: expect.objectContaining({
          chartDataHumanDesign: fakeHDChart,
          hdProfileVersion: 1,
        }),
      });
    });
  });

  describe("getOrCreateVedicChart", () => {
    it("returns cached chart from KV when present", async () => {
      const vedicChart = { planets: [] };
      mockKvGet.mockResolvedValueOnce(vedicChart);
      const { getOrCreateVedicChart } = await import("./chartService");
      const result = await getOrCreateVedicChart("user1", baseProfile);
      expect(result).toEqual(vedicChart);
      expect(mockFetchVedicNatalChart).not.toHaveBeenCalled();
    });

    it("fetches from API when KV and DB miss", async () => {
      mockKvGet.mockResolvedValueOnce(null);
      const vedicChart = { rawResponse: {}, planets: [] };
      mockFetchVedicNatalChart.mockResolvedValueOnce(vedicChart);
      mockKvSet.mockResolvedValue(undefined);
      mockUpdate.mockResolvedValue(undefined);
      mockStoreDashasFromChart.mockResolvedValue(undefined);

      const { getOrCreateVedicChart } = await import("./chartService");
      const result = await getOrCreateVedicChart("user1", baseProfile);

      expect(mockFetchVedicNatalChart).toHaveBeenCalledTimes(1);
      expect(result).toEqual(vedicChart);
      expect(mockStoreDashasFromChart).toHaveBeenCalledWith("user1", {});
    });
  });
});

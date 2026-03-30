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
    vedicChart:            (userId: string) => `chart:vedic:${userId}`,
    hdChart:               (userId: string) => `chart:hd:${userId}`,
    dashas:                (userId: string) => `chart:dashas:${userId}`,
    specialPoints:               (userId: string) => `chart:specialpointsv2:${userId}`,
    specialPointsLegacy:         (userId: string) => `chart:specialpoints:${userId}`,
    specialPointsInsights:       (userId: string) => `chart:specialpoints:insights:${userId}`,
    extendedSpecialPoints:       (userId: string) => `chart:specialpoints:ext:v3:${userId}`,
    extendedSpecialPointsLegacy: (userId: string) => `chart:specialpoints:ext:v2:${userId}`,
    divisionalCharts:      (userId: string) => `chart:divisional:${userId}`,
    currentDasha:          (userId: string) => `chart:dasha:current:${userId}`,
    yogas:                 (userId: string) => `chart:yogas:${userId}`,
  },
  KV_TTL: { NATAL_CHART: undefined, TRANSIT_SECONDS: 86400 },
}));

const mockBirthProfileFindUnique = vi.fn().mockResolvedValue(null);
const mockUpdate = vi.fn();
const mockDashaCount = vi.fn().mockResolvedValue(1);
vi.mock("@/lib/db", () => ({
  db: {
    birthProfile: {
      findUnique: (...args: unknown[]) => mockBirthProfileFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    dasha: {
      count: (...args: unknown[]) => mockDashaCount(...args),
    },
    insight: {
      deleteMany: vi.fn().mockResolvedValue({}),
    },
  },
}));

const mockCalculateHDChart = vi.fn();
vi.mock("@/lib/astro/hdCalculator", () => ({
  calculateHDChart: (...args: unknown[]) => mockCalculateHDChart(...args),
}));

const mockCalculateChart = vi.fn();
const mockCalculateAllDivisionalCharts = vi.fn().mockReturnValue({});
const mockGetCurrentDasha = vi.fn().mockReturnValue({});

vi.mock("@/lib/astro/calculatorService", () => ({
  getVedicCalculator: () => ({
    calculateChart: (...args: unknown[]) => mockCalculateChart(...args),
    calculateAllDivisionalCharts: mockCalculateAllDivisionalCharts,
    getCurrentDasha: mockGetCurrentDasha,
  }),
}));

const mockStoreDashasFromChart = vi.fn();
vi.mock("@/lib/astro/dashaService", () => ({
  storeDashasFromChart: (...args: unknown[]) => mockStoreDashasFromChart(...args),
}));

vi.mock("@/lib/astro/birthInfoMapper", () => ({
  prismaProfileToBirthInfo: vi.fn().mockReturnValue({
    name: "Test",
    dateOfBirth: "1990-01-15",
    timeOfBirth: "12:00",
    latitude: 44.8,
    longitude: 20.5,
    timezone: "Europe/Belgrade",
  }),
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
    it("calls kvDeleteMany with all chart cache keys for the user", async () => {
      const { invalidateChartCache } = await import("./chartService");
      await invalidateChartCache("user1");
      expect(mockKvDeleteMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          "chart:vedic:user1",
          "chart:hd:user1",
          "chart:dashas:user1",
          "chart:divisional:user1",
          "chart:dasha:current:user1",
        ])
      );
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

    it("returns chart from DB when KV misses but DB row has matching HD snapshot", async () => {
      mockKvGet.mockResolvedValueOnce(null);
      mockBirthProfileFindUnique.mockResolvedValueOnce({
        chartDataHumanDesign: fakeHDChart as unknown as object,
        hdProfileVersion: 1,
        profileVersion: 1,
      });
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
      const vedicChart = {
        ascendant: { sign: 'aries', degree: 15 },
        planets: { sun: { sign: 'aries', house: 1 }, moon: { sign: 'taurus', house: 2 } },
        dashas: { vimshottari: { dashaPeriods: [] } },
        yogas: [],
      };
      mockKvGet.mockResolvedValueOnce(vedicChart);
      mockDashaCount.mockResolvedValueOnce(1);
      const { getOrCreateVedicChart } = await import("./chartService");
      const result = await getOrCreateVedicChart("user1", baseProfile);
      expect(result).toEqual(vedicChart);
      expect(mockCalculateChart).not.toHaveBeenCalled();
    });

    it("calculates when KV and DB miss", async () => {
      mockKvGet.mockResolvedValueOnce(null);
      const vedicChart = {
        ascendant: { sign: 'aries', degree: 15 },
        planets: { sun: { sign: 'aries', house: 1 }, moon: { sign: 'taurus', house: 2 } },
        dashas: { vimshottari: { dashaPeriods: [] } },
        yogas: [],
      };
      mockCalculateChart.mockResolvedValueOnce(vedicChart);
      mockKvSet.mockResolvedValue(undefined);
      mockUpdate.mockResolvedValue(undefined);
      mockStoreDashasFromChart.mockResolvedValue(undefined);

      const { getOrCreateVedicChart } = await import("./chartService");
      const result = await getOrCreateVedicChart("user1", baseProfile);

      expect(mockCalculateChart).toHaveBeenCalledTimes(1);
      expect(result).toEqual(vedicChart);
      expect(mockStoreDashasFromChart).toHaveBeenCalledWith("user1", vedicChart);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, PATCH } from "./route";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockTransaction = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    birthProfile: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

const mockInvalidateChartCache = vi.fn();
const mockGetOrCreateHDChart = vi.fn();
vi.mock("@/lib/astro/chartService", () => ({
  invalidateChartCache: (...args: unknown[]) => mockInvalidateChartCache(...args),
  getOrCreateHDChart: (...args: unknown[]) => mockGetOrCreateHDChart(...args),
}));

describe("POST /api/birth-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockFindUnique.mockResolvedValue(null); // no existing profile by default
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "POST",
      body: JSON.stringify(validBody()),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 422 when validation fails", async () => {
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "POST",
      body: JSON.stringify({ birthName: "", birthDate: "invalid", birthCity: "x", birthCountry: "y", latitude: 0, longitude: 0, timezone: "UTC", birthTimeKnown: false }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
  });

  it("returns 409 when profile already exists", async () => {
    mockFindUnique.mockResolvedValueOnce({ id: "bp1" });
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "POST",
      body: JSON.stringify(validBody()),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 201 and creates profile with valid body", async () => {
    mockCreate.mockResolvedValueOnce({ id: "bp1", userId: "user1" });
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "POST",
      body: JSON.stringify(validBody()),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.profileId).toBe("bp1");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user1",
          birthCity: "Belgrade",
          birthCountry: "Serbia",
          latitude: 44.8,
          longitude: 20.5,
          timezone: "Europe/Belgrade",
          birthName: "Test",
          birthTimeKnown: true,
          birthHour: 10,
          birthMinute: 30,
        }),
      })
    );
  });
});

describe("PATCH /api/birth-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockFindUnique.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "PATCH",
      body: JSON.stringify(validBody()),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 422 when birthHour/birthMinute missing with birthTimeKnown true", async () => {
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "PATCH",
      body: JSON.stringify({
        ...validBody(),
        birthTimeKnown: true,
        birthHour: undefined,
        birthMinute: undefined,
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(422);
  });

  it("returns 404 when no existing profile", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "PATCH",
      body: JSON.stringify(validBody()),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it("runs transaction and invalidates chart cache on valid update", async () => {
    mockFindUnique.mockResolvedValue({ id: "bp1", userId: "user1" });
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        birthProfile: { update: vi.fn().mockResolvedValue(undefined) },
        dasha: { deleteMany: vi.fn().mockResolvedValue(undefined) },
      };
      return fn(tx);
    });

    const req = new NextRequest("http://localhost/api/birth-profile", {
      method: "PATCH",
      body: JSON.stringify(validBody()),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.updated).toBe(true);
    expect(data.notice).toContain("Past insights");
    expect(mockTransaction).toHaveBeenCalled();
    expect(mockInvalidateChartCache).toHaveBeenCalledWith("user1");
  });
});

describe("GET /api/birth-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockFindUnique.mockResolvedValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 404 when no profile", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns 200 with profile when found", async () => {
    const profile = {
      birthName: "Test",
      birthDate: new Date("1990-01-15"),
      birthTimeKnown: true,
      birthHour: 10,
      birthMinute: 30,
      gender: "other",
      birthCity: "Belgrade",
      birthCountry: "Serbia",
      latitude: 44.8,
      longitude: 20.5,
      timezone: "Europe/Belgrade",
      profileVersion: 1,
    };
    mockFindUnique.mockResolvedValue(profile);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    // Response profile may have serialized dates (string) from JSON
    expect(data.profile.birthName).toBe(profile.birthName);
    expect(data.profile.birthCity).toBe(profile.birthCity);
    expect(data.profile.profileVersion).toBe(profile.profileVersion);
  });
});

function validBody() {
  return {
    birthName: "Test",
    birthDate: "1990-01-15",
    birthTimeKnown: true,
    birthHour: 10,
    birthMinute: 30,
    birthCity: "Belgrade",
    birthCountry: "Serbia",
    latitude: 44.8,
    longitude: 20.5,
    timezone: "Europe/Belgrade",
    gender: "other",
  };
}

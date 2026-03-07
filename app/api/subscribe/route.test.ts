import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

const mockUpsert = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

const mockMockCharge = vi.fn();
vi.mock("@/lib/payments/mockPaymentService", () => ({
  mockCharge: (...args: unknown[]) => mockMockCharge(...args),
  TIER_PRICES: { CORE: { amountCents: 999 }, VIP: { amountCents: 2999 } },
}));

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockUpsert.mockResolvedValue({});
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify(validBody()),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockMockCharge).not.toHaveBeenCalled();
  });

  it("returns 422 when validation fails", async () => {
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({
        tier: "INVALID",
        card: { number: "4242", expiry: "12/30", cvc: "123", name: "Test" },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
  });

  it("returns 402 when mock charge fails", async () => {
    mockMockCharge.mockResolvedValueOnce({ success: false, transactionId: "", error: "Card declined" });
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify(validBody()),
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.error).toBe("Card declined");
  });

  it("returns 200 and upserts subscription when charge succeeds", async () => {
    mockMockCharge.mockResolvedValueOnce({ success: true, transactionId: "tx_123" });
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify(validBody()),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.tier).toBe("CORE");
    expect(data.transactionId).toBe("tx_123");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user1" },
        create: expect.objectContaining({
          userId: "user1",
          tier: "CORE",
          status: "ACTIVE",
          stripeSubscriptionId: "tx_123",
        }),
      })
    );
  });
});

function validBody() {
  return {
    tier: "CORE",
    card: {
      number: "4242424242424242",
      expiry: "12/30",
      cvc: "123",
      name: "Test User",
    },
  };
}

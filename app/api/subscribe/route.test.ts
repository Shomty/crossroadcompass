import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("POST /api/subscribe", () => {
  it("returns 410 Gone with Stripe checkout migration message", async () => {
    const req = new NextRequest("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ tier: "CORE" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(410);
    const data = await res.json();
    expect(data.error).toMatch(/stripe\/checkout/i);
  });
});

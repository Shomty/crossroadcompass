import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditActionType } from "@prisma/client";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

const mockAuditCreate = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: (...args: unknown[]) => mockAuditCreate(...args),
    },
  },
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`redirect:${url}`);
  },
}));

import { requireAdmin, writeAuditLog } from "@/lib/auth/adminHelpers";

describe("adminHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requireAdmin redirects to login when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow(/redirect:\/login/);
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("requireAdmin redirects when session has no email", async () => {
    mockAuth.mockResolvedValue({ user: { role: "ADMIN" } });
    await expect(requireAdmin()).rejects.toThrow(/redirect:\/login/);
  });

  it("requireAdmin redirects non-admin to dashboard", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "u@x.com", role: "USER", isAdmin: false },
    });
    await expect(requireAdmin()).rejects.toThrow(
      /redirect:\/dashboard\?error=unauthorized/
    );
  });

  it("requireAdmin returns session for ADMIN role", async () => {
    const session = {
      user: { email: "a@x.com", role: "ADMIN" as const },
    };
    mockAuth.mockResolvedValue(session);
    await expect(requireAdmin()).resolves.toEqual(session);
  });

  it("requireAdmin returns session when isAdmin flag is true", async () => {
    const session = {
      user: { email: "a@x.com", role: "USER" as const, isAdmin: true },
    };
    mockAuth.mockResolvedValue(session);
    await expect(requireAdmin()).resolves.toEqual(session);
  });

  it("writeAuditLog persists mapped action type", async () => {
    mockAuditCreate.mockResolvedValue({});
    await writeAuditLog({
      adminEmail: "admin@x.com",
      action: "report.create",
      targetType: "report",
      targetId: "prod_1",
      detail: "created",
      ip: "127.0.0.1",
    });
    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminEmail: "admin@x.com",
        actionType: AuditActionType.REPORT_PRODUCT_CREATED,
        actionLabel: "report.create",
        targetType: "report",
        targetId: "prod_1",
        detail: "created",
        ip: "127.0.0.1",
      }),
    });
  });
});

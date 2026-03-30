/**
 * Admin session helpers and audit logging (task AP.1).
 * API routes should use requireAdminApi from @/lib/admin/requireAdmin for JSON 403.
 */

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuditActionType } from "@prisma/client";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export type AdminSession = Session;

const ACTION_MAP: Record<string, AuditActionType> = {
  "report.create": AuditActionType.REPORT_PRODUCT_CREATED,
  "prompt.save": AuditActionType.REPORT_PROMPT_SAVED,
  "report.activate": AuditActionType.REPORT_ACTIVATE_TOGGLED,
  "report.test": AuditActionType.REPORT_TEST_RUN,
  "report.regenerate": AuditActionType.REPORT_REGENERATE,
  "payment.bank_instructions_sent":
    AuditActionType.PAYMENT_BANK_INSTRUCTIONS_SENT,
  "user.impersonate": AuditActionType.USER_IMPERSONATE,
  "user.patch": AuditActionType.USER_ADMIN_UPDATE,
};

function isAdminSession(session: Session | null): boolean {
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.isAdmin === true;
}

/**
 * Server components / server actions: redirect if unauthenticated or non-admin.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }
  if (!isAdminSession(session)) {
    redirect("/dashboard?error=unauthorized");
  }
  return session;
}

export async function writeAuditLog(opts: {
  adminEmail: string;
  action: string;
  targetType: "user" | "report" | "payment" | "prompt";
  targetId: string;
  detail?: string;
  ip?: string;
}): Promise<void> {
  try {
    const actionType =
      ACTION_MAP[opts.action] ?? AuditActionType.USER_ADMIN_UPDATE;
    await db.auditLog.create({
      data: {
        adminEmail: opts.adminEmail,
        actionType,
        targetId: opts.targetId,
        targetType: opts.targetType,
        actionLabel: opts.action,
        detail: opts.detail,
        ip: opts.ip,
      },
    });
  } catch (err) {
    console.error("[writeAuditLog] Failed:", err);
  }
}

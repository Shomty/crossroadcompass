// STATUS: done | Task Admin-3
import { AuditActionType } from "@prisma/client";
import { db } from "@/lib/db";

interface AuditLogParams {
  adminEmail: string;
  actionType: AuditActionType;
  targetId?: string;
  targetType?: string;
  before?: unknown;
  after?: unknown;
  notes?: string;
  actionLabel?: string;
  detail?: string;
  ip?: string;
}

/**
 * Write an audit log entry. Never throws to caller — failures are silent server-side.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        adminEmail: params.adminEmail,
        actionType: params.actionType,
        targetId: params.targetId,
        targetType: params.targetType,
        before: params.before !== undefined ? JSON.stringify(params.before) : undefined,
        after: params.after !== undefined ? JSON.stringify(params.after) : undefined,
        notes: params.notes,
        actionLabel: params.actionLabel,
        detail: params.detail,
        ip: params.ip,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}

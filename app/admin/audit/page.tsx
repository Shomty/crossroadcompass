// STATUS: done | Task Admin-13
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { AuditActionType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ adminEmail?: string; actionType?: string; dateFrom?: string; dateTo?: string; cursor?: string }>;
}) {
  await requireAdminSession();

  const sp = await searchParams;
  const PAGE_SIZE = 50;

  const where: Record<string, unknown> = {};
  if (sp.adminEmail) where.adminEmail = { contains: sp.adminEmail };
  if (sp.actionType) where.actionType = sp.actionType as AuditActionType;
  if (sp.dateFrom || sp.dateTo) {
    where.timestamp = {
      ...(sp.dateFrom ? { gte: new Date(sp.dateFrom) } : {}),
      ...(sp.dateTo ? { lte: new Date(sp.dateTo) } : {}),
    };
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: PAGE_SIZE,
    ...(sp.cursor ? { skip: 1, cursor: { id: sp.cursor } } : {}),
  });

  const nextCursor = logs.length === PAGE_SIZE ? logs[logs.length - 1].id : null;

  const serializedLogs = logs.map((l) => ({ ...l, timestamp: l.timestamp.toISOString() }));

  const ACTION_TYPES = Object.values(AuditActionType);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 28,
          fontWeight: 400,
          color: "#f0dca0",
          margin: 0,
          marginBottom: 6,
        }}>
          Audit Log
        </h1>
        <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", margin: 0 }}>
          Immutable record of all admin actions
        </p>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          name="adminEmail"
          defaultValue={sp.adminEmail}
          placeholder="Filter by admin email..."
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.7)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            width: 220,
            outline: "none",
          }}
        />
        <select
          name="actionType"
          defaultValue={sp.actionType ?? ""}
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.7)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            outline: "none",
          }}
        >
          <option value="">All action types</option>
          {ACTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="date"
          name="dateFrom"
          defaultValue={sp.dateFrom}
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.7)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            outline: "none",
          }}
        />
        <input
          type="date"
          name="dateTo"
          defaultValue={sp.dateTo}
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.7)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 16px",
            background: "rgba(200,135,58,0.15)",
            border: "1px solid rgba(200,135,58,0.4)",
            borderRadius: 6,
            color: "#e8b96a",
            cursor: "pointer",
          }}
        >
          Filter
        </button>
      </form>

      <AuditLogViewer logs={serializedLogs} nextCursor={nextCursor} />
    </div>
  );
}

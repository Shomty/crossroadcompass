// STATUS: done | Task Admin-10
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TIER_COLORS: Record<string, string> = {
  FREE: "#606880",
  CORE: "#c8873a",
  VIP: "#e8b96a",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await requireAdminSession();

  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = parseInt(sp.page ?? "1");
  const PAGE_SIZE = 50;

  const where = search ? { email: { contains: search } } : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: { select: { tier: true, status: true } },
        birthProfile: { select: { chartDataHumanDesign: true } },
        insights: { orderBy: { deliveredAt: "desc" }, take: 1, select: { deliveredAt: true } },
        _count: { select: { insights: true } },
      },
    }),
    db.user.count({ where }),
  ]);

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
          Users
        </h1>
        <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", margin: 0 }}>
          {total} total users
        </p>
      </div>

      {/* Search */}
      <form method="GET" style={{ marginBottom: 20 }}>
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by email..."
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.7)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            width: 280,
            outline: "none",
          }}
        />
      </form>

      {/* Table */}
      <div style={{
        background: "rgba(28,35,64,0.4)",
        border: "1px solid rgba(200,135,58,0.1)",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 90px 90px 80px 100px",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(200,135,58,0.15)",
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 10,
          color: "#c8873a",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          <div>Email</div>
          <div>Tier</div>
          <div>Status</div>
          <div>Joined</div>
          <div>Chart</div>
          <div>Insights</div>
        </div>

        {users.map((u, i) => (
          <Link
            key={u.id}
            href={`/admin/users/${u.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 90px 90px 80px 100px",
              padding: "10px 16px",
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              textDecoration: "none",
              transition: "background 0.1s",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#c8d0e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {u.email}
            </div>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: TIER_COLORS[u.subscription?.tier ?? "FREE"] ?? "#606880" }}>
              {u.subscription?.tier ?? "FREE"}
            </div>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
              {u.subscription?.status ?? "—"}
            </div>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
              {new Date(u.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: u.birthProfile?.chartDataHumanDesign ? "#80D4A0" : "#E8705A" }}>
              {u.birthProfile?.chartDataHumanDesign ? "✓" : "✗"}
            </div>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
              {u._count.insights}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12 }}>
          {page > 1 && (
            <Link href={`?search=${search}&page=${page - 1}`} style={{ color: "#c8873a", textDecoration: "none" }}>← Prev</Link>
          )}
          <span style={{ color: "#606880" }}>Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
          {page < Math.ceil(total / PAGE_SIZE) && (
            <Link href={`?search=${search}&page=${page + 1}`} style={{ color: "#c8873a", textDecoration: "none" }}>Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}

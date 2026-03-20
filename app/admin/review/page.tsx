// STATUS: done | Task Admin-7
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { ReviewQueue } from "@/components/admin/ReviewQueue";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  await requireAdminSession();

  const pending = await db.insight.findMany({
    where: { reviewedByConsultant: false, rejectedAt: null },
    orderBy: { generatedAt: "asc" },
    take: 50,
    include: {
      user: { select: { email: true, birthProfile: { select: { hdType: true } } } },
    },
  });

  const items = pending.map((insight) => {
    const email = insight.user.email ?? "";
    const atIdx = email.indexOf("@");
    const partialEmail =
      atIdx > 3
        ? email.slice(0, 3) + "***" + email.slice(atIdx)
        : email.slice(0, 1) + "***" + (atIdx >= 0 ? email.slice(atIdx) : "");

    return {
      id: insight.id,
      type: insight.type as string,
      content: insight.content as string,
      generatedAt: insight.generatedAt.toISOString(),
      partialEmail,
      hdType: insight.user.birthProfile?.hdType ?? null,
    };
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 28,
          fontWeight: 400,
          color: "#f0dca0",
          margin: 0,
          marginBottom: 6,
        }}>
          Content Review Queue
        </h1>
        <p style={{
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 12,
          color: "#606880",
          margin: 0,
        }}>
          {items.length > 0
            ? `${items.length} insight${items.length !== 1 ? "s" : ""} pending review`
            : "All caught up"}
        </p>
      </div>

      <ReviewQueue initialItems={items} />
    </div>
  );
}

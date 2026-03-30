import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { MarketReportEditor } from "@/components/admin/MarketReportEditor";

export const dynamic = "force-dynamic";

export default async function EditMarketReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const exists = await db.reportProduct.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) notFound();
  return <MarketReportEditor reportId={id} />;
}

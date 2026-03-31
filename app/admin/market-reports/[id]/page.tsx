import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/requireAdmin";

export default async function EditMarketReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  redirect(`/admin/report-products/${id}/edit`);
}

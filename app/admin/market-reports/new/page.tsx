import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/requireAdmin";

export default async function NewMarketReportPage() {
  await requireAdminSession();
  redirect("/admin/report-products/new");
}

import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { NewMarketReportForm } from "@/components/admin/NewMarketReportForm";

export const dynamic = "force-dynamic";

export default async function NewMarketReportPage() {
  await requireAdminSession();
  return <NewMarketReportForm />;
}

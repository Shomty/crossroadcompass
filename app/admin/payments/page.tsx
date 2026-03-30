import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { PaymentsAdminClient } from "@/components/admin/PaymentsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdminSession();
  return <PaymentsAdminClient />;
}

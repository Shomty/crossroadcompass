/**
 * app/(app)/report/page.tsx
 * V4 "Digital Grimoire" HD Foundation Report page.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { V4Report } from "@/components/report/V4Report";
import { PageLayout } from "@/components/layout/PageLayout";

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const firstName = session.user?.name?.split(" ")[0] ?? "You";

  return (
    <PageLayout>
      <V4Report firstName={firstName} />
    </PageLayout>
  );
}

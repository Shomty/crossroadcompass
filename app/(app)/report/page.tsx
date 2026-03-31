/**
 * app/(app)/report/page.tsx
 * V4 "Digital Grimoire" HD Foundation Report page.
 */

import { getAppUserContext } from "@/lib/auth/appContext";
import { redirect } from "next/navigation";
import { V4Report } from "@/components/report/V4Report";
import { PageLayout } from "@/components/layout/PageLayout";

export default async function ReportPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const firstName = ctx.name?.split(" ")[0] ?? "You";

  return (
    <PageLayout
      eyebrow="Human Design · Foundation"
      title="HD Foundation Report"
      subtitle="Your personalised blueprint decoded from birth chart and Human Design"
    >
      <V4Report firstName={firstName} />
    </PageLayout>
  );
}

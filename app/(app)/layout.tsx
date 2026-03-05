/**
 * app/(app)/layout.tsx
 * Shared shell for all authenticated app pages:
 * /dashboard, /report, /settings
 * Provides: starfield, nebulas, sidebar, bottom nav.
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";
import { StarfieldCanvas } from "@/components/StarfieldCanvas";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { tier: true },
  });

  const tier = subscription?.tier ?? "FREE";
  const userName = session.user?.name ?? session.user?.email?.split("@")[0] ?? "You";

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)" }}>
      <StarfieldCanvas />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>
        <DashboardSidebar userName={userName} tier={tier} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div className="dashboard-mobile-header">
            <DashboardNav tier={tier} />
          </div>
          <main style={{ flex: 1, paddingBottom: "5rem" }}>
            {children}
          </main>
          <DashboardBottomNav />
        </div>
      </div>
    </div>
  );
}

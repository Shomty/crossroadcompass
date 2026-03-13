/**
 * app/(app)/layout.tsx
 * Shared shell for all authenticated app pages.
 * Design system: FRONTEND.md v1.0 — cosmos background, noise overlay,
 * no animated starfield (dashboard-only restriction per §12).
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarNav } from "@/components/app/SidebarNav";
import { TimeColorProvider } from "@/components/app/TimeColorProvider";
import { AuroraCanvas } from "@/components/AuroraCanvas";
import "@/styles/v2.css";
import "@/styles/dashboard.css";

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
    /* FRONTEND.md §12: cosmos background + aurora canvas overlay */
    <div style={{ minHeight: "100vh", background: "#0d0d0d" }}>
      <TimeColorProvider />
      <AuroraCanvas
        colorStops={["#0d0d0d", "#B19EEF", "#5227FF"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.3}
      />
      <div style={{ position: "relative", zIndex: 2, display: "flex", minHeight: "100vh" }}>
        <SidebarNav userName={userName} tier={tier} />
        <main className="app-main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

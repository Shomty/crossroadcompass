/**
 * app/(app)/layout.tsx
 * Shared shell for all authenticated app pages.
 * Design system: FRONTEND.md v1.0 — cosmos background, noise overlay,
 * no animated starfield (dashboard-only restriction per §12).
 */

import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { SidebarNav } from "@/components/app/SidebarNav";
import { TimeColorProvider } from "@/components/app/TimeColorProvider";
import { ImpersonationBanner } from "@/components/app/ImpersonationBanner";
import "@/styles/v2.css";
import "@/styles/dashboard.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: ctx.userId },
    select: { tier: true },
  });

  const tier = subscription?.tier ?? "FREE";
  const userName =
    ctx.name?.trim() ||
    ctx.email?.split("@")[0] ||
    "You";

  return (
    <div style={{ minHeight: "100vh" }}>
      <TimeColorProvider />
      <div style={{ position: "relative", zIndex: 2, display: "flex", minHeight: "100vh" }}>
        <SidebarNav userName={userName} tier={tier} />
        <main className="app-main-content" style={{ flex: 1, minWidth: 0 }}>
          {ctx.impersonating ? (
            <ImpersonationBanner impersonatedEmail={ctx.email} />
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

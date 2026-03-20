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
import "@/styles/v2.css";
import "@/styles/dashboard.css";
// #region agent log
import * as fs from "fs";
const debugLog = (msg: string, data?: object) => {
  try { fs.appendFileSync('/Users/miloshmarkovic/Documents/crossroadcompass/.cursor/debug-2f76b5.log', JSON.stringify({sessionId:'2f76b5',location:'app/(app)/layout.tsx',message:msg,data,timestamp:Date.now(),hypothesisId:'C'})+'\n'); } catch {}
};
// #endregion

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // #region agent log
  debugLog('AppLayout render started');
  // #endregion
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { tier: true },
  });

  const tier = subscription?.tier ?? "FREE";
  const userName = session.user?.name ?? session.user?.email?.split("@")[0] ?? "You";

  return (
    <div style={{ minHeight: "100vh" }}>
      <TimeColorProvider />
      <div style={{ position: "relative", zIndex: 2, display: "flex", minHeight: "100vh" }}>
        <SidebarNav userName={userName} tier={tier} />
        <main className="app-main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

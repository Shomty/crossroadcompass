/**
 * app/(app)/layout.tsx
 * Shared shell for all authenticated app pages.
 * Design system: FRONTEND.md v1.0 — cosmos background, noise overlay,
 * no animated starfield (dashboard-only restriction per §12).
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopNavV2 } from "@/components/v2/TopNav";
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
    /* FRONTEND.md §12: var(--cosmos) background + noise overlay only — no starfield */
    <div style={{ minHeight: "100vh", background: "var(--cosmos)" }}>
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <TopNavV2 userName={userName} tier={tier} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

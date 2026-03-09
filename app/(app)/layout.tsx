/**
 * app/(app)/layout.tsx
 * Shared shell for all authenticated app pages.
 * Uses V2 design system — TopNavV2, v2.css
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopNavV2 } from "@/components/v2/TopNav";
import "@/styles/v2.css";

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
    <div className="v2" style={{ minHeight: "100vh" }}>
      <div className="v2-bg" />
      <div className="v2-nebula v2-nebula-1" />
      <div className="v2-nebula v2-nebula-2" />
      <div className="v2-nebula v2-nebula-3" />
      <div className="v2-grain" />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <TopNavV2 userName={userName} tier={tier} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * app/(v2)/layout.tsx
 * Premium V2 layout shell — A/B test route at /v2/*
 * Original dashboard unchanged at /dashboard
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarV2 } from "@/components/v2/Sidebar";
import { BottomNavV2 } from "@/components/v2/BottomNav";
import "@/styles/v2.css";

export default async function V2Layout({ children }: { children: React.ReactNode }) {
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
      {/* Layered backgrounds */}
      <div className="v2-bg" />
      <div className="v2-nebula v2-nebula-1" />
      <div className="v2-nebula v2-nebula-2" />
      <div className="v2-nebula v2-nebula-3" />
      <div className="v2-grain" />

      <div style={{ position: "relative", zIndex: 2, display: "flex", minHeight: "100vh" }}>
        <SidebarV2 userName={userName} tier={tier} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Mobile header */}
          <header className="v2-mobile-header" style={{
            position: "fixed", top: 0, left: 0, right: 0,
            background: "rgba(2,4,10,0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--v2-border)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 11,
            zIndex: 50,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              border: "1px solid var(--v2-border-lit)",
              background: "var(--v2-gold-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--v2-gold)" strokeWidth="1.4">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="2 3"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "var(--v2-moon)", fontWeight: 400 }}>
              Crossroads Compass
            </span>
            <div style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--v2-gold)", border: "1px solid var(--v2-border-lit)", padding: "3px 8px", borderRadius: 2 }}>
              {tier}
            </div>
          </header>

          <main style={{ flex: 1, paddingBottom: "5rem" }}>
            {children}
          </main>

          <BottomNavV2 />
        </div>
      </div>
    </div>
  );
}

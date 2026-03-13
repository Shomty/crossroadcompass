/**
 * app/(app)/transit/page.tsx
 * Today's Transit Chart page.
 * Auth-guarded server component — shell provided by (app)/layout.tsx.
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TodaysTransitForm } from "@/components/transit/TodaysTransitForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function TodaysTransitPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userName = session.user?.name ?? session.user?.email?.split("@")[0] ?? "Traveler";

  return (
    <div className="v2-content">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <Link
          href="/dashboard"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono', monospace", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mist)", textDecoration: "none", marginBottom: 20 }}
        >
          <ChevronLeft size={12} /> Dashboard
        </Link>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 8 }}>
          ✦ Transit
        </p>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 300, color: "var(--cream)", lineHeight: 1.1, margin: "0 0 10px" }}>
          Today&apos;s <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Transit Chart</em>
        </h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 13.5, color: "var(--mist)", lineHeight: 1.7, maxWidth: 480 }}>
          Generate a Vedic birth chart for this exact moment using your current location.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────────── */}
      <TodaysTransitForm userName={userName} />

    </div>
  );
}

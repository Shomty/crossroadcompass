/**
 * app/(app)/subscribe/page.tsx
 * Pricing / upgrade page — shows CORE and VIP plans.
 * Reads STRIPE_PRICE_* env vars to know if Stripe is configured.
 * If not configured, shows a "coming soon" notice instead of checkout buttons.
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { UpgradeButton } from "@/components/subscribe/UpgradeButton";

export default async function SubscribePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { tier: true },
  });
  const currentTier = sub?.tier ?? "FREE";

  const stripeConfigured =
    !!(process.env.STRIPE_SECRET_KEY) &&
    !!(process.env.STRIPE_PRICE_CORE_MONTHLY) &&
    !!(process.env.STRIPE_PRICE_VIP_QUARTERLY);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg, #0a0e1a)", padding: "60px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber, #c8873a)", marginBottom: 12 }}>
            ✦ Membership
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300, color: "var(--moon, #f2ead8)", margin: "0 0 16px", lineHeight: 1.1 }}>
            Choose Your Path
          </h1>
          <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, color: "var(--muted, #8a8070)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Deepen your practice with personalised weekly forecasts, monthly cosmic maps, and priority consultations.
          </p>
        </div>

        {/* Stripe not yet configured notice */}
        {!stripeConfigured && (
          <div style={{ marginBottom: 32, padding: "14px 20px", background: "rgba(212,175,95,0.06)", border: "1px solid rgba(212,175,95,0.2)", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--amber, #c8873a)", letterSpacing: "0.1em", textAlign: "center" }}>
            PAYMENT PROCESSING COMING SOON — Stripe is not yet configured.
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>

          {/* FREE */}
          <PlanCard
            name="Free"
            price="$0"
            interval="forever"
            features={["Daily guidance", "Human Design report", "Birth chart analysis"]}
            isCurrent={currentTier === "FREE"}
            ctaLabel="Current plan"
            ctaDisabled
          />

          {/* CORE */}
          <PlanCard
            name="Core"
            price="$29"
            interval="/ month"
            features={["Everything in Free", "Weekly personalised forecast", "Monthly cosmic map", "Dasha AI insights"]}
            highlight
            isCurrent={currentTier === "CORE"}
            ctaLabel={currentTier === "CORE" ? "Current plan" : "Upgrade to Core →"}
            ctaDisabled={currentTier === "CORE" || !stripeConfigured}
            tier="CORE"
          />

          {/* VIP */}
          <PlanCard
            name="VIP"
            price="$149"
            interval="/ quarter"
            features={["Everything in Core", "Priority consultant review", "Monthly 1:1 guidance session", "Early access to new features"]}
            isCurrent={currentTier === "VIP"}
            ctaLabel={currentTier === "VIP" ? "Current plan" : "Upgrade to VIP →"}
            ctaDisabled={currentTier === "VIP" || !stripeConfigured}
            tier="VIP"
          />
        </div>

        {/* Manage subscription */}
        {(currentTier === "CORE" || currentTier === "VIP") && stripeConfigured && (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <ManageSubscriptionButton />
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/dashboard" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "var(--faint, #4a4535)", textDecoration: "none" }}>
            ← Back to dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  name, price, interval, features, highlight, isCurrent, ctaLabel, ctaDisabled, tier,
}: {
  name: string;
  price: string;
  interval: string;
  features: string[];
  highlight?: boolean;
  isCurrent: boolean;
  ctaLabel: string;
  ctaDisabled: boolean;
  tier?: "CORE" | "VIP";
}) {
  return (
    <div style={{
      background: highlight ? "rgba(212,175,95,0.04)" : "rgba(255,255,255,0.02)",
      border: highlight ? "1px solid rgba(212,175,95,0.3)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: 32,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      position: "relative",
    }}>
      {highlight && (
        <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "rgba(212,175,95,0.15)", border: "1px solid rgba(212,175,95,0.4)", borderRadius: "0 0 8px 8px", padding: "3px 14px", fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.18em", color: "var(--gold, #d4af5f)", textTransform: "uppercase" }}>
          Most Popular
        </div>
      )}

      {/* Name + price */}
      <div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--faint, #4a4535)", marginBottom: 8 }}>
          {name}
          {isCurrent && <span style={{ marginLeft: 8, color: "var(--gold, #d4af5f)" }}>✓</span>}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "var(--moon, #f2ead8)", lineHeight: 1 }}>{price}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted, #8a8070)" }}>{interval}</span>
        </div>
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, color: "var(--muted, #8a8070)", lineHeight: 1.45 }}>
            <span style={{ color: "var(--gold, #d4af5f)", flexShrink: 0, marginTop: 1 }}>✦</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {tier ? (
        <UpgradeButton tier={tier} label={ctaLabel} disabled={ctaDisabled} />
      ) : (
        <div style={{ padding: "12px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, color: "var(--faint, #4a4535)", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center" }}>
          {ctaLabel}
        </div>
      )}
    </div>
  );
}

// ── Manage subscription ───────────────────────────────────────────────────────

function ManageSubscriptionButton() {
  // This is a server component — the button needs to be client-side
  // Rendered inline with a simple form POST to avoid a separate client component
  return (
    <form action="/api/stripe/portal" method="POST">
      <button type="submit" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "var(--faint, #4a4535)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
        Manage or cancel subscription →
      </button>
    </form>
  );
}

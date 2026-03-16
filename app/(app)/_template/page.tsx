/**
 * app/(app)/_template/page.tsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CANONICAL PAGE TEMPLATE — Digital Grimoire Design System
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * HOW TO USE THIS TEMPLATE
 * ────────────────────────
 * 1. Copy this file to your new route:
 *      cp -r app/(app)/_template  app/(app)/your-route
 *    Then rename/edit page.tsx.
 *
 * 2. Replace the TODO items marked below.
 *
 * 3. Add sections using the animate-enter stagger pattern.
 *    Each top-level section gets the next index: animate-enter-2, -3, -4, -5.
 *    (animate-enter-1 is reserved for the PageLayout header.)
 *
 * DESIGN RULES (from STYLE_GUIDE.md)
 * ───────────────────────────────────
 * - Cards:       Always use <V4GlassCard>. Never use .dash-card or raw divs.
 * - Colors:      Use CSS vars from globals.css (--gold-solar, --moon, --muted, etc.)
 *                Never hardcode hex values in components.
 * - Typography:  Playfair Display → headings/titles
 *                Plus Jakarta Sans → body / long labels
 *                JetBrains Mono → data, eyebrows, dates, coordinates
 * - Layout:      The app shell (app/(app)/layout.tsx) provides the sidebar and
 *                navigation. Do NOT add your own nav, header, or fixed elements.
 * - Anti-patterns: No .dash-card, no .dash-grid, no hardcoded colors,
 *                  no custom nav/sidebar inside a page.
 *
 * REFERENCES
 * ──────────
 * - STYLE_GUIDE.md — visual and interaction rules
 * - app/globals.css — token definitions
 * - components/v4/V4GlassCard.tsx — base card primitive
 * - components/layout/PageLayout.tsx — this page's outer wrapper
 * - app/(app)/v4/page.tsx — full reference implementation
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageLayout } from "@/components/layout/PageLayout";
import { V4GlassCard } from "@/components/v4/V4GlassCard";

export default async function TemplatePage() {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  // The app shell redirects unauthenticated users, but this guard keeps each
  // page self-contained and type-safe for data fetching below.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // ── TODO: fetch page data here ─────────────────────────────────────────────
  // const data = await db.something.findUnique({ where: { userId: session.user.id } });

  // ── TODO: derive display values ────────────────────────────────────────────
  // const firstName = session.user?.name?.split(" ")[0] ?? "Traveler";

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <PageLayout
      eyebrow="TODO: Section Name"   // e.g. "Natal Chart" — mono, gold, all-caps
      title="TODO: Page Title"       // e.g. "My Chart"     — serif
      subtitle="TODO: Description"   // e.g. "Your birth blueprint" — sans, muted
    >

      {/* ── Section 1 ────────────────────────────────────────────────────────
          animate-enter-2 (header uses -1; sections start at -2)
          Use goldEdge on the primary/identity card.
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="animate-enter animate-enter-2">
        <V4GlassCard goldEdge style={{ padding: "22px 24px" }}>
          {/* TODO: primary content */}
          <p style={{
            fontFamily: "'JetBrains Mono','Courier New',monospace",
            fontSize: 9,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 4,
          }}>
            Primary Section
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 12,
          }}>
            Card Heading
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            color: "var(--muted, rgba(232,224,208,0.45))",
            lineHeight: 1.6,
          }}>
            Body copy here.
          </p>
        </V4GlassCard>
      </section>

      {/* ── Section 2 ────────────────────────────────────────────────────────
          Add more sections as needed. Increment the animate-enter index.
          Wrap related content in a single <section> per visual group.
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="animate-enter animate-enter-3">
        <V4GlassCard style={{ padding: "22px 24px" }}>
          <>{/* TODO: secondary content */}</>
        </V4GlassCard>
      </section>

    </PageLayout>
  );
}

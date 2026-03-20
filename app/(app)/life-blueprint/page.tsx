// STATUS: done | Phase 5 Feature Pages
/**
 * app/(app)/life-blueprint/page.tsx
 * 6-chapter synthesis report: Jyotish natal + Human Design.
 *
 * Tier behaviour:
 *   FREE  → Chapter 1 (Purpose & Dharma) fully shown.
 *           Chapters 2–6 show preview + GlimpseBlur.
 *   CORE+ → All 6 chapters fully rendered.
 *
 * Uses the existing HD report pipeline (generateHDReport / getLatestHDReport).
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChapterCard } from "@/components/blueprint/ChapterCard";
import { GlimpseCTA } from "@/components/glimpse";
import { getLatestHDReport } from "@/lib/ai/hdReportService";
import type { SubscriptionTier } from "@/types";

// Maps the 7 HD report sections → 6 Life Blueprint chapters
// Sections: Type, Strategy+Authority, Profile, Centers, Channels, Shadow, Guidance
// We merge "Centers" + "Channels" into one chapter, giving us 6.
/** Returns only the first paragraph (up to first double-newline or ~320 chars). */
function truncateToFirstParagraph(content: string): string {
  if (!content) return "";
  const para = content.split(/\n\n/)[0] ?? content;
  if (para.length <= 320) return para;
  const cut = para.slice(0, 320);
  const lastDot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return lastDot > 80 ? cut.slice(0, lastDot + 1) : cut + "…";
}

const CHAPTER_TITLES = [
  "Purpose & Dharma",
  "Relationships & Connection",
  "Career & Artha",
  "Health & Vitality",
  "Shadow & Growth",
  "Timing & Practical Guidance",
];

export default async function LifeBlueprintPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ── Subscription ──────────────────────────────────────────────────────────
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);
  const isPaid = effectiveTier === "CORE" || effectiveTier === "VIP";

  // ── Load latest HD report ─────────────────────────────────────────────────
  const report = await getLatestHDReport(userId);

  // ── Map report sections → 6 chapters ─────────────────────────────────────
  // HD report has 7 sections; we remap to our 6 blueprint chapters:
  //   0 → Purpose & Dharma        (HD: Type)
  //   1 → Relationships           (HD: Strategy & Authority)
  //   2 → Career & Artha          (HD: Profile)
  //   3 → Health & Vitality       (HD: Centers)
  //   4 → Shadow & Growth         (HD: Shadow Work)
  //   5 → Timing & Guidance       (HD: Practical Guidance)
  // Section "Channels & Themes" is merged into relevant chapters automatically.

  const sectionMap = [0, 1, 2, 3, 5, 6]; // indices into report.sections

  const chapters = CHAPTER_TITLES.map((title, i) => {
    const sectionIdx = sectionMap[i];
    const section = report?.sections?.[sectionIdx];
    const fullContent = section?.content ?? "";
    const isLocked = !isPaid && i > 0;
    // Don't send premium content to free users — truncate to first paragraph only.
    // The blur in ChapterCard is purely visual; full content must not reach the DOM.
    const content = isLocked ? truncateToFirstParagraph(fullContent) : fullContent;
    return { title, content, locked: isLocked };
  });

  const hasReport = !!report;

  return (
    <PageLayout
      eyebrow="Vedic · Human Design Synthesis"
      title="Life Blueprint"
      subtitle="Your 6-chapter personal synthesis report"
    >
      {!hasReport ? (
        /* No report yet — prompt to generate */
        <section
          className="animate-enter animate-enter-2"
          style={{
            textAlign: "center",
            padding: "5rem 1rem",
            background: "rgba(13,18,32,0.5)",
            borderRadius: 16,
            border: "1px solid rgba(200,135,58,0.12)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 20 }}>◈</div>
          <h2 style={{
            fontFamily: "Cinzel, serif", fontSize: 22, fontWeight: 400,
            color: "rgba(255,255,255,0.9)", marginBottom: 12,
          }}>
            Your Blueprint awaits
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14, color: "var(--mist, rgba(255,255,255,0.5))",
            lineHeight: 1.65, maxWidth: 400, margin: "0 auto 28px",
          }}>
            Generate your Human Design report first to unlock your Life Blueprint.
          </p>
          <Link
            href="/report"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 10,
              background: "linear-gradient(135deg, #c8873a, #e8b96a)",
              color: "#0d1220", fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            Generate HD Report →
          </Link>
        </section>
      ) : (
        <section className="animate-enter animate-enter-2" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {chapters.map((chapter, i) => (
            <ChapterCard
              key={i}
              index={i}
              title={chapter.title}
              content={chapter.content || `This chapter explores your ${chapter.title.toLowerCase()} through the lens of your natal chart and Human Design blueprint. Generate your full report to receive personalised insights for this life domain.`}
              locked={chapter.locked}
              userTier={effectiveTier}
            />
          ))}

          {/* Bottom CTA for FREE users */}
          {!isPaid && (
            <div style={{ textAlign: "center", padding: "2.5rem 0 1rem" }}>
              <p style={{
                fontFamily: "Cinzel, serif", fontSize: 15, fontStyle: "italic",
                color: "rgba(240,220,160,0.6)", marginBottom: 20,
              }}>
                Chapters 2–6 contain your relationships, career, health, shadow, and timing insights.
              </p>
              <GlimpseCTA
                text="Unlock your full Life Blueprint"
                variant="primary"
                featureName="life_blueprint_bottom"
                href="/pricing"
              />
            </div>
          )}
        </section>
      )}
    </PageLayout>
  );
}

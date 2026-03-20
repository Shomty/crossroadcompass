"use client";
// STATUS: done | Phase 5 Feature Pages
/**
 * components/blueprint/ChapterCard.tsx
 * A single chapter card for the Life Blueprint page.
 *
 * FREE:  Chapter 1 rendered fully. Chapters 2–6 show header + first paragraph,
 *        then GlimpseBlur over the rest of the content.
 * CORE+: All chapters fully rendered.
 */

import { GlimpseBlur } from "@/components/glimpse/GlimpseBlur";
import type { SubscriptionTier } from "@/types";

const CHAPTER_GLYPHS = ["◈", "♡", "✦", "☾", "◎", "♄"];

interface ChapterCardProps {
  index: number;          // 0-based
  title: string;
  content: string;
  /** If true, blur everything after the preview paragraph */
  locked: boolean;
  userTier: SubscriptionTier;
}

/** Extracts first paragraph (up to first double-newline or ~300 chars) */
function firstParagraph(content: string): string {
  const para = content.split(/\n\n/)[0] ?? content;
  if (para.length <= 320) return para;
  // Cut at last sentence boundary before 320 chars
  const cut = para.slice(0, 320);
  const lastDot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return lastDot > 80 ? cut.slice(0, lastDot + 1) : cut + "…";
}

export function ChapterCard({ index, title, content, locked }: ChapterCardProps) {
  const glyph = CHAPTER_GLYPHS[index] ?? "◈";
  const preview = firstParagraph(content);
  const remainder = content.slice(preview.length).trim();

  return (
    <div
      className="animate-enter"
      style={{
        animationDelay: `${0.05 + index * 0.06}s`,
        padding: "28px 32px",
        borderRadius: 16,
        background: "rgba(13,18,32,0.55)",
        border: "1px solid rgba(200,135,58,0.14)",
        marginBottom: 2,
      }}
    >
      {/* Chapter header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: "rgba(200,135,58,0.08)",
          border: "1px solid rgba(200,135,58,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "serif", fontSize: 18, color: "#c8873a",
        }}>
          {glyph}
        </div>
        <div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            color: "rgba(200,135,58,0.6)", marginBottom: 3,
          }}>
            Chapter {index + 1}
          </div>
          <h2 style={{
            fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 400,
            color: "var(--cream, rgba(255,255,255,0.92))", lineHeight: 1.25,
            margin: 0,
          }}>
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      {locked ? (
        <GlimpseBlur
          preview={preview}
          featureName={`life_blueprint_chapter_${index + 1}`}
          ctaText="Unlock your Life Blueprint"
          ctaHref="/pricing"
        >
          {/* Placeholder — real content is intentionally withheld server-side */}
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14, color: "rgba(240,220,160,0.8)", lineHeight: 1.75,
          }}>
            This chapter contains your personalised {title.toLowerCase()} synthesis — a detailed analysis drawing on your natal placements, Dasha timing, and Human Design configuration. Upgrade to unlock the full reading.
          </p>
        </GlimpseBlur>
      ) : (
        <p style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 14, color: "rgba(240,220,160,0.85)", lineHeight: 1.8,
          margin: 0,
        }}>
          {content}
        </p>
      )}
    </div>
  );
}

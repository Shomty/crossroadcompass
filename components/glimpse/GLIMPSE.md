# Crossroads Compass — Glimpse System Implementation Guide

## What is the Glimpse System?

The Glimpse layer is the critical conversion mechanism between Free and Premium. It is NOT a hard paywall. It shows users enough premium content that they FEEL what they're missing. The blur is the product.

## The 7 Glimpse Patterns

### Pattern 1: The Blur Wall
**Used by:** Life Blueprint, Purpose Decoder, Shadow Work Portal

Show a full premium section. First paragraph is readable. Everything below has a CSS blur overlay with a glowing CTA button.

```tsx
// components/glimpse/GlimpseBlur.tsx
interface GlimpseBlurProps {
  preview: string;           // First paragraph (visible)
  sectionTitle?: string;     // Optional section header
  featureName: string;       // For analytics tracking
  ctaText?: string;          // Default: "Unlock full access"
  children?: React.ReactNode; // The actual premium content (rendered but blurred)
}
```

**CSS implementation:**
```css
.glimpse-blur-container {
  position: relative;
}
.glimpse-blur-overlay {
  position: relative;
  max-height: 200px;
  overflow: hidden;
}
.glimpse-blur-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(13, 18, 32, 0.3) 30%,
    rgba(13, 18, 32, 0.8) 100%
  );
}
.glimpse-cta {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  /* Use the gold accent color with glow */
  background: linear-gradient(135deg, #c8873a, #e8b96a);
  color: #0d1220;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 0 24px rgba(200, 135, 58, 0.4);
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.2s;
}
.glimpse-cta:hover {
  box-shadow: 0 0 40px rgba(200, 135, 58, 0.6);
  transform: translateX(-50%) translateY(-1px);
}
```

**Key:** The blurred content is REAL content, not placeholder. This proves depth exists.

---

### Pattern 2: The Locked Insight Counter
**Used by:** Transit Pulse

Show total count of available insights, reveal some, lock the rest with specific labels.

```tsx
// components/glimpse/LockedInsightCard.tsx
interface LockedInsightCardProps {
  icon: React.ReactNode;      // Planet icon
  label: string;              // e.g., "Saturn Insight"
  featureName: string;
}
```

**Visual:** Card with planet icon, label text, and a small lock icon. Same card dimensions as unlocked insights. Border is dashed instead of solid. Background slightly dimmed.

```css
.locked-insight-card {
  border: 1px dashed rgba(200, 135, 58, 0.3);
  background: rgba(13, 18, 32, 0.4);
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s, border-color 0.2s;
}
.locked-insight-card:hover {
  opacity: 0.9;
  border-color: rgba(200, 135, 58, 0.6);
}
```

**Critical:** User must see EXACTLY which insights are locked. "Saturn insight locked" is more compelling than "4 insights locked."

---

### Pattern 3: The Teaser Score
**Used by:** Cosmic Chemistry, Daily Alignment

Show a compelling metric/score prominently. Reveal 1 dimension. Lock the rest.

```tsx
// components/glimpse/TeaserScore.tsx
interface TeaserScoreProps {
  score: number;
  maxScore: number;
  label: string;               // e.g., "Cosmic Chemistry"
  revealedDimension: string;   // Name of the one revealed
  lockedDimensions: string[];  // Names of locked ones
  featureName: string;
}
```

**The score is the hook. The dimensions are the sell.** "You're 78% compatible. Want to know WHY?"

---

### Pattern 4: The Timeline Cliffhanger
**Used by:** Karma Timeline

Show current content in full. Next section shows first 2 sentences then hard cuts mid-insight.

```tsx
// components/glimpse/TimelineCliff.tsx
interface TimelineCliffProps {
  currentContent: string;        // Full current period text
  nextPreview: string;           // First 2 sentences of next period
  nextTitle: string;             // e.g., "Jupiter Mahadasha (2027–2043)"
  featureName: string;
}
```

**Implementation:** Render `nextPreview` text, then apply a gradient fade that cuts the text mid-sentence. Below the fade, show a "Continue reading..." CTA. The incomplete sentence creates psychological tension.

```css
.timeline-cliff-text {
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}
```

---

### Pattern 5: The Date Without Time
**Used by:** Muhurta Finder

Show dates (the WHEN) but blur the exact times and reasoning (the HOW and WHY).

```tsx
// components/glimpse/DateWithoutTime.tsx
interface DateWithoutTimeProps {
  dates: { date: string; dayOfWeek: string }[];  // Visible
  featureName: string;
}
```

**Visual:** Calendar-like cards showing day name and date clearly. Below each date, a blurred row for time + reasoning. The specificity of visible dates makes the locked content feel tangible.

---

### Pattern 6: The Shadow Headline
**Used by:** Shadow Work Portal

One devastating, accurate headline. Nothing else. Maximum psychological impact.

```tsx
// components/glimpse/ShadowHeadline.tsx
interface ShadowHeadlineProps {
  headline: string;      // e.g., "The fear of being truly seen"
  subtext?: string;      // Max 2 sentences
  featureName: string;
}
```

**Design:** Large typography (Cormorant Garamond, 28px+). Dark background. Minimal. The headline stands alone. Below it, a subtle "Explore your shadow map →" link. No blur needed — the restraint IS the hook.

---

### Pattern 7: The Push Notification Hook
**Used by:** Daily Alignment, Transit Pulse

Push notification contains a compelling but incomplete insight. Opens app to the locked feature.

**Implementation:** This is a notification content strategy, not a component. The notification text must:
- Include a specific metric or claim: "Your alignment score today: 7.2/10"
- Cut off mid-insight: "Transit Mars is activating your..."
- Deep link to the relevant feature page

```typescript
// lib/notifications/glimpseNotification.ts
interface GlimpseNotification {
  title: string;        // Feature name
  body: string;         // Truncated insight
  deepLink: string;     // /dashboard/alignment, /dashboard/transits
  userTier: string;     // Only send glimpse notifications to FREE users
}

// Example:
{
  title: "Daily Alignment",
  body: "Your alignment score today: 7.2/10. Transit Mars is activating your...",
  deepLink: "/dashboard",
  userTier: "FREE"
}
```

---

## Shared Glimpse Components

### GlimpseCTA — The upgrade button
```tsx
// components/glimpse/GlimpseCTA.tsx
interface GlimpseCTAProps {
  text?: string;             // Default: "Unlock full access"
  variant?: 'primary' | 'secondary' | 'inline';
  featureName: string;       // For conversion tracking
  onClick?: () => void;      // Default: navigate to /pricing
}
```

- `primary`: Gold gradient button with glow (used in blur overlays)
- `secondary`: Outlined gold button (used after locked cards)
- `inline`: Text link with arrow (used mid-content)

### GlimpseGate — Wrapper component for tier checking
```tsx
// components/glimpse/GlimpseGate.tsx
interface GlimpseGateProps {
  requiredTier: 'CORE' | 'VIP';
  featureName: string;
  freeContent: React.ReactNode;
  glimpseContent: React.ReactNode;  // What FREE users see as teaser
  premiumContent: React.ReactNode;  // What CORE/VIP users see
}
```

This is the PRIMARY component for implementing tier-gated features. It handles:
1. Session check (server-side)
2. Tier comparison
3. Rendering the appropriate content
4. Analytics event emission

---

## Analytics Events

Every glimpse interaction must fire an analytics event:

```typescript
// lib/analytics/glimpse.ts
type GlimpseEvent =
  | { type: 'glimpse_view'; feature: string; pattern: string }
  | { type: 'glimpse_cta_click'; feature: string; pattern: string }
  | { type: 'glimpse_to_pricing'; feature: string }
  | { type: 'glimpse_conversion'; feature: string; plan: string };
```

Track which glimpse patterns convert best per feature. This data drives optimization.

---

## Content Rules for Glimpse Previews

1. The visible preview must be GENUINELY valuable — not a tease of nothing
2. The preview must demonstrate the QUALITY of the premium content
3. The cut-off point must feel natural, not arbitrary
4. Blurred content must show enough structure (headers, sections) to prove depth
5. Every glimpse must have a clear, single CTA — never multiple competing buttons
6. Never show a glimpse and a hard paywall simultaneously — glimpse IS the paywall

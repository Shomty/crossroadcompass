# Dharma Compass Style Guide

Version: 1.1
Status: Canonical design source for v4-first implementation
Aesthetic: Digital Grimoire

## Scope

This guide is the single source of truth for visual and interaction rules during the current rollout.

Current implementation scope:
- Required now: `/app/(app)/v4/**`, `/components/v4/**`, and shared-safe styling updates that do not break other routes.
- Deferred: full visual migration of v1, v2, v3, and legacy dashboard surfaces.

If this guide conflicts with older styling notes, this file wins.

## Design Intent

Dharma Compass should feel like ancient wisdom rendered through a precision instrument.
The interface must balance two qualities at the same time:
- Mystical: atmospheric, quiet, ceremonial, symbolic.
- Technical: aligned, legible, data-dense, exact.

## Canonical Tokens

### Background
- Deep Space: `#050505`
- Atmosphere: radial nebula glows may be layered above Deep Space, but the base field must remain Deep Space.

### Accents
- Solar Gold: `#D4AF37`
- Cosmic Violet: `#7C3AED`
- Lavender: `#EDE9FF`
- Live Green: `#4ADE80`

### Glass Card Contract
All v4 containers must follow this baseline unless a component spec explicitly overrides one property.
- Background: `rgba(255,255,255,0.05)`
- Border: `1px solid rgba(255,255,255,0.10)`
- Blur: `backdrop-blur-md` equivalent
- Radius: `14px`
- Optional top-edge shimmer is allowed

## Typography Triad

### Serif
Use for wisdom, titles, planetary periods, and interpretive statements.
Preferred:
- Playfair Display
- Cinzel for legacy compatibility only where already established

### Sans
Use for utility text, body copy, labels longer than one line, and explanatory paragraphs.
Preferred:
- Plus Jakarta Sans

### Monospace
Use for all technical data surfaces.
Required for:
- Degrees
- Coordinates
- Dates when presented as precision metadata
- Table numeric values
- Eyebrow labels on technical panels
Preferred:
- JetBrains Mono

## Motion Rules

### Orbits
- Must be linear
- Must be perpetual
- No ease-in-out on orbital systems

### Live Indicators
- Use pulse dots for live data
- Pulse may expand/fade, but should remain subtle and precise

### Entrance Motion
- Small upward offset
- Fast fade and settle
- Never theatrical

## Layout and Surface Rules

### Data Tables
- Numeric columns must align consistently
- Monospace required for numeric values
- Hover feedback should be subtle (`bg-white/5` range)
- Borders should stay in the `white/5` to `white/10` family

### Profile Strip
- Glass card with Solar Gold anchor edge
- Identity first, technical second
- HD summary fields should feel like instrument readouts

### Dharma Synthesis
- Violet-led oracle surface
- Deterministic synthesis fields should sit beside narrative text, not hide inside it
- Live state should be visible at a glance

### Vimshottari Dasha
- Orbit visuals must communicate time flow, not decoration only
- Planet color and glyph must remain readable against Deep Space
- Progress bars should run Gold to Violet

## Synthesis UX Contract

The system should always bridge Jyotish and Human Design when data exists.

Minimum contract for v4 synthesis surfaces:
- If a planet is shown, the UI should be able to surface its HD gate linkage when available.
- If a nakshatra-derived interpretation is shown, the UI should be able to surface the related HD strategy influence when available.
- Deterministic mappings come first.
- AI narrative explains the meaning of the deterministic state; it does not replace it.

## Implementation Boundary

Current rollout target:
1. Canonical docs
2. Shared v4 tokens and primitives
3. v4 component conformance
4. Deterministic synthesis fields
5. Verification and visual QA

## Component Notes

### Forecast Surfaces in v4
Legacy forecast UI may be reused, but when rendered in v4 it must adopt:
- Solar Gold / Cosmic Violet / Lavender palette
- Playfair Display for major headings
- JetBrains Mono for tabs, pills, labels, and metadata
- Glass-card framing via v4 primitives

### Planet Metadata
Planet glyph and color mappings must be centralized in one shared module to avoid drift across cards and pages.

## Creating a New Page

Every new authenticated page must use the canonical template and `PageLayout` wrapper.

### Quickstart

```bash
# Copy the template to your new route
cp -r app/(app)/_template  app/(app)/your-new-route
```

Then edit `page.tsx`: replace the three TODO props and add your data-fetching logic.

### PageLayout Wrapper

`components/layout/PageLayout.tsx` is the required outer wrapper for all pages.

```tsx
import { PageLayout } from "@/components/layout/PageLayout";

<PageLayout
  eyebrow="Section Name"   // JetBrains Mono, Solar Gold, all-caps
  title="Page Title"       // Playfair Display serif
  subtitle="Description"   // Plus Jakarta Sans, muted
>
  {/* sections */}
</PageLayout>
```

All three props are optional. If none are provided, `PageLayout` renders only the content container.

### Section Stagger Pattern

```tsx
{/* Header uses animate-enter-1 (inside PageLayout) */}
<section className="animate-enter animate-enter-2">
  <V4GlassCard goldEdge>...</V4GlassCard>
</section>
<section className="animate-enter animate-enter-3">
  <V4GlassCard>...</V4GlassCard>
</section>
{/* continue: -4, -5 */}
```

### Card Primitive

```tsx
import { V4GlassCard } from "@/components/v4/V4GlassCard";

<V4GlassCard>              // standard glass card
<V4GlassCard goldEdge>     // Solar Gold left-border anchor (identity / primary)
<V4GlassCard violetGlow>   // violet radial gradient (oracle / synthesis)
```

### Token Quick Reference

| Purpose | CSS Variable | Value |
|---------|-------------|-------|
| Background | `--deep-space` | `#050505` |
| Primary accent | `--gold-solar` | `#D4AF37` |
| Oracle accent | `--violet` | `#7C3AED` |
| Body text | `--moon` | `#E8E0D0` |
| Secondary text | `--muted` | `rgba(232,224,208,0.45)` |
| Tertiary text | `--faint` | `rgba(232,224,208,0.22)` |
| Card border | `--border` | `rgba(255,255,255,0.06)` |

All tokens are defined in `/app/globals.css`. Never hardcode hex values in components.

### Anti-Patterns

- `--` Do NOT use `.dash-card` or `.dash-grid` (legacy v1/v2 utilities)
- `--` Do NOT add a custom sidebar, nav bar, or fixed header inside a page component
- `--` Do NOT hardcode hex color values — always use CSS variables
- `--` Do NOT skip `animate-enter-N` on sections — motion is part of the identity
- `--` Do NOT wrap the page in `.v4-page` / `.v4-inner` directly — `PageLayout` handles the content container; the app shell owns the background

## References
- `/instructions/style-change.md` contains earlier exploratory notes and should be treated as secondary.
- `/app/globals.css` contains the executable token layer.
- `/components/v4/V4GlassCard.tsx` is the canonical v4 container primitive.
- `/components/layout/PageLayout.tsx` is the canonical page wrapper.
- `/app/(app)/_template/page.tsx` is the copy-paste page template.

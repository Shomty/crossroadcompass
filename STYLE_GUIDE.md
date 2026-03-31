# Dharma Compass Style Guide

Version: 1.4
Status: Canonical design source for v4-first implementation
Aesthetic: Digital Grimoire

> **v1.4 changes:** Added formal Button, Toggle, Label/Badge Standards sections derived from a scan of all 5 feature pages. Fixed `GlimpseCTA.tsx` (DM Mono → Plus Jakarta Sans on primary/secondary variants). Fixed `ChartVariantToggle.tsx` (indigo → `.chart-variant-toggle` amber gradient). Fixed `Label.tsx` (applies `.ui-label` by default). Added `Toggle.tsx` canonical component. Removed `Instrument Sans` anti-pattern from `.cc-body` and `.sky-observer-page .page-subtitle` in `globals.css`. Extended Anti-Patterns list.
>
> **v1.5 changes:** Added `.btn-toggle` CSS class for single on/off buttons and filter chips. Fixed page-level toggles in `ChartPageClient.tsx`, `ChartJhoraPageClient.tsx`, `DivisionalChartsPanel.tsx` (North/South tab → `.chart-variant-toggle`). Fixed `YogaGrid.tsx` filter chips (raw Tailwind → `.btn-toggle`). Fixed "Show today's transits" button in chart pages. `rounded-full` banned from all interactive controls.

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

**Outer shell** (page-level feature containers): use [`V4GlassCard`](components/v4/V4GlassCard.tsx) / `.glass-card`. Baseline unless a component spec explicitly overrides one property:
- Background: `rgba(255,255,255,0.05)` (via implemented glass stack — see `globals.css`)
- Border: `1px solid rgba(255,255,255,0.10)` (or `var(--border)` where aligned)
- Blur: `backdrop-blur-md` equivalent
- Radius: `18px` on `.glass-card` (rounded container); inner tiles use `14px` below
- Optional top-edge shimmer is allowed

**Inner dense panels** (rows, theme pickers, timeline-adjacent tiles **inside** an outer glass card): these are **not** the same surface as the outer contract. They read as nested instrument cells:
- Background: `rgba(13,18,32,0.45)`
- Border: `1px solid rgba(255,255,255,0.05)`
- Radius: `14px`
- Selected / emphasis: `border-color: rgba(200,135,58,0.35)` plus a **subtle** gold tint (light gradient). Avoid heavy glow.

Reference: [`components/insights/DashaPeriodCard.tsx`](components/insights/DashaPeriodCard.tsx), [`components/oracle/OracleForm.tsx`](components/oracle/OracleForm.tsx).

## Typography Triad

Four font roles. Never mix roles for the same semantic purpose.

| Role | Font | CSS family string | Tailwind alias | Use for |
|------|------|-------------------|----------------|---------|
| **Ceremonial** | Cinzel | `Cinzel, serif` | `font-serif` | Headings, titles, planetary names, planet display values |
| **Oracle** | Lora | `'Lora', Georgia, serif` | `font-oracle` | Italic narrative, oracle card body, meditative passages |
| **Functional** | Plus Jakarta Sans | `'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif` | `font-sans` | Body copy, labels longer than one line, button text, explanatory paragraphs |
| **Precision** | DM Mono | `'DM Mono', monospace` | `font-mono` | Eyebrow labels, pill badges, tabs, toggles, degrees, coordinates, all metadata |

**Fallback chain note:** `@theme inline` maps `--font-mono` to `'DM Mono', 'JetBrains Mono', monospace` so JetBrains Mono acts as a system fallback only. Do NOT reference JetBrains Mono explicitly in new component code.

**Legacy classes to avoid on new surfaces:**
- `.oracle-title` and `.oracle-subtitle` use Playfair Display — do not use on v4 surfaces; use Cinzel instead.
- `.data-value` uses JetBrains Mono — replace with `.ui-label` or inline `font-family: 'DM Mono', monospace` on new surfaces.

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

### Forecast Surfaces
Forecast UI uses the standard design system everywhere:
- Solar Gold / Cosmic Violet / Lavender palette
- Cinzel for major headings
- DM Mono for tabs, pills, labels, and metadata
- Glass-card framing via `V4GlassCard`

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
  eyebrow="Section Name"   // DM Mono, Solar Gold, all-caps
  title="Page Title"       // Cinzel serif
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

### Feature blocks and nested surfaces

Rules for authenticated pages under `PageLayout` and for components that should match Karma Timeline / dashboard rhythm.

| Topic | Rule | Reference |
|-------|------|-----------|
| **Outer section** | Each major block under `PageLayout` children is `<section className="animate-enter animate-enter-N">` with `N` starting at **2** (page header uses `-1`). Increment per sibling: `-3`, `-4`, … | [`app/(app)/_template/page.tsx`](app/(app)/_template/page.tsx), [`app/globals.css`](app/globals.css) `.animate-enter-*` |
| **Primary container** | Prefer `V4GlassCard` for user-visible feature shells (grain, top highlight, `glass-card` baseline). Avoid one-off `rounded-2xl` + opaque `rgba(13,18,32,0.6)` wrappers for the same role. | [`components/oracle/OracleForm.tsx`](components/oracle/OracleForm.tsx) |
| **Inner rows / tiles** | Use the **inner dense panel** recipe from the Glass Card Contract above. | [`DashaPeriodCard`](components/insights/DashaPeriodCard.tsx) |
| **Vertical rhythm** | Inside a feature: either **tight** (`gap: 12px` / Tailwind `gap-3`) to match [`KarmaTimeline`](components/insights/KarmaTimeline.tsx), or **loose** (`1.5rem` like `.v4-wrap` / `.chart-page`). Pick one per page and stay consistent. | — |
| **Subsection copy** | Reuse utilities: `page-eyebrow` for in-card product/section labels; `page-subtitle` for supporting lines. Short titles inside cards: **Cinzel** + `var(--cream, rgba(255,255,255,0.9))`. Card body secondary text: **Plus Jakarta Sans** + `var(--mist, …)`. | [`app/globals.css`](app/globals.css) `.page-eyebrow`, `.page-subtitle` |
| **Monospace pills** | Status/metadata: **DM Mono**, ~9px, `letter-spacing: 0.14em`, `uppercase`, gold tint (`var(--gold-solar)` + soft `rgba(212,175,95,…)` fill/border) — same language as Dasha “Active”. | [`DashaPeriodCard.tsx`](components/insights/DashaPeriodCard.tsx) |
| **Primary CTA** | Filled actions: `linear-gradient(135deg, #c8873a, #e8b96a)`, text `#0d1220`, **Plus Jakarta Sans** semibold ~13px. **Canonical primary button** for app pages. Allowed fixed gradient (no semantic token yet — document here if it changes). | [`app/(app)/life-blueprint/page.tsx`](app/(app)/life-blueprint/page.tsx) |
| **Icons in cards** | Lucide (or similar) on dark glass: `color: var(--gold-solar, #D4AF37)` unless planet-specific color is intentional. | — |
| **Motion inside a section** | Parent `<section>` already has `animate-enter-N`. For child lists, use `className="animate-enter"` + inline `animationDelay` (e.g. `idx * 0.05s`). Do **not** put the same `animate-enter-2` on a giant inner wrapper — avoids stagger clash. | [`KarmaTimeline.tsx`](components/insights/KarmaTimeline.tsx) |

**Worked examples** (copy patterns from these before inventing new shells):

- Outer glass + inner tiles: [`components/oracle/OracleForm.tsx`](components/oracle/OracleForm.tsx)
- Timeline row / badge / typography: [`components/insights/DashaPeriodCard.tsx`](components/insights/DashaPeriodCard.tsx)

### Token Quick Reference

Three token namespaces co-exist in `globals.css`. The table below shows the **canonical v4 name** and its alias in other namespaces. Always use the v4 name in new code.

| Purpose | v4 CSS Variable | Value | Legacy aliases |
|---------|----------------|-------|----------------|
| Deep background | `--deep-space` | `#050505` | `--void: #04050f`, `--cosmos: #0d1220` |
| Warm amber (CTA fills, gradients) | `--amber` | `#c8873a` | `--gold-warm`, `--cc-amber` |
| Cool solar gold (borders, badges, metadata tints) | `--gold-solar` | `#D4AF37` | `--accent-gold-cool`, `--gold` (≈ `#e8b96a` — different!) |
| CTA gradient highlight end | `--gold` | `#e8b96a` | `--star`, `--cc-amber-light` |
| Oracle / synthesis accent | `--violet` | `#7C3AED` | — |
| Indigo accent (time-dynamic) | `--accent-indigo` | `#818CF8` | — |
| Body text | `--moon` | `#E8E0D0` | `--cream: #f2ead8` |
| Secondary text | `--muted` | `rgba(232,224,208,0.45)` | `--text-secondary` |
| Tertiary / muted | `--faint` | `rgba(232,224,208,0.22)` | `--text-muted` |
| Card border | `--border` | `rgba(255,255,255,0.06)` | `--cc-border-card` |

**`--amber` vs `--gold-solar` — the key distinction:**
- `--amber` (`#c8873a`) is warm, orange-gold: use for CTA fills, gradients, border highlights on cards, icon tints.
- `--gold-solar` (`#D4AF37`) is cool, classic gold: use for badge borders, monospace metadata text, active indicator borders.
- The canonical primary CTA gradient spans both: `linear-gradient(135deg, #c8873a, #e8b96a)`.

All tokens are defined in `/app/globals.css`.

### Anti-Patterns

- `--` Do NOT use `.dash-card` or `.dash-grid` (legacy v1/v2 utilities)
- `--` Do NOT add a custom sidebar, nav bar, or fixed header inside a page component
- `--` Do NOT hardcode arbitrary hex colors — use CSS variables (except the documented primary CTA gradient)
- `--` Do NOT skip `animate-enter-N` on sections — motion is part of the identity
- `--` Do NOT wrap the page in `.v4-page` / `.v4-inner` directly — `PageLayout` handles the content container; the app shell owns the background
- `--` Do NOT use **Cormorant** or **Instrument Sans** on new Karma / timeline / dashboard-adjacent surfaces; use **Cinzel + Plus Jakarta Sans + DM Mono** as in this guide
- `--` Do NOT use **Instrument Sans** anywhere — it is not a loaded font. Previously leaked into `.cc-body` and `.sky-observer-page .page-subtitle`; those are fixed. Use **Plus Jakarta Sans** instead.
- `--` Do NOT introduce a second ad-hoc glass recipe for the same semantic “card” role without updating this guide
- `--` Do NOT use `font-family: 'DM Mono'` on primary or secondary **button** text — DM Mono is for metadata, labels, and toggles only; button text uses **Plus Jakarta Sans**
- `--` Do NOT use `bg-indigo-600` / `border-indigo-*` for toggle active states — use `.chart-variant-toggle` CSS class with the canonical amber gradient
- `--` Do NOT use `rounded-full` on interactive buttons or toggles — use `6px` radius (`.btn-toggle`) or `8px` (`.chart-variant-toggle`). `rounded-full` is reserved for decorative dots, progress rings, and avatars.
- `--` Do NOT use ad-hoc `border-amber-500/*` or `bg-amber-500/*` Tailwind tokens on buttons — use `.btn-toggle` or `.chart-variant-toggle` which encode the correct `rgba(200,135,58,…)` tokens

---

## Button Standards

All buttons fall into three canonical variants. Choose by context, not by preference.

### 1. Primary CTA Button (card / section context)

Used in page sections and feature cards. This is the pattern seen across all 5 feature pages.

```tsx
<a
  href="/pricing"
  style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px 28px", borderRadius: 10,
    background: "linear-gradient(135deg, #c8873a, #e8b96a)",
    color: "#0d1220",
    fontFamily: "\'Plus Jakarta Sans\', ui-sans-serif, system-ui, sans-serif",
    fontSize: 13, fontWeight: 600, textDecoration: "none",
  }}
>
  Action label →
</a>
```

**Upgrade / conversion CTA** — use `GlimpseCTA` (not a raw button):
```tsx
import { GlimpseCTA } from "@/components/glimpse";
<GlimpseCTA text="Unlock full access" variant="primary" featureName="my_feature" href="/pricing" />
```

`GlimpseCTA` variants:

| Variant | Font | Style | Use |
|---------|------|-------|-----|
| `primary` | Plus Jakarta Sans 600 | Gold gradient + glow | Inside locked/blur sections |
| `secondary` | Plus Jakarta Sans 500 | Outlined amber | Below locked feature cards |
| `inline` | DM Mono | Text link with arrow | Mid-content upgrade nudges |

### 2. Form Submit Button

`.btn-primary` CSS class (or `<Button variant="primary">`). Flat amber fill, 2px radius, Plus Jakarta Sans uppercase. Use for form submits, settings, and compact UI contexts.

```tsx
import { Button } from "@/components/ui/Button";
<Button>Save changes</Button>
<Button variant="ghost">Cancel</Button>
```

**Typography rule:** All button text = **Plus Jakarta Sans**. DM Mono is for metadata/labels only.

---

## Toggle Standards

Two patterns exist. Choose based on semantic context:

| Pattern | Use for | Class |
|---------|---------|-------|
| Tab toggle | Mutually exclusive 2-option view (chart style) | `.chart-variant-toggle` |
| On/off chip | Single toggle or multi-option filter chips | `.btn-toggle` |

### Tab Toggle — `.chart-variant-toggle`

Use `.chart-variant-toggle` (defined in `app/globals.css`):
- Container: inner dense panel background, `1px solid rgba(200,135,58,0.22)`, `8px` radius
- Buttons: **DM Mono**, `var(--type-small)`, `uppercase`, `letter-spacing: 0.1em`
- **Active:** `linear-gradient(135deg, #c8873a, #e8b96a)`, `color: #0d1220`, `font-weight: 600`
- Inactive: `color: var(--text-secondary)`, hover `var(--cream)`

### Canonical Component

```tsx
import { Toggle } from "@/components/ui/Toggle";

<Toggle
  options={[
    { value: "north-indian", label: "North Indian" },
    { value: "south-indian", label: "South Indian" },
  ]}
  value={variant}
  onChange={setVariant}
/>
```

`Toggle.tsx` renders `.chart-variant-toggle` + `data-active` buttons — no extra CSS needed. Do not implement toggles with `bg-indigo-*` or custom active states.

### On/Off Toggle Button & Filter Chip — `.btn-toggle`

For single show/hide buttons and filter chip groups (e.g. "Show today's transits", YogaGrid filters):

```tsx
<button
  type="button"
  className="btn-toggle"
  data-active={isOn ? "true" : undefined}
  onClick={toggle}
>
  {isOn ? "Hide transits" : "Show transits"}
</button>
```

Styling:
- **Shape:** `6px` radius — NOT `rounded-full`
- **Font:** DM Mono, `var(--type-small)`, uppercase, `0.1em` tracking
- **Inactive:** `color: var(--mist)`, `border: 1px solid rgba(200,135,58,0.3)`
- **Hover:** border brightens to `rgba(200,135,58,0.5)`, `color: var(--cream)`
- **Active (`data-active="true"`):** `bg: rgba(200,135,58,0.12)`, `border: rgba(200,135,58,0.55)`, `color: var(--cream)`

For filter chip groups, wrap in `flex flex-wrap gap-2` and map each option as its own `.btn-toggle`.

---

## Label and Badge Standards

### Field Labels

```tsx
// Data-tile eyebrow (inside amber-tinted tiles — Pattern from Energy Blueprint, Purpose, Shadow):
<span style={{
  fontFamily: "\'DM Mono\', monospace",
  fontSize: 10, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "rgba(200,135,58,0.7)",
}}>
  Field Name
</span>

// Form field label (via component):
import { Label } from "@/components/ui/Label";
<Label htmlFor="field-id">Field Name</Label>
// Applies .ui-label: DM Mono, 12px minimum, uppercase, letter-spacing 0.18em
```

**Eyebrow (section-level):** Use `page-eyebrow` CSS class or the `eyebrow` prop on `PageLayout`. DM Mono, `letter-spacing: 0.3em`, amber.

### Status Badges / Pills

| Context | Token | Hex | Component |
|---------|-------|-----|-----------|
| Metadata, active period, neutral status | `--gold-solar` | `#D4AF37` | Inline style |
| Plan tier, amber-tinted CTA contexts | `--amber` | `#c8873a` | `<Badge>` |

```tsx
// Gold-solar metadata badge (e.g. "ACTIVE" period):
<span style={{
  fontFamily: "\'DM Mono\', monospace", fontSize: 9,
  letterSpacing: "0.14em", textTransform: "uppercase",
  border: "1px solid rgba(212,175,55,0.4)", color: "var(--gold-solar)",
  padding: "2px 8px", borderRadius: 2,
}}>ACTIVE</span>

// Amber tier badge:
import { Badge } from "@/components/ui/Badge";
<Badge>CORE</Badge>
```

---

## References
- `/instructions/style-change.md` contains earlier exploratory notes and should be treated as secondary.
- `/app/globals.css` contains the executable token layer.
- `/components/v4/V4GlassCard.tsx` is the canonical v4 container primitive.
- `/components/layout/PageLayout.tsx` is the canonical page wrapper.
- `/app/(app)/_template/page.tsx` is the copy-paste page template.
- `/components/insights/DashaPeriodCard.tsx` — inner panel, badge, and typography reference for timeline-adjacent UI.
- `/components/oracle/OracleForm.tsx` — `V4GlassCard` shell + nested tiles + primary CTA reference.
- `/components/ui/Button.tsx` — canonical button primitive (`btn-primary` / `btn-ghost`).
- `/components/ui/Toggle.tsx` — canonical tab-toggle primitive (`.chart-variant-toggle`).
- `.btn-toggle` CSS class — single on/off toggle button / filter chip (see Toggle Standards).
- `/components/ui/Label.tsx` — canonical field label (`.ui-label`).
- `/components/ui/Badge.tsx` — canonical amber-context badge.
- `/components/glimpse/GlimpseCTA.tsx` — canonical upgrade / conversion CTA (3 variants).

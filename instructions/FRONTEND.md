# Crossroads Compass — Frontend Design Instructions
# Version: 1.0 | March 2026
# Source of truth: landing.html (Auric Root design reference)
# Purpose: Every new page, component, and UI element must match this design system exactly.

---

## CRITICAL RULE

Do not invent new design patterns. Every component you build must use
the tokens, fonts, spacing, and interaction patterns documented here.
When in doubt, look at the reference. Never default to Tailwind
defaults — this design has its own visual language.

---

## 1. BRAND IDENTITY

**Product name in use:** Auric Root (working name — may change, see TASKS.md open decisions)

**Logo markup pattern:**
```html
<a href="/" class="logo">Auric<span></span>Root</a>
```
The `<span>` between the words renders as a 5x5px amber dot, vertically
centered. Do not replace this with a dash, slash, or text separator.

**Visual character:** Dark cosmic — deep navy backgrounds, warm amber/gold
accents, serif headlines, monospace labels, subtle starfield. The feeling
is sophisticated and quietly spiritual, not flashy or neon.

---

## 2. COLOR TOKENS

Define these as CSS custom properties on `:root`. Use variable names
exactly as shown — do not rename them.

```css
:root {
  --ink:       #1a1410;   /* darkest text, rarely used directly */
  --earth:     #2e1f0f;   /* deep warm brown, gradients */
  --amber:     #c8873a;   /* primary accent — CTAs, glyphs, borders */
  --gold:      #e8b96a;   /* highlighted text, em tags, logo */
  --clay:      #8b5c38;   /* secondary warm accent */
  --moss:      #3d4a2e;   /* unused in landing, reserved */
  --cream:     #f2ead8;   /* primary body text */
  --parchment: #ede0c4;   /* slightly warmer cream, subtle contrast */
  --mist:      #d4c9b0;   /* secondary text, nav links, descriptions */
  --sky:       #1c2340;   /* mid-dark blue, avatar gradients */
  --cosmos:    #0d1220;   /* page background — the darkest layer */
  --star:      #f0dca0;   /* starfield particle color */
}
```

**Usage rules:**
- Page background: always `var(--cosmos)`
- Primary body text: `var(--cream)`
- Secondary / descriptive text: `var(--mist)`
- All accent elements (icons, borders, CTA outlines, labels): `var(--amber)`
- Italic emphasis in headings: `var(--gold)`
- Never use raw hex values in component code — always reference the variable

---

## 3. TYPOGRAPHY

### Font stack
Three fonts, loaded from Google Fonts. All three are required.

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
```

In Tailwind config or global CSS, set the font families:
- `font-serif` → `'Cormorant Garamond', serif`
- `font-mono` → `'DM Mono', monospace`
- `font-sans` → `'Instrument Sans', sans-serif`

### Role of each font

| Font | Role | Weight used |
|---|---|---|
| Cormorant Garamond | All headings (h1-h4), blockquotes, logo, plan prices, feature titles | 300, 400, 600 |
| DM Mono | Eyebrows, labels, badges, step numbers, plan tier names | 300, 400 |
| Instrument Sans | Body text, nav links, buttons, descriptions, all running prose | 400, 500 |

### Type scale

```
h1 (hero):        clamp(3.2rem, 8vw, 7rem)   weight 300   Cormorant
h2 (sections):    clamp(2rem, 4vw, 3.2rem)   weight 300   Cormorant
h3 (step titles): 1.2rem                      weight 600   Cormorant
h4 (feature):     1.05rem                     weight 600   Cormorant
eyebrow label:    0.65-0.7rem                 DM Mono      uppercase, letter-spacing 0.3em
nav links:        0.8rem                       Instrument   uppercase, letter-spacing 0.12em
body text:        0.95-1.05rem                Instrument   line-height 1.75-1.85
small text:       0.8-0.85rem                 Instrument   line-height 1.6-1.7
```

### Italic emphasis rule
Every `<em>` tag inside a heading must render in `var(--gold)` and
italic. Apply globally:
```css
h1 em, h2 em, h3 em, h4 em { font-style: italic; color: var(--gold); }
```

---

## 4. BACKGROUND AND LAYERS

The page uses a precise z-index layering system. Maintain this in every
new page:

```
z-index 0:   Starfield canvas (fixed, full viewport, pointer-events none)
z-index 1:   Noise texture overlay (fixed, CSS ::before on body, opacity 0.028)
z-index 2:   <main> content
z-index 100: Fixed navigation
```

### Noise overlay (apply to body::before)
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.028;
  pointer-events: none;
}
```

### Starfield canvas
Include on every full-page layout (not modals or auth pages).
Canvas renders 180 twinkling star particles in `rgba(240, 220, 160, opacity)`.
See `StarField.tsx` component — do not rewrite the canvas logic, reuse it.

---

## 5. NAVIGATION

Fixed top nav. Always present on marketing and dashboard pages.

```
Layout:     space-between, aligned center
Padding:    1.4rem 3rem
Background: linear-gradient(to bottom, rgba(13,18,32,0.95), transparent)
Z-index:    100
```

**Logo:** Cormorant Garamond, 1.35rem, weight 600, `var(--gold)`, uppercase,
letter-spacing 0.18em. Amber dot between words (5x5px circle, `var(--amber)`).

**Nav links:** Instrument Sans, 0.8rem, uppercase, letter-spacing 0.12em,
color `var(--mist)`, hover → `var(--gold)`, transition 0.2s.

**CTA link in nav:**
```css
border: 1px solid var(--amber);
color: var(--amber);
padding: 0.5rem 1.2rem;
border-radius: 2px;
hover: background var(--amber), color var(--cosmos)
```

**Mobile (max-width 900px):** hide nav `<ul>`. Logo remains. Add hamburger
menu in Phase 2 — for now just hide the links, do not break the layout.

---

## 6. BUTTONS

Two button variants only. Do not create new variants.

### Primary button (.btn-primary)
```css
background:    var(--amber)
color:         var(--cosmos)
padding:       1rem 2.2rem
font:          Instrument Sans, 0.85rem, weight 500
letter-spacing: 0.1em
text-transform: uppercase
border-radius: 2px
border:        none
hover:         background var(--gold), translateY(-1px)
transition:    background 0.2s, transform 0.15s
```

### Ghost button (.btn-ghost)
```css
background:    transparent
color:         var(--mist)
border:        none
font:          Instrument Sans, 0.85rem
letter-spacing: 0.08em
hover:         color var(--cream)
::after:       content '→' (appended automatically)
```

### Plan CTA button (.plan-cta)
```css
display:        block (full width within card)
padding:        0.75rem 1rem
border:         1px solid var(--amber)
color:          var(--amber)
font:           0.75rem, uppercase, letter-spacing 0.12em
border-radius:  2px
hover:          background var(--amber), color var(--cosmos)
featured plan:  always shows hover state (filled amber) by default
```

---

## 7. CARDS AND BORDERED CONTAINERS

All card-type containers share a consistent border and background system.

**Standard card:**
```css
border:     1px solid rgba(200, 135, 58, 0.12)
border-radius: 3px
background: rgba(255, 255, 255, 0.02)
hover border: rgba(200, 135, 58, 0.28-0.30)
```

**Featured / highlighted card:**
```css
border:     1px solid rgba(200, 135, 58, 0.45)
background: rgba(200, 135, 58, 0.05)
```

**Hover lift (steps only):**
```css
hover: transform translateY(-4px), border-color rgba(200,135,58,0.3)
transition: transform 0.2s, border-color 0.2s
```

Feature items and testimonials use opacity/translateY scroll fade-in
via IntersectionObserver (see section 12).

---

## 8. SECTION STRUCTURE

Every content section follows the same structural pattern:

```
Section padding:  6-7rem 2rem
Max-width:        1100px (wide sections) or 900-1000px (narrower)
Margin:           0 auto (centered)
```

**Section eyebrow label** (appears above every h2):
```
Font:    DM Mono
Size:    0.65rem
Color:   var(--amber)
Case:    uppercase
Spacing: letter-spacing 0.3em
Margin:  0 0 0.75-1.5rem 0
```

**Section dividers** between sections:
```html
<div class="section-divider">
  <span class="section-divider-glyph">☽</span>
</div>
```
The divider is a horizontal amber gradient line with a centered glyph.
Glyphs used in the reference: ☽ ☿ ♄ ✦ — use planetary/celestial symbols only.
```css
.section-divider {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 3rem;
  opacity: 0.35;
}
.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--amber), transparent);
}
.section-divider-glyph {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  color: var(--amber);
}
```

---

## 9. SPECIFIC COMPONENTS

### Feature items (`.feature-item`)
```
Layout:   flex, gap 1.2rem, align-items flex-start
Padding:  1.5rem
Card:     standard card styles (section 7)
```
Glyph: Cormorant Garamond, 1.6rem, `var(--amber)`, min-width 2rem, centered.
Use celestial symbols only: ☉ ◉ ♃ ☽ ⟡ ⊕ ◈

Title (h4): Cormorant Garamond, 1.05rem, weight 600, `var(--cream)`
Body (p): Instrument Sans, 0.85rem, `var(--mist)`, line-height 1.6

### Step cards (`.step`)
```
Padding:  2.5rem 2rem
Card:     standard card styles + hover lift
```
Step number: DM Mono, 0.65rem, letter-spacing 0.2em, `var(--amber)`, opacity 0.7
Icon:      2rem, centered glyph
Title (h3): Cormorant Garamond, 1.2rem, weight 600, `var(--cream)`
Body (p):  0.85rem, `var(--mist)`, line-height 1.7

Connector arrow between steps (`.step-connector`):
```css
position: absolute;
right: -1rem; top: 50%;
color: var(--amber); opacity: 0.3;
font-size: 1.2rem;
```
Hide on mobile (max-width 900px).

### Pricing cards (`.plan`)
```
Padding:     2rem 1.5rem
Card:        standard card styles
Text-align:  left
```
Tier label:   DM Mono, 0.65rem, uppercase, letter-spacing 0.2em, `var(--amber)`
Price:        Cormorant Garamond, 2.2rem, weight 300, `var(--cream)`
Price sup:    1rem, vertical-align super
Period:       0.75rem, `var(--mist)`, Instrument Sans
Plan name:    Cormorant Garamond, 1rem, `var(--mist)`, margin 0.5rem 0 1.5rem
Feature list: 0.8rem, `var(--mist)`, gap 0.6rem between items

Feature list bullet: `◈` in `var(--amber)`, 0.6rem, margin-top 0.25rem

Badge (featured plan):
```css
position: absolute;
top: -0.6rem; left: 50%; transform: translateX(-50%);
background: var(--amber); color: var(--cosmos);
font: DM Mono, 0.6rem, uppercase, letter-spacing 0.15em, weight 500
padding: 0.2rem 0.8rem;
border-radius: 1px;
```

### Testimonial cards (`.testimonial`)
```
Padding:  2rem
Card:     standard card styles (no hover lift)
```
Stars:      `var(--amber)`, 0.75rem, letter-spacing 0.1em
Quote:      Cormorant Garamond, 1.05rem, italic, `var(--cream)`, line-height 1.7
Author:     0.75rem, `var(--mist)`, flex with avatar

Avatar circle: 32x32px, border-radius 50%,
background: `linear-gradient(135deg, var(--earth), var(--sky))`,
border: `1px solid rgba(200,135,58,0.3)`,
letter: Cormorant Garamond, 0.85rem, `var(--gold)`, centered.

---

## 10. HERO SECTION

```
Min-height:  100vh
Layout:      flex, column, center, text-center
Padding:     8rem 2rem 4rem
```

**Eyebrow:** DM Mono, 0.7rem, uppercase, letter-spacing 0.3em, `var(--amber)`,
margin-bottom 2rem.

**h1:** Cormorant Garamond, clamp(3.2rem, 8vw, 7rem), weight 300,
line-height 1.05, `var(--cream)`, max-width 820px.

**Sub:** Instrument Sans, 1.05rem, `var(--mist)`, max-width 500px,
line-height 1.75, margin-top 2rem.

**Actions:** flex, gap 1.2rem, align-items center, margin-top 3rem.

**Hero ring animation:** Three concentric circles, positioned absolute,
centered on the hero section, rotating slowly (60s linear infinite).
```css
.hero-ring {
  width: min(600px, 90vw); height: min(600px, 90vw);
  border-radius: 50%;
  border: 1px solid rgba(200, 135, 58, 0.12);
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: slowSpin 60s linear infinite;
  pointer-events: none;
}
.hero-ring::before { inset: 20px; border: 1px solid rgba(232,185,106,0.07); }
.hero-ring::after  { inset: 50px; border: 1px solid rgba(200,135,58,0.05); }
```

---

## 11. ANIMATIONS

Two animation keyframes used throughout. Define globally.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slowSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}
```

**Hero entrance animation:** hero eyebrow, h1, sub, and actions each
have `opacity: 0` and staggered `animation: fadeUp 0.8s Xs forwards`
with delays 0.2s, 0.4s, 0.6s, 0.8s respectively.

**Scroll fade-in (IntersectionObserver):** Apply to all
`.feature-item`, `.step`, `.plan`, `.testimonial` elements on mount:
```javascript
el.style.opacity = '0';
el.style.transform = 'translateY(16px)';
el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
// observer fires: opacity '1', transform 'translateY(0)'
```
In React, implement this as a `useScrollReveal` hook with an
IntersectionObserver. Threshold: 0.1.

---

## 12. DASHBOARD PAGES (not in landing, but must match)

Dashboard pages share the same dark background, noise overlay, and font
system. They do NOT use the starfield canvas — that is marketing-only.

Dashboard-specific rules:
- Background: `var(--cosmos)` with the noise overlay only
- Nav: same fixed nav component, but links change to: Dashboard, My Chart, Consultations, Account
- Content area: max-width 1100px, centered, padding 6rem 2rem
- Cards: use the same standard card styles from section 7
- All text: same type scale and colors
- Subscription tier badge: DM Mono, 0.6rem, uppercase, amber border, amber text

Tier gating visual:
- Locked content: same card but `opacity: 0.4`, content blurred with `filter: blur(4px)`
- Upgrade CTA: overlaid on blurred content, centered, `var(--amber)` border button

---

## 13. FORMS AND INPUTS

The birth data form is the most critical UI in the product. It must
feel as premium as the rest of the design.

```css
input, select {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(200, 135, 58, 0.2);
  border-radius: 2px;
  color: var(--cream);
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.9rem;
  padding: 0.85rem 1rem;
  width: 100%;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--amber);
}

input::placeholder {
  color: var(--mist);
  opacity: 0.5;
}

label {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--amber);
  display: block;
  margin-bottom: 0.5rem;
}
```

Error states:
```css
input.error { border-color: #c84a3a; }
.field-error {
  font-size: 0.75rem;
  color: #e07060;
  margin-top: 0.4rem;
  font-family: 'Instrument Sans', sans-serif;
}
```

Checkbox (birth time unknown):
```css
/* Custom checkbox — do not use default browser checkbox */
accent-color: var(--amber);
```
Label text: Instrument Sans, 0.85rem, `var(--mist)`.

---

## 14. GLYPH VOCABULARY

Use only these symbols as decorative glyphs and icons. Do not use emoji,
heroicons, or Lucide icons in visible UI. Lucide is only acceptable for
functional UI icons (close button, settings gear, etc.) inside the
dashboard, not in content areas.

| Symbol | Use |
|---|---|
| ☉ | Sun / daily energy |
| ☽ | Moon / weekly rhythm |
| ☿ | Mercury / communication |
| ♃ | Jupiter / expansion |
| ♄ | Saturn / structure / section dividers |
| ⟡ | Step 1 / form |
| ⊕ | Step 2 / chart |
| ◈ | Step 3 / daily / feature list bullets |
| ✦ | Generic divider / sparkle |
| ◉ | Focus / center |

---

## 15. RESPONSIVE BREAKPOINTS

Two breakpoints only:

```
900px:  Two-column grids collapse to single column
        Nav links hidden
        Step connectors hidden
        Plans grid: 1 col → 2 col

600px:  Plans grid: 2 col → 1 col
        Footer: stacks vertically, text-align center
```

Always design and build mobile-first mentally, even if coding desktop-
first. The primary user checks the product on a phone.

---

## 16. WHAT NOT TO DO

- Do not use white or light backgrounds on any page. The product lives in the dark.
- Do not use blue, green, purple, or red as primary accent colors. Amber and gold only.
- Do not use rounded corners larger than `border-radius: 3px` on cards or `2px` on buttons.
- Do not use drop shadows (`box-shadow`) — borders and background opacity create depth instead.
- Do not use filled icon libraries for decorative purposes. Glyphs only (section 14).
- Do not use Tailwind's default color palette for this project. All colors must come from the CSS variables defined in section 2.
- Do not animate anything with duration > 0.5s except the hero ring (60s) and the hero entrance (0.8s). Everything else: 0.2s transitions only.
- Do not center-align body text in cards or feature items. Center-align only section headings and the hero.
- Do not add gradients on text except in the logo. Use flat color from the palette.

---

## 17. COMPONENT FILE MAP

When building these components, name them exactly as shown:

```
components/
  layout/
    StarField.tsx           - Animated canvas starfield (marketing pages only)
    Nav.tsx                 - Fixed navigation bar
    SectionDivider.tsx      - Amber gradient divider with glyph
    Footer.tsx              - Footer with logo, links, GDPR note

  marketing/
    Hero.tsx                - Full-viewport hero with ring animation
    FeatureItem.tsx         - Icon + title + description card
    StepCard.tsx            - Numbered step with connector arrow
    PricingCard.tsx         - Plan card with tier, price, features, CTA
    TestimonialCard.tsx     - Quote card with star rating and author

  onboarding/
    BirthDataForm.tsx       - The primary conversion form
    UnknownTimeNotice.tsx   - Info message when birth time is unknown

  dashboard/
    DailyInsightCard.tsx    - Today's insight with accuracy rating
    WeeklyForecastCard.tsx  - Weekly forecast, tier-gated
    LifePhaseIndicator.tsx  - Active dasha display
    TierGate.tsx            - Blur overlay + upgrade CTA for locked content

  ui/
    Button.tsx              - Primary and ghost variants
    Input.tsx               - Styled form input
    Label.tsx               - DM Mono uppercase label
    Card.tsx                - Standard bordered container
    Badge.tsx               - DM Mono small tag (plan badges, tier badges)
```

---

*Crossroads Compass Frontend Instructions v1.0 | March 2026 | Derived from landing.html design by Milosh*

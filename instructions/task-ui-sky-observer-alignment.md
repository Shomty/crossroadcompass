# Task: Align Sky Observer Page to Crossroads Compass Design System
# Scope: Typography, spacing, color, card style, label treatment
# Reference: Dashboard page (Image 2) — the authoritative L&F source

---

## CONTEXT

The Sky Observer page exists as a feature but its visual language has
drifted from the established dashboard aesthetic. This task brings it
into full alignment with the design system as expressed on the Dashboard.

Do NOT change any Sky Observer data logic, API calls, state management,
or component structure unless explicitly stated. This is a **visual
alignment task only**.

Read this file fully before touching any code.

---

## DESIGN SYSTEM REFERENCE — extract from the dashboard

### 1. Color tokens (add to globals.css or your CSS variables file if not already present)

```css
:root {
  /* Backgrounds */
  --cc-bg-base:        #080a14;   /* page background — deep space navy */
  --cc-bg-card:        #0d1022;   /* card surface */
  --cc-bg-card-hover:  #111428;
  --cc-border-card:    rgba(255, 255, 255, 0.07);
  --cc-border-subtle:  rgba(255, 255, 255, 0.04);

  /* Text */
  --cc-text-primary:   #ede9dc;   /* warm off-white — main body */
  --cc-text-secondary: #8a8678;   /* muted — subtitles, descriptions */
  --cc-text-tertiary:  #4e4c44;   /* very muted — disabled, placeholders */

  /* Accent — amber/gold */
  --cc-amber:          #c8902a;
  --cc-amber-light:    #e8b86d;
  --cc-amber-dim:      rgba(200, 144, 42, 0.15);

  /* Status / semantic */
  --cc-green:          #4a9c6a;   /* auspicious, active, live */
  --cc-green-dim:      rgba(74, 156, 106, 0.15);
  --cc-neutral-tag:    rgba(255, 255, 255, 0.08);
  --cc-red-dim:        rgba(180, 60, 60, 0.18);
}
```

### 2. Typography

Three fonts are in use. Verify they are imported in your project.

```css
/* Cormorant Garamond — display headings */
/* DM Mono            — labels, tags, metadata, monospace data */
/* Instrument Sans    — body text, UI prose */
```

Apply the following scale:

```css
/* Page / section titles */
.cc-title-lg {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;           /* 32px */
  font-weight: 400;
  letter-spacing: 0.01em;
  color: var(--cc-text-primary);
  line-height: 1.15;
}

/* Card section headings (e.g. "Temporal Engine", "Focused Body") */
.cc-title-card {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.125rem;       /* 18px */
  font-weight: 500;
  letter-spacing: 0.03em;
  color: var(--cc-text-primary);
  line-height: 1.2;
}

/* ALL-CAPS metadata labels (e.g. "REAL-TIME VEDIC SKY MAP", "TYPE", "STRATEGY") */
.cc-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.6875rem;      /* 11px */
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cc-text-secondary);
}

/* Body / insight text */
.cc-body {
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.9375rem;      /* 15px */
  font-weight: 400;
  line-height: 1.7;
  color: var(--cc-text-primary);
}

/* Data values, coordinates, numeric displays */
.cc-mono {
  font-family: 'DM Mono', monospace;
  font-size: 0.875rem;       /* 14px */
  color: var(--cc-text-primary);
  letter-spacing: 0.02em;
}
```

### 3. Pill / tag badges

```css
.cc-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 0.625rem;       /* 10px */
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--cc-neutral-tag);
  color: var(--cc-text-secondary);
  border: 1px solid var(--cc-border-subtle);
}

.cc-tag--amber {
  background: var(--cc-amber-dim);
  color: var(--cc-amber-light);
  border-color: rgba(200, 144, 42, 0.25);
}

.cc-tag--green {
  background: var(--cc-green-dim);
  color: var(--cc-green);
  border-color: rgba(74, 156, 106, 0.25);
}
```

### 4. Card container

```css
.cc-card {
  background: var(--cc-bg-card);
  border: 1px solid var(--cc-border-card);
  border-radius: 12px;
  padding: 20px 24px;
}

/* Tighter variant for compact data panels */
.cc-card--compact {
  padding: 14px 18px;
}
```

### 5. Spacing rhythm

| Use | Value |
|---|---|
| Between card sections | 24px |
| Between label + value row | 10px |
| Internal card padding | 20–24px |
| Between sibling cards | 16px |
| Top of page to first content | 28px |

Use these values via Tailwind or CSS. Do not use arbitrary pixel values
that fall outside this rhythm.

### 6. Dividers

```css
.cc-divider {
  border: none;
  border-top: 1px solid var(--cc-border-subtle);
  margin: 16px 0;
}
```

### 7. Active / selected state (e.g. active nav item, selected planet)

```css
/* Active sidebar nav item — from dashboard screenshot */
.cc-nav-active {
  background: rgba(200, 144, 42, 0.12);
  border-radius: 8px;
  color: var(--cc-amber-light);
}

/* Focused body card — amber left border accent */
.cc-card--focused {
  border-left: 2px solid var(--cc-amber);
  padding-left: 22px;  /* compensate for border */
}
```

---

## CHANGES REQUIRED ON SKY OBSERVER PAGE

Apply every section below. Each section includes what to change and the
exact class or token to use. Do not refactor structure — only update
visual properties.

---

### A. Page header block

**Selector**: the element containing "REAL-TIME VEDIC SKY MAP" and "Sky Observer"

Changes:
- "REAL-TIME VEDIC SKY MAP" → apply `cc-label` (DM Mono, 11px, 0.14em tracking, uppercase, `--cc-text-secondary`)
- "Sky Observer" → apply `cc-title-lg` (Cormorant Garamond, 32px, weight 400)
- Subtitle line "Planetary positions · Active yogas · ..." → apply `cc-body` at 14px with `--cc-text-secondary`
- Spacing below header before filter tags: 16px

---

### B. Filter / mode tags (SIDEREAL · GEOCENTRIC · LAHIRI etc.)

These are the pill-shaped toggles at the top of the map area.

Changes:
- Apply `cc-tag` base style to all inactive/neutral tags
- Apply `cc-tag--amber` to the currently active/selected tag
- Gap between tags: 6px
- Do not change click handlers or state logic

---

### C. Right panel cards (Temporal Engine, Focused Body, Active Yogas, Transit Events)

Each panel is a card. Apply the following to every panel card:

Changes:
- Background: `var(--cc-bg-card)`
- Border: `1px solid var(--cc-border-card)`
- Border-radius: `12px`
- Padding: `20px 24px`
- Card section titles ("Temporal Engine", "Focused Body", etc.):
  - Apply `cc-title-card` (Cormorant Garamond, 18px, 500 weight)
  - The title text capitalises first letter of each word (current behaviour is fine — keep it)
- Sub-labels ("TIME NAVIGATION · LIVE OR MANUAL", "NAKSHATRA", "LONGITUDE" etc.):
  - Apply `cc-label` (DM Mono, 11px, uppercase, `--cc-text-secondary`)
- Data values (dates, coordinates, planet names):
  - Apply `cc-mono` (DM Mono, 14px)
- Numeric large values (e.g. "7°46'"):
  - Cormorant Garamond, 22px, weight 400, `--cc-text-primary`
- Spacing between label row and value: 6px
- Spacing between data pairs: 12px
- Dividers between card sub-sections: apply `cc-divider`

---

### D. "LIVE SYNC" badge

Changes:
- Apply `cc-tag--green` — green tinted background with green text
- Keep existing click/toggle logic untouched

---

### E. Ascendant / focused body block

The block with the large "ASC" icon, "ASCENDANT" title, and degree value.

Changes:
- "ASC" icon tile:
  - Background: `var(--cc-amber-dim)`
  - Border: `1px solid rgba(200, 144, 42, 0.3)`
  - Border-radius: 8px
  - Text: Cormorant Garamond, 14px, `--cc-amber-light`
- "ASCENDANT" heading: `cc-title-card` (Cormorant Garamond, 18px)
- Degree value "7°46'": Cormorant Garamond, 22px, `--cc-text-primary`
- "CANCER · 1ST HOUSE" label row: `cc-label`
- "PADA 2" badge: `cc-tag--amber`
- Apply `cc-card--focused` (amber left border) to this block

---

### F. Active Yogas section

Changes:
- "2 ACTIVE" count badge: `cc-tag--amber`
- Subtitle "CLASSICAL COMBINATIONS · CURRENT SKY": `cc-label`
- Each yoga row:
  - Left border on yoga card: `2px solid var(--cc-amber)` for AUSPICIOUS, `2px solid rgba(255,255,255,0.1)` for NEUTRAL
  - Yoga name ("Gajakesari Yoga"): Instrument Sans, 13px, weight 500, `--cc-text-primary`
  - "AUSPICIOUS" / "NEUTRAL" badge: `cc-tag--amber` for auspicious, `cc-tag` for neutral
  - Description text: `cc-body` at 12px, `--cc-text-secondary`
  - Row background: transparent; row padding: 10px 12px; row border-radius: 6px
  - Hover: background `rgba(255,255,255,0.03)`

---

### G. Transit Events section

Changes:
- "7 EVENTS" badge: `cc-tag` (neutral)
- "DIGNITY · RETROGRADE · CONJUNCTIONS" subtitle: `cc-label`
- Keep existing component — only apply the label and badge styles above

---

### H. Map area (the circular sky chart)

The map canvas itself should remain unchanged. Only the frame around it:

Changes:
- Map container border: `1px solid var(--cc-border-card)`
- Border-radius: `12px`
- Background of the map frame: `var(--cc-bg-card)` — not pure black, not transparent
- No padding changes — keep existing map padding

---

### I. Navigation sidebar

Changes (only if not already matching the dashboard):
- Sidebar background: `var(--cc-bg-base)` with a `1px solid var(--cc-border-card)` right border
- Nav item labels: Instrument Sans, 13px, weight 400, `--cc-text-secondary`
- Nav item hover: background `rgba(255,255,255,0.04)`, border-radius 8px
- Active nav item (Sky Observer in the screenshot): apply `cc-nav-active`
- Nav icons: size 16px, color `--cc-text-secondary`, active color `--cc-amber-light`
- App name "CROSSROADS COMPASS": DM Mono, 10px, 0.2em tracking, `--cc-amber-light`
- Tagline "VEDIC · HUMAN DESIGN": DM Mono, 9px, `--cc-text-tertiary`

---

### J. Time navigation controls

The date input and the time-step buttons (0.1M, 0.1D, 1D, 1M).

Changes:
- Date input field: background `rgba(255,255,255,0.05)`, border `1px solid var(--cc-border-card)`, border-radius 6px, DM Mono, 13px, `--cc-text-primary`, padding 6px 10px
- Step buttons: background `rgba(255,255,255,0.04)`, border `1px solid var(--cc-border-subtle)`, border-radius 4px, DM Mono, 10px, `--cc-text-secondary`
- Step button active/hover: border-color `var(--cc-amber)`, color `--cc-amber-light`
- "LIVE SYNC" toggle button: apply `cc-tag--green` styling

---

## WHAT NOT TO CHANGE

- Component JSX structure
- State management, hooks, context
- API fetch logic
- Chart rendering (the circular sky map SVG/canvas)
- Routing
- Responsive breakpoints that currently exist
- Any animation logic on the sky map itself

---

## VERIFICATION CHECKLIST

Before marking this task done, visually verify:

- [ ] Page background matches Dashboard (`#080a14` range — deep space, not pure black)
- [ ] All card backgrounds use `--cc-bg-card`, not white or transparent
- [ ] All heading text uses Cormorant Garamond
- [ ] All label/metadata text uses DM Mono, all-caps, correct tracking
- [ ] All body text uses Instrument Sans
- [ ] Tag badges match the two styles: neutral (muted) and amber (accent)
- [ ] "LIVE SYNC" badge is green-tinted
- [ ] Active nav item shows amber highlight
- [ ] ASC focused body block has amber left border accent
- [ ] Auspicious yoga rows have amber left border
- [ ] Card padding is 20-24px — nothing cramped
- [ ] No hard-coded hex values left in the component — all colors via CSS variables
- [ ] No inline styles for colors — all moved to CSS classes or Tailwind utilities

---

*Task file: task-ui-sky-observer-alignment.md*
*Crossroads Compass | March 2026 | Milosh*

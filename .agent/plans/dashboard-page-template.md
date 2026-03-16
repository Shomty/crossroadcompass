# Plan: Dashboard Page Template Standardization

**Goal**: Extract the V4 Digital Grimoire design system into a reusable `PageLayout` wrapper and canonical page template, so every new page auto-inherits the correct look and feel.

---

## Phase 0: Documentation Discovery — COMPLETE

### Allowed APIs & Patterns (sourced from codebase)

**Source files confirmed:**
- `app/globals.css` — master CSS token registry
- `styles/dashboard.css` — dashboard-specific utilities
- `styles/v2.css` — v2 layout tokens
- `app/(app)/layout.tsx` — authenticated shell (auth guard + TimeColorProvider + SidebarNav)
- `app/(app)/v4/page.tsx` — the gold-standard page implementation
- `components/v4/V4GlassCard.tsx` — base card primitive
- `components/v4/ProfileStrip.tsx`, `DharmaSynthesis.tsx`, `DashaVisualizer.tsx`, `TransitTable.tsx`
- `STYLE_GUIDE.md` — canonical design intent document

**Canonical V4 Token Set:**
| Token | Value | Use |
|-------|-------|-----|
| `--deep-space` | `#050505` | Page background |
| `--gold` / `--gold-solar` | `#D4AF37` | Primary accent, anchors, data |
| `--violet` | `#7C3AED` | Oracle/synthesis surfaces |
| `--moon` | `#E8E0D0` | Body text |
| `--muted` | `rgba(232,224,208,0.45)` | Secondary text |
| `--faint` | `rgba(232,224,208,0.22)` | Tertiary / disabled |
| `--border` | `rgba(255,255,255,0.06)` | Card borders |

**Glass Card Contract** (from STYLE_GUIDE.md):
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.10);
backdrop-filter: blur(12px);
border-radius: 14px;
```

**Typography Triad:**
- Titles/headings: `Playfair Display` or `Cinzel`
- Body/labels: `Plus Jakarta Sans`
- Data/mono: `JetBrains Mono`

**Page Entrance Animation Pattern** (from `v4/page.tsx`):
```jsx
<section className="animate-enter animate-enter-1">...</section>
<section className="animate-enter animate-enter-2">...</section>
// etc. up to -5
```

**Layout wrapper class** (from `app/(app)/layout.tsx`):
- `.v4-wrap` — sets max-width, padding, responsive spacing
- Outer shell already provides: auth guard, `TimeColorProvider`, `SidebarNav`

**Anti-Patterns to Avoid:**
- Do NOT import dashboard.css tokens directly in new pages — use globals.css tokens only
- Do NOT use `.dash-card` / `.dash-grid` classes — those are legacy; use `V4GlassCard`
- Do NOT add `position: fixed` nav — the app layout already handles all nav
- Do NOT skip `animate-enter-N` stagger on sections — motion is part of the identity

---

## Phase 1: Create `PageLayout` Wrapper Component

**What to build**: `components/layout/PageLayout.tsx`

A thin wrapper that provides:
1. Consistent max-width + responsive padding (reuse or replace `.v4-wrap`)
2. Optional page-level eyebrow label (mono, uppercase, gold)
3. Optional page title (Playfair Display serif)
4. Optional subtitle/description (Plus Jakarta Sans, muted)
5. Divider with optional glyph (reuse `.v4-divider` pattern)
6. Slot for `<children>` (the page content)

**Pattern to copy from**: `app/(app)/v4/page.tsx` lines 1-40 (header section structure)

**Interface:**
```tsx
interface PageLayoutProps {
  eyebrow?: string        // e.g. "Natal Chart"
  title?: string          // e.g. "My Chart"
  subtitle?: string
  children: React.ReactNode
  className?: string
}
```

**CSS to add to globals.css** (new `.page-layout` utility):
```css
.page-layout {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 2.25rem 2rem 5rem;
}
.page-layout-header {
  margin-bottom: 2rem;
}
.page-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.5rem;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  color: var(--moon);
}
.page-subtitle {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: var(--type-body);
  color: var(--muted);
  margin-top: 0.35rem;
}
```

**Verification:**
- [ ] Component renders without errors
- [ ] Eyebrow appears in JetBrains Mono, gold, uppercase
- [ ] Title appears in Playfair Display
- [ ] Children render below header
- [ ] Max-width + padding matches existing `.v4-wrap` behavior
- [ ] No `.dash-card` / `.dash-grid` usage in new component

---

## Phase 2: Create Canonical Page Template

**What to build**: `app/(app)/_template/page.tsx`

A copy-paste-ready page stub that any new route can copy.

**Template structure:**
```
app/(app)/_template/
  page.tsx          ← server component stub with data fetch pattern
  README.md         ← instructions (what to change, what NOT to change)
```

**`page.tsx` pattern** (copy from `app/(app)/v4/page.tsx` structure):
```tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import PageLayout from "@/components/layout/PageLayout"
import V4GlassCard from "@/components/v4/V4GlassCard"

export default async function TemplatePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  return (
    <PageLayout
      eyebrow="Section Name"
      title="Page Title"
      subtitle="Optional description of this page"
    >
      {/* Section 1 */}
      <section className="animate-enter animate-enter-1">
        <V4GlassCard goldEdge>
          {/* Content */}
        </V4GlassCard>
      </section>

      {/* Section 2 */}
      <section className="animate-enter animate-enter-2">
        <V4GlassCard>
          {/* Content */}
        </V4GlassCard>
      </section>
    </PageLayout>
  )
}
```

**README.md for the template** (what to tell the next agent / developer):
- Which tokens to use (point to globals.css)
- How to add cards (V4GlassCard props)
- How to add sections (animate-enter stagger)
- What NOT to do (see anti-patterns from Phase 0)
- Link to STYLE_GUIDE.md

**Verification:**
- [ ] `_template/page.tsx` is a valid Next.js server component
- [ ] It renders inside the existing authenticated app shell without custom nav/layout modifications
- [ ] Auth guard is present
- [ ] PageLayout wraps all content
- [ ] No legacy `.dash-*` classes used

---

## Phase 3: Update STYLE_GUIDE.md with Template Reference

**What to update**: `STYLE_GUIDE.md`

Add a new section: **"Creating a New Page"** that:
1. Points to `app/(app)/_template/page.tsx` as the canonical starting point
2. Lists the design primitives available (V4GlassCard props, PageLayout props)
3. Shows the token cheat-sheet (Phase 0 table above)
4. Lists the anti-patterns

**Verification:**
- [ ] Section exists in STYLE_GUIDE.md
- [ ] Template file path is correct
- [ ] Token table matches globals.css

---

## Phase 4: Migrate One Existing Page to Use PageLayout

**What to migrate**: `app/(app)/report/page.tsx`

This page currently uses `.v4-wrap` directly. Migrating it proves the PageLayout wrapper works end-to-end.

**Steps:**
1. Read `app/(app)/report/page.tsx` in full
2. Replace the outer `<div className="v4-wrap">` with `<PageLayout title="..." eyebrow="...">`
3. Verify the page visually matches the pre-migration state

**Verification:**
- [ ] Page renders without errors
- [ ] Visual layout unchanged (same max-width, padding)
- [ ] No regressions in auth or data fetching

---

## Phase 5: Final Verification

**Checklist:**
- [ ] `components/layout/PageLayout.tsx` exists and is importable
- [ ] `app/(app)/_template/page.tsx` exists
- [ ] `STYLE_GUIDE.md` has "Creating a New Page" section
- [ ] `app/(app)/report/page.tsx` uses PageLayout (not raw `.v4-wrap`)
- [ ] `globals.css` has `.page-layout`, `.page-eyebrow`, `.page-title`, `.page-subtitle` tokens
- [ ] Grep for `.dash-card` / `.dash-grid` in new files returns 0 results
- [ ] Grep for `animate-enter` in template returns staggered sections
- [ ] Dev server starts without TypeScript errors (`rtk tsc`)

---

## Implementation Notes for Executing Agent

- **Start with Phase 1** (PageLayout component + CSS tokens) — all other phases depend on it
- **Copy, don't transform**: copy the header structure from `v4/page.tsx`, don't rewrite it
- **Consult STYLE_GUIDE.md** before any visual decision
- **Read before editing**: always read the full target file before any Edit call
- **Token source of truth**: `app/globals.css` — never hardcode hex values in component files
- **Run `rtk tsc`** after each phase to catch type errors early

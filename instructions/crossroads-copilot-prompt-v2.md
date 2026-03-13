# GitHub Copilot Prompt - Crossroads Dashboard (v2.1, Next.js Repo-Aligned)
### Source of truth: active Crossroads Compass app structure
### Legacy reference: dharma-compass is visual reference only

---

## PROJECT CONTEXT

This repository is a Next.js App Router application, not a Vite single-page app.

Use these paths for implementation work:
- app/(app)/dashboard/page.tsx
- app/globals.css
- components/dashboard/*.tsx
- components/app/SidebarNav.tsx

Do not implement tasks against archived demo files under:
- public/dharma-compass 2/src/*

That folder is reference material only unless explicitly requested.

---

## ACTIVE DESIGN SYSTEM

Read app/globals.css before editing styles.

Current stack in use:
- Tailwind CSS v4
- Runtime accent variables via TimeColorProvider (`--accent-indigo`, `--accent-gold-cool`)
- Typography tokens in theme (`--font-serif`, `--font-sans`, `--font-mono`)
- Existing utility patterns: `.glass`, `.mono-data`, dashboard classes in styles/dashboard.css

Do not redefine the full token system. Extend only where needed.

---

## TASK 1 - Token/Class Audit (Repo-Correct)

Goal: remove invalid or legacy class names from active dashboard paths only.

Target files:
- app/(app)/dashboard/page.tsx
- components/dashboard/*.tsx
- app/globals.css

Rules:
- If `border-accent-gold` appears as a Tailwind utility class, replace with an existing valid strategy, e.g. `border-[var(--accent-gold-cool)]`.
- If `border-accent-gold` appears as a CSS variable name, keep it.
- Do not apply this task to public/dharma-compass 2.

---

## TASK 2 - Indigo Badge Class (Only If Used)

Goal: define missing style only when referenced by active app code.

Target file:
- app/globals.css

Implementation:
- First search active app and components for `badge-indigo` usage.
- If found and class is undefined, add:

```css
.badge-indigo { background: rgba(79,70,229,0.22); color: #A5B4FC; border: 1px solid rgba(99,102,241,0.30); }
```

- If not used, skip this task.

---

## TASK 3 - Remove Raw Markdown From JSX

Goal: remove literal markdown artifacts from rendered UI text.

Target files:
- app/(app)/dashboard/page.tsx
- components/dashboard/*.tsx

Rules:
- Replace any literal `**text**` in JSX text nodes with plain text or `<strong>`.
- Keep semantic emphasis where it improves readability.

---

## TASK 4 - Entrance Animation Utilities and Usage

### Step 4a - Add utilities in global styles

Target file:
- app/globals.css

Add only if not already present equivalent utilities:

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-enter {
  animation: fadeSlideUp 0.45s ease forwards;
  opacity: 0;
}

.animate-enter-1 { animation-delay: 0.05s; }
.animate-enter-2 { animation-delay: 0.13s; }
.animate-enter-3 { animation-delay: 0.21s; }
.animate-enter-4 { animation-delay: 0.29s; }
.animate-enter-5 { animation-delay: 0.37s; }
.animate-enter-6 { animation-delay: 0.45s; }
```

### Step 4b - Apply to major dashboard sections

Target file:
- app/(app)/dashboard/page.tsx

Apply staggered `animate-enter` classes to top-level cards/rows only. Avoid deep nesting and preserve responsive behavior.

---

## TASK 5 - Dasha Progress Motion (Data-Driven)

Goal: animate progress without hardcoding values.

Target file:
- components/dashboard/DashaCard.tsx

Rules:
- Use existing `mahaProgress` value from props.
- Animate width from 0 to `${mahaProgress}%` on mount.
- Do not hardcode `34%`.
- Keep existing insight flip behavior intact.

---

## TASK 6 - Sidebar Navigation Wiring (Route-Based)

This app uses Next.js routes, not `App.tsx` local view state switching.

Target file:
- components/app/SidebarNav.tsx

Rules:
- Add/update `NAV_ITEMS` entries using route href values.
- Active state must continue using `usePathname()`.
- For new sections, add corresponding route pages under app/(app)/ before adding nav links.

Current route examples already in use:
- /dashboard
- /report
- /transit
- /settings

---

## TASK 7 - Keep Dashboard Glanceable

Target file:
- app/(app)/dashboard/page.tsx

Guideline:
- Keep the dashboard focused on summary and decision support.
- Move heavy deep-dive sections to dedicated pages (report/transit/settings) when needed.
- Maintain useful top-level cards (guidance, dasha, quick metrics).

---

## TASK 8 - Cosmic Guidance Card Quality Check

Target file:
- app/(app)/dashboard/page.tsx

Requirements:
- Card must show both header and body content.
- Body should render from today's `dailyInsightRow.content` when available.
- If no insight exists, show a clear placeholder.
- Ensure no empty visual shell remains.

---

## ARCHITECTURE GUARDRAILS

Must follow repository rules:
- Do not call external Vedic API outside `lib/astro/vedicApiClient.ts` and orchestrators in `lib/astro/*`.
- Keep cache behavior consistent with chart service rules (HD and natal persistent, transits daily, dashas long-range).
- Avoid direct `process.env` reads in feature code; use centralized env validation pattern.

---

## QUALITY CHECKLIST (REPO-SAFE)

Before merging, verify:
- [ ] Every edited file path exists in active app structure (app/, components/, lib/).
- [ ] No tasks were applied to `public/dharma-compass 2/src/*` accidentally.
- [ ] No raw markdown emphasis syntax remains in JSX.
- [ ] Dashboard still renders on desktop and mobile breakpoints.
- [ ] Dasha progress remains data-driven and animates smoothly.
- [ ] Sidebar links point to valid routes.
- [ ] No external API boundary violations introduced.

---

*Copilot prompt v2.1 - rewritten for active Crossroads Compass Next.js repo - March 2026*

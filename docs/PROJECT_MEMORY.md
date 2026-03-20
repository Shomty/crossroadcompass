# Project Memory Map

This document defines where project "memory" lives, which source is authoritative, and how to keep context accurate over time.

## Memory Layers and Ownership

| Layer | Purpose | Canonical owner | Update frequency |
|---|---|---|---|
| Agent operating rules | Session behavior, coding constraints, architecture guardrails | `.claude/CLAUDE.md` | Rare (policy-level) |
| Task execution memory | In-flight or completed implementation plans | `.agent/plans/*.md` | Per task |
| Product/domain specs | Feature definitions, admin behavior, gap analysis | `docs/*.md` | Regular |
| Tool-specific coding hints | Copilot-specific implementation guidance | `.github/copilot-instructions.md` | Occasional |

## Memory Inventory (Current Repo)

### 1) Long-lived memory (highest authority)
- `.claude/CLAUDE.md`
  - Contains global development rules, architecture constraints, stack assumptions, and caching strategy.
  - Treat as the main source of truth for implementation behavior during agent sessions.

### 2) Task-scoped memory (short-lived)
- `.agent/plans/transit-refresh-fix.md`
- `.agent/plans/dashboard-page-template.md`
  - These are tactical execution plans tied to specific changes.
  - Keep focused and retire/archive when task context is no longer active.

### 3) Product and implementation memory
- `docs/FEATURES.md`
- `docs/GAP-ANALYSIS.md`
- `docs/ADMIN_PANEL.md`
- `docs/ADMIN-PROMPT-EDITOR.md`
- `docs/task-feature-muhurta-finder.md`
- `docs/task-admin-custom-report-builder.md`
  - These define product behavior, scope, and implementation milestones.

### 4) Secondary guidance
- `.github/copilot-instructions.md`
  - Useful integration/caching conventions for coding assistants.
  - Should not conflict with `.claude/CLAUDE.md`.

## Authority Rules (Conflict Resolution)

When two files disagree, resolve by this precedence:

1. `.claude/CLAUDE.md` (agent/runtime behavior and architecture guardrails)
2. Task file currently being executed (`.agent/plans/*.md` or explicit task file in `docs/`)
3. Product specs in `docs/*.md`
4. `.github/copilot-instructions.md` and other assistant-specific guidance

If a conflict changes user-facing behavior or schema contracts, create/update a single canonical source and replace duplicates with links.

## Hygiene Checklist (Monthly or Before Large Feature Work)

- [ ] **Stale plans:** Move completed plans older than 30 days from `.agent/plans/` to an archive folder (for example `.agent/plans/archive/`).
- [ ] **Duplicate rules:** Search for repeated policy text across `.claude/CLAUDE.md`, `docs/*.md`, and `.github/copilot-instructions.md`.
- [ ] **Contradictions:** Resolve direct conflicts (for example tier names/pricing nomenclature drift across docs).
- [ ] **Ownership tags:** Ensure each new memory doc states its owner and scope in the first 5 lines.
- [ ] **Link-first principle:** Replace duplicated paragraphs with a one-line summary plus a link to the canonical file.
- [ ] **Task closure:** Mark completed task-plan files with final outcome and date.

## Recommended Naming and Versioning

### Plan files (`.agent/plans/`)
- Naming: `<topic>-<intent>-<yyyymmdd>.md`
- Examples:
  - `transit-refresh-fix-20260319.md`
  - `dashboard-template-standardization-20260319.md`
- Include frontmatter:
  - `status: draft|active|done|archived`
  - `owner: <name or team>`
  - `created: YYYY-MM-DD`
  - `updated: YYYY-MM-DD`

### Product/docs files (`docs/`)
- Task docs: `task-<area>-<goal>.md`
- Reference docs: `<SUBJECT>.md` (uppercase allowed for stable cornerstone docs)
- Add a lightweight header block in each new doc:
  - `Owner`
  - `Last Updated`
  - `Canonical For` (what this file owns)
  - `Depends On` (links to upstream canonical memory)

## Minimal Working Process

1. Start each implementation by reading `.claude/CLAUDE.md`.
2. Read the active task plan in `.agent/plans/` and matching task doc in `docs/`.
3. Implement using canonical guidance only; avoid copying rules into multiple files.
4. At task completion, update/close the plan and note any canonical doc changes needed.

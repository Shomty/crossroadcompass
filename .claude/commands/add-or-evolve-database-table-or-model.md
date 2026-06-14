---
name: add-or-evolve-database-table-or-model
description: Workflow command scaffold for add-or-evolve-database-table-or-model in crossroadcompass.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-evolve-database-table-or-model

Use this workflow when working on **add-or-evolve-database-table-or-model** in `crossroadcompass`.

## Goal

Adds a new database table/model or evolves schema, including migrations and updating related backend logic.

## Common Files

- `prisma/schema.prisma`
- `prisma/migrations/*/migration.sql`
- `app/api/**/*.ts`
- `lib/**/*.ts`
- `types/index.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit prisma/schema.prisma to add or change a model/table.
- Generate or write a new migration SQL file under prisma/migrations/...
- Update backend API route(s) or service logic to use the new/changed model.
- Update types/index.ts or related type files if needed.
- Sometimes update lib/kv/keys.ts or caching logic.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.
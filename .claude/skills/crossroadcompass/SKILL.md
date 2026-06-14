```markdown
# crossroadcompass Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute effectively to the `crossroadcompass` codebase, a TypeScript project built on Next.js. You'll learn the repository's coding conventions, commit patterns, and the most common development workflows—including database migrations, API endpoint development, feature integration, design system updates, AI service evolution, report engine changes, and print/PDF support. This guide includes step-by-step instructions and code examples to help you follow best practices and streamline your contributions.

## Coding Conventions

### File Naming

- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `reportTemplateVars.ts`

### Import Style

- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { getUser } from '@/lib/userService';
    import PrintButton from '@/components/ui/PrintButton';
    ```

### Export Style

- Use **default exports** for modules unless multiple exports are necessary.
  - Example:
    ```typescript
    // Good
    export default function UserProfile() { ... }

    // Acceptable for utilities
    export function getUser() { ... }
    export function setUser() { ... }
    ```

### Commit Patterns

- **Conventional commits** are used.
- Prefixes: `feat`, `fix`, `chore`
- Example:
  ```
  feat(api): add endpoint for user reports
  fix(report): correct variable interpolation in templates
  chore: update dependencies
  ```

## Workflows

### Add or Evolve Database Table or Model
**Trigger:** When you need to persist new data or change the DB structure  
**Command:** `/new-table`

1. Edit `prisma/schema.prisma` to add or modify a model/table.
2. Generate or write a new migration SQL file under `prisma/migrations/`.
   ```bash
   npx prisma migrate dev --name add_new_model
   ```
3. Update backend API route(s) or service logic to use the new/changed model (e.g., `app/api/**/*.ts`, `lib/**/*.ts`).
4. Update `types/index.ts` or related type files if needed.
5. If caching is involved, update `lib/kv/keys.ts` or related logic.

**Example:**
```prisma
model Report {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
}
```

---

### Add or Evolve API Endpoint
**Trigger:** When you want to expose new backend functionality  
**Command:** `/new-endpoint`

1. Create or update `app/api/[feature]/[endpoint]/route.ts`.
2. Implement or update related service logic in `lib/...`.
3. Update or add tests in `tests/api/...` or `lib/...test.ts`.
4. Update `types/index.ts` if new types are introduced.

**Example:**
```typescript
// app/api/reports/summary/route.ts
import { getReportSummary } from '@/lib/reports/summaryService';

export default async function handler(req, res) {
  const summary = await getReportSummary(req.query.id);
  res.json(summary);
}
```

---

### Feature Development: Frontend-Backend Integration
**Trigger:** When building a new user-facing feature that requires backend logic  
**Command:** `/new-feature`

1. Create or update `app/(app)/[feature]/page.tsx`.
2. Create or update `components/[feature]/*.tsx`.
3. Create or update `app/api/[feature]/*/route.ts`.
4. Implement or update `lib/[feature]/*.ts` service logic.
5. Update `types/index.ts` as needed.
6. Update `app/globals.css` or `styles/*.css` for new UI elements.

**Example:**
```tsx
// app/(app)/dashboard/page.tsx
import Dashboard from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  return <Dashboard />;
}
```

---

### Design System or Style Guide Update
**Trigger:** When standardizing or updating the app's visual language  
**Command:** `/update-design-system`

1. Edit `app/globals.css` and/or `styles/*.css` to add or update tokens, utilities, or palettes.
2. Update components to use new or changed classes.
3. Update or create `STYLE_GUIDE.md` or related docs.
4. Sometimes update layout or shared UI primitives.

**Example:**
```css
/* app/globals.css */
:root {
  --primary-color: #1a73e8;
}
.button {
  background: var(--primary-color);
}
```

---

### AI Service or Prompt Engine Evolution
**Trigger:** When adding new AI features or improving prompt logic  
**Command:** `/new-ai-service`

1. Edit or add `lib/ai/[service]Service.ts` and/or `lib/ai/prompts/*.ts`.
2. Update or create `app/api/[feature]/*/route.ts` to use new AI logic.
3. Update `types/index.ts` if new types are needed.
4. Sometimes update caching (`lib/kv/keys.ts`) or add tests.

**Example:**
```typescript
// lib/ai/prompts/generateSummary.ts
export default function generateSummaryPrompt(data: any): string {
  return `Summarize the following data: ${JSON.stringify(data)}`;
}
```

---

### Report Template Variable or Engine Update
**Trigger:** When adding new computed fields or logic to reports  
**Command:** `/update-report-vars`

1. Edit `lib/reports/reportTemplateVariableKeys.ts` and/or `reportTemplateVars.ts`.
2. Update `lib/reports/contextBuilder.ts` or `reportGenerationService.ts`.
3. Update `types/index.ts` for new variable types.
4. Sometimes update related API endpoints or tests.

**Example:**
```typescript
// lib/reports/reportTemplateVars.ts
export const reportTemplateVars = {
  userName: (user) => user.name,
  purchaseDate: (purchase) => purchase.date,
};
```

---

### Print or PDF Styling and Print Button Integration
**Trigger:** When improving print/PDF output or adding print actions to UI  
**Command:** `/add-print-support`

1. Edit `app/globals.css` to add or update `@media print` rules and print-specific classes.
2. Add or update `components/ui/PrintButton.tsx`.
3. Integrate `PrintButton` into content/report components.
4. Update `app/(app)/reports/[purchaseId]/page.tsx` or similar pages to use print features.

**Example:**
```css
/* app/globals.css */
@media print {
  .no-print {
    display: none;
  }
}
```
```tsx
// components/ui/PrintButton.tsx
export default function PrintButton() {
  return <button onClick={() => window.print()}>Print</button>;
}
```

## Testing Patterns

- **Testing Framework:** [vitest](https://vitest.dev/)
- **Test File Pattern:** `*.test.ts`
- Place tests alongside the code or in a `tests/` directory.
- Example:
  ```typescript
  // lib/userService.test.ts
  import { getUser } from './userService';
  import { describe, it, expect } from 'vitest';

  describe('getUser', () => {
    it('returns user data', async () => {
      const user = await getUser('123');
      expect(user).toHaveProperty('id', '123');
    });
  });
  ```

## Commands

| Command               | Purpose                                                |
|-----------------------|--------------------------------------------------------|
| /new-table            | Add or evolve a database table or model                |
| /new-endpoint         | Add or evolve an API endpoint                          |
| /new-feature          | Develop a new feature with frontend-backend integration|
| /update-design-system | Update the design system or style guide                |
| /new-ai-service       | Add or evolve AI services or prompt logic              |
| /update-report-vars   | Update report template variables or engine             |
| /add-print-support    | Add or refine print/PDF styling and print button       |
```

// STATUS: done | Admin report catalog
import { z } from "zod";

export const reportCategoryZod = z.enum([
  "LIFE_PURPOSE",
  "CAREER",
  "RELATIONSHIPS",
  "SHADOW_WORK",
  "TIMING",
  "HEALTH",
  "FINANCE",
  "CUSTOM",
]);

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug: lowercase letters, digits, single hyphens only"
  );

/** "", undefined → omit; null → clear (null); else valid URL. */
const optionalUrl = z.preprocess(
  (v) => {
    if (v === "") return undefined;
    if (v === undefined) return undefined;
    return v;
  },
  z.union([z.string().url(), z.null()]).optional()
);

export const createReportProductSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  subtitle: z.union([z.string().max(300), z.null()]).optional(),
  description: z.string().min(1).max(50_000),
  category: reportCategoryZod,
  priceUsd: z.number().int().min(0).max(99_999_999),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(-999_999).max(999_999).optional().default(0),
  coverImageUrl: optionalUrl,
  geminiPrompt: z.string().min(1).max(500_000),
  estimatedWordCount: z
    .number()
    .int()
    .min(100)
    .max(500_000)
    .optional()
    .default(2000),
});

export const updateReportProductSchema = createReportProductSchema.partial();

export type CreateReportProductInput = z.infer<typeof createReportProductSchema>;
export type UpdateReportProductInput = z.infer<typeof updateReportProductSchema>;

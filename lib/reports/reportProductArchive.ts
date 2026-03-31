/** Slug suffix used when soft-deleting so @unique(slug) stays valid and slug can be restored. */
export function archivedReportProductSlug(
  currentSlug: string,
  productId: string
): string {
  const suffix = `--del--${productId}`;
  const max = 120;
  const maxBase = Math.max(0, max - suffix.length);
  const base =
    currentSlug.length <= maxBase
      ? currentSlug
      : currentSlug.slice(0, maxBase);
  return `${base}${suffix}`;
}

export function parseRestoreSlugFromArchived(
  slug: string,
  productId: string
): string | null {
  const suffix = `--del--${productId}`;
  if (!slug.endsWith(suffix)) return null;
  const restored = slug.slice(0, -suffix.length);
  return restored.length > 0 ? restored : null;
}

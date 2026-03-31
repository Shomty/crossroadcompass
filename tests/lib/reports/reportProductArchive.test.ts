import { describe, it, expect } from "vitest";
import {
  archivedReportProductSlug,
  parseRestoreSlugFromArchived,
} from "@/lib/reports/reportProductArchive";

describe("reportProductArchive", () => {
  it("archives slug with product id suffix within max length", () => {
    const id = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    expect(archivedReportProductSlug("my-report", id)).toBe(
      `my-report--del--${id}`
    );
  });

  it("truncates long slug before appending suffix", () => {
    const id = "cuid25charslongxxxxxxxxxxxx";
    const suffix = `--del--${id}`;
    const archived = archivedReportProductSlug("x".repeat(120), id);
    expect(archived.length).toBe(120);
    expect(archived.endsWith(suffix)).toBe(true);
  });

  it("parses restore slug from archived form", () => {
    const id = "prod1";
    const archived = `foo-bar--del--${id}`;
    expect(parseRestoreSlugFromArchived(archived, id)).toBe("foo-bar");
  });

  it("returns null when suffix does not match product id", () => {
    expect(parseRestoreSlugFromArchived("foo--del--a", "b")).toBeNull();
  });
});

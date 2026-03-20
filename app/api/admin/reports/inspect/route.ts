// STATUS: done | Admin Custom Report — Inspect Data
/**
 * GET /api/admin/reports/inspect?userId=X
 * Returns chart data availability and full interpolation vars for a user.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import { buildReportTemplateVars } from "@/lib/reports/reportTemplateVars";

function previewOf(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data as Record<string, unknown>).slice(0, 3);
  return Object.fromEntries(entries);
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const sources = await loadReportTemplateSources(userId);
  const vars = buildReportTemplateVars(sources);

  const dashaPreview =
    sources.currentMahadasha || sources.currentAntardasha
      ? {
          mahadasha: sources.currentMahadasha,
          antardasha: sources.currentAntardasha,
        }
      : null;

  return NextResponse.json({
    vars,
    vedicFull: sources.vedicData ?? null,
    dataSources: {
      hd: {
        available: sources.hdData !== null,
        preview: previewOf(sources.hdData),
      },
      vedic: {
        available: sources.vedicData !== null,
        preview: previewOf(sources.vedicData),
      },
      dashas: {
        available:
          dashaPreview !== null ||
          (Array.isArray(sources.dashasData) &&
            (sources.dashasData as unknown[]).length > 0),
        preview: dashaPreview,
      },
      transit: {
        available: sources.transitData != null,
        preview: previewOf(sources.transitData),
      },
    },
  });
}

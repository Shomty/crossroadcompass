// STATUS: done | Admin Custom Report Builder
/**
 * POST /api/admin/reports/generate
 * Validates config, assembles custom report, returns CustomReportOutput.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { assembleCustomReport } from "@/lib/content/customReportAssembler";

const ReportVariableEnum = z.enum([
  "hd_type_strategy",
  "hd_authority",
  "hd_profile",
  "hd_defined_centers",
  "hd_incarnation_cross",
  "vedic_natal_overview",
  "current_dasha",
  "dasha_guidance",
  "active_transits",
  "sade_sati_status",
  "career_purpose_theme",
  "relationship_theme",
  "shadow_growth_theme",
  "monthly_focus",
  "custom_note",
]);

const GenerateReportSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  variables: z.array(ReportVariableEnum).min(1),
  customNote: z.string().optional(),
  deliveryMode: z.enum(["preview", "email", "pdf"]),
});

export async function POST(request: Request): Promise<NextResponse> {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const config = parsed.data;

  // 25-second timeout guard
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Report generation timed out")), 25_000)
  );

  try {
    const report = await Promise.race([
      assembleCustomReport(config),
      timeoutPromise,
    ]);

    return NextResponse.json({ report });
  } catch (err) {
    const isTimeout =
      err instanceof Error && err.message.includes("timed out");
    if (isTimeout) {
      return NextResponse.json(
        { error: "Report generation timed out. Try fewer AI variables." },
        { status: 504 }
      );
    }
    console.error("[admin/reports/generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// STATUS: done | Task R.7
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { buildUserReportContext } from "./contextBuilder";
import { interpolateReportTemplate } from "./interpolateReportTemplate";
import { buildReportTemplateVars } from "./reportTemplateVars";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import {
  generateReportWithGemini,
  GeminiGenerationError,
} from "@/lib/gemini/client";
export async function generateReportForPurchase(
  purchaseId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Load purchase + product + user
  const purchase = await db.reportPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      reportProduct: true,
      user: { select: { id: true, email: true } },
    },
  });

  if (!purchase) {
    return { success: false, error: "Purchase not found" };
  }

  if (purchase.status !== "PAID") {
    return {
      success: false,
      error: `Purchase is in status ${purchase.status}, expected PAID`,
    };
  }

  // 2. Mark as GENERATING
  await db.reportPurchase.update({
    where: { id: purchaseId },
    data: { status: "GENERATING" },
  });

  try {
    const userId = purchase.user.id;

    // 3. Birth profile is required by chartService for HD calculation
    const birthProfile = await db.birthProfile.findUnique({
      where: { userId },
    });

    if (!birthProfile) {
      throw new Error("No birth profile for user");
    }

    // 4. Load chart data for interpolation
    const hdChart = await getOrCreateHDChart(userId, birthProfile);

    const templateSources = await loadReportTemplateSources(userId);
    const vars = buildReportTemplateVars({
      ...templateSources,
      hdData: hdChart,
      userEmail: purchase.user.email ?? templateSources.userEmail,
    });

    const systemPrompt = interpolateReportTemplate(
      purchase.reportProduct.geminiPrompt,
      vars
    );

    // 5. Build user data context (includes structured chart data)
    const userContext = await buildUserReportContext(userId);

    // 6. Call Gemini
    const result = await generateReportWithGemini(systemPrompt, userContext);

    // 7. Save generated report + mark purchase COMPLETE
    await db.$transaction([
      db.generatedReport.create({
        data: {
          purchaseId,
          content: result.text,
          wordCount: result.wordCount,
          geminiModel: result.model,
          generationTimeMs: result.durationMs,
        },
      }),
      db.reportPurchase.update({
        where: { id: purchaseId },
        data: { status: "COMPLETE" },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("[reportGenerationService] Generation failed:", error);

    await db.reportPurchase.update({
      where: { id: purchaseId },
      data: { status: "FAILED" },
    });

    const msg =
      error instanceof GeminiGenerationError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";

    return { success: false, error: msg };
  }
}


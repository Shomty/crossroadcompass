// STATUS: done | Task R.7
import { db } from "@/lib/db";
import { runMarketplaceReportGeneration } from "./marketplaceReportRunner";
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

  if (!["PAID", "COMPLETE", "FAILED"].includes(purchase.status)) {
    return {
      success: false,
      error: `Purchase is in status ${purchase.status}, cannot generate`,
    };
  }

  // 2. Mark as GENERATING
  await db.reportPurchase.update({
    where: { id: purchaseId },
    data: { status: "GENERATING" },
  });

  try {
    const userId = purchase.user.id;
    const email = purchase.user.email ?? "";

    const birthProfile = await db.birthProfile.findUnique({
      where: { userId },
    });
    if (!birthProfile) {
      throw new Error("No birth profile for user");
    }

    await db.generatedReport.upsert({
      where: { purchaseId },
      create: {
        purchaseId,
        status: "GENERATING",
        content: "",
        wordCount: 0,
        geminiModel: "",
      },
      update: {
        status: "GENERATING",
        errorMsg: null,
      },
    });

    const result = await runMarketplaceReportGeneration(
      userId,
      purchase.reportProduct.geminiPrompt,
      email
    );

    if (!result.ok) {
      await db.$transaction([
        db.generatedReport.update({
          where: { purchaseId },
          data: {
            status: "FAILED",
            errorMsg: result.error,
            content: "",
            wordCount: 0,
          },
        }),
        db.reportPurchase.update({
          where: { id: purchaseId },
          data: { status: "FAILED" },
        }),
      ]);
      return { success: false, error: result.error };
    }

    await db.$transaction([
      db.generatedReport.update({
        where: { purchaseId },
        data: {
          status: "DONE",
          content: result.text,
          wordCount: result.wordCount,
          geminiModel: result.model,
          generationTimeMs: result.durationMs,
          errorMsg: null,
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
      error instanceof Error ? error.message : "Unknown error";

    try {
      await db.generatedReport.update({
        where: { purchaseId },
        data: { status: "FAILED", errorMsg: msg },
      });
    } catch {
      /* ignore */
    }

    return { success: false, error: msg };
  }
}


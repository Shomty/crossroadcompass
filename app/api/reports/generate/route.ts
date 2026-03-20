// STATUS: done | Task R.8c
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { generateReportForPurchase } from "@/lib/reports/reportGenerationService";

const GenerateReportSchema = z.object({
  purchaseId: z.string().min(1),
});

export async function POST(request: Request) {
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

  const { purchaseId } = parsed.data;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Report generation timed out")), 25_000)
  );

  try {
    const result = await Promise.race([
      generateReportForPurchase(purchaseId),
      timeoutPromise,
    ]);

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Generation failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const isTimeout =
      err instanceof Error && err.message.toLowerCase().includes("timed out");

    if (isTimeout) {
      return NextResponse.json(
        { error: "Report generation timed out. Try again later." },
        { status: 504 }
      );
    }

    console.error("[api/reports/generate] failed:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}


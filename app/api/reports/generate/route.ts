import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateReportForPurchase } from "@/lib/reports/reportGenerationService";

const SEVEN_DAYS_MS = 7 * 86_400_000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { reportProductId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reportProductId = body.reportProductId;
  if (typeof reportProductId !== "string" || !reportProductId) {
    return NextResponse.json(
      { error: "reportProductId required" },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const adminBypass =
    !!env.ADMIN_EMAIL &&
    session.user.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

  let purchase = await db.reportPurchase.findFirst({
    where: { userId, reportProductId },
    include: { generatedReport: true },
    orderBy: { purchasedAt: "desc" },
  });

  const productActive = await db.reportProduct.findFirst({
    where: { id: reportProductId, deletedAt: null },
    select: { id: true },
  });

  if (!purchase && adminBypass) {
    if (!productActive) {
      return NextResponse.json({ error: "Report product not found" }, { status: 404 });
    }
    purchase = await db.reportPurchase.upsert({
      where: {
        userId_reportProductId: { userId, reportProductId },
      },
      create: {
        userId,
        reportProductId,
        amountPaidUsd: 0,
        status: "PAID",
      },
      update: {
        status: "PAID",
      },
      include: { generatedReport: true },
    });
  }

  if (!purchase) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const gr = purchase.generatedReport;
  if (gr?.status === "DONE" && gr.content.length > 0) {
    const ref = gr.regeneratedAt ?? gr.generatedAt;
    if (Date.now() - ref.getTime() < SEVEN_DAYS_MS) {
      return NextResponse.json({
        reportId: gr.id,
        status: "DONE",
        cached: true,
      });
    }
  }

  const result = await generateReportForPurchase(purchase.id);
  const updated = await db.generatedReport.findUnique({
    where: { purchaseId: purchase.id },
  });

  if (!result.success) {
    return NextResponse.json(
      {
        reportId: updated?.id ?? null,
        status: updated?.status ?? "FAILED",
        error: result.error,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    reportId: updated?.id ?? null,
    status: updated?.status ?? "DONE",
  });
}

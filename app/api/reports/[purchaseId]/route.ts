// STATUS: done | Task R.8b
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { purchaseId } = await params;

  const purchase = await db.reportPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      reportProduct: { select: { title: true } },
      generatedReport: true,
      user: { select: { id: true, email: true } },
    },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = purchase.user.id === userId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (purchase.status !== "COMPLETE" || !purchase.generatedReport) {
    return NextResponse.json({
      status: purchase.status,
      message: "Report not yet available",
    });
  }

  return NextResponse.json({
    purchaseId: purchase.id,
    productTitle: purchase.reportProduct.title,
    content: purchase.generatedReport.content,
    generatedAt: purchase.generatedReport.generatedAt.toISOString(),
    wordCount: purchase.generatedReport.wordCount,
  });
}


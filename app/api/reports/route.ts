// STATUS: done | Task R.8a
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await db.reportProduct.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      category: true,
      priceUsd: true,
      isActive: true,
      sortOrder: true,
      coverImageUrl: true,
      estimatedWordCount: true,
      // Do NOT expose geminiPrompt to the client
    },
  });

  const purchases = await db.reportPurchase.findMany({
    where: {
      userId,
      status: { in: ["PAID", "GENERATING", "COMPLETE"] },
    },
    select: {
      reportProductId: true,
      status: true,
      id: true,
    },
  });

  const purchaseMap = new Map(
    purchases.map((p) => [p.reportProductId, p])
  );

  const response = products.map((product) => {
    const purchase = purchaseMap.get(product.id);
    return {
      ...product,
      purchaseStatus: purchase?.status ?? null,
      purchaseId: purchase?.id ?? null,
    };
  });

  return NextResponse.json({ products: response });
}


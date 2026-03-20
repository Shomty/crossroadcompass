// STATUS: done | Task R.8d
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const PurchaseSchema = z.object({
  reportProductId: z.string().min(1),
  stripePaymentId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { reportProductId, stripePaymentId } = parsed.data;

  const product = await db.reportProduct.findUnique({
    where: { id: reportProductId },
    select: { id: true, priceUsd: true, isActive: true },
  });

  if (!product || !product.isActive) {
    return NextResponse.json(
      { error: "Report product not found or inactive" },
      { status: 404 }
    );
  }

  const existing = await db.reportPurchase.findFirst({
    where: { userId, reportProductId: product.id },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already purchased", purchaseId: existing.id },
      { status: 409 }
    );
  }

  const isAdmin = (session?.user?.email ?? "") === env.ADMIN_EMAIL;

  const purchase = await db.reportPurchase.create({
    data: {
      userId,
      reportProductId: product.id,
      stripePaymentId: stripePaymentId ?? null,
      amountPaidUsd: product.priceUsd,
      status: isAdmin ? "PAID" : "PENDING",
    },
  });

  return NextResponse.json({ purchaseId: purchase.id, status: purchase.status });
}


// SECURITY: geminiPrompt is admin-only. This route is protected by requireAdminApi.
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;
  const product = await db.reportProduct.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    name: product.title,
    slug: product.slug,
    description: product.description,
    isActive: product.isActive,
    promptVersion: product.promptVersion,
    priceCents: product.priceUsd,
    geminiPrompt: product.geminiPrompt,
    updatedAt: product.updatedAt.toISOString(),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;
  const existing = await db.reportProduct.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { geminiPrompt?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.geminiPrompt !== "string") {
    return NextResponse.json({ error: "geminiPrompt required" }, { status: 400 });
  }

  const adminEmail = session!.user.email ?? "admin";
  const nextVersion = existing.promptVersion + 1;

  await db.$transaction([
    db.reportPromptVersion.create({
      data: {
        reportProductId: id,
        version: nextVersion,
        prompt: body.geminiPrompt,
        savedBy: adminEmail,
      },
    }),
    db.reportProduct.update({
      where: { id },
      data: {
        geminiPrompt: body.geminiPrompt,
        promptVersion: nextVersion,
      },
    }),
  ]);

  await writeAuditLog({
    adminEmail,
    action: "prompt.save",
    targetType: "prompt",
    targetId: id,
  });

  return NextResponse.json({ promptVersion: nextVersion });
}

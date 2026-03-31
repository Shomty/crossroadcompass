import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

const createSchema = z.object({
  label: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(1000),
  sortOrder: z.number().int().optional(),
  enabled: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const starters = await db.chatStarterPrompt.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ starters });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", detail: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { label, message, sortOrder, enabled } = parsed.data;
  const maxOrder = await db.chatStarterPrompt.aggregate({ _max: { sortOrder: true } });
  const nextOrder = sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

  const starter = await db.chatStarterPrompt.create({
    data: {
      label: label ?? "",
      message,
      sortOrder: nextOrder,
      enabled,
      updatedBy: session!.user.email ?? "",
    },
  });

  return NextResponse.json({ starter });
}

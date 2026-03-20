// STATUS: done | Task Admin-9
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { getPrompt, savePrompt } from "@/lib/admin/promptService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promptKey: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { promptKey } = await params;
  const template = await getPrompt(decodeURIComponent(promptKey));
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ template });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ promptKey: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { promptKey } = await params;
  const body = await request.json();

  const template = await savePrompt(
    decodeURIComponent(promptKey),
    body,
    session!.user.email ?? ""
  );
  return NextResponse.json({ template });
}

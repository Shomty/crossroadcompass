// STATUS: done | Task Admin-9
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { rollbackPrompt } from "@/lib/admin/promptService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ promptKey: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { promptKey } = await params;
  const body = await request.json();

  if (!body.version || typeof body.version !== "number") {
    return NextResponse.json({ error: "version (number) required" }, { status: 400 });
  }

  const template = await rollbackPrompt(
    decodeURIComponent(promptKey),
    body.version,
    session!.user.email ?? ""
  );
  return NextResponse.json({ template });
}

// STATUS: done | Task Admin-9
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { getPromptHistory } from "@/lib/admin/promptService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promptKey: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { promptKey } = await params;
  const history = await getPromptHistory(decodeURIComponent(promptKey));
  return NextResponse.json({ history });
}

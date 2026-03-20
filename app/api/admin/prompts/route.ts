// STATUS: done | Task Admin-8
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { getAllPrompts, savePrompt } from "@/lib/admin/promptService";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const prompts = await getAllPrompts();
  return NextResponse.json({ prompts });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const body = await request.json();
  const { promptKey, ...data } = body;

  if (!promptKey) {
    return NextResponse.json({ error: "promptKey required" }, { status: 400 });
  }

  const template = await savePrompt(promptKey, data, session!.user.email ?? "");
  return NextResponse.json({ template }, { status: 201 });
}

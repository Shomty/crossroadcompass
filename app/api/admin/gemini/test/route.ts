// STATUS: done | Admin Gemini connectivity test
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { testGeminiConnection } from "@/lib/gemini/client";

export async function POST(request: Request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const result = await testGeminiConnection();

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}

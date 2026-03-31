import { NextResponse } from "next/server";
import { getEffectiveChatStarters } from "@/lib/ai/chatStarters";
import { getRequiredSession } from "@/lib/auth/helpers";

export async function GET() {
  try {
    await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const starters = await getEffectiveChatStarters();
  return NextResponse.json({ starters });
}

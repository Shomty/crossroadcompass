import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/helpers";
import { deleteSession, sessionExists } from "@/lib/ai/chatSessions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _req: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await sessionExists(session.user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Unknown session" }, { status: 404 });
  }

  await deleteSession(session.user.id, id);
  return NextResponse.json({ ok: true });
}

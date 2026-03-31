import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/helpers";
import {
  createSession,
  listSessions,
  loadThread,
  setActiveSessionId,
  sessionExists,
} from "@/lib/ai/chatSessions";

const patchSchema = z.object({
  activeSessionId: z.string().min(1).max(128),
});

export async function GET(): Promise<NextResponse> {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await listSessions(session.user.id);
  return NextResponse.json({ sessions });
}

export async function POST(): Promise<NextResponse> {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await createSession(session.user.id);
  return NextResponse.json({ id });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "activeSessionId required" }, { status: 400 });
  }

  const { activeSessionId } = parsed.data;
  const ok = await sessionExists(session.user.id, activeSessionId);
  if (!ok) {
    return NextResponse.json({ error: "Unknown session" }, { status: 404 });
  }

  await setActiveSessionId(session.user.id, activeSessionId);
  const history = await loadThread(session.user.id, activeSessionId);

  return NextResponse.json({ activeSessionId, history });
}

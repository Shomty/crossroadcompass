// Cosmic Chat persistence — SQLite via Prisma (per-user threads). Redis is not used for chat storage.

import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";

import { NEW_CHAT_TITLE, titleFromFirstUserMessage } from "@/lib/chat/chatSessionTitles";
import { db } from "@/lib/db";
import type { ChatRole } from "@/types";

export { NEW_CHAT_TITLE, titleFromFirstUserMessage } from "@/lib/chat/chatSessionTitles";

export interface ChatThreadSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface HistoryItem {
  role: ChatRole;
  content: string;
}

const MAX_SESSIONS = 30;
const MAX_TURNS = 20;

function parseHistoryMessages(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (
      (o.role === "user" || o.role === "assistant") &&
      typeof o.content === "string"
    ) {
      out.push({ role: o.role as ChatRole, content: o.content });
    }
  }
  return out;
}

function historyToJson(history: HistoryItem[]): Prisma.InputJsonValue {
  return history.map((h) => ({ role: h.role, content: h.content }));
}

/** Legacy Redis import removed — chat history lives in DB only. */
export async function migrateLegacyChatHistory(_userId: string): Promise<void> {
  /* no-op */
}

async function enforceMaxSessions(userId: string): Promise<void> {
  const threads = await db.chatThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (threads.length <= MAX_SESSIONS) return;
  const toDelete = threads.slice(MAX_SESSIONS).map((t) => t.id);
  const state = await db.userChatState.findUnique({ where: { userId } });
  const active = state?.activeThreadId ?? null;
  await db.chatThread.deleteMany({ where: { id: { in: toDelete } } });
  if (active && toDelete.includes(active)) {
    const remaining = threads.filter((t) => !toDelete.includes(t.id));
    const next = remaining[0]?.id ?? null;
    await db.userChatState.upsert({
      where: { userId },
      create: { userId, activeThreadId: next },
      update: { activeThreadId: next },
    });
  }
}

export async function listSessions(userId: string): Promise<ChatThreadSummary[]> {
  await migrateLegacyChatHistory(userId);
  const rows = await db.chatThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: MAX_SESSIONS,
    select: { id: true, title: true, updatedAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getActiveSessionId(userId: string): Promise<string | null> {
  const row = await db.userChatState.findUnique({
    where: { userId },
    select: { activeThreadId: true },
  });
  return row?.activeThreadId ?? null;
}

export async function setActiveSessionId(userId: string, sessionId: string): Promise<void> {
  await db.userChatState.upsert({
    where: { userId },
    create: { userId, activeThreadId: sessionId },
    update: { activeThreadId: sessionId },
  });
}

export async function sessionExists(userId: string, sessionId: string): Promise<boolean> {
  const n = await db.chatThread.count({ where: { userId, id: sessionId } });
  return n > 0;
}

/**
 * Ensures user has at least one session and returns a valid active session id.
 */
export async function ensureActiveSession(userId: string): Promise<string> {
  await migrateLegacyChatHistory(userId);
  const active = await getActiveSessionId(userId);
  if (active) {
    const exists = await db.chatThread.findFirst({
      where: { userId, id: active },
      select: { id: true },
    });
    if (exists) return active;
  }
  const threads = await db.chatThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: MAX_SESSIONS,
    select: { id: true },
  });
  if (threads.length > 0) {
    const pick = threads[0]!.id;
    await setActiveSessionId(userId, pick);
    return pick;
  }
  const created = await createSession(userId);
  return created.id;
}

export async function createSession(userId: string): Promise<{ id: string }> {
  await migrateLegacyChatHistory(userId);
  const id = randomUUID();
  await db.chatThread.create({
    data: {
      id,
      userId,
      title: NEW_CHAT_TITLE,
      messages: [],
    },
  });
  await enforceMaxSessions(userId);
  await setActiveSessionId(userId, id);
  return { id };
}

export async function loadThread(userId: string, sessionId: string): Promise<HistoryItem[]> {
  const row = await db.chatThread.findFirst({
    where: { userId, id: sessionId },
    select: { messages: true },
  });
  if (!row) return [];
  return parseHistoryMessages(row.messages);
}

export async function saveThread(
  userId: string,
  sessionId: string,
  history: HistoryItem[]
): Promise<void> {
  const trimmed = history.slice(-MAX_TURNS);
  const payload = historyToJson(trimmed);
  const result = await db.chatThread.updateMany({
    where: { userId, id: sessionId },
    data: { messages: payload },
  });
  if (result.count === 0) {
    await db.chatThread.create({
      data: {
        id: sessionId,
        userId,
        title: NEW_CHAT_TITLE,
        messages: payload,
      },
    });
    await enforceMaxSessions(userId);
  }
}

export async function clearThreadMessages(userId: string, sessionId: string): Promise<void> {
  await saveThread(userId, sessionId, []);
}

export async function syncSessionMetaAfterTurn(
  userId: string,
  sessionId: string,
  history: HistoryItem[]
): Promise<void> {
  const thread = await db.chatThread.findFirst({ where: { userId, id: sessionId } });
  const firstUser = history.find((h) => h.role === "user");
  let title = thread?.title ?? NEW_CHAT_TITLE;
  if (firstUser && title === NEW_CHAT_TITLE) {
    title = titleFromFirstUserMessage(firstUser.content);
  }
  const now = new Date();
  if (thread) {
    await db.chatThread.update({
      where: { id: sessionId },
      data: { title, updatedAt: now },
    });
  } else {
    const trimmed = history.slice(-MAX_TURNS);
    await db.chatThread.create({
      data: {
        id: sessionId,
        userId,
        title: firstUser ? titleFromFirstUserMessage(firstUser.content) : NEW_CHAT_TITLE,
        messages: historyToJson(trimmed),
      },
    });
    await enforceMaxSessions(userId);
  }
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  await db.chatThread.deleteMany({ where: { userId, id: sessionId } });
  const state = await db.userChatState.findUnique({ where: { userId } });
  if (state?.activeThreadId !== sessionId) return;
  const next = await db.chatThread.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  await db.userChatState.upsert({
    where: { userId },
    create: { userId, activeThreadId: next?.id ?? null },
    update: { activeThreadId: next?.id ?? null },
  });
}

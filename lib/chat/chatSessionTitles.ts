/** Shared title rules for Cosmic Chat (Redis + browser store). No server-only deps. */

export const NEW_CHAT_TITLE = "New conversation";

const TITLE_MAX = 72;

export function titleFromFirstUserMessage(content: string): string {
  const t = content.trim().replace(/\s+/g, " ");
  if (!t) return NEW_CHAT_TITLE;
  return t.length > TITLE_MAX ? `${t.slice(0, TITLE_MAX - 1)}…` : t;
}

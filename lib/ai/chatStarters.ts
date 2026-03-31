import { COSMIC_CHAT_STARTER_PROMPTS } from "@/lib/ai/chatWelcome";
import type { ChatStarterItem } from "@/lib/ai/chatStarterShared";
import { db } from "@/lib/db";

/**
 * Enabled DB rows, or built-in defaults when none are configured.
 */
export async function getEffectiveChatStarters(): Promise<ChatStarterItem[]> {
  const rows = await db.chatStarterPrompt.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, message: true },
  });
  if (rows.length === 0) {
    return COSMIC_CHAT_STARTER_PROMPTS.map((message, i) => ({
      id: `builtin-${i}`,
      label: "",
      message,
    }));
  }
  return rows;
}

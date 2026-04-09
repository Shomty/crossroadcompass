// Server-only helper. Call from server components or route handlers.

import { getRateLimitStatus } from "@/lib/ai/chatRateLimiter";
import {
  ensureActiveSession,
  loadThread,
} from "@/lib/ai/chatSessions";
import {
  CHAT_INTRO_CONFIG_KEY,
  CHAT_INTRO_MAX_LENGTH,
  DEFAULT_CHAT_INTRO_MESSAGE,
} from "@/lib/ai/chatWelcome";
import type { ChatStarterItem } from "@/lib/ai/chatStarterShared";
import { getEffectiveChatStarters } from "@/lib/ai/chatStarters";
import { db } from "@/lib/db";
import type { ChatRole } from "@/types";

export interface ChatInitialState {
  remaining: number | null;
  tier: string;
  resetAt: string | null;
  history: Array<{ role: ChatRole; content: string }>;
  introMessage: string;
  activeSessionId: string;
  /** Chat threads persist in SQLite (always true when DB is configured). */
  persistenceEnabled: boolean;
  starterPrompts: ChatStarterItem[];
  /** User's saved AI model preference for CosmicChat (e.g. "gemini-flash", "claude-sonnet").
   * NOTE: This preference applies ONLY to CosmicChat. Report generation always uses Gemini. */
  preferredAiModel: string;
}

function resolveIntroMessage(raw: string | undefined): string {
  const t = raw?.trim();
  if (!t || t.length > CHAT_INTRO_MAX_LENGTH) return DEFAULT_CHAT_INTRO_MESSAGE;
  return t;
}

export async function getChatInitialState(userId: string): Promise<ChatInitialState> {
  const [subscription, introRow, starterPrompts, chatState] = await Promise.all([
    db.subscription.findUnique({
      where: { userId },
      select: { tier: true },
    }),
    db.systemConfig.findUnique({
      where: { key: CHAT_INTRO_CONFIG_KEY },
      select: { value: true },
    }),
    getEffectiveChatStarters(),
    db.userChatState.findUnique({
      where: { userId },
      select: { preferredAiModel: true },
    }),
  ]);

  const tier = (subscription?.tier ?? "FREE") as import("@/types").SubscriptionTier;
  const introMessage = resolveIntroMessage(introRow?.value);
  const preferredAiModel = chatState?.preferredAiModel ?? (tier === "FREE" ? "gemini-flash" : "gemini-pro");

  const activeSessionId = await ensureActiveSession(userId);
  const history = await loadThread(userId, activeSessionId);
  const persistenceEnabled = true;

  if (tier !== "FREE") {
    return {
      remaining: null,
      tier,
      resetAt: null,
      history,
      introMessage,
      activeSessionId,
      persistenceEnabled,
      starterPrompts,
      preferredAiModel,
    };
  }

  const status = await getRateLimitStatus(userId, tier);

  return {
    remaining: status.remaining,
    tier,
    resetAt: status.resetAt.toISOString(),
    history,
    introMessage,
    activeSessionId,
    persistenceEnabled,
    starterPrompts,
    preferredAiModel,
  };
}

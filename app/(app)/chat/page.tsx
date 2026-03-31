import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { getChatInitialState } from "@/lib/ai/getChatInitialState";
import { listSessions } from "@/lib/ai/chatSessions";
import { ChatPageClient } from "@/components/chat/ChatPageClient";

export default async function ChatPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const [state, sessions] = await Promise.all([
    getChatInitialState(ctx.userId),
    listSessions(ctx.userId),
  ]);

  return (
    <ChatPageClient
      initialSessions={sessions}
      initialHistory={state.history}
      initialSessionId={state.activeSessionId}
      initialRemaining={state.remaining}
      initialTier={state.tier}
      initialLimitResetIso={state.resetAt}
      introMessage={state.introMessage}
      starterPrompts={state.starterPrompts}
    />
  );
}

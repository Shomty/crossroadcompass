// STATUS: done | CHAT.8

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/helpers";
import {
  checkAndIncrementRateLimit,
  checkPremiumSoftLimit,
} from "@/lib/ai/chatRateLimiter";
import { buildChatContext } from "@/lib/ai/chartContextBuilder";
import {
  ensureActiveSession,
  loadThread,
  saveThread,
  sessionExists,
  setActiveSessionId,
  syncSessionMetaAfterTurn,
} from "@/lib/ai/chatSessions";
import { geminiGenerate, GeminiChatError } from "@/lib/ai/geminiClient";
import { CONTENT_RULES } from "@/lib/ai/contentRules";
import {
  appendChatUserContextToSystemPrompt,
  formatReportVarsForChat,
  loadChatReportTemplateInput,
} from "@/lib/ai/chatReportVariables";
import { buildReportTemplateVars } from "@/lib/reports/reportTemplateVars";
import {
  getOrCreateHDChart,
  getOrCreateVedicChart,
} from "@/lib/astro/chartService";
import { db } from "@/lib/db";
import type {
  ChatResponse,
  ChatRateLimitResponse,
  ChatErrorResponse,
  ChatRole,
} from "@/types";

/** Assistant turns can exceed user input cap; rejecting the next POST caused 400s. */
const historyItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(16_000),
});

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(historyItemSchema).max(20).default([]),
  /** Thread ids are UUIDs today; allow any non-empty id so legacy rows still validate. */
  sessionId: z.string().min(1).max(128).optional(),
});

interface HistoryItem {
  role: ChatRole;
  content: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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
    return NextResponse.json<ChatErrorResponse>(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ChatErrorResponse>(
      { error: "Invalid request", detail: parsed.error.message },
      { status: 400 }
    );
  }

  const { message, history: clientHistory, sessionId: bodySessionId } =
    parsed.data;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { birthProfile: true },
  });

  if (!user) {
    return NextResponse.json<ChatErrorResponse>(
      { error: "User not found" },
      { status: 404 }
    );
  }

  if (!user.birthProfile) {
    return NextResponse.json<ChatErrorResponse>(
      { error: "Birth profile required to use chat." },
      { status: 400 }
    );
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { tier: true },
  });
  const tier = (subscription?.tier ?? "FREE") as import("@/types").SubscriptionTier;

  const rateLimit = await checkAndIncrementRateLimit(user.id, tier);

  if (!rateLimit.allowed) {
    return NextResponse.json<ChatRateLimitResponse>(
      {
        error: "RATE_LIMITED",
        remaining: 0,
        resetAt: rateLimit.resetAt.toISOString(),
        upgradeMessage:
          "You have used your 3 free questions for today. Unlock unlimited conversations in your full Life Blueprint.",
      },
      { status: 429 }
    );
  }

  const activeFallback = await ensureActiveSession(user.id);
  let sessionId: string;
  if (bodySessionId) {
    const ok = await sessionExists(user.id, bodySessionId);
    if (!ok) {
      return NextResponse.json<ChatErrorResponse>(
        { error: "Invalid or unknown chat session." },
        { status: 400 }
      );
    }
    sessionId = bodySessionId;
  } else {
    sessionId = activeFallback;
  }
  await setActiveSessionId(user.id, sessionId);

  const [hdChart, vedicChart, templateInput] = await Promise.all([
    getOrCreateHDChart(user.id, user.birthProfile),
    getOrCreateVedicChart(user.id, user.birthProfile).catch(() => null),
    loadChatReportTemplateInput(user.id, user.birthProfile),
  ]);

  const vars = buildReportTemplateVars(templateInput);
  const userContextBlock = formatReportVarsForChat(vars, {
    tier,
    maxChars: tier === "FREE" ? 14_000 : 42_000,
  });

  const narrative =
    tier === "FREE" ? buildChatContext(tier, hdChart, vedicChart) : "";
  const rulesAndNarrative = narrative
    ? `${CONTENT_RULES}\n\n${narrative}`
    : CONTENT_RULES;
  const systemPrompt = appendChatUserContextToSystemPrompt(
    rulesAndNarrative,
    userContextBlock
  );

  const serverHistory = await loadThread(user.id, sessionId);
  const history: HistoryItem[] =
    clientHistory.length > 0 ? clientHistory : serverHistory;

  const conversationLines = [
    ...history.map(
      (h) => `${h.role === "user" ? "User" : "Compass"}: ${h.content}`
    ),
    `User: ${message}`,
    "Compass:",
  ];
  const fullPrompt = conversationLines.join("\n\n");

  const model = tier === "FREE" ? "flash" : "pro";

  let responseText: string;
  try {
    responseText = await geminiGenerate(model, fullPrompt, systemPrompt);
  } catch (err) {
    console.error("[chat/route] generation error:", err);
    if (err instanceof GeminiChatError && err.code === "RATE_LIMITED") {
      return NextResponse.json<ChatErrorResponse>(
        { error: "AI service temporarily busy. Please try again in a moment." },
        { status: 503 }
      );
    }
    return NextResponse.json<ChatErrorResponse>(
      { error: "Could not generate a response. Please try again." },
      { status: 500 }
    );
  }

  const updatedHistory: HistoryItem[] = [
    ...history,
    { role: "user" as ChatRole, content: message },
    { role: "assistant" as ChatRole, content: responseText },
  ];
  await saveThread(user.id, sessionId, updatedHistory);
  await syncSessionMetaAfterTurn(user.id, sessionId, updatedHistory);

  let warning = false;
  if (tier !== "FREE") {
    const premiumLimit = await checkPremiumSoftLimit(user.id);
    warning = premiumLimit.warning;
  }

  const isUnlimited = tier !== "FREE";

  return NextResponse.json<ChatResponse>({
    response: responseText,
    remaining: isUnlimited ? null : rateLimit.remaining,
    resetAt: isUnlimited ? null : rateLimit.resetAt.toISOString(),
    tier,
    warning: warning || undefined,
    sessionId,
  });
}

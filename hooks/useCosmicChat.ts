"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, ChatRole } from "@/types";

interface UseChatOptions {
  initialRemaining?: number | null;
  initialTier?: string;
  initialMessages?: Array<{ role: ChatRole; content: string }>;
  initialSessionId?: string;
  initialLimitResetIso?: string | null;
}

interface SendResult {
  ok: boolean;
  limited: boolean;
  errorMsg?: string;
}

function toClientMessages(
  items: Array<{ role: ChatRole; content: string }>
): ChatMessage[] {
  return items.map((m) => ({
    id: crypto.randomUUID(),
    role: m.role,
    content: m.content,
    createdAt: new Date().toISOString(),
  }));
}

export function useCosmicChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!options.initialMessages?.length) return [];
    return toClientMessages(options.initialMessages);
  });
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(
    options.initialRemaining ?? null
  );
  const [tier, setTier] = useState(options.initialTier ?? "FREE");
  const [limited, setLimited] = useState(false);
  const [limitReset, setLimitReset] = useState<Date | null>(() =>
    options.initialLimitResetIso ? new Date(options.initialLimitResetIso) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState(
    options.initialSessionId ?? ""
  );

  const historyRef = useRef<Array<{ role: ChatRole; content: string }>>(
    options.initialMessages ?? []
  );
  const sessionIdRef = useRef(options.initialSessionId ?? "");

  useEffect(() => {
    if (options.initialMessages?.length && historyRef.current.length === 0) {
      historyRef.current = options.initialMessages;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (options.initialSessionId) {
      sessionIdRef.current = options.initialSessionId;
      setActiveSessionId(options.initialSessionId);
    }
  }, [options.initialSessionId]);

  const replaceThread = useCallback(
    (sessionId: string, items: Array<{ role: ChatRole; content: string }>) => {
      sessionIdRef.current = sessionId;
      setActiveSessionId(sessionId);
      historyRef.current = items;
      setMessages(toClientMessages(items));
      setError(null);
      setLimited(false);
    },
    []
  );

  const addMessage = useCallback((role: ChatRole, content: string): ChatMessage => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    historyRef.current = [...historyRef.current, { role, content }];
    return msg;
  }, []);

  const sendMessage = useCallback(
    async (text: string): Promise<SendResult> => {
      if (loading) return { ok: false, limited: false, errorMsg: "Already loading" };
      if (!text.trim()) return { ok: false, limited: false, errorMsg: "Empty message" };
      if (limited) return { ok: false, limited: true };

      setError(null);
      setLoading(true);
      addMessage("user", text);

      const history = historyRef.current.slice(-20).slice(0, -1);

      try {
        const body: Record<string, unknown> = {
          message: text,
          history,
        };
        if (sessionIdRef.current) {
          body.sessionId = sessionIdRef.current;
        }

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.status === 429) {
          setLimited(true);
          setRemaining(0);
          if (data.resetAt) setLimitReset(new Date(data.resetAt));
          setLoading(false);
          return { ok: false, limited: true, errorMsg: data.upgradeMessage };
        }

        if (!res.ok) {
          const msg = data.error ?? "Something went wrong. Please try again.";
          setError(msg);
          setMessages((prev) => prev.slice(0, -1));
          historyRef.current = historyRef.current.slice(0, -1);
          setLoading(false);
          return { ok: false, limited: false, errorMsg: msg };
        }

        addMessage("assistant", data.response);

        if (data.sessionId && typeof data.sessionId === "string") {
          sessionIdRef.current = data.sessionId;
          setActiveSessionId(data.sessionId);
        }
        if (data.remaining !== null && data.remaining !== undefined) {
          setRemaining(data.remaining);
        }
        if (data.tier) setTier(data.tier);

        setLoading(false);
        return { ok: true, limited: false };
      } catch (err) {
        console.error("[useCosmicChat] fetch error:", err);
        const msg = "Network error. Check your connection and try again.";
        setError(msg);
        setMessages((prev) => prev.slice(0, -1));
        historyRef.current = historyRef.current.slice(0, -1);
        setLoading(false);
        return { ok: false, limited: false, errorMsg: msg };
      }
    },
    [loading, limited, addMessage]
  );

  const clearMessages = useCallback(async () => {
    const id = sessionIdRef.current;
    if (id) {
      try {
        await fetch(`/api/chat/sessions/${encodeURIComponent(id)}/clear`, {
          method: "POST",
        });
      } catch {
        /* offline — still clear UI */
      }
    }
    setMessages([]);
    historyRef.current = [];
    setError(null);
    setLimited(false);
  }, []);

  const startNewConversation = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/chat/sessions", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.id) {
        sessionIdRef.current = data.id;
        setActiveSessionId(data.id);
        setMessages([]);
        historyRef.current = [];
        setError(null);
        setLimited(false);
        return data.id as string;
      }
    } catch (e) {
      console.error("[useCosmicChat] new session failed:", e);
    }
    return null;
  }, []);

  return {
    messages,
    loading,
    remaining,
    tier,
    limited,
    limitReset,
    error,
    activeSessionId,
    sendMessage,
    clearMessages,
    startNewConversation,
    replaceThread,
  };
}

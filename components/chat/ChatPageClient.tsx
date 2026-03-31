"use client";

import { useCallback, useEffect, useRef, useState, KeyboardEvent } from "react";
import { useCosmicChat } from "@/hooks/useCosmicChat";
import type { ChatStarterItem } from "@/lib/ai/chatStarterShared";
import { starterButtonText } from "@/lib/ai/chatStarterShared";
import { DEFAULT_CHAT_INTRO_MESSAGE } from "@/lib/ai/chatWelcome";
import type { ChatRole, ChatThreadSummary } from "@/types";
import {
  ChatLimitedState,
  ChatMessageBubble,
  ChatTypingIndicator,
} from "@/components/chat/ChatMessagePrimitives";

interface Props {
  initialSessions: ChatThreadSummary[];
  initialHistory: Array<{ role: ChatRole; content: string }>;
  initialSessionId: string;
  initialRemaining: number | null;
  initialTier: string;
  initialLimitResetIso: string | null;
  introMessage: string;
  starterPrompts: ChatStarterItem[];
}

function formatSessionWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatPageClient({
  initialSessions,
  initialHistory,
  initialSessionId,
  initialRemaining,
  initialTier,
  initialLimitResetIso,
  introMessage,
  starterPrompts,
}: Props) {
  const [sessions, setSessions] = useState<ChatThreadSummary[]>(initialSessions);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
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
  } = useCosmicChat({
    initialRemaining,
    initialTier,
    initialMessages: initialHistory,
    initialSessionId,
    initialLimitResetIso,
  });

  const refreshSessions = useCallback(async () => {
    const r = await fetch("/api/chat/sessions");
    if (!r.ok) return;
    const d = await r.json();
    setSessions(Array.isArray(d.sessions) ? d.sessions : []);
  }, []);

  const selectSession = useCallback(
    async (id: string) => {
      const r = await fetch("/api/chat/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeSessionId: id }),
      });
      const d = await r.json();
      if (r.ok && Array.isArray(d.history) && d.activeSessionId) {
        replaceThread(d.activeSessionId, d.history);
      }
    },
    [replaceThread]
  );

  const handleNewChat = useCallback(async () => {
    await startNewConversation();
    await refreshSessions();
  }, [startNewConversation, refreshSessions]);

  const handleDeleteSession = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const res = await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      const listRes = await fetch("/api/chat/sessions");
      const listData = await listRes.json();
      const list: ChatThreadSummary[] = Array.isArray(listData.sessions)
        ? listData.sessions
        : [];
      setSessions(list);

      if (id !== activeSessionId) return;

      if (list.length > 0) {
        await selectSession(list[0]!.id);
      } else {
        await startNewConversation();
        const again = await fetch("/api/chat/sessions");
        const j = await again.json();
        setSessions(Array.isArray(j.sessions) ? j.sessions : []);
      }
    },
    [activeSessionId, selectSession, startNewConversation]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || limited) return;
    setInput("");
    const result = await sendMessage(text);
    if (result.ok) void refreshSessions();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isFreeTier = tier === "FREE";
  const questionsLeft = isFreeTier && remaining !== null ? remaining : null;
  const welcome = introMessage?.trim() || DEFAULT_CHAT_INTRO_MESSAGE;

  return (
    <div style={{ padding: "24px 20px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        @keyframes chatpulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%           { transform: scale(1.2); opacity: 1;   }
        }
        .chat-page-layout { display: flex; gap: 0; min-height: calc(100vh - 120px); border-radius: 16px; overflow: hidden; border: 1px solid rgba(200,135,58,0.2); background: #0d1220; }
        @media (max-width: 768px) {
          .chat-page-layout { flex-direction: column; min-height: auto; }
          .chat-page-sidebar { width: 100% !important; max-height: 220px; border-right: none !important; border-bottom: 1px solid rgba(200,135,58,0.15); }
        }
        .cosmic-page-send:hover { background: #e8b96a !important; }
        .cosmic-page-starter:hover { background: rgba(200,135,58,0.15) !important; }
      `}</style>

      <header style={{ marginBottom: 20 }}>
        <h1
          style={{
            margin: 0,
            color: "#f0dca0",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 28,
            fontWeight: 400,
          }}
        >
          Cosmic Chat
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            color: "#606880",
            fontSize: 13,
            fontFamily: '"Instrument Sans", sans-serif',
          }}
        >
          Open the floating Compass anytime — this page keeps your full conversation history.
        </p>
      </header>

      <div className="chat-page-layout">
        <aside
          className="chat-page-sidebar"
          style={{
            width: 280,
            flexShrink: 0,
            borderRight: "1px solid rgba(200,135,58,0.15)",
            display: "flex",
            flexDirection: "column",
            background: "rgba(13,18,32,0.95)",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid rgba(200,135,58,0.12)",
              display: "flex",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => { void handleNewChat(); }}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(200,135,58,0.35)",
                background: "rgba(200,135,58,0.15)",
                color: "#e8b96a",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: '"Instrument Sans", sans-serif',
              }}
            >
              New chat
            </button>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {sessions.length === 0 ? (
              <p
                style={{
                  padding: "12px 14px",
                  margin: 0,
                  color: "rgba(240,220,160,0.35)",
                  fontSize: 12,
                  fontFamily: '"Instrument Sans", sans-serif',
                }}
              >
                No saved threads yet. Send a message to start your first chat.
              </p>
            ) : (
              sessions.map((s) => {
                const active = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => { void selectSession(s.id); }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        void selectSession(s.id);
                      }
                    }}
                    style={{
                      padding: "10px 12px",
                      margin: "0 8px 6px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: active ? "rgba(200,135,58,0.12)" : "transparent",
                      border: active
                        ? "1px solid rgba(200,135,58,0.35)"
                        : "1px solid transparent",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          color: "#f0dca0",
                          fontSize: 13,
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontWeight: active ? 600 : 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.title}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "rgba(200,135,58,0.5)",
                          fontSize: 11,
                          fontFamily: '"Instrument Sans", sans-serif',
                        }}
                      >
                        {formatSessionWhen(s.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Delete chat"
                      onClick={(ev) => { void handleDeleteSession(ev, s.id); }}
                      style={{
                        flexShrink: 0,
                        background: "transparent",
                        border: "none",
                        color: "rgba(240,220,160,0.25)",
                        cursor: "pointer",
                        fontSize: 16,
                        lineHeight: 1,
                        padding: "2px 4px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <section
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 480,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(200,135,58,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#f0dca0",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
              >
                Compass
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  color: "#c8873a",
                  fontSize: 11,
                  fontFamily: '"Instrument Sans", sans-serif',
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {isFreeTier && questionsLeft !== null
                  ? `${questionsLeft} question${questionsLeft !== 1 ? "s" : ""} remaining today`
                  : "Unlimited · Navigator"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => { void handleNewChat(); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(240,220,160,0.45)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: '"Instrument Sans", sans-serif',
                  padding: "4px 8px",
                }}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => { void clearMessages(); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(240,220,160,0.4)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: '"Instrument Sans", sans-serif',
                  padding: "4px 8px",
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div
            style={{
              flex: "1 1 0",
              overflowY: "auto",
              padding: "16px 14px 8px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(200,135,58,0.3) transparent",
            }}
          >
            {messages.length === 0 && !limited && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 16px 12px",
                    color: "rgba(240,220,160,0.5)",
                    fontSize: 13,
                    fontFamily: '"Instrument Sans", sans-serif',
                    lineHeight: 1.7,
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: 22 }}>✦</p>
                  <p style={{ margin: 0 }}>{welcome}</p>
                </div>
                <div style={{ padding: "0 4px 12px" }}>
                  {starterPrompts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="cosmic-page-starter"
                      onClick={() => {
                        void (async () => {
                          const r = await sendMessage(item.message);
                          if (r.ok) void refreshSessions();
                        })();
                      }}
                      disabled={loading}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: "rgba(200,135,58,0.08)",
                        border: "1px solid rgba(200,135,58,0.2)",
                        borderRadius: 8,
                        padding: "9px 12px",
                        marginBottom: 8,
                        color: "rgba(240,220,160,0.8)",
                        fontSize: 13,
                        fontFamily: '"Instrument Sans", sans-serif',
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      {starterButtonText(item)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && <ChatTypingIndicator />}
            {limited && <ChatLimitedState resetAt={limitReset} />}
            {error && !loading && (
              <p
                style={{
                  color: "rgba(255,120,100,0.8)",
                  fontSize: 13,
                  fontFamily: '"Instrument Sans", sans-serif',
                  textAlign: "center",
                  padding: 8,
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {!limited && (
            <div
              style={{
                padding: "10px 12px 14px",
                borderTop: "1px solid rgba(200,135,58,0.15)",
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your chart…"
                rows={1}
                disabled={loading}
                style={{
                  flex: "1 1 0",
                  resize: "none",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(200,135,58,0.2)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "#f0dca0",
                  fontSize: 14,
                  fontFamily: '"Instrument Sans", sans-serif',
                  lineHeight: 1.5,
                  maxHeight: 120,
                  overflowY: "auto",
                  opacity: loading ? 0.5 : 1,
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
              />
              <button
                type="button"
                className="cosmic-page-send"
                onClick={() => { void handleSend(); }}
                disabled={loading || !input.trim()}
                style={{
                  flexShrink: 0,
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background:
                    loading || !input.trim() ? "rgba(200,135,58,0.3)" : "#c8873a",
                  border: "none",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 8L2 2l3 6-3 6 12-6z"
                    fill={
                      loading || !input.trim() ? "rgba(26,14,0,0.5)" : "#1a0e00"
                    }
                  />
                </svg>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

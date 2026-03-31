"use client";

import type { ChatMessage } from "@/types";

export function ChatLimitedState({ resetAt }: { resetAt: Date | null }) {
  const resetStr = resetAt
    ? resetAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "tomorrow";

  return (
    <div
      style={{
        margin: "12px",
        padding: "16px",
        borderRadius: "12px",
        background: "rgba(200,135,58,0.1)",
        border: "1px solid rgba(200,135,58,0.3)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "#e8b96a",
          fontSize: "14px",
          margin: "0 0 8px",
          fontFamily: '"Instrument Sans", sans-serif',
        }}
      >
        3 free questions used today
      </p>
      <p
        style={{
          color: "#a07040",
          fontSize: "13px",
          margin: "0 0 16px",
          fontFamily: '"Instrument Sans", sans-serif',
        }}
      >
        Resets at {resetStr}. Your Life Blueprint includes unlimited conversations.
      </p>
      <a
        href="/subscribe"
        style={{
          display: "inline-block",
          padding: "8px 20px",
          borderRadius: "8px",
          background: "#c8873a",
          color: "#1a0e00",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: '"Instrument Sans", sans-serif',
        }}
      >
        Unlock full access →
      </a>
    </div>
  );
}

export function ChatMessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "#c8873a" : "rgba(255,255,255,0.07)",
          color: isUser ? "#1a0e00" : "#f0dca0",
          fontSize: "14px",
          lineHeight: "1.6",
          fontFamily: '"Instrument Sans", sans-serif',
          border: isUser ? "none" : "1px solid rgba(200,135,58,0.2)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export function ChatTypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 0 12px 4px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#c8873a",
            opacity: 0.6,
            animation: `chatpulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

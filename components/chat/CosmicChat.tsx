// STATUS: done | CHAT.11 CHAT.14
'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useCosmicChat } from '@/hooks/useCosmicChat'
import type { ChatStarterItem } from '@/lib/ai/chatStarterShared'
import { starterButtonText } from '@/lib/ai/chatStarterShared'
import { DEFAULT_CHAT_INTRO_MESSAGE } from '@/lib/ai/chatWelcome'
import type { ChatRole } from '@/types'
import {
  ChatLimitedState,
  ChatMessageBubble,
  ChatTypingIndicator,
} from '@/components/chat/ChatMessagePrimitives'

// ─── Main component ───────────────────────────────────────────────────────────

interface CosmicChatProps {
  initialRemaining?: number | null
  initialTier?: string
  initialMessages?: Array<{ role: ChatRole; content: string }>
  initialSessionId?: string
  initialLimitResetIso?: string | null
  introMessage?: string
  starterPrompts?: ChatStarterItem[]
}

export function CosmicChat({
  initialRemaining,
  initialTier,
  initialMessages,
  initialSessionId,
  initialLimitResetIso,
  introMessage,
  starterPrompts = [],
}: CosmicChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef(0)

  const {
    messages, loading, remaining, tier,
    limited, limitReset, error,
    sendMessage, clearMessages, startNewConversation,
    replaceThread,
  } = useCosmicChat({
    initialRemaining,
    initialTier,
    initialMessages,
    initialSessionId,
    initialLimitResetIso,
  })

  messagesRef.current = messages.length

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Layout RSC props are from first shell render; re-sync from DB when opening panel.
  useEffect(() => {
    if (!open || loading) return
    let cancelled = false
    void (async () => {
      try {
        const r = await fetch('/api/chat/status')
        if (!r.ok || cancelled) return
        const d = (await r.json()) as {
          sessionId?: string
          history?: Array<{ role: ChatRole; content: string }>
        }
        const sid = typeof d.sessionId === 'string' ? d.sessionId : null
        if (!sid) return
        const h = Array.isArray(d.history) ? d.history : []
        if (cancelled) return
        if (h.length < messagesRef.current) return
        replaceThread(sid, h)
      } catch {
        /* ignore */
      }
    })()
    return () => { cancelled = true }
  }, [open, loading, replaceThread])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading || limited) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const isFreeTier    = tier === 'FREE'
  const questionsLeft = isFreeTier && remaining !== null ? remaining : null

  return (
    <>
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes chatslideup {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes chatpulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%           { transform: scale(1.2); opacity: 1;   }
        }
        .cosmic-chat-btn:hover { transform: scale(1.08); }
        .cosmic-chat-btn       { transition: transform 0.15s ease; }
        .cosmic-send-btn:hover { background: #e8b96a !important; }
        .cosmic-send-btn       { transition: background 0.15s ease; }
        .cosmic-msg-input:focus { outline: none; border-color: rgba(200,135,58,0.5) !important; }
        .cosmic-starter-btn:hover { background: rgba(200,135,58,0.15) !important; }
      `}</style>

      {/* ── Floating trigger button ── */}
      <button
        className="cosmic-chat-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open Compass chat'}
        style={{
          position:       'fixed',
          bottom:         '24px',
          right:          '24px',
          zIndex:         1000,
          width:          '52px',
          height:         '52px',
          borderRadius:   '50%',
          background:     'linear-gradient(135deg, #c8873a, #e8b96a)',
          border:         'none',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 4px 20px rgba(200,135,58,0.4)',
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="#1a0e00" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
              fill="#1a0e00" stroke="#1a0e00" strokeWidth="0.5"/>
          </svg>
        )}
        {/* Unread indicator — shown when closed and messages exist */}
        {!open && messages.length > 0 && (
          <span style={{
            position:     'absolute',
            top:          '2px',
            right:        '2px',
            width:        '10px',
            height:       '10px',
            borderRadius: '50%',
            background:   '#f0dca0',
            border:       '2px solid #0d1220',
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          style={{
            position:      'fixed',
            bottom:        '88px',
            right:         '24px',
            zIndex:        999,
            width:         'min(380px, calc(100vw - 32px))',
            height:        '520px',
            borderRadius:  '16px',
            background:    '#0d1220',
            border:        '1px solid rgba(200,135,58,0.25)',
            display:       'flex',
            flexDirection: 'column',
            overflow:      'hidden',
            boxShadow:     '0 20px 60px rgba(0,0,0,0.6)',
            animation:     'chatslideup 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding:        '14px 16px 12px',
            borderBottom:   '1px solid rgba(200,135,58,0.15)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            flexShrink:     0,
          }}>
            <div>
              <p style={{
                margin:        0,
                color:         '#f0dca0',
                fontSize:      '15px',
                fontWeight:    600,
                fontFamily:    '"Cormorant Garamond", Georgia, serif',
                letterSpacing: '0.02em',
              }}>
                Compass
              </p>
              <p style={{
                margin:         '2px 0 0',
                color:          '#c8873a',
                fontSize:       '11px',
                fontFamily:     '"Instrument Sans", sans-serif',
                letterSpacing:  '0.06em',
                textTransform:  'uppercase',
              }}>
                {isFreeTier && questionsLeft !== null
                  ? `${questionsLeft} question${questionsLeft !== 1 ? 's' : ''} remaining today`
                  : 'Unlimited · Navigator'
                }
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => { void startNewConversation() }}
                title="Start a new conversation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(240,220,160,0.45)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: '"Instrument Sans", sans-serif',
                  padding: '4px 8px',
                }}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => { void clearMessages() }}
                title="Clear messages in this chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(240,220,160,0.4)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: '"Instrument Sans", sans-serif',
                  padding: '4px 8px',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div style={{
            flex:            '1 1 0',
            overflowY:       'auto',
            padding:         '16px 12px 8px',
            scrollbarWidth:  'thin',
            scrollbarColor:  'rgba(200,135,58,0.3) transparent',
          }}>
            {/* Welcome + starter prompts */}
            {messages.length === 0 && !limited && (
              <>
                <div style={{
                  textAlign:  'center',
                  padding:    '16px 16px 12px',
                  color:      'rgba(240,220,160,0.5)',
                  fontSize:   '13px',
                  fontFamily: '"Instrument Sans", sans-serif',
                  lineHeight: '1.7',
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: '22px' }}>✦</p>
                  <p style={{ margin: 0 }}>
                    {introMessage?.trim() || DEFAULT_CHAT_INTRO_MESSAGE}
                  </p>
                </div>

                <div style={{ padding: '0 4px 12px' }}>
                  {starterPrompts.map((item) => (
                    <button
                      key={item.id}
                      className="cosmic-starter-btn"
                      onClick={() => { void sendMessage(item.message) }}
                      disabled={loading}
                      style={{
                        display:      'block',
                        width:        '100%',
                        textAlign:    'left',
                        background:   'rgba(200,135,58,0.08)',
                        border:       '1px solid rgba(200,135,58,0.2)',
                        borderRadius: '8px',
                        padding:      '9px 12px',
                        marginBottom: '8px',
                        color:        'rgba(240,220,160,0.8)',
                        fontSize:     '13px',
                        fontFamily:   '"Instrument Sans", sans-serif',
                        cursor:       loading ? 'not-allowed' : 'pointer',
                        transition:   'background 0.15s',
                      }}
                    >
                      {starterButtonText(item)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map(msg => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))}

            {loading && <ChatTypingIndicator />}

            {limited && (
              <ChatLimitedState resetAt={limitReset} />
            )}

            {error && !loading && (
              <p style={{
                color:      'rgba(255,120,100,0.8)',
                fontSize:   '13px',
                fontFamily: '"Instrument Sans", sans-serif',
                textAlign:  'center',
                padding:    '8px',
                margin:     0,
              }}>
                {error}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          {!limited && (
            <div style={{
              padding:    '10px 12px 14px',
              borderTop:  '1px solid rgba(200,135,58,0.15)',
              display:    'flex',
              gap:        '8px',
              alignItems: 'flex-end',
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                className="cosmic-msg-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your chart…"
                rows={1}
                disabled={loading}
                style={{
                  flex:         '1 1 0',
                  resize:       'none',
                  background:   'rgba(255,255,255,0.06)',
                  border:       '1px solid rgba(200,135,58,0.2)',
                  borderRadius: '10px',
                  padding:      '10px 12px',
                  color:        '#f0dca0',
                  fontSize:     '14px',
                  fontFamily:   '"Instrument Sans", sans-serif',
                  lineHeight:   '1.5',
                  maxHeight:    '96px',
                  overflowY:    'auto',
                  opacity:      loading ? 0.5 : 1,
                }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 96) + 'px'
                }}
              />
              <button
                className="cosmic-send-btn"
                onClick={() => { void handleSend() }}
                disabled={loading || !input.trim()}
                style={{
                  flexShrink:     0,
                  width:          '38px',
                  height:         '38px',
                  borderRadius:   '10px',
                  background:     loading || !input.trim() ? 'rgba(200,135,58,0.3)' : '#c8873a',
                  border:         'none',
                  cursor:         loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l3 6-3 6 12-6z"
                    fill={loading || !input.trim() ? 'rgba(26,14,0,0.5)' : '#1a0e00'}/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

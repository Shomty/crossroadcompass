// STATUS: done | CHAT.4
// Server-only. Never import this file from a client component.

import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/lib/env'

function getClient() {
  if (!env.GEMINI_API_KEY) throw new GeminiChatError('API_ERROR', 'GEMINI_API_KEY is not set')
  return new GoogleGenerativeAI(env.GEMINI_API_KEY)
}

export class GeminiChatError extends Error {
  constructor(
    public readonly code: 'EMPTY_RESPONSE' | 'API_ERROR' | 'RATE_LIMITED',
    message: string
  ) {
    super(message)
    this.name = 'GeminiChatError'
  }
}

/**
 * Generate a single response from Gemini for the chat feature.
 * model: 'pro'   = GEMINI_MODEL_PRO   (premium users)
 * model: 'flash' = GEMINI_MODEL_FLASH (free tier)
 *
 * Never expose systemInstruction or prompt content in error responses.
 */
export async function geminiGenerate(
  model: 'pro' | 'flash',
  userPrompt: string,
  systemInstruction?: string
): Promise<string> {
  const modelName = model === 'pro' ? env.GEMINI_MODEL_PRO : env.GEMINI_MODEL_FLASH

  // systemInstruction must be passed to getGenerativeModel(), not generateContent()
  const m = getClient().getGenerativeModel({
    model: modelName,
    ...(systemInstruction ? { systemInstruction } : {}),
  })

  try {
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    })

    const text = result.response.text()
    if (!text?.trim()) {
      throw new GeminiChatError('EMPTY_RESPONSE', 'Model returned empty content')
    }
    return text.trim()
  } catch (err) {
    // Log server-side only — never forward raw Gemini errors to client
    console.error('[geminiGenerate] model=%s error=%s', modelName, String(err))
    if (err instanceof GeminiChatError) throw err
    throw new GeminiChatError('API_ERROR', 'Generation failed')
  }
}

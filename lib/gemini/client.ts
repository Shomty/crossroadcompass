// STATUS: done | Task R.4
/**
 * Gemini API client for report generation.
 * Uses `@google/generative-ai`.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class GeminiGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "GeminiGenerationError";
  }
}

function serializeGenerativeAiError(error: unknown): string {
  if (error instanceof Error) {
    let msg = error.message;
    const ex = error as Error & {
      status?: number;
      statusText?: string;
      errorDetails?: unknown;
    };
    if (typeof ex.status === "number") {
      msg += ` · HTTP ${ex.status}${ex.statusText ? ` ${ex.statusText}` : ""}`;
    }
    if (ex.errorDetails !== undefined) {
      try {
        const s = JSON.stringify(ex.errorDetails);
        if (s.length > 2) msg += ` · ${s.slice(0, 500)}`;
      } catch {
        /* ignore */
      }
    }
    return msg;
  }
  return String(error);
}

export interface GeminiGenerationResult {
  text: string;
  wordCount: number;
  model: string;
  durationMs: number;
}

export interface GeminiReportGenerationOptions {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * Generate a long-form report using Gemini.
 * @param systemPrompt - The full system/context prompt (from ReportProduct.geminiPrompt)
 * @param userDataContext - Assembled user chart data as a structured string
 */
export async function generateReportWithGemini(
  systemPrompt: string,
  userDataContext: string,
  options?: GeminiReportGenerationOptions
): Promise<GeminiGenerationResult> {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const start = Date.now();

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userDataContext }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens ?? 8192,
        topP: options?.topP ?? 0.9,
      },
    });

    const text = result.response.text();
    if (!text || !text.trim()) {
      throw new GeminiGenerationError(
        "Gemini returned an empty response. The prompt may have been blocked or the model returned no text."
      );
    }
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const durationMs = Date.now() - start;

    return {
      text,
      wordCount,
      model: env.GEMINI_MODEL,
      durationMs,
    };
  } catch (error) {
    if (error instanceof GeminiGenerationError) throw error;
    throw new GeminiGenerationError(
      serializeGenerativeAiError(error),
      error
    );
  }
}

export interface GeminiPingResult {
  ok: boolean;
  model: string;
  durationMs: number;
  /** First bytes of model output when ok */
  preview?: string;
  error?: string;
}

/**
 * Minimal live call to verify API key + model (admin diagnostics).
 */
export async function testGeminiConnection(): Promise<GeminiPingResult> {
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  const start = Date.now();

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Reply with exactly the single word PONG and nothing else.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 16,
      },
    });

    const text = result.response.text().trim();
    const durationMs = Date.now() - start;

    return {
      ok: true,
      model: env.GEMINI_MODEL,
      durationMs,
      preview: text.slice(0, 200),
    };
  } catch (error) {
    return {
      ok: false,
      model: env.GEMINI_MODEL,
      durationMs: Date.now() - start,
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error",
    };
  }
}


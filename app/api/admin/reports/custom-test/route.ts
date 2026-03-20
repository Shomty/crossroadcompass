// STATUS: done | Admin Custom Report — Custom Prompt Test
/**
 * POST /api/admin/reports/custom-test
 * Injects real KV user data into a free-form prompt and calls Gemini.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import { buildReportTemplateVars } from "@/lib/reports/reportTemplateVars";
import { interpolateReportTemplate } from "@/lib/reports/interpolateReportTemplate";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

const BodySchema = z.object({
  userId:        z.string().min(1),
  sectionTitle:  z.string().min(1).max(200),
  systemPrompt:  z.string(),
  userPrompt:    z.string().min(1),
  temperature:   z.number().min(0).max(1).optional().default(0.75),
  maxTokens:     z.number().int().min(100).max(4000).optional().default(1000),
});

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { userId, sectionTitle, systemPrompt, userPrompt, temperature, maxTokens } =
    parsed.data;

  const sources = await loadReportTemplateSources(userId);
  const vars = buildReportTemplateVars(sources);
  const composedUserPrompt = interpolateReportTemplate(userPrompt, vars);
  const composedSystem = systemPrompt.trim()
    ? interpolateReportTemplate(systemPrompt, vars)
    : "";

  if (!env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("custom-test timed out")), 25_000)
  );

  try {
    const result = await Promise.race([
      gemini().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: composedUserPrompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(composedSystem ? { systemInstruction: composedSystem } : {}),
        },
      }),
      timeoutPromise,
    ]);

    const output = result.text?.trim() ?? "";
    return NextResponse.json({
      output,
      composedPrompt: composedUserPrompt,
      vars,
      sectionTitle,
      dataSources: {
        hd: { available: sources.hdData !== null },
        vedic: { available: sources.vedicData !== null },
        transit: { available: sources.transitData != null },
      },
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.message.includes("timed out");
    if (isTimeout) {
      return NextResponse.json(
        { error: "Request timed out. Simplify the prompt and try again." },
        { status: 504 }
      );
    }
    console.error("[admin/reports/custom-test] Gemini error:", err);
    return NextResponse.json({ error: "Gemini call failed" }, { status: 500 });
  }
}

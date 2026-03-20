// STATUS: done | Admin report catalog — pre-save Gemini validation
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import { buildReportTemplateVars } from "@/lib/reports/reportTemplateVars";
import { interpolateReportTemplate } from "@/lib/reports/interpolateReportTemplate";
import { buildUserReportContext } from "@/lib/reports/contextBuilder";
import {
  generateReportWithGemini,
  GeminiGenerationError,
} from "@/lib/gemini/client";

const BodySchema = z.object({
  userId: z.string().min(1),
  geminiPrompt: z.string().min(1).max(500_000),
});

const TEST_TIMEOUT_MS = 55_000;
/** Avoid max-input errors during admin test when prompts expand huge JSON vars. */
const TEST_MAX_SYSTEM_CHARS = 90_000;
const TEST_MAX_USER_CHARS = 90_000;

function testGenerationErrorHint(message: string): string | undefined {
  const m = message.toLowerCase();
  if (message.includes("404") || /\bnot found\b/i.test(message)) {
    return "Set GEMINI_MODEL to a model your API key can call (ListModels in AI Studio). Try gemini-3-flash-preview, gemini-3.1-flash-lite-preview, or gemini-2.5-flash — legacy IDs like gemini-1.5-pro are often removed from v1beta.";
  }
  if (
    m.includes("api key") ||
    m.includes("permission_denied") ||
    m.includes("permission denied") ||
    m.includes("invalid api")
  ) {
    return "Verify GEMINI_API_KEY and that the Generative Language API is enabled for that key’s Google Cloud project.";
  }
  return undefined;
}

export async function POST(request: Request) {
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

  const { userId, geminiPrompt } = parsed.data;

  const birthProfile = await db.birthProfile.findUnique({
    where: { userId },
  });

  if (!birthProfile) {
    return NextResponse.json(
      {
        error:
          "No birth profile for this user. Pick a user who has completed onboarding.",
      },
      { status: 400 }
    );
  }

  try {
    const hdChart = await getOrCreateHDChart(userId, birthProfile);
    const templateSources = await loadReportTemplateSources(userId);
    const vars = buildReportTemplateVars({
      ...templateSources,
      hdData: hdChart,
      userEmail: templateSources.userEmail,
    });

    let systemPrompt = interpolateReportTemplate(geminiPrompt, vars);
    let userContext = await buildUserReportContext(userId);
    let truncated = false;

    if (systemPrompt.length > TEST_MAX_SYSTEM_CHARS) {
      systemPrompt =
        systemPrompt.slice(0, TEST_MAX_SYSTEM_CHARS) +
        "\n\n[… truncated for admin test — full product uses the complete interpolated prompt …]";
      truncated = true;
    }
    if (userContext.length > TEST_MAX_USER_CHARS) {
      userContext =
        userContext.slice(0, TEST_MAX_USER_CHARS) +
        "\n\n[… truncated for admin test — live generation uses full chart context …]";
      truncated = true;
    }

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Test generation timed out")), TEST_TIMEOUT_MS)
    );

    const result = await Promise.race([
      generateReportWithGemini(systemPrompt, userContext, {
        maxOutputTokens: 2048,
        temperature: 0.55,
      }),
      timeout,
    ]);

    return NextResponse.json({
      ok: true,
      preview: result.text.slice(0, 4_000),
      wordCount: result.wordCount,
      durationMs: result.durationMs,
      model: result.model,
      truncated,
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("timed out")) {
      return NextResponse.json(
        { ok: false, error: "Test timed out. Shorten the prompt or try again." },
        { status: 504 }
      );
    }
    if (e instanceof GeminiGenerationError) {
      return NextResponse.json(
        {
          ok: false,
          error: e.message,
          hint: testGenerationErrorHint(e.message),
        },
        { status: 502 }
      );
    }
    const msg = e instanceof Error ? e.message : "Test failed";
    console.error("[admin/report-products/test-generation]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

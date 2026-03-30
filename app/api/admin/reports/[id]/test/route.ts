import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { SAMPLE_REPORT_VARIABLES } from "@/lib/admin/reportTestSampleVars";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { resolveMergedPromptVariables } from "@/lib/content/reportVariableResolver";
import { interpolateReportTemplate } from "@/lib/reports/interpolateReportTemplate";
import { listMissingTemplateKeys } from "@/lib/reports/marketplaceReportRunner";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SEED_EMAIL = "shomty@hotmail.com";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;
  const product = await db.reportProduct.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { userId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const adminEmail = session!.user.email ?? "admin";
  let vars: Record<string, string>;
  let seedUserMissing = false;
  let detail: string;

  if (typeof body.userId === "string" && body.userId.length > 0) {
    vars = await resolveMergedPromptVariables(body.userId);
    if (Object.keys(vars).length === 0) {
      vars = { ...SAMPLE_REPORT_VARIABLES };
      seedUserMissing = true;
    }
    detail = body.userId;
  } else {
    const seed = await db.user.findUnique({
      where: { email: SEED_EMAIL },
      select: { id: true },
    });
    if (seed) {
      vars = await resolveMergedPromptVariables(seed.id);
      detail = `seed:${SEED_EMAIL}`;
    } else {
      vars = { ...SAMPLE_REPORT_VARIABLES };
      seedUserMissing = true;
      detail = `seed:${SEED_EMAIL}`;
    }
  }

  const interpolated = interpolateReportTemplate(product.geminiPrompt, vars);
  const variablesMissing = listMissingTemplateKeys(product.geminiPrompt, vars);
  const variablesResolved = Object.keys(vars).filter(
    (k) => vars[k] && vars[k] !== "unknown"
  ).length;

  let preview: string;
  if (env.GEMINI_API_KEY) {
    try {
      const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = client.getGenerativeModel({ model: env.GEMINI_MODEL });
      const start = Date.now();
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: interpolated.slice(0, 12000) }] }],
      });
      const text = result.response.text() ?? "";
      preview = text.slice(0, 500);
      const latestPv = await db.reportPromptVersion.findFirst({
        where: { reportProductId: id },
        orderBy: { version: "desc" },
      });
      if (latestPv) {
        await db.reportPromptVersion.update({
          where: { id: latestPv.id },
          data: { testResult: preview },
        });
      }
      void start;
    } catch (e) {
      preview = `[Gemini error] ${e instanceof Error ? e.message : String(e)}`.slice(0, 500);
    }
  } else {
    preview = `[Stub — no GEMINI_API_KEY] ${interpolated.slice(0, 400)}`;
  }

  await writeAuditLog({
    adminEmail,
    action: "report.test",
    targetType: "report",
    targetId: id,
    detail,
  });

  const payload: Record<string, unknown> = {
    preview,
    variablesResolved,
    variablesMissing,
  };
  if (seedUserMissing) payload.seedUserMissing = true;

  return NextResponse.json(payload);
}

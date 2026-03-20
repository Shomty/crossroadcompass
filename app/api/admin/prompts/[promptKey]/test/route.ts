// STATUS: done | Task Admin-9
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { PROMPT_VARIABLE_MAP } from "@/lib/content/promptBuilder";

// Sample values for prompt preview/testing
const SAMPLE_VALUES: Record<string, string> = {
  hdType: "Generator",
  strategy: "To Respond",
  authority: "Sacral",
  profile: "1/3",
  currentDasha: "Saturn Mahadasha",
  todayDate: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  userName: "Alex",
  weekStart: "Monday, March 17, 2026",
  monthName: "March 2026",
  definition: "Single Definition",
  channels: "Channel of Initiation (51-25), Channel of Community (37-40)",
  intakeLifeSituation: "Career transition, feeling stuck",
  intakePrimaryFocus: "Finding direction and purpose",
  d1Houses: "Ascendant Scorpio, 10th house Saturn",
  d9Houses: "Venus in Pisces, strong 7th",
  d10Houses: "Jupiter in career house",
  d1Chart: "Scorpio ascendant, Saturn in 10th",
  d9Chart: "Navamsha Venus strong",
  d10Chart: "Dashamsha Jupiter prominent",
  definedCenters: "Sacral, Spleen, Root",
};

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ promptKey: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { promptKey } = await params;
  const body = await request.json();

  const { systemPrompt, userPromptTemplate, temperature = 0.8, maxTokens = 800 } = body;

  if (!userPromptTemplate) {
    return NextResponse.json({ error: "userPromptTemplate required" }, { status: 400 });
  }

  // Get variable list for this prompt key
  const varNames = PROMPT_VARIABLE_MAP[decodeURIComponent(promptKey)] ?? Object.keys(SAMPLE_VALUES);
  const vars = Object.fromEntries(varNames.map((k) => [k, SAMPLE_VALUES[k] ?? `[${k}]`]));

  const renderedPrompt = interpolate(userPromptTemplate, vars);

  if (!env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: renderedPrompt,
    config: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
    },
  });

  return NextResponse.json({
    output: result.text,
    renderedPrompt,
    sampleVars: vars,
  });
}

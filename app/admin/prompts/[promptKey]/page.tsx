// STATUS: done | Task Admin-9
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { getPrompt, getPromptHistory } from "@/lib/admin/promptService";
import { PROMPT_VARIABLE_MAP } from "@/lib/content/promptBuilder";
import { notFound } from "next/navigation";
import { PromptEditor } from "@/components/admin/PromptEditor";

export const dynamic = "force-dynamic";

export default async function PromptEditPage({
  params,
}: {
  params: Promise<{ promptKey: string }>;
}) {
  await requireAdminSession();

  const { promptKey } = await params;
  const key = decodeURIComponent(promptKey);

  const [template, history] = await Promise.all([
    getPrompt(key),
    getPromptHistory(key),
  ]);

  if (!template) notFound();

  const variableNames = PROMPT_VARIABLE_MAP[key] ?? [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 26,
          fontWeight: 400,
          color: "#f0dca0",
          margin: 0,
          marginBottom: 4,
        }}>
          {key}
        </h1>
        <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#606880" }}>
          v{template.version} · last updated {new Date(template.updatedAt).toLocaleDateString()} by {template.updatedBy}
        </div>
      </div>

      <PromptEditor
        promptKey={key}
        initialTemplate={{
          id: template.id,
          systemPrompt: template.systemPrompt,
          userPromptTemplate: template.userPromptTemplate,
          bannedPhrases: template.bannedPhrases,
          maxTokens: template.maxTokens,
          temperature: template.temperature,
          isActive: template.isActive,
          version: template.version,
        }}
        history={history.map((h) => ({
          id: h.id,
          version: h.version,
          savedAt: h.savedAt.toISOString(),
          savedBy: h.savedBy,
          systemPrompt: h.systemPrompt,
          userPromptTemplate: h.userPromptTemplate,
        }))}
        variableNames={variableNames}
      />
    </div>
  );
}

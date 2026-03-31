// STATUS: done | Task Admin-4
import { db } from "@/lib/db";
import {
  Prisma,
  PromptTemplate,
  PromptTemplateVersion,
  PromptFeature,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import {
  prismaCreateTodayMoonBase,
  todayMoonBaseTemplateFields,
  TODAY_MOON_BASE_PROMPT_KEY,
} from "@/lib/admin/todayMoonBasePromptDefault";

export interface PromptUpdateInput {
  systemPrompt: string;
  userPromptTemplate: string;
  bannedPhrases?: string;
  maxTokens?: number;
  temperature?: number;
  isActive?: boolean;
  feature?: PromptFeature;
  hdType?: string | null;
}

export async function getPrompt(promptKey: string): Promise<PromptTemplate | null> {
  let row = await db.promptTemplate.findUnique({ where: { promptKey } });

  if (promptKey === TODAY_MOON_BASE_PROMPT_KEY) {
    // #region agent log
    fetch("http://127.0.0.1:7699/ingest/5bba2a91-3664-43de-850b-4feb81d96c61", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ceb90d" },
      body: JSON.stringify({
        sessionId: "ceb90d",
        location: "promptService.ts:getPrompt:enterTodayMoon",
        message: "todayMoon.base lookup",
        data: {
          rowFound: !!row,
          userPromptLen: row?.userPromptTemplate?.length ?? 0,
          trimEmpty: !row?.userPromptTemplate?.trim(),
        },
        timestamp: Date.now(),
        hypothesisId: "H-empty-row-or-template",
      }),
    }).catch(() => {});
    // #endregion

    if (!row) {
      try {
        await db.promptTemplate.create({
          data: prismaCreateTodayMoonBase("system:lazy-seed"),
        });
      } catch (e) {
        const dup =
          e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
        // #region agent log
        fetch("http://127.0.0.1:7699/ingest/5bba2a91-3664-43de-850b-4feb81d96c61", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ceb90d" },
          body: JSON.stringify({
            sessionId: "ceb90d",
            location: "promptService.ts:getPrompt:createTodayMoon",
            message: "lazy create result",
            data: { dup, err: dup ? null : String(e) },
            timestamp: Date.now(),
            hypothesisId: "H-upsert-empty-update",
          }),
        }).catch(() => {});
        // #endregion
        if (!dup) throw e;
      }
      row = await db.promptTemplate.findUnique({ where: { promptKey } });
    }

    if (row && !row.userPromptTemplate?.trim()) {
      row = await db.promptTemplate.update({
        where: { promptKey: TODAY_MOON_BASE_PROMPT_KEY },
        data: {
          systemPrompt: todayMoonBaseTemplateFields.systemPrompt,
          userPromptTemplate: todayMoonBaseTemplateFields.userPromptTemplate,
          maxTokens: todayMoonBaseTemplateFields.maxTokens,
          temperature: todayMoonBaseTemplateFields.temperature,
          updatedBy: "system:lazy-seed-repair",
        },
      });
    }

    // #region agent log
    fetch("http://127.0.0.1:7699/ingest/5bba2a91-3664-43de-850b-4feb81d96c61", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ceb90d" },
      body: JSON.stringify({
        sessionId: "ceb90d",
        location: "promptService.ts:getPrompt:exitTodayMoon",
        message: "todayMoon.base final",
        data: {
          rowFound: !!row,
          userPromptLen: row?.userPromptTemplate?.length ?? 0,
        },
        timestamp: Date.now(),
        hypothesisId: "H-verify",
      }),
    }).catch(() => {});
    // #endregion
  }

  return row;
}

export async function getAllPrompts(): Promise<PromptTemplate[]> {
  return db.promptTemplate.findMany({ orderBy: [{ feature: "asc" }, { promptKey: "asc" }] });
}

export async function savePrompt(
  promptKey: string,
  data: PromptUpdateInput,
  adminEmail: string
): Promise<PromptTemplate> {
  const existing = await db.promptTemplate.findUnique({ where: { promptKey } });

  const newVersion = (existing?.version ?? 0) + 1;

  const template = await db.promptTemplate.upsert({
    where: { promptKey },
    create: {
      promptKey,
      feature: data.feature ?? PromptFeature.DAILY_INSIGHT,
      hdType: data.hdType,
      systemPrompt: data.systemPrompt,
      userPromptTemplate: data.userPromptTemplate,
      bannedPhrases: data.bannedPhrases ?? "",
      maxTokens: data.maxTokens ?? 800,
      temperature: data.temperature ?? 0.8,
      isActive: data.isActive ?? true,
      version: 1,
      updatedBy: adminEmail,
    },
    update: {
      systemPrompt: data.systemPrompt,
      userPromptTemplate: data.userPromptTemplate,
      bannedPhrases: data.bannedPhrases ?? existing?.bannedPhrases ?? "",
      maxTokens: data.maxTokens ?? existing?.maxTokens ?? 800,
      temperature: data.temperature ?? existing?.temperature ?? 0.8,
      isActive: data.isActive ?? existing?.isActive ?? true,
      version: newVersion,
      updatedBy: adminEmail,
      ...(data.hdType !== undefined ? { hdType: data.hdType } : {}),
    },
  });

  // Write version history
  await db.promptTemplateVersion.create({
    data: {
      promptTemplateId: template.id,
      systemPrompt: template.systemPrompt,
      userPromptTemplate: template.userPromptTemplate,
      version: template.version,
      savedBy: adminEmail,
    },
  });

  await writeAuditLog({
    adminEmail,
    actionType: "PROMPT_SAVED",
    targetId: promptKey,
    targetType: "PromptTemplate",
    before: existing ? { version: existing.version, systemPrompt: existing.systemPrompt } : null,
    after: { version: template.version, systemPrompt: template.systemPrompt },
  });

  return template;
}

export async function getPromptHistory(promptKey: string): Promise<PromptTemplateVersion[]> {
  const template = await db.promptTemplate.findUnique({ where: { promptKey } });
  if (!template) return [];

  return db.promptTemplateVersion.findMany({
    where: { promptTemplateId: template.id },
    orderBy: { version: "desc" },
  });
}

export async function rollbackPrompt(
  promptKey: string,
  version: number,
  adminEmail: string
): Promise<PromptTemplate> {
  const template = await db.promptTemplate.findUnique({ where: { promptKey } });
  if (!template) throw new Error(`Prompt not found: ${promptKey}`);

  const targetVersion = await db.promptTemplateVersion.findFirst({
    where: { promptTemplateId: template.id, version },
  });
  if (!targetVersion) throw new Error(`Version ${version} not found for prompt: ${promptKey}`);

  const newVersion = template.version + 1;

  const updated = await db.promptTemplate.update({
    where: { promptKey },
    data: {
      systemPrompt: targetVersion.systemPrompt,
      userPromptTemplate: targetVersion.userPromptTemplate,
      version: newVersion,
      updatedBy: adminEmail,
    },
  });

  await db.promptTemplateVersion.create({
    data: {
      promptTemplateId: template.id,
      systemPrompt: updated.systemPrompt,
      userPromptTemplate: updated.userPromptTemplate,
      version: newVersion,
      savedBy: adminEmail,
    },
  });

  await writeAuditLog({
    adminEmail,
    actionType: "PROMPT_ROLLED_BACK",
    targetId: promptKey,
    targetType: "PromptTemplate",
    before: { version: template.version },
    after: { version: newVersion, rolledBackTo: version },
  });

  return updated;
}

// STATUS: done | Admin report template data
import { db } from "@/lib/db";
import { kvGet } from "@/lib/kv/helpers";
import { kvKeys } from "@/lib/kv/keys";
import type { HDChartData } from "@/types";
import type { BuildReportTemplateVarsInput } from "@/lib/reports/reportTemplateVars";

/**
 * Loads HD, Vedic, transit, dasha, and birth data for template interpolation
 * (admin inspect / custom-test / shared with marketplace generation pattern).
 */
export async function loadReportTemplateSources(
  userId: string
): Promise<BuildReportTemplateVarsInput> {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [hdDataKv, vedicDataKv, transitDataKv, dashasKv, user, birthProfile] =
    await Promise.all([
      kvGet<HDChartData>(kvKeys.hdChart(userId)),
      kvGet<Record<string, unknown>>(kvKeys.vedicChart(userId)),
      kvGet<unknown>(kvKeys.transit(userId, todayStr)),
      kvGet<unknown>(kvKeys.dashas(userId)),
      db.user.findUnique({ where: { id: userId }, select: { email: true } }),
      db.birthProfile.findUnique({ where: { userId } }),
    ]);

  let hdData: HDChartData | null = hdDataKv;
  if (!hdData && birthProfile?.chartDataHumanDesign) {
    hdData = birthProfile.chartDataHumanDesign as unknown as HDChartData;
  }

  let vedicData: Record<string, unknown> | null = vedicDataKv;
  if (!vedicData && birthProfile?.chartDataVedic) {
    vedicData = birthProfile.chartDataVedic as unknown as Record<string, unknown>;
  }

  let transitData: unknown = transitDataKv;
  if (!transitData) {
    const todayStart = new Date(todayStr + "T00:00:00.000Z");
    const todayEnd = new Date(todayStr + "T23:59:59.999Z");
    const dbTransit = await db.transit.findFirst({
      where: { userId, date: { gte: todayStart, lte: todayEnd } },
      select: { data: true },
    });
    transitData = dbTransit?.data ?? null;
  }

  let dashasData: unknown = dashasKv;
  if (
    dashasData == null ||
    (Array.isArray(dashasData) && dashasData.length === 0)
  ) {
    dashasData = await db.dasha.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
      select: {
        startDate: true,
        endDate: true,
        planetName: true,
        level: true,
      },
    });
  }

  const [activeMaha, activeAntar] = await Promise.all([
    db.dasha.findFirst({
      where: {
        userId,
        level: "MAHADASHA",
        startDate: { lte: today },
        endDate: { gte: today },
      },
      select: { planetName: true },
    }),
    db.dasha.findFirst({
      where: {
        userId,
        level: "ANTARDASHA",
        startDate: { lte: today },
        endDate: { gte: today },
      },
      select: { planetName: true },
    }),
  ]);

  const bp = birthProfile
    ? {
        birthName: birthProfile.birthName,
        birthDate: birthProfile.birthDate,
        birthTimeKnown: birthProfile.birthTimeKnown,
        birthHour: birthProfile.birthHour,
        birthMinute: birthProfile.birthMinute,
        birthCity: birthProfile.birthCity,
        birthCountry: birthProfile.birthCountry,
        latitude: birthProfile.latitude,
        longitude: birthProfile.longitude,
        timezone: birthProfile.timezone,
        gender: birthProfile.gender,
        observationCity: birthProfile.observationCity,
        observationLatitude: birthProfile.observationLatitude,
        observationLongitude: birthProfile.observationLongitude,
        intakeLifeSituation: birthProfile.intakeLifeSituation,
        intakePrimaryFocus: birthProfile.intakePrimaryFocus,
        intakeWantsClarity: birthProfile.intakeWantsClarity,
      }
    : null;

  return {
    hdData,
    vedicData,
    dashasData,
    transitData,
    birthProfile: bp,
    userEmail: user?.email ?? "",
    currentMahadasha: activeMaha?.planetName ?? "",
    currentAntardasha: activeAntar?.planetName ?? "",
  };
}

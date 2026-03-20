// STATUS: done | Task R.5
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { kvGet } from "@/lib/kv/helpers";
import { kvKeys } from "@/lib/kv/keys";
import type { BirthProfile } from "@prisma/client";
import type { HDChartData, VedicChartData } from "@/types";

function formatBirthTime(profile: BirthProfile): string {
  if (!profile.birthTimeKnown) return "Unknown";
  const hh = String(profile.birthHour ?? 12).padStart(2, "0");
  const mm = String(profile.birthMinute ?? 0).padStart(2, "0");
  return `${hh}:${mm}`;
}

function safeString(value: unknown, fallback = "Unknown"): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

/**
 * Builds a structured, plain-text context string to send to Gemini.
 * Gemini receives this as the user message after the system prompt.
 */
export async function buildUserReportContext(userId: string): Promise<string> {
  // 1. Fetch birth profile from DB
  const birthProfile = await db.birthProfile.findUnique({
    where: { userId },
  });

  if (!birthProfile) {
    throw new Error(`No birth profile found for user ${userId}`);
  }

  // 2. Fetch HD chart (KV hot-cache / calculate on miss)
  const hdChart = await getOrCreateHDChart(userId, birthProfile);

  // 3. Fetch Vedic chart from KV (may be null — handle gracefully)
  const vedicChart = (await kvGet<VedicChartData>(
    kvKeys.vedicChart(userId)
  )) as VedicChartData | null;

  // 4. Fetch dasha data:
  // - Try KV first (spec expectation)
  // - Fall back to DB if KV cache isn't populated for dashas
  const dashasKv = await kvGet<unknown>(kvKeys.dashas(userId));
  const dashas =
    dashasKv ??
    (await db.dasha.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
      select: {
        startDate: true,
        endDate: true,
        planetName: true,
        level: true,
      },
    }));

  // 5. Fetch user email for personalization
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const lines: string[] = [
    "=== USER CHART DATA FOR REPORT GENERATION ===",
    "",
    `User: ${user?.email ?? "Unknown"}`,
    `Birth Date: ${birthProfile.birthDate.toISOString().split("T")[0]}`,
    `Birth Time: ${formatBirthTime(birthProfile)}`,
    `Birth Location: ${[birthProfile.birthCity, birthProfile.birthCountry]
      .filter(Boolean)
      .join(", ")}`,
    `Timezone: ${birthProfile.timezone}`,
    "",
    "--- HUMAN DESIGN ---",
    `Type: ${hdChart.type}`,
    `Strategy: ${hdChart.strategy}`,
    `Authority: ${hdChart.authority}`,
    `Profile: ${hdChart.profile}`,
    `Definition: ${hdChart.definition}`,
    `Signature: ${hdChart.signature}`,
    `Not-Self Theme: ${hdChart.notSelfTheme}`,
    `Incarnation Cross: ${JSON.stringify(hdChart.incarnationCross ?? {})}`,
    `Defined Centers: ${hdChart.definedCenters.join(", ") || "None"}`,
    `Undefined Centers: ${hdChart.undefinedCenters.join(", ") || "None"}`,
    `Active Channels: ${JSON.stringify(hdChart.activeChannels ?? [])}`,
    `Active Gates: ${hdChart.activeGates.join(", ") || "None"}`,
    "",
  ];

  if (vedicChart) {
    lines.push("--- VEDIC ASTROLOGY ---");
    lines.push(`Lagna (Ascendant): ${safeString((vedicChart as Record<string, unknown>).lagna)}`);
    lines.push(`Sun Sign: ${safeString((vedicChart as Record<string, unknown>).sunSign)}`);
    lines.push(`Moon Sign: ${safeString((vedicChart as Record<string, unknown>).moonSign)}`);
    lines.push(
      `Planetary Positions: ${JSON.stringify(
        (vedicChart as Record<string, unknown>).planets ?? {}
      )}`
    );
    lines.push(
      `House Cusps: ${JSON.stringify(
        (vedicChart as Record<string, unknown>).houses ?? {}
      )}`
    );
    lines.push("");
  } else {
    lines.push("--- VEDIC ASTROLOGY ---");
    lines.push("Note: Vedic chart data not yet available for this user.");
    lines.push("");
  }

  if (dashas) {
    lines.push("--- CURRENT DASHA PERIODS ---");
    lines.push(JSON.stringify(dashas, null, 2));
    lines.push("");
  }

  lines.push("=== END OF USER DATA ===");
  lines.push("");

  lines.push(
    "Using all the above data, generate the requested report. " +
      'Write in warm, practical, non-predictive language. ' +
      'Avoid "you will" language. Prefer "you may notice", "this period tends to", ' +
      '"your chart suggests". Format output in clear sections with markdown headings. ' +
      'Be specific to this person\'s chart — never generic.'
  );

  return lines.join("\n");
}


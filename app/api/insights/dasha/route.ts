/**
 * POST /api/insights/dasha
 * Returns the AI insight for the user's current Mahadasha + Antardasha.
 * Cache-read-first: persisted in the Insight table keyed by Mahadasha startDate.
 * Pass ?force=true to skip cache and regenerate.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const force = new URL(req.url).searchParams.get("force") === "true";
  const now = new Date();

  const maha = await db.dasha.findFirst({
    where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } },
  });
  if (!maha) return NextResponse.json({ insight: null });

  const antar = await db.dasha.findFirst({
    where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } },
  });

  const mahaName = maha.planetName.charAt(0).toUpperCase() + maha.planetName.slice(1);
  const antarName = antar
    ? (antar.planetName.split("/")[1] ?? antar.planetName).charAt(0).toUpperCase() +
      (antar.planetName.split("/")[1] ?? antar.planetName).slice(1)
    : null;

  // Check cache (skip on force)
  if (!force) {
    const cached = await db.insight.findUnique({
      where: {
        userId_type_periodDate: { userId, type: "DASHA", periodDate: maha.startDate },
      },
    });
    if (cached) {
      let insightText: string;
      try {
        insightText = (JSON.parse(cached.content) as { insight: string }).insight;
      } catch {
        insightText = cached.content;
      }
      return NextResponse.json({ insight: insightText, planet: mahaName, subPlanet: antarName, cached: true });
    }
  }

  if (!env.GEMINI_API_KEY) return NextResponse.json({ insight: null });

  const prompt = [
    `You are a Vedic astrology guide. Write a concise, empowering insight (max 3 sentences, ~60 words) for someone in their ${mahaName} Mahadasha${antarName ? ` / ${antarName} Antardasha` : ""}.`,
    `Focus on: the core energy of this period, one key opportunity, and one inner quality to cultivate.`,
    `Tone: warm, wise, poetic but grounded. No fluff, no generic advice. Speak directly to this planetary energy.`,
    `Reply with ONLY the insight text — no labels, no headings.`,
  ].join(" ");

  try {
    const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
    const text = (result.text ?? "").trim();
    if (!text) return NextResponse.json({ insight: null });

    // Persist to DB — keyed by mahadasha startDate so it stays valid for the entire period
    await db.insight.upsert({
      where: {
        userId_type_periodDate: { userId, type: "DASHA", periodDate: maha.startDate },
      },
      create: {
        userId,
        type: "DASHA",
        periodDate: maha.startDate,
        content: JSON.stringify({ insight: text }),
      },
      update: {
        content: JSON.stringify({ insight: text }),
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({ insight: text, planet: mahaName, subPlanet: antarName, cached: false });
  } catch (e) {
    console.error("[dasha-insight]", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

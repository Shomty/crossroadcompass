/**
 * POST /api/insights/dasha
 * Returns a short AI insight for the user's current Mahadasha + Antardasha.
 * Generated fresh per request; concise enough to fit a card back (3 sentences max).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
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

  const prompt = [
    `You are a Vedic astrology guide. Write a concise, empowering insight (max 3 sentences, ~60 words) for someone in their ${mahaName} Mahadasha${antarName ? ` / ${antarName} Antardasha` : ""}.`,
    `Focus on: the core energy of this period, one key opportunity, and one inner quality to cultivate.`,
    `Tone: warm, wise, poetic but grounded. No fluff, no generic advice. Speak directly to this planetary energy.`,
    `Reply with ONLY the insight text — no labels, no headings.`,
  ].join(" ");

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return NextResponse.json({ insight: text, planet: mahaName, subPlanet: antarName });
  } catch (e) {
    console.error("[dasha-insight]", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

// STATUS: done | Task YG.10
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateYogas } from "@/lib/astro/chartService";
import type { YogaCategory, YogaDetectionResult } from "@/types";

function filterYogaResult(
  data: YogaDetectionResult,
  category: string | null,
  activeOnly: boolean
): YogaDetectionResult {
  let yogas = data.yogas;
  if (activeOnly) {
    yogas = yogas.filter((y) => y.isActive);
  }
  if (category && category !== "all") {
    const c = category as YogaCategory;
    yogas = yogas.filter((y) => y.category === c);
  }
  const activeYogas = yogas.filter((y) => y.isActive);
  const strongYogas = yogas.filter((y) => y.strength === "strong");
  const catCount = activeYogas.reduce<Record<string, number>>((acc, y) => {
    acc[y.category] = (acc[y.category] ?? 0) + 1;
    return acc;
  }, {});
  const dominantCategory = (
    Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other"
  ) as YogaCategory;
  return {
    ...data,
    yogas,
    activeCount: activeYogas.length,
    strongCount: strongYogas.length,
    dominantCategory,
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getOrCreateYogas(session.user.id);
  if (!result) {
    return NextResponse.json(
      {
        error: "Yoga data not yet available.",
        detail: "Vedic chart may still be generating. Retry after chart generation completes.",
      },
      { status: 202 }
    );
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const activeParam = searchParams.get("active");
  const activeOnly = activeParam === "true" || activeParam === "1";

  const payload =
    category || activeOnly ? filterYogaResult(result, category, activeOnly) : result;

  return NextResponse.json(payload);
}

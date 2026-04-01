"use client";

import { useEffect, useState } from "react";
import { CHARAKA_LABELS, ARUDHA_LABEL } from "@/lib/astro/specialPointsLabels";
import { formatPlacementLine } from "@/lib/astro/vedicPointPlacementFormat";
import { BHRIGU_BINDU_HOUSE_INTERPRETATIONS } from "@/lib/astro/bhriguBinduInterpretations";
import type {
  ArudhaLagnaResult,
  Charakaraka,
  CharakarakaSetResult,
  ExtendedSpecialPointsResult,
  FoundationSpecialPointsPlacements,
  SignNumber,
} from "@/types";

const SIGN_NAMES: Record<SignNumber, string> = {
  1: "Aries",
  2: "Taurus",
  3: "Gemini",
  4: "Cancer",
  5: "Leo",
  6: "Virgo",
  7: "Libra",
  8: "Scorpio",
  9: "Sagittarius",
  10: "Capricorn",
  11: "Aquarius",
  12: "Pisces",
};

function rankToLabelKey(rank: string): string {
  return rank.charAt(0).toLowerCase() + rank.slice(1);
}

function isCharakarakaSetResult(raw: unknown): raw is CharakarakaSetResult {
  return (
    raw != null &&
    typeof raw === "object" &&
    "karakas" in raw &&
    Array.isArray((raw as CharakarakaSetResult).karakas)
  );
}

/** Legacy API/cache: flat map of role key → planet name string. */
function isLegacyCharakarakaMap(raw: unknown): raw is Record<string, string> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return false;
  const o = raw as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return false;
  return keys.every((k) => typeof o[k] === "string");
}

function KarakaRow({
  title,
  planet,
  description,
  shared,
  placementLine,
}: {
  title: string;
  planet: string;
  description?: string;
  shared?: boolean;
  placementLine?: string;
}) {
  return (
    <li className="rounded-xl border border-[rgba(200,135,58,0.14)] bg-[rgba(13,18,32,0.35)] px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-medium text-[var(--cream)]">{title}</span>
        <span className="font-mono text-[11px] text-[rgba(232,185,106,0.95)]">
          {planet}
          {shared ? " · shared rank" : ""}
        </span>
      </div>
      {description && <p className="chart-bp-muted mt-2">{description}</p>}
      {placementLine ? (
        <p
          className="mt-2 font-mono text-[10px] leading-relaxed text-[rgba(255,255,255,0.38)]"
          title="Whole sign from Lagna; planet chart longitude."
        >
          {placementLine}
        </p>
      ) : null}
    </li>
  );
}

export function SpecialPointsSection() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [extData, setExtData] = useState<ExtendedSpecialPointsResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chart/special-points");
        const json = (await res.json()) as Record<string, unknown>;
        if (!res.ok) {
          if (!cancelled) setErr((json.error as string) ?? "Unavailable");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErr("Failed to load");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chart/special-points/extended");
        if (res.status === 202) return;
        if (!res.ok) return;
        const json = (await res.json()) as ExtendedSpecialPointsResult;
        if (!cancelled) setExtData(json);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) {
    return (
      <div className="chart-bp-stack">
        <div className="chart-bp-card border-amber-500/25 bg-amber-500/5">
          <p className="chart-bp-body text-amber-100/90">{err}</p>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="chart-bp-stack">
        <div className="chart-bp-card">
          <p className="chart-bp-muted">Loading foundation points…</p>
        </div>
      </div>
    );
  }

  const arRaw = data.arudhaLagna;
  const ar =
    arRaw != null && typeof arRaw === "object" && "arudhaSignNumber" in (arRaw as object)
      ? (arRaw as ArudhaLagnaResult)
      : undefined;

  const placements = (data as { placements?: FoundationSpecialPointsPlacements }).placements;

  const ckRaw = data.charakarakas;

  return (
    <div className="chart-bp-stack">
      <div className="chart-bp-hero">
        <span className="chart-bp-hero-star" aria-hidden>
          ✦
        </span>
        <span className="chart-bp-hero-title">Foundation points</span>
        <span className="chart-bp-hero-sub">
          Arudha and Charakārakas — the same lens as Life Blueprint, compact
        </span>
      </div>

      <div className="chart-bp-card">
        <div className="chart-bp-section-title">Ārudha lagna</div>
        <p className="chart-bp-muted mb-3">{ARUDHA_LABEL.description}</p>
        {ar ? (
          <div className="space-y-2">
            <p className="chart-bp-body">
              <span className="text-[var(--cream)]">{SIGN_NAMES[ar.arudhaSignNumber]}</span>
              <span className="text-[var(--muted)]">
                {" "}
                · {ar.stepsFromLagnaToLord} step{ar.stepsFromLagnaToLord === 1 ? "" : "s"} from natal
                lagna to its lord (Ārudha calculation)
              </span>
            </p>
            {placements?.arudhaLagna ? (
              <p
                className="font-mono text-[10px] leading-relaxed text-[rgba(255,255,255,0.38)]"
                title="Whole sign from Lagna; sign-only Ārudha uses 0° for nakṣatra."
              >
                {formatPlacementLine(placements.arudhaLagna)}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="chart-bp-muted">Ārudha lagna could not be resolved for this chart.</p>
        )}
      </div>

      {isCharakarakaSetResult(ckRaw) && (
        <div className="chart-bp-card">
          <div className="chart-bp-section-title">Charakārakas</div>
          <p className="chart-bp-muted mb-4">
            Eight planetary roles by degree strength — soul, career, family, and
            more.
          </p>
          {ckRaw.deficit && (
            <p className="mb-4 rounded-xl border border-amber-500/22 bg-amber-500/8 px-3 py-2.5 text-[var(--type-small)] leading-relaxed text-amber-100/90">
              {ckRaw.deficit.reason}
            </p>
          )}
          <ul className="space-y-2.5">
            {ckRaw.karakas.map((k) => {
              const label = CHARAKA_LABELS[rankToLabelKey(k.rank)];
              const ckPl = placements?.charakarakas?.[k.rank as Charakaraka];
              return (
                <KarakaRow
                  key={`${k.rank}-${k.planet}`}
                  title={label?.title ?? k.rank}
                  planet={k.planet}
                  description={label?.description}
                  shared={k.sharedRank}
                  placementLine={ckPl ? formatPlacementLine(ckPl) : undefined}
                />
              );
            })}
          </ul>
        </div>
      )}

      {!isCharakarakaSetResult(ckRaw) && isLegacyCharakarakaMap(ckRaw) && (
        <div className="chart-bp-card">
          <div className="chart-bp-section-title">Charakārakas</div>
          <p className="chart-bp-muted mb-4">
            Eight planetary roles — shown from cached chart data.
          </p>
          <ul className="space-y-2.5">
            {Object.entries(ckRaw).map(([k, planet]) => {
              const label = CHARAKA_LABELS[k];
              return (
                <KarakaRow
                  key={k}
                  title={label?.title ?? k}
                  planet={planet}
                  description={label?.description}
                />
              );
            })}
          </ul>
        </div>
      )}

      {extData?.bhriguBindu && extData.placements?.bhriguBindu && (() => {
        const bb = extData.bhriguBindu!;
        const house = extData.placements!.bhriguBindu!.houseFromLagna ?? 0;
        const interp = BHRIGU_BINDU_HOUSE_INTERPRETATIONS[house];
        const signName = extData.placements!.bhriguBindu!.rasiName ?? "";
        const deg = Math.floor(bb.bhriguBinduDegree ?? 0);
        const min = Math.round(((bb.bhriguBinduDegree ?? 0) - deg) * 60);
        return (
          <div className="chart-bp-card">
            <div className="chart-bp-section-title">Bhrigu Bindu</div>
            <p className="chart-bp-muted mb-3">
              Moon–Rahu midpoint — your karmic hotspot where destiny unfolds most strongly.
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-[rgba(200,135,58,0.25)] bg-[rgba(200,135,58,0.08)] px-2.5 py-1 font-mono text-[11px] text-[rgba(200,135,58,0.9)]">
                {signName} {deg}°{min.toString().padStart(2, "0")}′
              </span>
              <span className="text-[var(--muted)] text-[11px]">·</span>
              <span className="rounded-md border border-[rgba(200,135,58,0.18)] bg-[rgba(200,135,58,0.05)] px-2.5 py-1 font-mono text-[11px] text-[rgba(200,135,58,0.7)]">
                House {house}
              </span>
            </div>
            {interp && (
              <p className="chart-bp-body text-[var(--cream)] font-medium mb-1">{interp.title}</p>
            )}
            {interp && (
              <p className="chart-bp-muted line-clamp-3">{interp.body}</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

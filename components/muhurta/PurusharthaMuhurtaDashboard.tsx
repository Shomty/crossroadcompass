"use client";

/**
 * Puruṣārtha Muhūrta — celestial heatmap (5-minute slots), Pañcāṅga summary, D1 on selection.
 */

import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { formatInTimeZone } from "date-fns-tz";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { PurusharthaMuhurtaDetailResponse, PurusharthaMuhurtaSlotSummary } from "@/types";
import { NatalChartGrid } from "@/components/chart/NatalChartGrid";
import { PurusharthaLocationBar } from "@/components/muhurta/PurusharthaLocationBar";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import {
  getPurusharthaRemedyPayload,
  remedyFocusForRedScore,
} from "@/lib/astro/muhurta/purusharthaRemedyContent";

const SIGN_NAMES = [
  "",
  "Meṣa",
  "Vṛṣabha",
  "Mithuna",
  "Karka",
  "Siṃha",
  "Kanyā",
  "Tulā",
  "Vṛścika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Mīna",
] as const;

function tierCellClass(slot: PurusharthaMuhurtaSlotSummary): string {
  if (slot.heatTier === "volatile") {
    return "bg-rose-950/90 hover:bg-rose-900/95 ring-1 ring-rose-400/50";
  }
  if (slot.heatTier === "high" && slot.greenEligible) {
    return "bg-emerald-600/85 hover:bg-emerald-500/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]";
  }
  if (slot.heatTier === "medium") {
    return "bg-amber-600/75 hover:bg-amber-500/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]";
  }
  if (slot.heatTier === "low" && slot.taraNaidhana) {
    return "bg-red-950/90 hover:bg-red-900/92 ring-1 ring-red-500/40";
  }
  return "bg-slate-800/70 hover:bg-slate-700/80";
}

function slotTitle(slot: PurusharthaMuhurtaSlotSummary, timeZone: string): string {
  const time = formatInTimeZone(new Date(slot.startIso), timeZone, "HH:mm");
  const light = slot.score >= 70 ? "green" : slot.score >= 45 ? "yellow" : "red";
  const parts = [
    `${time} · ${light} · weighted ${slot.score}`,
    `Pañcaka ref ${slot.electionScore}`,
    slot.personalization === "full" && slot.savMoonSignPoints != null
      ? `SAV ${slot.savMoonSignPoints}`
      : null,
    slot.taraNumber != null ? `Tara ${slot.taraNumber}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

interface Props {
  defaultTimeZone: string;
  defaultLatitude: number;
  defaultLongitude: number;
  /** BirthProfile.observationCity when set (for display + parity with transit). */
  defaultObservationCity?: string | null;
}

export function PurusharthaMuhurtaDashboard({
  defaultTimeZone,
  defaultLatitude,
  defaultLongitude,
  defaultObservationCity,
}: Props) {
  const [timeZone, setTimeZone] = useState(defaultTimeZone);
  const [latitude, setLatitude] = useState(String(defaultLatitude));
  const [longitude, setLongitude] = useState(String(defaultLongitude));
  const [startLocal, setStartLocal] = useState(() =>
    formatInTimeZone(new Date(), defaultTimeZone, "yyyy-MM-dd'T'HH:mm")
  );
  const [windowHours, setWindowHours] = useState(24);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [slots, setSlots] = useState<PurusharthaMuhurtaSlotSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<PurusharthaMuhurtaDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [remedyOpen, setRemedyOpen] = useState(false);

  const runScan = useCallback(async () => {
    setErr(null);
    setDetail(null);
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setErr("Enter valid latitude and longitude.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/muhurta/purushartha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLocal,
          timeZone,
          latitude: lat,
          longitude: lng,
          windowHours,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        slots?: PurusharthaMuhurtaSlotSummary[];
        intervalMinutes?: number;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const parts = [j.error, j.detail].filter(Boolean);
        setErr(parts.length ? parts.join(" — ") : "Scan failed");
        setSlots([]);
        return;
      }
      setSlots(j.slots ?? []);
      setIntervalMinutes(
        typeof j.intervalMinutes === "number" && j.intervalMinutes > 0 ? j.intervalMinutes : 5
      );
    } catch {
      setErr("Network error");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, startLocal, timeZone, windowHours]);

  const loadDetail = useCallback(
    async (instantIso: string) => {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      setDetailLoading(true);
      setDetail(null);
      setRemedyOpen(false);
      try {
        const res = await fetch("/api/muhurta/purushartha/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instant: instantIso,
            timeZone,
            latitude: lat,
            longitude: lng,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          detail?: string;
        };
        if (!res.ok) {
          const parts = [j.error, j.detail].filter(Boolean);
          setErr(parts.length ? parts.join(" — ") : "Could not load chart");
          return;
        }
        setDetail(j as PurusharthaMuhurtaDetailResponse);
      } catch {
        setErr("Network error loading chart");
      } finally {
        setDetailLoading(false);
      }
    },
    [latitude, longitude, timeZone]
  );

  const slotsPerHour = Math.max(1, Math.round(60 / intervalMinutes));

  const rows = useMemo(() => {
    const out: PurusharthaMuhurtaSlotSummary[][] = [];
    for (let i = 0; i < slots.length; i += slotsPerHour) {
      out.push(slots.slice(i, i + slotsPerHour));
    }
    return out;
  }, [slots, slotsPerHour]);

  const fieldLabelClass =
    "flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em]";
  const fieldLabelStyle: CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    color: "var(--mist, rgba(255,255,255,0.45))",
  };
  const inputClass =
    "rounded-[10px] border border-white/10 bg-[rgba(13,18,32,0.45)] px-3 py-2 text-sm text-white outline-none transition-colors focus-visible:border-[rgba(200,135,58,0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(212,175,95,0.22)]";
  const selectClass = `${inputClass} w-full cursor-pointer appearance-none pr-9`;
  const btnSecondaryClass =
    "rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,95,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(13,18,37,0.72)]";
  const primaryCtaClass =
    "w-full rounded-[10px] border-0 py-2.5 text-[13px] font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,95,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(13,18,37,0.72)] disabled:cursor-not-allowed";
  const primaryCtaStyle: CSSProperties = {
    width: "100%",
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.5 : 1,
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    background: "linear-gradient(135deg, #c8873a, #e8b96a)",
    color: "#0d1220",
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="animate-enter animate-enter-2">
        <V4GlassCard>
          <h2
            className="text-lg font-normal tracking-wide"
            style={{
              fontFamily: "Cinzel, serif",
              color: "var(--cream, rgba(255,255,255,0.92))",
            }}
          >
            Purposeful action (Puruṣārtha)
          </h2>
          <p className="page-subtitle mt-2 max-w-2xl text-sm leading-relaxed">
            Weighted Puruṣārtha score: every slot starts at 50, then adds or subtracts for your Tara, SAV on
            the Moon’s sign, Tithi–Vāra harmony, and benefic/malefic dṛṣṭi to the transit Moon — plus
            Gaṇḍānta penalty. Green (≥70) is a real “go”; yellow (45–69) is cautious; red (&lt;45) asks for
            patience or remedy. Pañcāṅga + Pañcaka + Lagna lord still show on the side for context.
          </p>

        <div className="mt-5">
          <PurusharthaLocationBar
            latitude={latitude}
            longitude={longitude}
            timeZone={timeZone}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onTimeZoneChange={setTimeZone}
            initialPlaceLabel={defaultObservationCity ?? null}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className={fieldLabelClass} style={fieldLabelStyle}>
            IANA timezone
            <input className={inputClass} value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
          </label>
          <label className={fieldLabelClass} style={fieldLabelStyle}>
            Start (local wall)
            <input
              type="datetime-local"
              className={inputClass}
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
            />
          </label>
          <label className={fieldLabelClass} style={fieldLabelStyle}>
            Window (hours)
            <div className="relative">
              <select
                className={selectClass}
                style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
                value={windowHours}
                onChange={(e) => setWindowHours(Number(e.target.value))}
              >
                {[6, 12, 18, 24].map((h) => (
                  <option key={h} value={h} className="bg-[#0d1220] text-white">
                    {h}h
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "var(--gold-solar, #D4AF37)" }}
                aria-hidden
              />
            </div>
          </label>
          <label className={fieldLabelClass} style={fieldLabelStyle}>
            Latitude (decimal °)
            <input
              className={inputClass}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className={fieldLabelClass} style={fieldLabelStyle}>
            Longitude (decimal °)
            <input
              className={inputClass}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className={primaryCtaClass}
              onClick={() => void runScan()}
              disabled={loading}
              style={primaryCtaStyle}
            >
              {loading ? "Computing…" : "Build celestial heatmap"}
            </button>
          </div>
        </div>

        {err && <p className="mt-4 text-sm text-rose-400">{err}</p>}
        </V4GlassCard>
      </section>

      {slots.length > 0 && (
        <section className="animate-enter animate-enter-3">
          <V4GlassCard>
          <div
            className="mb-4 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.12em]"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "var(--mist, rgba(255,255,255,0.45))",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded bg-emerald-600/85" /> Green (score ≥ 70)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded bg-amber-600/75" /> Yellow (45–69)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded bg-slate-800/70" /> Red (&lt; 45)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded bg-red-950/90 ring-1 ring-red-500/40" /> Naidhana Tara (7)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded bg-rose-950/90 ring-1 ring-rose-400/50" /> Gaṇḍānta
            </span>
            <span className="normal-case tracking-normal" style={{ color: "var(--faint, rgba(255,255,255,0.35))" }}>
              Step {intervalMinutes} min · {slotsPerHour} slots per row (one hour)
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-flex flex-col gap-0.5">
              {rows.map((row, ri) => {
                const first = row[0];
                const hourLabel = first
                  ? formatInTimeZone(new Date(first.startIso), timeZone, "HH:00")
                  : `${ri}`;
                return (
                  <div key={ri} className="flex items-stretch gap-0.5">
                    <div
                      className="w-12 shrink-0 pr-2 text-right text-[10px]"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: "var(--mist, rgba(255,255,255,0.4))",
                      }}
                    >
                      {hourLabel}
                    </div>
                    <div className="flex gap-0.5">
                      {row.map((slot) => (
                        <button
                          key={slot.startIso}
                          type="button"
                          title={slotTitle(slot, timeZone)}
                          onClick={() => void loadDetail(slot.startIso)}
                          className={clsx(
                            "h-7 w-5 shrink-0 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,95,0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(13,18,37,0.95)]",
                            tierCellClass(slot)
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </V4GlassCard>
        </section>
      )}

      {(detailLoading || detail) && (
        <section className="animate-enter animate-enter-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
          <V4GlassCard>
            {detailLoading && (
              <p className="text-sm" style={{ color: "var(--mist, rgba(255,255,255,0.45))" }}>
                Drawing D1 for this moment…
              </p>
            )}
            {detail && !detailLoading && (
              <>
                <h3
                  className="text-base font-normal"
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: "var(--cream, rgba(255,255,255,0.9))",
                  }}
                >
                  {formatInTimeZone(new Date(detail.instantIso), timeZone, "PPpp")}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    color: "var(--mist, rgba(255,255,255,0.5))",
                  }}
                >
                  Lagna: {SIGN_NAMES[detail.lagnaSignNumber] ?? detail.lagnaSignNumber} · Lord{" "}
                  {detail.lagnaLord}
                  {detail.lagnaLordHouse !== null ? ` · house ${detail.lagnaLordHouse}` : ""}
                  {detail.lagnaLordStrong ? " · clear of trika" : " · in or weak (6/8/12)"}
                </p>
                {detail.gandanta && (
                  <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-100">
                    <strong>Gaṇḍānta:</strong> {detail.gandantaReason ?? "Highly volatile lunar junction."}
                  </p>
                )}
                <div
                  className="mt-3 rounded-[14px] border border-white/10 px-3 py-2 text-sm"
                  style={{
                    background: "rgba(13,18,32,0.45)",
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    color: "var(--moon, rgba(255,255,255,0.72))",
                  }}
                >
                  <p style={{ color: "var(--gold-solar, #D4AF37)" }}>Weighted score breakdown</p>
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-[rgba(255,255,255,0.6)]">
                    <li>Base {detail.weightedBreakdown.base}</li>
                    <li>Tara {detail.weightedBreakdown.taraDelta >= 0 ? "+" : ""}
                      {detail.weightedBreakdown.taraDelta}</li>
                    <li>SAV (Moon sign) {detail.weightedBreakdown.savDelta >= 0 ? "+" : ""}
                      {detail.weightedBreakdown.savDelta}</li>
                    <li>Tithi–Vāra {detail.weightedBreakdown.tithiVaraDelta >= 0 ? "+" : ""}
                      {detail.weightedBreakdown.tithiVaraDelta}</li>
                    <li>Dṛṣṭi {detail.weightedBreakdown.drishtiDelta >= 0 ? "+" : ""}
                      {detail.weightedBreakdown.drishtiDelta}</li>
                    <li>Gaṇḍānta {detail.weightedBreakdown.gandantaDelta}</li>
                    <li className="font-medium text-[rgba(255,255,255,0.85)]">
                      Total {detail.weightedBreakdown.total} ({detail.heatTier})
                    </li>
                  </ul>
                  {detail.personalization === "full" &&
                    detail.savBand != null &&
                    detail.savMoonSignPoints != null && (
                      <p className="mt-2 text-xs text-[rgba(255,255,255,0.45)]">
                        SAV bindus on transit Moon sign: {detail.savMoonSignPoints} ({detail.savBand})
                        {detail.taraNumber != null ? ` · Tara ${detail.taraNumber}` : ""}
                      </p>
                    )}
                  {detail.mantraRequired && detail.mantraWarning && (
                    <p className="mt-2 text-amber-100/95">{detail.mantraWarning}</p>
                  )}
                  {detail.remedyHint && (
                    <p className="mt-1 text-[rgba(255,255,255,0.55)]">{detail.remedyHint}</p>
                  )}
                </div>
                {detail.score < 45 && (
                  <button
                    type="button"
                    onClick={() => setRemedyOpen(true)}
                    className={clsx(
                      btnSecondaryClass,
                      "mt-3 border-[rgba(200,135,58,0.4)] bg-[rgba(200,135,58,0.1)] text-[color:var(--cream,rgba(255,255,255,0.92))] hover:border-[rgba(200,135,58,0.55)] hover:bg-[rgba(200,135,58,0.16)]"
                    )}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    }}
                  >
                    Remedy — score booster
                  </button>
                )}
                <ul
                  className="mt-4 space-y-2 text-sm"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    color: "var(--mist, rgba(255,255,255,0.65))",
                  }}
                >
                  <li>
                    <span style={{ color: "var(--gold-solar, #D4AF37)" }}>Tithi:</span>{" "}
                    {detail.limbs.tithi.label}
                  </li>
                  <li>
                    <span style={{ color: "var(--gold-solar, #D4AF37)" }}>Nakṣatra:</span>{" "}
                    {detail.limbs.nakshatra.label}
                  </li>
                  <li>
                    <span style={{ color: "var(--gold-solar, #D4AF37)" }}>Yoga:</span> {detail.limbs.yoga}
                  </li>
                  <li>
                    <span style={{ color: "var(--gold-solar, #D4AF37)" }}>Karaṇa:</span>{" "}
                    {detail.limbs.karana}
                  </li>
                  <li>
                    <span style={{ color: "var(--gold-solar, #D4AF37)" }}>Vāra:</span> {detail.limbs.vaara}
                  </li>
                  <li>
                    <span style={{ color: "var(--gold-solar, #D4AF37)" }}>Pañcaka base:</span>{" "}
                    {detail.panchakaScore}/100
                    {detail.panchakaDeductions.length > 0 && (
                      <ul className="mt-1 list-disc pl-5 text-[rgba(255,255,255,0.45)]">
                        {detail.panchakaDeductions.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                  <li>
                    <span className="text-amber-200/90">Weighted Puruṣārtha score:</span> {detail.score}{" "}
                    ({detail.heatTier}) ·{" "}
                    <span className="text-[rgba(255,255,255,0.45)]">
                      Pañcaka reference {detail.electionScore}/100
                    </span>
                  </li>
                </ul>
              </>
            )}
          </V4GlassCard>
          {detail && !detailLoading && (
            <V4GlassCard>
              <NatalChartGrid chart={detail.chart} birthTimeKnown centered />
            </V4GlassCard>
          )}
        </section>
      )}

      {remedyOpen && detail && detail.score < 45 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purushartha-remedy-title"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto">
            <V4GlassCard violetGlow>
            {(() => {
              const focus = remedyFocusForRedScore(
                detail.score,
                detail.savMoonSignPoints,
                detail.taraNumber
              );
              const payload = getPurusharthaRemedyPayload(focus);
              return (
                <>
                  <h3
                    id="purushartha-remedy-title"
                    className="text-lg font-normal"
                    style={{
                      fontFamily: "Cinzel, serif",
                      color: "var(--cream, rgba(255,255,255,0.92))",
                    }}
                  >
                    {payload.title}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      color: "var(--moon, rgba(255,255,255,0.75))",
                    }}
                  >
                    {payload.body}
                  </p>
                  <p
                    className="mt-3 text-xs"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      color: "var(--mist, rgba(255,255,255,0.45))",
                    }}
                  >
                    {payload.sourceNote}
                  </p>
                  <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100/90">
                    {payload.resonanceCopy}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRemedyOpen(false)}
                    className={clsx(
                      btnSecondaryClass,
                      "mt-6 w-full border-white/12 bg-white/[0.04] py-2.5 text-[color:var(--cream,rgba(255,255,255,0.88))] hover:border-[rgba(200,135,58,0.35)] hover:bg-[rgba(200,135,58,0.08)]"
                    )}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 13,
                    }}
                  >
                    Close
                  </button>
                </>
              );
            })()}
            </V4GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

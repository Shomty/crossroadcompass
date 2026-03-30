/**
 * AP.5 — flat {{variable}} map for admin report prompts (server-only).
 * Uses chartService-backed loaders via loadReportTemplateSources; no new astro math.
 */

import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import { getPrimaryLord } from "@/lib/astro/specialPoints";
import { signToHouse } from "@/lib/astro/yoga/signToHouse";
import {
  buildReportTemplateVars,
  type BuildReportTemplateVarsInput,
} from "@/lib/reports/reportTemplateVars";
import { db } from "@/lib/db";
import type { Charakaraka, SignNumber, SpecialPointsResult } from "@/types";
import {
  REPORT_VARIABLE_KEYS_AP5,
  type ReportVariableKeyAp5,
} from "@/lib/content/reportVariableKeysAp5";

export { REPORT_VARIABLE_KEYS_AP5, type ReportVariableKeyAp5 };

const U = "unknown";

const ZODIAC = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

function signName(n: SignNumber | null | undefined): string {
  if (!n || n < 1 || n > 12) return U;
  return ZODIAC[n - 1] ?? U;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const VEDIC_PLANETS = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
  "rahu",
  "ketu",
] as const;

function getVedicPlanet(
  vedic: Record<string, unknown> | null,
  planet: (typeof VEDIC_PLANETS)[number]
): Record<string, unknown> | null {
  if (!vedic) return null;
  const planets = vedic.planets;
  const planetsIsDict =
    planets != null && typeof planets === "object" && !Array.isArray(planets);
  const planetsArr: unknown[] | null = Array.isArray(vedic.planetaryPositions)
    ? (vedic.planetaryPositions as unknown[])
    : Array.isArray(vedic.planets)
      ? (vedic.planets as unknown[])
      : null;

  if (planetsIsDict) {
    const p = (planets as Record<string, unknown>)[planet];
    return p != null && typeof p === "object" ? (p as Record<string, unknown>) : null;
  }
  if (planetsArr) {
    const found = planetsArr.find((item) => {
      if (!item || typeof item !== "object") return false;
      const name = (item as Record<string, unknown>).name;
      return typeof name === "string" && name.toLowerCase() === planet;
    });
    return found ? (found as Record<string, unknown>) : null;
  }
  return null;
}

function signNumberFromPlanet(
  p: Record<string, unknown> | null
): SignNumber | null {
  if (!p) return null;
  const sn = p.signNumber ?? p.sign_number;
  if (typeof sn === "number" && sn >= 1 && sn <= 12) return sn as SignNumber;
  const sign = p.sign;
  if (typeof sign === "string") {
    const idx = ZODIAC.findIndex(
      (z) => z.toLowerCase() === sign.toLowerCase()
    );
    if (idx >= 0) return (idx + 1) as SignNumber;
  }
  return null;
}

function resolveLagnaSign(
  vedic: Record<string, unknown> | null,
  sp: SpecialPointsResult | null | undefined
): SignNumber | null {
  if (sp?.natalLagna?.signNumber) return sp.natalLagna.signNumber;
  const asc = vedic?.ascendant as Record<string, unknown> | undefined;
  const fromAsc = signNumberFromPlanet(asc ?? null);
  if (fromAsc) return fromAsc;
  const lsn = vedic?.lagnaSignNumber;
  if (typeof lsn === "number" && lsn >= 1 && lsn <= 12) return lsn as SignNumber;
  return null;
}

function charakarakaPlanet(
  sp: SpecialPointsResult | null | undefined,
  rank: Charakaraka
): string {
  if (!sp?.charakarakas?.karakas?.length) return U;
  const row = sp.charakarakas.karakas.find((k) => k.rank === rank);
  return row?.planet ?? U;
}

/** Pure AP.5 map from already-loaded template input + legacy vars. */
export function buildAp5VariableMap(
  input: BuildReportTemplateVarsInput,
  base: Record<string, string>,
  birthDate: Date
): Record<string, string> {
  const vedic = input.vedicData;
  const sp = input.specialPoints;

  const lagnaSn = resolveLagnaSign(vedic, sp);
  const lagnaStr =
    lagnaSn !== null ? String(lagnaSn) : base.lagna?.trim() ? base.lagna : U;
  const lagnaLordStr =
    lagnaSn !== null ? getPrimaryLord(lagnaSn) : U;

  const out: Record<string, string> = {
    lagna: lagnaStr,
    lagna_sign: lagnaSn !== null ? signName(lagnaSn) : U,
    lagna_lord: lagnaLordStr,
    mahadasha_lord: base.current_mahadasha || U,
    mahadasha_start_date: base.dasha_mahadasha_start || U,
    mahadasha_end_date: base.dasha_mahadasha_end || U,
    antardasha_lord: base.current_antardasha || U,
    antardasha_end_date: base.dasha_antardasha_end || U,
    arudha_lagna: sp
      ? String(sp.arudhaLagna.arudhaSignNumber)
      : U,
    arudha_lagna_sign: sp ? signName(sp.arudhaLagna.arudhaSignNumber) : U,
    ghati_lagna: sp ? String(sp.ghatiLagna.ghatiLagnaSignNumber) : U,
    ghati_lagna_sign: sp ? signName(sp.ghatiLagna.ghatiLagnaSignNumber) : U,
    bhava_lagna: sp ? String(sp.bhavaLagna.bhavaLagnaSignNumber) : U,
    bhava_lagna_sign: sp ? signName(sp.bhavaLagna.bhavaLagnaSignNumber) : U,
    hora_lagna: sp ? String(sp.horaLagna.horaLagnaSignNumber) : U,
    hora_lagna_sign: sp ? signName(sp.horaLagna.horaLagnaSignNumber) : U,
    atmakaraka: charakarakaPlanet(sp, "Atmakaraka"),
    amatyakaraka: charakarakaPlanet(sp, "Amatyakaraka"),
    bhratrukaraka: charakarakaPlanet(sp, "Bhratrukaraka"),
    matrukaraka: charakarakaPlanet(sp, "Matrukaraka"),
    pitrukaraka: charakarakaPlanet(sp, "Pitrukaraka"),
    putrakaraka: charakarakaPlanet(sp, "Putrakaraka"),
    gnatikaraka: charakarakaPlanet(sp, "Gnatikaraka"),
    darakaraka: charakarakaPlanet(sp, "Darakaraka"),
    hd_type: base.hd_type || U,
    hd_strategy: base.hd_strategy || U,
    hd_authority: base.hd_authority || U,
    hd_profile: base.hd_profile || U,
    hd_definition: base.hd_definition || U,
    hd_incarnation_cross: (() => {
      const parts = [
        base.hd_incarnation_cross_type,
        base.hd_incarnation_cross_gates,
      ].filter((p) => p && String(p).trim());
      return parts.length ? parts.join(" — ") : U;
    })(),
    user_name: base.user_name || U,
    birth_date: birthDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    birth_location: base.birth_location || U,
  };

  for (const p of VEDIC_PLANETS) {
    const rec = getVedicPlanet(vedic, p);
    const sn = signNumberFromPlanet(rec);
    const signLabel =
      sn !== null
        ? signName(sn)
        : rec?.sign
          ? capitalize(String(rec.sign))
          : U;
    const houseStr =
      lagnaSn !== null && sn !== null
        ? String(signToHouse(sn, lagnaSn))
        : U;
    out[`${p}_sign`] = signLabel;
    out[`${p}_house`] = houseStr;
  }

  const moonRec = getVedicPlanet(vedic, "moon");
  const nk =
    moonRec &&
    (moonRec.nakshatra ??
      moonRec.nakshatraName ??
      moonRec.nakshtra ??
      moonRec.constellation);
  out.moon_nakshatra =
    typeof nk === "string" && nk.trim()
      ? capitalize(nk.replace(/_/g, " "))
      : U;

  for (const k of REPORT_VARIABLE_KEYS_AP5) {
    if (out[k] === undefined || out[k] === "") {
      out[k] = U;
    }
  }

  return out;
}

export async function resolveReportVariables(
  userId: string
): Promise<Record<string, string>> {
  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
  if (!birthProfile) return {};

  const input = await loadReportTemplateSources(userId);
  const base = buildReportTemplateVars(input);
  return buildAp5VariableMap(input, base, birthProfile.birthDate);
}

/** Legacy template keys + AP.5 keys for marketplace / admin prompts. */
export async function resolveMergedPromptVariables(
  userId: string
): Promise<Record<string, string>> {
  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
  if (!birthProfile) return {};

  const input = await loadReportTemplateSources(userId);
  const legacy = buildReportTemplateVars(input);
  const ap5 = buildAp5VariableMap(input, legacy, birthProfile.birthDate);
  return { ...legacy, ...ap5 };
}

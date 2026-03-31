import type {
  Charakaraka,
  ExtendedSpecialPointsResult,
  KaalVelaResult,
  SpecialPointsResult,
  VedicPointPlacement,
} from "@/types";
import { SPECIAL_POINT_SCALAR_KEYS } from "./specialPointScalarKeys";

type SignLabelFn = (n: number) => string;
type FormatLonFn = (n: number | undefined) => string;

function clearScalarKeys(vars: Record<string, string>): void {
  for (const k of SPECIAL_POINT_SCALAR_KEYS) {
    vars[k] = "";
  }
}

function setPlacementStem(
  vars: Record<string, string>,
  stem: string,
  p: VedicPointPlacement | null | undefined,
  signLabel: SignLabelFn
): void {
  if (!p) return;
  vars[`sp_${stem}_sign`] = signLabel(p.rasiSignNumber);
  vars[`sp_${stem}_house`] = String(p.houseFromLagna);
  vars[`sp_${stem}_nakshatra`] = p.nakshatra ?? "";
  vars[`sp_${stem}_pada`] = String(p.pada ?? "");
  vars[`sp_${stem}_rasi_name`] = p.rasiName ?? "";
}

function mirrorAbbrev(
  vars: Record<string, string>,
  longStem: string,
  abbrev: string,
  fields: readonly string[]
): void {
  for (const f of fields) {
    const lk = `sp_${longStem}_${f}` as keyof typeof vars;
    const ak = `sp_${abbrev}_${f}` as keyof typeof vars;
    if (vars[lk] !== undefined) vars[ak] = vars[lk] ?? "";
  }
}

const CHARA_ROWS: readonly {
  rank: Charakaraka;
  stem: string;
  abbrev: string;
}[] = [
  { rank: "Atmakaraka", stem: "atmakaraka", abbrev: "AK" },
  { rank: "Amatyakaraka", stem: "amatyakaraka", abbrev: "AmK" },
  { rank: "Bhratrukaraka", stem: "bhratrukaraka", abbrev: "BK" },
  { rank: "Matrukaraka", stem: "matrukaraka", abbrev: "MK" },
  { rank: "Pitrukaraka", stem: "pitrukaraka", abbrev: "PiK" },
  { rank: "Putrakaraka", stem: "putrakaraka", abbrev: "PuK" },
  { rank: "Gnatikaraka", stem: "gnatikaraka", abbrev: "GK" },
  { rank: "Darakaraka", stem: "darakaraka", abbrev: "DK" },
] as const;

const KAALA_STEMS: readonly { key: keyof NonNullable<ExtendedSpecialPointsResult["kaalVelas"]>; stem: string }[] =
  [
    { key: "gulika", stem: "gulika" },
    { key: "maandi", stem: "maandi" },
    { key: "kaala", stem: "kaala" },
    { key: "mrityu", stem: "mrityu" },
    { key: "ardhaprahara", stem: "ardhaprahara" },
    { key: "yamaghantaka", stem: "yamaghantaka" },
  ] as const;

type DhoomaPlacements = NonNullable<
  ExtendedSpecialPointsResult["placements"]
>["dhoomaChain"];

function fillKaalVela(
  vars: Record<string, string>,
  stem: string,
  row: KaalVelaResult | undefined,
  placement: VedicPointPlacement | null | undefined,
  signLabel: SignLabelFn,
  formatLon: FormatLonFn
): void {
  if (!row) return;
  vars[`sp_${stem}_sign`] = signLabel(row.signNumber);
  vars[`sp_${stem}_longitude`] = formatLon(row.referenceLongitude);
  vars[`sp_${stem}_portion_number`] = String(row.portionNumber);
  vars[`sp_${stem}_start_min`] = String(row.startMinutesFromSunrise);
  vars[`sp_${stem}_end_min`] = String(row.endMinutesFromSunrise);
  setPlacementStem(vars, stem, placement, signLabel);
}

/**
 * Fills SPECIAL_POINT_SCALAR_KEYS on `vars` from special points + extended + placements.
 */
export function applySpecialPointTemplateScalars(
  vars: Record<string, string>,
  specialPoints: SpecialPointsResult | null | undefined,
  extended: ExtendedSpecialPointsResult | null | undefined,
  signLabel: SignLabelFn,
  formatLon: FormatLonFn
): void {
  clearScalarKeys(vars);
  if (!specialPoints) return;

  const fp = specialPoints.placements;

  if (specialPoints.natalLagna) {
    vars.sp_natal_sign = signLabel(specialPoints.natalLagna.signNumber);
  }
  if (fp?.natalLagna) {
    setPlacementStem(vars, "natal", fp.natalLagna, signLabel);
  }

  if (fp?.arudhaLagna) {
    setPlacementStem(vars, "arudha", fp.arudhaLagna, signLabel);
    setPlacementStem(vars, "AL", fp.arudhaLagna, signLabel);
  }
  if (fp?.ghatiLagna) {
    setPlacementStem(vars, "ghati", fp.ghatiLagna, signLabel);
    setPlacementStem(vars, "GL", fp.ghatiLagna, signLabel);
  }
  if (fp?.bhavaLagna) {
    setPlacementStem(vars, "bhava", fp.bhavaLagna, signLabel);
    setPlacementStem(vars, "BL", fp.bhavaLagna, signLabel);
  }
  if (fp?.horaLagna) {
    setPlacementStem(vars, "hora", fp.horaLagna, signLabel);
    setPlacementStem(vars, "HL", fp.horaLagna, signLabel);
  }

  vars.sp_ghati_degree = formatLon(specialPoints.ghatiLagna.ghatiLagnaDegree);
  vars.sp_GL_degree = vars.sp_ghati_degree;
  vars.sp_bhava_degree = formatLon(specialPoints.bhavaLagna.bhavaLagnaDegree);
  vars.sp_BL_degree = vars.sp_bhava_degree;
  vars.sp_hora_degree = formatLon(specialPoints.horaLagna.horaLagnaDegree);
  vars.sp_HL_degree = vars.sp_hora_degree;

  const karakas = specialPoints.charakarakas?.karakas ?? [];
  for (const row of CHARA_ROWS) {
    const planet =
      karakas.find((k) => k.rank === row.rank)?.planet?.trim() ?? "";
    vars[`sp_${row.stem}_planet`] = planet;
    vars[`sp_${row.abbrev}_planet`] = planet;
    const p = fp?.charakarakas?.[row.rank];
    setPlacementStem(vars, row.stem, p, signLabel);
    mirrorAbbrev(vars, row.stem, row.abbrev, [
      "sign",
      "house",
      "nakshatra",
      "pada",
      "rasi_name",
    ]);
  }

  if (!extended) return;
  const ep = extended.placements;
  const e = extended;

  vars.sp_varnada_count_from_aries = String(e.varnadaLagna.countFromAries);
  vars.sp_varnada_count_from_hora_lagna = String(
    e.varnadaLagna.countFromHoraLagna
  );
  vars.sp_varnada_lagna_is_odd = e.varnadaLagna.lagnaIsOdd ? "true" : "false";
  vars.sp_varnada_hora_is_odd = e.varnadaLagna.horaLagnaIsOdd
    ? "true"
    : "false";
  if (ep?.varnadaLagna) {
    setPlacementStem(vars, "varnada", ep.varnadaLagna, signLabel);
  }

  const pp = e.pranapada;
  vars.sp_pranapada_degree = formatLon(pp.pranapadalagnaDegree);
  vars.sp_pranapada_fortunate = pp.isFortunate ? "true" : "false";
  vars.sp_pranapada_sun_modality = pp.sunSignNature ?? "";
  vars.sp_pranapada_house_from_lagna = String(pp.houseFromLagna);
  if (ep?.pranapada) {
    setPlacementStem(vars, "pranapada", ep.pranapada, signLabel);
    vars.sp_pranapada_house = vars.sp_pranapada_house || String(pp.houseFromLagna);
  }
  vars.sp_PP_sign = signLabel(pp.pranapadalagnaSignNumber);
  vars.sp_PP_degree = vars.sp_pranapada_degree;
  vars.sp_PP_house = vars.sp_pranapada_house || String(pp.houseFromLagna);
  vars.sp_PP_fortunate = vars.sp_pranapada_fortunate;
  vars.sp_PP_sun_modality = vars.sp_pranapada_sun_modality;
  vars.sp_PP_nakshatra = vars.sp_pranapada_nakshatra;
  vars.sp_PP_pada = vars.sp_pranapada_pada;
  vars.sp_PP_rasi_name = vars.sp_pranapada_rasi_name;

  const up = e.upapadaLagna;
  vars.sp_upapada_twelfth_lord = up.twelfthHouseLord ?? "";
  vars.sp_upapada_lord_sign = signLabel(up.lordSignNumber);
  vars.sp_upapada_steps = String(up.stepsFromTwelfthToLord);
  vars.sp_upapada_exception = up.exceptionApplied ?? "";
  if (ep?.upapadaLagna) {
    setPlacementStem(vars, "upapada", ep.upapadaLagna, signLabel);
  }

  const sr = e.sreeLagna;
  vars.sp_sree_ninth_lord_lagna_kalas = String(sr.ninthLordFromLagnaKalas);
  vars.sp_sree_ninth_lord_moon_kalas = String(sr.ninthLordFromMoonKalas);
  vars.sp_sree_total_kalas = String(sr.totalKalas);
  vars.sp_sree_remainder = String(sr.remainder);
  if (ep?.sreeLagna) {
    setPlacementStem(vars, "sree", ep.sreeLagna, signLabel);
  }

  const bb = e.bhriguBindu;
  vars.sp_bhrigu_degree = formatLon(bb.bhriguBinduDegree);
  vars.sp_BB_sign = signLabel(bb.bhriguBinduSign);
  vars.sp_BB_longitude = formatLon(bb.bhriguBinduLongitude);
  vars.sp_BB_degree = vars.sp_bhrigu_degree;
  if (ep?.bhriguBindu) {
    setPlacementStem(vars, "bhrigu", ep.bhriguBindu, signLabel);
  }

  const bee = e.beejaSphuata;
  vars.sp_beeja_degree = formatLon(bee.beejaSphutaDegree);
  vars.sp_beeja_longitude = formatLon(bee.beejaSphutaLongitude);
  if (ep?.beejaSphuta) {
    setPlacementStem(vars, "beeja", ep.beejaSphuta, signLabel);
  }

  const ksh = e.kshetraSphuata;
  vars.sp_kshetra_degree = formatLon(ksh.kshetraSphutaDegree);
  vars.sp_kshetra_longitude = formatLon(ksh.kshetraSphutaLongitude);
  if (ep?.kshetraSphuta) {
    setPlacementStem(vars, "kshetra", ep.kshetraSphuta, signLabel);
  }

  if (e.trisphuta) {
    vars.sp_trisphuta_degree = formatLon(e.trisphuta.triSphutaDegree);
    if (ep?.trisphuta) {
      setPlacementStem(vars, "trisphuta", ep.trisphuta, signLabel);
    }
  }

  const chain = e.dhoomaChain;
  const dPl = ep?.dhoomaChain;
  const dhoomRows: readonly {
    stem: string;
    lon: number;
    sign: number;
    placeKey: keyof DhoomaPlacements;
  }[] = [
    { stem: "dhooma", lon: chain.dhooma, sign: chain.dhoomaSign, placeKey: "dhooma" },
    {
      stem: "vyatipata",
      lon: chain.vyatipata,
      sign: chain.vyatipataSign,
      placeKey: "vyatipata",
    },
    {
      stem: "parivesha",
      lon: chain.parivesha,
      sign: chain.pariveshaSign,
      placeKey: "parivesha",
    },
    {
      stem: "indrachapa",
      lon: chain.indraChapa,
      sign: chain.indraChapSign,
      placeKey: "indraChapa",
    },
    {
      stem: "upaketu",
      lon: chain.upaketu,
      sign: chain.upaKetuSign,
      placeKey: "upaketu",
    },
  ];
  for (const row of dhoomRows) {
    vars[`sp_${row.stem}_longitude`] = formatLon(row.lon);
    vars[`sp_${row.stem}_sign`] = signLabel(row.sign);
    const plc = dPl?.[row.placeKey];
    if (plc) setPlacementStem(vars, row.stem, plc, signLabel);
  }

  if (e.kaalVelas && ep?.kaalVelas) {
    for (const { key, stem } of KAALA_STEMS) {
      fillKaalVela(
        vars,
        stem,
        e.kaalVelas[key],
        ep.kaalVelas[key],
        signLabel,
        formatLon
      );
    }
  } else if (e.kaalVelas) {
    for (const { key, stem } of KAALA_STEMS) {
      fillKaalVela(vars, stem, e.kaalVelas[key], undefined, signLabel, formatLon);
    }
  }
}

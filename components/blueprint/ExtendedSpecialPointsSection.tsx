// STATUS: done | Life Blueprint extended SP-EXT display
/**
 * Extended Vedic special points — Varnada, Pranapada, Upapada, Sree Lagna, Bhrigu Bindu
 * (also under Sphuta as combined longitude), Sphutas, Dhooma chain, Kaal Velas.
 * Styling matches SpecialPointsPanel / ChapterCard.
 */

import React from "react";
import type {
  ExtendedSpecialPointsResult,
  KaalVelaPlanet,
  KaalVelaResult,
  KaalVelaSetResult,
  SignNumber,
} from "@/types";
import { formatPlacementLine } from "@/lib/astro/vedicPointPlacementFormat";

const SIGN_NAMES: Record<SignNumber, string> = {
  1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer",
  5: "Leo", 6: "Virgo", 7: "Libra", 8: "Scorpio",
  9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces",
};

const SIGN_GLYPHS: Record<SignNumber, string> = {
  1: "♈", 2: "♉", 3: "♊", 4: "♋", 5: "♌", 6: "♍",
  7: "♎", 8: "♏", 9: "♐", 10: "♑", 11: "♒", 12: "♓",
};

/** Shown next to Bhrigu Bindu — matches calculateBhriguBindu (short-arc midpoint, V2). */
const BHRIGU_BINDU_HELP =
  "Sidereal longitude; Moon–Rahu midpoint along the shorter ecliptic arc; not house-corrected.";

const card: React.CSSProperties = {
  background: "rgba(13,18,32,0.55)",
  border: "1px solid rgba(200,135,58,0.14)",
  borderRadius: 16,
  padding: "20px 22px",
  backdropFilter: "blur(14px)",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "Cinzel, serif",
  fontSize: 11,
  letterSpacing: 2.5,
  color: "rgba(240,220,160,0.5)",
  textTransform: "uppercase" as const,
  marginBottom: 14,
};

const tableCss: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const th: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
  fontSize: 9.5,
  letterSpacing: 1.5,
  color: "rgba(200,135,58,0.55)",
  textTransform: "uppercase" as const,
  textAlign: "left" as const,
  paddingBottom: 8,
  paddingRight: 16,
  borderBottom: "1px solid rgba(200,135,58,0.1)",
  whiteSpace: "nowrap" as const,
};

const tdBase: React.CSSProperties = {
  paddingTop: 8,
  paddingBottom: 8,
  paddingRight: 16,
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  verticalAlign: "top" as const,
};

const placementMuted: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
  fontSize: 9,
  color: "rgba(255,255,255,0.28)",
  marginTop: 5,
  lineHeight: 1.45,
};

function PlacementMuted({ line }: { line: string }) {
  return (
    <div title="Whole sign from Lagna; equal-division nakṣatra." style={placementMuted}>
      {line}
    </div>
  );
}

function wrapLon(n: number): number {
  const x = n % 360;
  return x < 0 ? x + 360 : x;
}

function lonToSignDeg(lon: number): { sign: SignNumber; deg: number; min: number } {
  const w = wrapLon(lon);
  const sign = (Math.floor(w / 30) + 1) as SignNumber;
  const inSign = w % 30;
  const deg = Math.floor(inSign);
  const min = Math.round((inSign - deg) * 60);
  return { sign, deg, min };
}

function SignCell({ sign }: { sign: SignNumber }) {
  return (
    <span>
      <span style={{ fontSize: 13, marginRight: 4 }}>{SIGN_GLYPHS[sign]}</span>
      <span style={{
        fontFamily: "Cinzel, serif", fontSize: 12, fontWeight: 500,
        color: "rgba(240,220,160,0.9)",
      }}>
        {SIGN_NAMES[sign]}
      </span>
    </span>
  );
}

function DegreeInSign({ deg, min }: { deg: number; min: number }) {
  return (
    <span style={{
      fontFamily: "DM Mono, monospace", fontSize: 11,
      color: "rgba(240,220,160,0.75)",
    }}>
      {deg}°{String(min).padStart(2, "0")}′
    </span>
  );
}

function AbsLongCell({ lon }: { lon: number }) {
  const { sign, deg, min } = lonToSignDeg(lon);
  return (
    <span>
      <SignCell sign={sign} />
      <span style={{ marginLeft: 8 }}>
        <DegreeInSign deg={deg} min={min} />
      </span>
      <span style={{
        display: "block",
        fontFamily: "DM Mono, monospace",
        fontSize: 9,
        color: "rgba(255,255,255,0.25)",
        marginTop: 2,
      }}>
        λ {wrapLon(lon).toFixed(2)}°
      </span>
    </span>
  );
}

function upapadaExceptionLabel(
  e: ExtendedSpecialPointsResult["upapadaLagna"]["exceptionApplied"]
): string | undefined {
  if (e === "use_10th_from_12th") return "10th-from-12th rule applied";
  if (e === "use_4th_from_12th") return "4th-from-12th rule applied";
  return undefined;
}

const KAAL_ORDER: (keyof KaalVelaSetResult)[] = [
  "gulika", "maandi", "kaala", "mrityu", "ardhaprahara", "yamaghantaka",
];

/** Legacy KV payloads used KaalVelaPlanet keys (Gulika, …) instead of camelCase */
const LEGACY_KAAL_KEY: Record<keyof KaalVelaSetResult, KaalVelaPlanet> = {
  gulika: "Gulika",
  maandi: "Maandi",
  kaala: "Kaala",
  mrityu: "Mrityu",
  ardhaprahara: "Ardhaprahara",
  yamaghantaka: "Yamaghantaka",
};

function kaalVelaEntry(
  set: KaalVelaSetResult,
  k: keyof KaalVelaSetResult
): KaalVelaResult | undefined {
  const direct = set[k];
  if (direct) return direct;
  const legacy = set as unknown as Record<string, KaalVelaResult | undefined>;
  return legacy[LEGACY_KAAL_KEY[k]];
}

function KaalVelaRow({ label, v, placementLine }: { label: string; v: KaalVelaResult; placementLine?: string }) {
  return (
    <tr>
      <td style={tdBase}>
        <span style={{
          fontFamily: "DM Mono, monospace", fontSize: 10,
          color: "rgba(200,135,58,0.8)", letterSpacing: 0.5,
        }}>
          {label}
        </span>
      </td>
      <td style={tdBase}>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 11, color: "rgba(255,255,255,0.45)",
        }}>
          Portion {v.portionNumber} · {Math.round(v.startMinutesFromSunrise)}–{Math.round(v.endMinutesFromSunrise)} min from sunrise
        </span>
        {placementLine ? <PlacementMuted line={placementLine} /> : null}
      </td>
      <td style={tdBase}>
        <SignCell sign={v.signNumber} />
      </td>
      <td style={{ ...tdBase, paddingRight: 0 }}>
        <AbsLongCell lon={v.referenceLongitude ?? v.midpointLongitude} />
      </td>
    </tr>
  );
}

interface Props {
  /** `null` when extended points are not yet computed or chart/KV base is unavailable */
  extended: ExtendedSpecialPointsResult | null;
}

function ExtendedSpecialPointsTables({ extended }: { extended: ExtendedSpecialPointsResult }) {
  const {
    varnadaLagna,
    pranapada,
    upapadaLagna,
    sreeLagna,
    bhriguBindu,
    beejaSphuata,
    kshetraSphuata,
    trisphuta,
    dhoomaChain,
    kaalVelas,
  } = extended;
  const pl = extended.placements;
  const dh = pl?.dhoomaChain;

  const dhoomaRows: { key: string; label: string; lon: number; sign: SignNumber; placementLine?: string }[] = [
    { key: "dh", label: "Dhooma", lon: dhoomaChain.dhooma, sign: dhoomaChain.dhoomaSign, placementLine: dh ? formatPlacementLine(dh.dhooma) : undefined },
    { key: "vy", label: "Vyatipāta", lon: dhoomaChain.vyatipata, sign: dhoomaChain.vyatipataSign, placementLine: dh ? formatPlacementLine(dh.vyatipata) : undefined },
    { key: "pa", label: "Pariveṣha", lon: dhoomaChain.parivesha, sign: dhoomaChain.pariveshaSign, placementLine: dh ? formatPlacementLine(dh.parivesha) : undefined },
    { key: "ic", label: "Indra Chāpa", lon: dhoomaChain.indraChapa, sign: dhoomaChain.indraChapSign, placementLine: dh ? formatPlacementLine(dh.indraChapa) : undefined },
    { key: "up", label: "Upaketu", lon: dhoomaChain.upaketu, sign: dhoomaChain.upaKetuSign, placementLine: dh ? formatPlacementLine(dh.upaketu) : undefined },
  ];

  return (
    <>
      {/* Extended Lagnas */}
      <div style={card}>
        <div style={sectionTitle}>5.3 · Extended Lagnas</div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableCss}>
            <thead>
              <tr>
                <th style={th}>Code</th>
                <th style={th}>Point</th>
                <th style={th}>Notes</th>
                <th style={th}>Sign</th>
                <th style={{ ...th, paddingRight: 0 }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdBase}><span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.8)" }}>VL</span></td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Varnada Lagna</span>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Society &amp; lineage</div>
                </td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    Lagna {varnadaLagna.lagnaIsOdd ? "odd" : "even"} · Hora {varnadaLagna.horaLagnaIsOdd ? "odd" : "even"} · from Aries {varnadaLagna.countFromAries} · from HL {varnadaLagna.countFromHoraLagna}
                  </span>
                  {pl?.varnadaLagna ? <PlacementMuted line={formatPlacementLine(pl.varnadaLagna)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={varnadaLagna.varnadaLagnaSignNumber} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}>—</td>
              </tr>
              <tr>
                <td style={tdBase}><span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.8)" }}>PL</span></td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Prāṇapada Lagna</span>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Life force</div>
                </td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    {pranapada.sunSignNature} Sun · start λ {pranapada.startingLongitude.toFixed(2)}° · vighatis {pranapada.vighatisSinceSunrise.toFixed(1)} · offset {pranapada.baseOffsetDegrees.toFixed(2)}° · house {pranapada.houseFromLagna} {pranapada.isFortunate ? "· fortunate" : ""} · Sun @ sunrise λ {pranapada.sunLongitudeAtSunrise.toFixed(2)}°
                  </span>
                  {pl?.pranapada ? <PlacementMuted line={formatPlacementLine(pl.pranapada)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={pranapada.pranapadalagnaSignNumber} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}>—</td>
              </tr>
              <tr>
                <td style={tdBase}><span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.8)" }}>UP</span></td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Upapada Lagna</span>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Marriage &amp; partnerships</div>
                </td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    12th lord {upapadaLagna.twelfthHouseLord} · steps {upapadaLagna.stepsFromTwelfthToLord}
                    {upapadaExceptionLabel(upapadaLagna.exceptionApplied) && (
                      <span> · {upapadaExceptionLabel(upapadaLagna.exceptionApplied)}</span>
                    )}
                  </span>
                  {pl?.upapadaLagna ? <PlacementMuted line={formatPlacementLine(pl.upapadaLagna)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={upapadaLagna.upapadaSignNumber} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}>—</td>
              </tr>
              <tr>
                <td style={tdBase}><span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.8)" }}>SL</span></td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Śrī Lagna</span>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Prosperity</div>
                </td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    9th-from-Lagna kālas {sreeLagna.ninthLordFromLagnaKalas} · 9th-from-Moon {sreeLagna.ninthLordFromMoonKalas} · total {sreeLagna.totalKalas} · rem {sreeLagna.remainder}
                  </span>
                  {pl?.sreeLagna ? <PlacementMuted line={formatPlacementLine(pl.sreeLagna)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={sreeLagna.sreeLagnaSignNumber} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}>—</td>
              </tr>
              <tr>
                <td style={tdBase}><span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.8)" }}>BB</span></td>
                <td style={tdBase}>
                  <span
                    title={BHRIGU_BINDU_HELP}
                    style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}
                  >
                    Bhrigu Bindu
                  </span>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Sensitive point · fruition &amp; turning points</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 5, lineHeight: 1.45 }}>{BHRIGU_BINDU_HELP}</div>
                </td>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    Rahu–Moon short-arc ecliptic midpoint
                  </span>
                  {pl?.bhriguBindu ? <PlacementMuted line={formatPlacementLine(pl.bhriguBindu)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={bhriguBindu.bhriguBinduSign} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}>
                  <AbsLongCell lon={bhriguBindu.bhriguBinduLongitude} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sphuta */}
      <div style={card}>
        <div style={sectionTitle}>5.4 · Sphuta · Dhooma · Kaal Velas</div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableCss}>
            <thead>
              <tr>
                <th style={th}>Point</th>
                <th style={th}>Sign</th>
                <th style={{ ...th, paddingRight: 0 }}>Longitude</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdBase}>
                  <span
                    title={BHRIGU_BINDU_HELP}
                    style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}
                  >
                    Bhrigu Bindu
                  </span>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Rahu–Moon short-arc midpoint</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 5, lineHeight: 1.45 }}>{BHRIGU_BINDU_HELP}</div>
                  {pl?.bhriguBindu ? <PlacementMuted line={formatPlacementLine(pl.bhriguBindu)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={bhriguBindu.bhriguBinduSign} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}><AbsLongCell lon={bhriguBindu.bhriguBinduLongitude} /></td>
              </tr>
              <tr>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Vijaya (Beeja) Sphuta</span>
                  {pl?.beejaSphuta ? <PlacementMuted line={formatPlacementLine(pl.beejaSphuta)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={beejaSphuata.beejaSphutaSign} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}><AbsLongCell lon={beejaSphuata.beejaSphutaLongitude} /></td>
              </tr>
              <tr>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Kṣetra Sphuta</span>
                  {pl?.kshetraSphuta ? <PlacementMuted line={formatPlacementLine(pl.kshetraSphuta)} /> : null}
                </td>
                <td style={tdBase}><SignCell sign={kshetraSphuata.kshetraSphutaSign} /></td>
                <td style={{ ...tdBase, paddingRight: 0 }}><AbsLongCell lon={kshetraSphuata.kshetraSphutaLongitude} /></td>
              </tr>
              <tr>
                <td style={tdBase}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Tri-Sphuta</span>
                  {pl?.trisphuta ? <PlacementMuted line={formatPlacementLine(pl.trisphuta)} /> : null}
                </td>
                <td style={tdBase}>
                  {trisphuta ? <SignCell sign={trisphuta.triSphutaSign} /> : (
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>—</span>
                  )}
                </td>
                <td style={{ ...tdBase, paddingRight: 0 }}>
                  {trisphuta ? (
                    <span>
                      <AbsLongCell lon={trisphuta.triSphutaLongitude} />
                      <span style={{
                        display: "block",
                        fontFamily: "DM Mono, monospace",
                        fontSize: 9,
                        color: "rgba(255,255,255,0.25)",
                        marginTop: 4,
                      }}>
                        Gulika λ {trisphuta.gulikaLongitudeUsed.toFixed(2)}°
                      </span>
                    </span>
                  ) : (
                    <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      Needs Gulika (Kaal Vela)
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dhooma chain */}
      <div style={card}>
        <div style={sectionTitle}>Dhooma · Upaketu Chain</div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableCss}>
            <thead>
              <tr>
                <th style={th}>Point</th>
                <th style={th}>Sign</th>
                <th style={{ ...th, paddingRight: 0 }}>Ecliptic λ</th>
              </tr>
            </thead>
            <tbody>
              {dhoomaRows.map((r) => (
                <tr key={r.key}>
                  <td style={tdBase}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{r.label}</span>
                    {r.placementLine ? <PlacementMuted line={r.placementLine} /> : null}
                  </td>
                  <td style={tdBase}><SignCell sign={r.sign} /></td>
                  <td style={{ ...tdBase, paddingRight: 0 }}><AbsLongCell lon={r.lon} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kaal Velas */}
      <div style={card}>
        <div style={sectionTitle}>Kaal Velas · Sub-planetary windows</div>
        {kaalVelas ? (
          <div style={{ overflowX: "auto" }}>
            <table style={tableCss}>
              <thead>
                <tr>
                  <th style={th}>Velā</th>
                  <th style={th}>Window</th>
                  <th style={th}>Sign</th>
                  <th style={{ ...th, paddingRight: 0 }}>Reference λ</th>
                </tr>
              </thead>
              <tbody>
                {KAAL_ORDER.map((k) => {
                  const labels: Record<keyof KaalVelaSetResult, string> = {
                    gulika: "Gulika",
                    maandi: "Maandi",
                    kaala: "Kāla",
                    mrityu: "Mrityu",
                    ardhaprahara: "Ardhaprahara",
                    yamaghantaka: "Yamaghantaka",
                  };
                  const v = kaalVelaEntry(kaalVelas, k);
                  if (!v) return null;
                  const kp = pl?.kaalVelas?.[k];
                  return (
                    <KaalVelaRow
                      key={k}
                      label={labels[k]}
                      v={v}
                      placementLine={kp ? formatPlacementLine(kp) : undefined}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            margin: 0,
            lineHeight: 1.6,
          }}>
            Kaal Velas could not be computed (birth place, sunrise/sunset, or weekday data unavailable). Tri-Sphuta may also be unavailable.
          </p>
        )}
      </div>
    </>
  );
}

export function ExtendedSpecialPointsSection({ extended }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 6 }}>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingLeft: 2, marginTop: 4,
      }}>
        <span style={{ color: "rgba(200,135,58,0.6)", fontSize: 12 }}>✦</span>
        <span style={{
          fontFamily: "Cinzel, serif", fontSize: 13, letterSpacing: 1.5,
          color: "rgba(240,220,160,0.7)",
        }}>
          Extended Calculations
        </span>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 11, color: "rgba(255,255,255,0.25)",
        }}>
          — Varnada, Upapada, Sphuta, Dhooma, Kaal Velas
        </span>
      </div>

      {extended ? (
        <ExtendedSpecialPointsTables extended={extended} />
      ) : (
        <div style={{
          ...card,
          background: "rgba(13,18,32,0.42)",
          borderColor: "rgba(200,135,58,0.1)",
        }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            margin: 0,
            lineHeight: 1.65,
          }}>
            Extended Vedic points are not available yet — your chart or cached base data may still be preparing. Try again after your Vedic chart has finished generating.
          </p>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.28)",
            margin: "12px 0 0",
            lineHeight: 1.6,
          }}>
            When ready, this section shows Extended Lagnas (Varnada, Prāṇapada, Upapada, Śrī Lagna, Bhrigu Bindu), combined Sphutas (including Bhrigu Bindu as a longitude), the Dhooma–Upaketu chain, and Kaal Velas.
          </p>
        </div>
      )}
    </div>
  );
}

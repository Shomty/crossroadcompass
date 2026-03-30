// STATUS: done | Admin Variable Inspector
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const MONO = "var(--font-mono, 'DM Mono')";
const AMBER = "#c8873a";
const GOLD = "#e8b96a";
const STAR = "#f0dca0";
const DIM = "#606880";
const MID = "#a0a8c0";
const GREEN = "#80D4A0";
const RED = "#E8705A";
const SURFACE = "rgba(28,35,64,0.5)";
const BORDER = "rgba(200,135,58,0.12)";

const JSON_KEYS = new Set([
  "hd_incarnation_cross_json", "hd_active_channels_json", "hd_variables_json",
  "hd_personality_activations_json", "hd_design_activations_json",
  "vedic_json", "vedic_planets_json", "vedic_houses_json",
  "dashas_json", "transit_json",
  "sp_foundation_json", "sp_charakarakas_json", "sp_extended_json",
  "sp_dhooma_chain_json", "sp_kaal_velas_json",
]);

// Keys where the value might be a JSON object or a short string
const MAYBE_JSON_KEYS = new Set(["sade_sati"]);

type DataSources = {
  hd: { available: boolean };
  vedic: { available: boolean };
  dashas: { available: boolean };
  transit: { available: boolean };
  specialPoints: { available: boolean; extendedAvailable: boolean };
};

interface Group {
  label: string;
  icon: string;
  availKey?: keyof DataSources;
  keys: string[];
  subSections?: Array<{ label: string; keys: string[] }>;
}

const GROUPS: Group[] = [
  {
    label: "Identity",
    icon: "⊙",
    keys: ["user_email", "user_name", "today_date", "today_iso"],
  },
  {
    label: "Birth Profile",
    icon: "◎",
    keys: [
      "birth_name", "birth_date", "birth_time", "birth_city", "birth_country",
      "birth_location", "birth_latitude", "birth_longitude", "timezone", "gender",
      "observation_city", "observation_latitude", "observation_longitude",
      "intake_life_situation", "intake_primary_focus", "intake_wants_clarity",
    ],
  },
  {
    label: "Human Design",
    icon: "◈",
    availKey: "hd",
    keys: [
      "hd_type", "hd_strategy", "hd_authority", "hd_profile", "hd_definition",
      "hd_signature", "hd_not_self_theme", "hd_incarnation_cross_type",
      "hd_incarnation_cross_gates", "hd_design_date", "hd_defined_centers",
      "hd_undefined_centers", "hd_active_gates",
      "hd_incarnation_cross_json", "hd_active_channels_json", "hd_variables_json",
      "hd_personality_activations_json", "hd_design_activations_json",
    ],
  },
  {
    label: "Vedic Astrology",
    icon: "✦",
    availKey: "vedic",
    keys: ["lagna", "sun_sign", "moon_sign", "sade_sati", "vedic_json", "vedic_planets_json", "vedic_houses_json"],
    subSections: [
      {
        label: "Per-Planet",
        keys: [
          "vedic_sun_sign", "vedic_sun_degree", "vedic_sun_retro",
          "vedic_moon_sign", "vedic_moon_degree", "vedic_moon_retro",
          "vedic_mars_sign", "vedic_mars_degree", "vedic_mars_retro",
          "vedic_mercury_sign", "vedic_mercury_degree", "vedic_mercury_retro",
          "vedic_jupiter_sign", "vedic_jupiter_degree", "vedic_jupiter_retro",
          "vedic_venus_sign", "vedic_venus_degree", "vedic_venus_retro",
          "vedic_saturn_sign", "vedic_saturn_degree", "vedic_saturn_retro",
          "vedic_rahu_sign", "vedic_rahu_degree",
          "vedic_ketu_sign", "vedic_ketu_degree",
          "vedic_lagna_degree",
        ],
      },
      {
        label: "House Signs",
        keys: [
          "vedic_house_1_sign", "vedic_house_2_sign", "vedic_house_3_sign",
          "vedic_house_4_sign", "vedic_house_5_sign", "vedic_house_6_sign",
          "vedic_house_7_sign", "vedic_house_8_sign", "vedic_house_9_sign",
          "vedic_house_10_sign", "vedic_house_11_sign", "vedic_house_12_sign",
        ],
      },
    ],
  },
  {
    label: "Dasha Periods",
    icon: "⟳",
    availKey: "dashas",
    keys: [
      "current_mahadasha", "current_antardasha", "current_dasha",
      "dasha_mahadasha_start", "dasha_mahadasha_end",
      "dasha_antardasha_start", "dasha_antardasha_end",
      "dashas_json",
    ],
  },
  {
    label: "Transits",
    icon: "◉",
    availKey: "transit",
    keys: ["transit_date", "transit_json"],
  },
  {
    label: "Special Points",
    icon: "⬡",
    availKey: "specialPoints",
    keys: [
      "sp_arudha_sign", "sp_ghati_sign", "sp_bhava_sign", "sp_hora_sign",
      "sp_foundation_json", "sp_charakarakas_json",
    ],
  },
  {
    label: "Extended Points",
    icon: "⬡",
    availKey: "specialPoints",
    keys: [
      "sp_varnada_sign", "sp_pranapada_sign", "sp_upapada_sign", "sp_sree_sign",
      "sp_bhrigu_sign", "sp_bhrigu_longitude", "sp_beeja_sign", "sp_kshetra_sign",
      "sp_trisphuta_sign", "sp_trisphuta_longitude",
      "sp_extended_json", "sp_dhooma_chain_json", "sp_kaal_velas_json",
    ],
  },
];

// Planet rows for the per-planet sub-section table view
const PLANET_ROWS = [
  { planet: "sun", label: "☉ Sun" },
  { planet: "moon", label: "☽ Moon" },
  { planet: "mars", label: "♂ Mars" },
  { planet: "mercury", label: "☿ Mercury" },
  { planet: "jupiter", label: "♃ Jupiter" },
  { planet: "venus", label: "♀ Venus" },
  { planet: "saturn", label: "♄ Saturn" },
  { planet: "rahu", label: "☊ Rahu" },
  { planet: "ketu", label: "☋ Ketu" },
] as const;

export interface UserVariableInspectorProps {
  vars: Record<string, string>;
  dataSources: DataSources;
}

export function UserVariableInspector({ vars, dataSources }: UserVariableInspectorProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function copyVar(key: string) {
    navigator.clipboard.writeText(`{{${key}}}`).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  }

  function toggleExpanded(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  const filterLower = filter.toLowerCase();

  function keyMatchesFilter(key: string): boolean {
    if (!filterLower) return true;
    return key.toLowerCase().includes(filterLower);
  }

  function getAvailBadge(group: Group): ReactNode {
    if (!group.availKey) return null;
    const src = dataSources[group.availKey];
    const avail = "extendedAvailable" in src ? src.available || src.extendedAvailable : src.available;
    return (
      <span style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em",
        color: avail ? GREEN : RED,
        background: avail ? "rgba(128,212,160,0.08)" : "rgba(232,112,90,0.08)",
        border: `1px solid ${avail ? "rgba(128,212,160,0.2)" : "rgba(232,112,90,0.2)"}`,
        borderRadius: 4, padding: "1px 5px",
      }}>
        {avail ? "✓" : "✗"}
      </span>
    );
  }

  function renderVarChip(key: string) {
    const isCopied = copied === key;
    const isJson = JSON_KEYS.has(key) || (MAYBE_JSON_KEYS.has(key) && vars[key]?.startsWith("{"));
    const value = vars[key] ?? "";
    const isEmpty = !value;

    return (
      <div key={key} style={{ marginBottom: isJson ? 12 : 0 }}>
        {isJson ? (
          <div style={{
            background: "rgba(13,18,32,0.6)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 6,
            overflow: "hidden",
          }}>
            {/* JSON var header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
              <button
                onClick={() => copyVar(key)}
                style={{
                  fontFamily: MONO, fontSize: 11, cursor: "pointer",
                  background: isCopied ? "rgba(128,212,160,0.15)" : "rgba(200,135,58,0.12)",
                  border: `1px solid ${isCopied ? "rgba(128,212,160,0.3)" : "rgba(200,135,58,0.25)"}`,
                  borderRadius: 4, padding: "3px 8px",
                  color: isCopied ? GREEN : GOLD, transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                {isCopied ? "✓ copied" : `{{${key}}}`}
              </button>
              <span style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>
                {isEmpty ? "empty" : `${value.length} chars`}
              </span>
              <button
                onClick={() => toggleExpanded(key)}
                style={{
                  marginLeft: "auto", fontFamily: MONO, fontSize: 10,
                  background: "none", border: "none", cursor: "pointer",
                  color: AMBER, padding: "2px 6px",
                }}
              >
                {expanded.has(key) ? "▲ collapse" : "▼ expand"}
              </button>
            </div>
            {expanded.has(key) && value && (
              <pre style={{
                fontFamily: MONO, fontSize: 10, color: "#7080a8",
                padding: "0 12px 10px", margin: 0, maxHeight: 300,
                overflowY: "auto", borderTop: "1px solid rgba(255,255,255,0.04)",
                whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>
                {value}
              </pre>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => copyVar(key)}
              style={{
                fontFamily: MONO, fontSize: 11, cursor: "pointer",
                background: isCopied ? "rgba(128,212,160,0.12)" : "rgba(200,135,58,0.08)",
                border: `1px solid ${isCopied ? "rgba(128,212,160,0.25)" : "rgba(200,135,58,0.18)"}`,
                borderRadius: 4, padding: "3px 8px",
                color: isCopied ? GREEN : AMBER, transition: "all 0.15s",
                flexShrink: 0, whiteSpace: "nowrap",
              }}
            >
              {isCopied ? "✓" : `{{${key}}}`}
            </button>
            <span style={{
              fontFamily: MONO, fontSize: 11,
              color: isEmpty ? DIM : MID,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontStyle: isEmpty ? "italic" : "normal",
            }}>
              {isEmpty ? "—" : value.length > 60 ? value.slice(0, 60) + "…" : value}
            </span>
          </div>
        )}
      </div>
    );
  }

  function renderPlanetTable(keys: string[]) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(200,135,58,0.12)" }}>
              <th style={{ textAlign: "left", padding: "5px 8px", color: AMBER, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600 }}>PLANET</th>
              <th style={{ textAlign: "left", padding: "5px 8px", color: AMBER, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600 }}>SIGN</th>
              <th style={{ textAlign: "left", padding: "5px 8px", color: AMBER, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600 }}>DEGREE</th>
              <th style={{ textAlign: "left", padding: "5px 8px", color: AMBER, fontSize: 9, letterSpacing: "0.1em", fontWeight: 600 }}>RETRO</th>
            </tr>
          </thead>
          <tbody>
            {PLANET_ROWS.map(({ planet, label }) => {
              const signKey = `vedic_${planet}_sign`;
              const degKey = `vedic_${planet}_degree`;
              const retroKey = `vedic_${planet}_retro`;
              if (!keyMatchesFilter(signKey) && !keyMatchesFilter(degKey) && !keyMatchesFilter(retroKey) && !keyMatchesFilter(planet)) return null;
              const hasRetro = planet !== "rahu" && planet !== "ketu";
              return (
                <tr key={planet} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "5px 8px", color: STAR }}>{label}</td>
                  <td style={{ padding: "5px 8px" }}>
                    {keys.includes(signKey) && (
                      <VarPill k={signKey} val={vars[signKey]} copied={copied} onCopy={copyVar} />
                    )}
                  </td>
                  <td style={{ padding: "5px 8px" }}>
                    {keys.includes(degKey) && (
                      <VarPill k={degKey} val={vars[degKey]} copied={copied} onCopy={copyVar} />
                    )}
                  </td>
                  <td style={{ padding: "5px 8px" }}>
                    {hasRetro && keys.includes(retroKey) && (
                      <VarPill k={retroKey} val={vars[retroKey]} copied={copied} onCopy={copyVar} />
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Lagna degree row */}
            {keys.includes("vedic_lagna_degree") && keyMatchesFilter("vedic_lagna_degree") && (
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "5px 8px", color: GOLD }}>⬆ Lagna</td>
                <td style={{ padding: "5px 8px" }} />
                <td style={{ padding: "5px 8px" }}>
                  <VarPill k="vedic_lagna_degree" val={vars["vedic_lagna_degree"]} copied={copied} onCopy={copyVar} />
                </td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderHouseGrid(keys: string[]) {
    const filtered = keys.filter(keyMatchesFilter);
    if (filtered.length === 0) return null;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const h = i + 1;
          const k = `vedic_house_${h}_sign`;
          if (!keys.includes(k) || !keyMatchesFilter(k)) return null;
          const val = vars[k];
          const isCopied = copied === k;
          return (
            <div key={k} style={{
              background: "rgba(13,18,32,0.4)",
              border: "1px solid rgba(200,135,58,0.1)",
              borderRadius: 5, padding: "6px 8px",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: DIM, marginBottom: 3 }}>H{h}</div>
              <button
                onClick={() => copyVar(k)}
                style={{
                  fontFamily: MONO, fontSize: 10, cursor: "pointer",
                  background: isCopied ? "rgba(128,212,160,0.12)" : "none",
                  border: "none", padding: 0,
                  color: isCopied ? GREEN : (val ? MID : DIM),
                  display: "block", width: "100%", textAlign: "left",
                }}
              >
                {isCopied ? "✓ copied" : (val || "—")}
              </button>
              <div style={{ fontFamily: MONO, fontSize: 9, color: AMBER, marginTop: 2 }}>
                {`{{${k}}}`}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderSubSection(sub: { label: string; keys: string[] }) {
    const filteredKeys = sub.keys.filter(keyMatchesFilter);
    if (filteredKeys.length === 0) return null;

    const isPlanetTable = sub.label === "Per-Planet";
    const isHouseGrid = sub.label === "House Signs";

    return (
      <div key={sub.label} style={{ marginTop: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: AMBER, letterSpacing: "0.1em", marginBottom: 8 }}>
          {sub.label.toUpperCase()}
        </div>
        {isPlanetTable ? renderPlanetTable(sub.keys) : isHouseGrid ? renderHouseGrid(sub.keys) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredKeys.map(renderVarChip)}
          </div>
        )}
      </div>
    );
  }

  const totalVars = Object.keys(vars).length;
  const filledVars = Object.values(vars).filter(Boolean).length;

  return (
    <div>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20, flexWrap: "wrap",
      }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: DIM }}>
          <span style={{ color: GOLD }}>{filledVars}</span>/{totalVars} vars populated
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(Object.entries(dataSources) as [keyof DataSources, DataSources[keyof DataSources]][]).map(([k, src]) => {
            const avail = "extendedAvailable" in src ? src.available || src.extendedAvailable : src.available;
            return (
              <span key={k} style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em",
                color: avail ? GREEN : RED,
                background: avail ? "rgba(128,212,160,0.06)" : "rgba(232,112,90,0.06)",
                border: `1px solid ${avail ? "rgba(128,212,160,0.15)" : "rgba(232,112,90,0.15)"}`,
                borderRadius: 4, padding: "2px 7px",
              }}>
                {k.toUpperCase()} {avail ? "✓" : "✗"}
              </span>
            );
          })}
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter variables…"
          style={{
            marginLeft: "auto", fontFamily: MONO, fontSize: 11,
            padding: "6px 10px",
            background: "rgba(13,18,32,0.7)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6, color: MID, outline: "none", width: 200,
          }}
        />
      </div>

      {/* Groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {GROUPS.map((group) => {
          const allGroupKeys = [
            ...group.keys,
            ...(group.subSections?.flatMap((s) => s.keys) ?? []),
          ];
          const hasMatch = allGroupKeys.some(keyMatchesFilter);
          if (!hasMatch) return null;

          const isCollapsed = collapsedGroups.has(group.label);
          const filteredMainKeys = group.keys.filter((k) => keyMatchesFilter(k));
          const jsonKeys = filteredMainKeys.filter((k) => JSON_KEYS.has(k) || (MAYBE_JSON_KEYS.has(k) && vars[k]?.startsWith("{")));
          const simpleKeys = filteredMainKeys.filter((k) => !JSON_KEYS.has(k) && !(MAYBE_JSON_KEYS.has(k) && vars[k]?.startsWith("{")));

          return (
            <div key={group.label} style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 8, overflow: "hidden",
            }}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px",
                  borderBottom: isCollapsed ? "none" : "1px solid rgba(200,135,58,0.08)",
                }}
              >
                <span style={{ color: AMBER, fontSize: 13 }}>{group.icon}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: STAR, letterSpacing: "0.06em" }}>
                  {group.label.toUpperCase()}
                </span>
                {getAvailBadge(group)}
                <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, color: DIM }}>
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </button>

              {!isCollapsed && (
                <div style={{ padding: 16 }}>
                  {/* Simple vars grid */}
                  {simpleKeys.length > 0 && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: 8, marginBottom: jsonKeys.length > 0 ? 14 : 0,
                    }}>
                      {simpleKeys.map(renderVarChip)}
                    </div>
                  )}

                  {/* JSON vars — full width */}
                  {jsonKeys.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {jsonKeys.map(renderVarChip)}
                    </div>
                  )}

                  {/* Sub-sections */}
                  {group.subSections?.map(renderSubSection)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VarPill({
  k, val, copied, onCopy,
}: {
  k: string; val: string; copied: string | null; onCopy: (key: string) => void;
}) {
  const isCopied = copied === k;
  const isEmpty = !val;
  return (
    <button
      onClick={() => onCopy(k)}
      title={`{{${k}}}`}
      style={{
        fontFamily: MONO, fontSize: 10, cursor: "pointer",
        background: isCopied ? "rgba(128,212,160,0.12)" : "rgba(200,135,58,0.07)",
        border: `1px solid ${isCopied ? "rgba(128,212,160,0.25)" : "rgba(200,135,58,0.15)"}`,
        borderRadius: 4, padding: "2px 6px",
        color: isCopied ? GREEN : (isEmpty ? DIM : MID),
        whiteSpace: "nowrap",
      }}
    >
      {isCopied ? "✓" : (isEmpty ? "—" : val)}
    </button>
  );
}

/**
 * Bhrigu Bindu — dedicated rich section for Life Blueprint.
 * Shows: what is BB, calculation (Moon + Rahu → midpoint), house interpretation, transit note.
 */

import React from "react";
import type { ExtendedSpecialPointsResult, SignNumber } from "@/types";
import {
  BHRIGU_BINDU_HOUSE_INTERPRETATIONS,
  BHRIGU_BINDU_INTRO,
} from "@/lib/astro/bhriguBinduInterpretations";

const SIGN_NAMES: Record<SignNumber, string> = {
  1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer",
  5: "Leo", 6: "Virgo", 7: "Libra", 8: "Scorpio",
  9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces",
};

const SIGN_GLYPHS: Record<SignNumber, string> = {
  1: "♈", 2: "♉", 3: "♊", 4: "♋", 5: "♌", 6: "♍",
  7: "♎", 8: "♏", 9: "♐", 10: "♑", 11: "♒", 12: "♓",
};

function formatLongitudeDMS(longitude: number): string {
  const sign = Math.floor(longitude / 30) as SignNumber;
  const deg = longitude % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.floor(((deg - d) * 60 - m) * 60);
  const name = SIGN_NAMES[sign] ?? "";
  return `${name} ${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″`;
}

function formatSignShort(longitude: number): { glyph: string; name: string; degree: string } {
  const signNum = (Math.floor(longitude / 30) + 1) as SignNumber;
  const deg = longitude % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return {
    glyph: SIGN_GLYPHS[signNum] ?? "",
    name: SIGN_NAMES[signNum] ?? "",
    degree: `${d}°${String(m).padStart(2, "0")}′`,
  };
}

const cardStyle: React.CSSProperties = {
  background: "rgba(13,18,32,0.55)",
  border: "1px solid rgba(200,135,58,0.14)",
  borderRadius: 16,
  padding: "22px 24px",
  backdropFilter: "blur(14px)",
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "Cinzel, serif",
  fontSize: 11,
  letterSpacing: 2.5,
  color: "rgba(240,220,160,0.5)",
  textTransform: "uppercase" as const,
  marginBottom: 6,
};

const headingStyle: React.CSSProperties = {
  fontFamily: "Cinzel, serif",
  fontSize: 18,
  fontWeight: 400,
  color: "rgba(255,255,255,0.92)",
  letterSpacing: 0.5,
  marginBottom: 12,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 13.5,
  lineHeight: 1.75,
  color: "rgba(255,255,255,0.62)",
  whiteSpace: "pre-line" as const,
};

const dimLabel: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
  fontSize: 10,
  letterSpacing: 1.2,
  color: "rgba(200,135,58,0.65)",
  textTransform: "uppercase" as const,
  marginBottom: 4,
};

const resultValueStyle: React.CSSProperties = {
  fontFamily: "Cinzel, serif",
  fontSize: 28,
  fontWeight: 400,
  color: "rgba(255,255,255,0.95)",
  letterSpacing: 0.5,
  lineHeight: 1.2,
};

const resultSubStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 12,
  color: "rgba(255,255,255,0.4)",
  marginTop: 4,
};

const divider: React.CSSProperties = {
  borderTop: "1px solid rgba(200,135,58,0.12)",
  margin: "18px 0",
};

const arrowStyle: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
  fontSize: 18,
  color: "rgba(200,135,58,0.5)",
  margin: "0 10px",
  alignSelf: "center",
};

const planetPillStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 3,
  padding: "10px 16px",
  background: "rgba(13,18,32,0.6)",
  border: "1px solid rgba(200,135,58,0.18)",
  borderRadius: 10,
  minWidth: 100,
};

const transitNoteStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 12.5,
  lineHeight: 1.65,
  color: "rgba(255,255,255,0.5)",
  padding: "12px 16px",
  background: "rgba(200,135,58,0.06)",
  border: "1px solid rgba(200,135,58,0.18)",
  borderRadius: 10,
  marginTop: 16,
};

interface Props {
  extended: ExtendedSpecialPointsResult | null;
}

export function BhriguBinduSection({ extended }: Props) {
  if (!extended?.bhriguBindu) return null;

  const bb = extended.bhriguBindu;
  const placement = extended.placements?.bhriguBindu;
  const house = placement?.houseFromLagna;
  const interp = house ? BHRIGU_BINDU_HOUSE_INTERPRETATIONS[house] : null;

  const moonSign = formatSignShort(bb.moonLongitudeUsed);
  const rahuSign = formatSignShort(bb.rahuLongitudeUsed);
  const bbSign = formatSignShort(bb.bhriguBinduLongitude);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Card 1: What is Bhrigu Bindu ── */}
      <div style={cardStyle}>
        <div style={sectionLabelStyle}>5.4 · Bhrigu Bindu</div>
        <h3 style={headingStyle}>{BHRIGU_BINDU_INTRO.heading}</h3>
        <p style={bodyStyle}>{BHRIGU_BINDU_INTRO.body}</p>
      </div>

      {/* ── Card 2: Calculation ── */}
      <div style={cardStyle}>
        <div style={dimLabel}>Calculation · Moon–Rahu Midpoint</div>
        <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap" as const, gap: 8, marginTop: 10 }}>
          {/* Moon */}
          <div style={planetPillStyle}>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.65)", textTransform: "uppercase" as const }}>Moon</span>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: 15, color: "rgba(255,255,255,0.9)" }}>
              {moonSign.glyph} {moonSign.name}
            </span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{moonSign.degree}</span>
          </div>

          <span style={arrowStyle}>+</span>

          {/* Rahu */}
          <div style={planetPillStyle}>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.65)", textTransform: "uppercase" as const }}>Rahu (☊)</span>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: 15, color: "rgba(255,255,255,0.9)" }}>
              {rahuSign.glyph} {rahuSign.name}
            </span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{rahuSign.degree}</span>
          </div>

          <span style={arrowStyle}>→</span>

          {/* Result */}
          <div style={{ ...planetPillStyle, border: "1px solid rgba(200,135,58,0.38)", background: "rgba(200,135,58,0.07)", flexGrow: 1 }}>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.85)", textTransform: "uppercase" as const }}>Bhrigu Bindu</span>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: 17, color: "rgba(255,220,120,0.98)" }}>
              {bbSign.glyph} {bbSign.name}
            </span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "rgba(200,135,58,0.6)" }}>
              {bbSign.degree}
              {house ? (
                <>
                  <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.4)" }}>· House {house}</span>
                  <span style={{ marginLeft: 6, color: "rgba(255,255,255,0.22)", fontSize: 10 }}>Bhav Chalit</span>
                </>
              ) : null}
            </span>
          </div>
        </div>

        {placement && (
          <div style={{ marginTop: 12, fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: 0.5 }}>
            {formatLongitudeDMS(bb.bhriguBinduLongitude)} · {placement.nakshatra} Pāda {placement.pada}
          </div>
        )}
      </div>

      {/* ── Card 3: House interpretation ── */}
      {interp && house && (
        <div style={cardStyle}>
          <div style={dimLabel}>Your Bhrigu Bindu · House {house} <span style={{ opacity: 0.5, fontSize: 9 }}>Nirayana Bhav Chalit</span></div>
          <h3 style={{ ...headingStyle, fontSize: 16, marginBottom: 10 }}>{interp.title}</h3>
          <p style={bodyStyle}>{interp.body}</p>
          <div style={divider} />
          <div style={transitNoteStyle}>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "rgba(200,135,58,0.7)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 6 }}>
              ◈ Transit Activations
            </span>
            {BHRIGU_BINDU_INTRO.transitNote}
          </div>
        </div>
      )}
    </div>
  );
}

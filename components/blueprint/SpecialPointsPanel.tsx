// STATUS: done | Task SP.16
/**
 * components/blueprint/SpecialPointsPanel.tsx
 * Full Vedic special-points table for the Life Blueprint page.
 * Shows all 4 special Lagnas + all 8 Charakarakas with their roles.
 * CORE+ users see AI-generated insight paragraphs below each row.
 */

import React from 'react'
import Link from 'next/link'
import type {
  SpecialPointsResult, SpecialPointsInsights, SignNumber, Charakaraka,
  CharakarakaResult, SthiraKarakaDeficit, SubscriptionTier,
} from '@/types'

// ─── Lookup tables ─────────────────────────────────────────────────────────

const SIGN_NAMES: Record<SignNumber, string> = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
  5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
  9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces',
}

const SIGN_GLYPHS: Record<SignNumber, string> = {
  1: '♈', 2: '♉', 3: '♊', 4: '♋', 5: '♌', 6: '♍',
  7: '♎', 8: '♏', 9: '♐', 10: '♑', 11: '♒', 12: '♓',
}

const CK_SHORT: Record<Charakaraka, string> = {
  Atmakaraka:    'AK',
  Amatyakaraka:  'AmK',
  Bhratrukaraka: 'BK',
  Matrukaraka:   'MK',
  Pitrukaraka:   'PiK',
  Putrakaraka:   'PK',
  Gnatikaraka:   'GK',
  Darakaraka:    'DK',
}

const CK_MEANING: Record<Charakaraka, string> = {
  Atmakaraka:    "Soul's core lesson",
  Amatyakaraka:  'Career & counsel',
  Bhratrukaraka: 'Siblings',
  Matrukaraka:   'Mother',
  Pitrukaraka:   'Father',
  Putrakaraka:   'Children & creativity',
  Gnatikaraka:   'Kinsmen & obstacles',
  Darakaraka:    'Spouse & partnerships',
}

// ─── Styles ────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'rgba(13,18,32,0.6)',
  border: '1px solid rgba(200,135,58,0.18)',
  borderRadius: 14,
  padding: '20px 22px',
  backdropFilter: 'blur(14px)',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  fontSize: 11,
  letterSpacing: 2.5,
  color: 'rgba(240,220,160,0.5)',
  textTransform: 'uppercase' as const,
  marginBottom: 14,
}

const tableCss: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const th: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace',
  fontSize: 9.5,
  letterSpacing: 1.5,
  color: 'rgba(200,135,58,0.55)',
  textTransform: 'uppercase' as const,
  textAlign: 'left' as const,
  paddingBottom: 8,
  paddingRight: 16,
  borderBottom: '1px solid rgba(200,135,58,0.1)',
  whiteSpace: 'nowrap' as const,
}

const tdBase: React.CSSProperties = {
  paddingTop: 8,
  paddingBottom: 8,
  paddingRight: 16,
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  verticalAlign: 'top' as const,
}

// ─── Sub-components ────────────────────────────────────────────────────────

function DegreeCell({ deg, min, sec }: { deg: number; min: number; sec: number }) {
  return (
    <span style={{
      fontFamily: 'DM Mono, monospace', fontSize: 11,
      color: 'rgba(240,220,160,0.75)',
    }}>
      {deg}°{String(min).padStart(2, '0')}′{String(sec).padStart(2, '0')}″
    </span>
  )
}

function SignCell({ sign }: { sign: SignNumber }) {
  return (
    <span>
      <span style={{ fontSize: 13, marginRight: 4 }}>{SIGN_GLYPHS[sign]}</span>
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 500,
        color: 'rgba(240,220,160,0.9)',
      }}>
        {SIGN_NAMES[sign]}
      </span>
    </span>
  )
}

// ─── Lagnas table ──────────────────────────────────────────────────────────

interface LagnaRow {
  abbr: string
  name: string
  meaning: string
  sign: SignNumber
  deg?: number   // undefined = whole-sign only (AL has no degree precision)
  min?: number
  note?: string
}

function LagnasTable({
  rows,
  insights,
}: {
  rows: LagnaRow[]
  insights?: SpecialPointsInsights['lagnas'] | null
}) {
  return (
    <table style={tableCss}>
      <thead>
        <tr>
          <th style={{ ...th, width: 40 }}>Code</th>
          <th style={th}>Lagna</th>
          <th style={th}>Meaning</th>
          <th style={th}>Sign</th>
          <th style={{ ...th, paddingRight: 0 }}>Degree</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          const insightText = insights?.[r.abbr as keyof typeof insights]
          return (
            <React.Fragment key={r.abbr}>
              <tr>
                <td style={tdBase}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 10,
                    color: 'rgba(200,135,58,0.8)', letterSpacing: 0.5,
                  }}>
                    {r.abbr}
                  </span>
                </td>
                <td style={tdBase}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 12, color: 'rgba(255,255,255,0.8)',
                  }}>
                    {r.name}
                  </span>
                  {r.note && (
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 9.5, color: 'rgba(200,135,58,0.6)',
                      marginTop: 1,
                    }}>
                      {r.note}
                    </div>
                  )}
                </td>
                <td style={tdBase}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 11, color: 'rgba(255,255,255,0.4)',
                  }}>
                    {r.meaning}
                  </span>
                </td>
                <td style={tdBase}>
                  <SignCell sign={r.sign} />
                </td>
                <td style={{ ...tdBase, paddingRight: 0 }}>
                  {r.deg !== undefined
                    ? <DegreeCell deg={r.deg} min={r.min ?? 0} sec={0} />
                    : <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>—</span>
                  }
                </td>
              </tr>
              {insightText && (
                <tr key={`${r.abbr}-insight`}>
                  <td colSpan={5} style={{ paddingBottom: 14, paddingTop: 2, paddingLeft: 4, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 12, lineHeight: 1.7,
                      color: 'rgba(240,220,160,0.72)',
                      margin: 0,
                      borderLeft: '2px solid rgba(200,135,58,0.25)',
                      paddingLeft: 10,
                    }}>
                      {insightText}
                    </p>
                  </td>
                </tr>
              )}
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Charakarakas table ────────────────────────────────────────────────────

function CharakarakasTable({
  karakas,
  deficit,
  insights,
}: {
  karakas: CharakarakaResult[]
  deficit: SthiraKarakaDeficit | null
  insights?: SpecialPointsInsights['charakarakas'] | null
}) {
  return (
    <>
      <table style={tableCss}>
        <thead>
          <tr>
            <th style={{ ...th, width: 36 }}>#</th>
            <th style={{ ...th, width: 44 }}>Code</th>
            <th style={th}>Role</th>
            <th style={th}>Meaning</th>
            <th style={th}>Planet</th>
            <th style={{ ...th, paddingRight: 0 }}>Ranking deg</th>
          </tr>
        </thead>
        <tbody>
          {karakas.map((k, i) => {
            const insightText = insights?.[k.rank as keyof typeof insights]
            return (
              <React.Fragment key={`${k.rank}-${k.planet}`}>
                <tr>
                  <td style={tdBase}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: 10,
                      color: 'rgba(255,255,255,0.25)',
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={tdBase}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: 10,
                      color: k.sharedRank ? 'rgba(232,185,106,0.9)' : 'rgba(200,135,58,0.8)',
                      letterSpacing: 0.5,
                    }}>
                      {CK_SHORT[k.rank]}
                    </span>
                  </td>
                  <td style={tdBase}>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 12, color: 'rgba(255,255,255,0.8)',
                    }}>
                      {k.rank}
                    </span>
                    {k.sharedRank && (
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 9, color: 'rgba(232,185,106,0.7)',
                        marginLeft: 4,
                      }}>
                        ★ shared
                      </span>
                    )}
                  </td>
                  <td style={tdBase}>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 11, color: 'rgba(255,255,255,0.4)',
                    }}>
                      {CK_MEANING[k.rank]}
                    </span>
                  </td>
                  <td style={tdBase}>
                    <span style={{
                      fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 500,
                      color: 'rgba(240,220,160,0.9)',
                    }}>
                      {k.planet}
                    </span>
                    {k.planet === 'Rahu' && (
                      <span style={{
                        fontFamily: 'DM Mono, monospace', fontSize: 9,
                        color: 'rgba(255,255,255,0.3)', marginLeft: 4,
                      }}>
                        ↺
                      </span>
                    )}
                  </td>
                  <td style={{ ...tdBase, paddingRight: 0 }}>
                    <DegreeCell
                      deg={k.rankingDegree}
                      min={k.rankingArcMinutes}
                      sec={k.rankingArcSeconds}
                    />
                  </td>
                </tr>
                {insightText && (
                  <tr key={`${k.rank}-insight`}>
                    <td colSpan={6} style={{ paddingBottom: 14, paddingTop: 2, paddingLeft: 4, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 12, lineHeight: 1.7,
                        color: 'rgba(240,220,160,0.72)',
                        margin: 0,
                        borderLeft: '2px solid rgba(200,135,58,0.25)',
                        paddingLeft: 10,
                      }}>
                        {insightText}
                      </p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>

      {deficit && (
        <div style={{
          marginTop: 10,
          padding: '8px 12px',
          background: 'rgba(200,135,58,0.06)',
          border: '1px solid rgba(200,135,58,0.15)',
          borderRadius: 6,
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 11,
          color: 'rgba(240,220,160,0.6)',
          lineHeight: 1.5,
        }}>
          <span style={{ color: 'rgba(200,135,58,0.8)', fontWeight: 600 }}>
            Shared-rank deficit:
          </span>{' '}
          {deficit.reason}{' '}
          <span style={{ color: 'rgba(240,220,160,0.8)' }}>
            {deficit.sthiraKaraka}
          </span>{' '}
          (Sthira Karaka) acts as significator for{' '}
          <span style={{ color: 'rgba(240,220,160,0.8)' }}>
            {deficit.missingRank}
          </span>.
        </div>
      )}
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

interface Props {
  specialPoints: SpecialPointsResult
  insights?: SpecialPointsInsights | null
  userTier?: SubscriptionTier
}

export function SpecialPointsPanel({ specialPoints, insights, userTier }: Props) {
  const { arudhaLagna, ghatiLagna, bhavaLagna, horaLagna, charakarakas } = specialPoints
  const isPaid = userTier === 'CORE' || userTier === 'VIP'

  const lagnaRows: LagnaRow[] = [
    {
      abbr:    'AL',
      name:    'Arudha Lagna',
      meaning: 'Worldly image & maya',
      sign:    arudhaLagna.arudhaSignNumber,
      // AL is whole-sign only — no degree precision in ArudhaLagnaResult
      note:    arudhaLagna.exceptionApplied === 'use_10th'
                 ? '10th-house rule applied (AL = Lagna)'
                 : arudhaLagna.exceptionApplied === 'use_4th'
                   ? '4th-house rule applied (AL = 7th)'
                   : undefined,
    },
    {
      abbr:    'GL',
      name:    'Ghati Lagna',
      meaning: 'Power & authority',
      sign:    ghatiLagna.ghatiLagnaSignNumber,
      deg:     Math.floor(ghatiLagna.ghatiLagnaDegree),
      min:     Math.round((ghatiLagna.ghatiLagnaDegree % 1) * 60),
    },
    {
      abbr:    'HL',
      name:    'Hora Lagna',
      meaning: 'Wealth & financial potential',
      sign:    horaLagna.horaLagnaSignNumber,
      deg:     Math.floor(horaLagna.horaLagnaDegree),
      min:     Math.round((horaLagna.horaLagnaDegree % 1) * 60),
    },
    {
      abbr:    'BL',
      name:    'Bhava Lagna',
      meaning: 'Body & life circumstances',
      sign:    bhavaLagna.bhavaLagnaSignNumber,
      deg:     Math.floor(bhavaLagna.bhavaLagnaDegree),
      min:     Math.round((bhavaLagna.bhavaLagnaDegree % 1) * 60),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 6 }}>

      {/* ── Section header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingLeft: 2,
      }}>
        <span style={{ color: 'rgba(200,135,58,0.6)', fontSize: 12 }}>✦</span>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1.5,
          color: 'rgba(240,220,160,0.7)',
        }}>
          Vedic Foundation Points
        </span>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 11, color: 'rgba(255,255,255,0.25)',
        }}>
          — calculated from natal chart
        </span>
      </div>

      {/* ── Lagnas card ── */}
      <div style={card}>
        <div style={sectionTitle}>Special Lagnas</div>
        <div style={{ overflowX: 'auto' }}>
          <LagnasTable rows={lagnaRows} insights={insights?.lagnas} />
        </div>
        {!isPaid && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 18px', borderRadius: 16,
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                border: '1px solid rgba(200,135,58,0.35)',
                color: '#e8b96a', textDecoration: 'none',
              }}
            >
              Unlock Vedic Soul Insights →
            </Link>
          </div>
        )}
      </div>

      {/* ── Charakarakas card ── */}
      <div style={card}>
        <div style={sectionTitle}>
          Charakarakas — Soul Role Assignments
          {charakarakas.deficit && (
            <span style={{
              marginLeft: 10,
              background: 'rgba(200,135,58,0.12)',
              border: '1px solid rgba(200,135,58,0.25)',
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 9,
              color: 'rgba(232,185,106,0.8)',
              letterSpacing: 0.5,
              textTransform: 'uppercase' as const,
            }}>
              deficit
            </span>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <CharakarakasTable
            karakas={charakarakas.karakas}
            deficit={charakarakas.deficit}
            insights={insights?.charakarakas}
          />
        </div>
        {!isPaid && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 18px', borderRadius: 16,
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                border: '1px solid rgba(200,135,58,0.35)',
                color: '#e8b96a', textDecoration: 'none',
              }}
            >
              Unlock Vedic Soul Insights →
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}

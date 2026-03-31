// STATUS: done | CHAT.6
// Builds the chart context string injected into Gemini system prompts.
// Server-only. Never expose combined context strings to the client.

import type { VedicChartCalculations } from 'openastrology-library'
import { getChartCurrentDasha } from '@/lib/astro/chartService'
import type { HDChartData, SubscriptionTier } from '@/types'

function buildHDLines(hd: HDChartData): string[] {
  const lines: string[] = ['HUMAN DESIGN:']
  if (hd.type)             lines.push(`  Type: ${hd.type}`)
  if (hd.strategy)         lines.push(`  Strategy: ${hd.strategy}`)
  if (hd.authority)        lines.push(`  Authority: ${hd.authority}`)
  if (hd.profile)          lines.push(`  Profile: ${hd.profile}`)
  if (hd.incarnationCross) lines.push(`  Incarnation Cross: ${hd.incarnationCross}`)
  if (Array.isArray(hd.definedCenters) && hd.definedCenters.length > 0)
    lines.push(`  Defined centers: ${hd.definedCenters.join(', ')}`)
  if (Array.isArray(hd.undefinedCenters) && hd.undefinedCenters.length > 0)
    lines.push(`  Undefined centers: ${hd.undefinedCenters.join(', ')}`)
  return lines
}

function buildVedicLines(vedic: VedicChartCalculations): string[] {
  const lines: string[] = ['VEDIC ASTROLOGY (Parashara system):']

  // Lagna (ascendant)
  if (vedic.ascendant?.sign) {
    const lagnaStr = vedic.ascendant.sign.charAt(0).toUpperCase() + vedic.ascendant.sign.slice(1)
    lines.push(`  Lagna (Ascendant): ${lagnaStr}`)
  }

  // Planetary placements — planets is a dict keyed by planet name
  if (vedic.planets && typeof vedic.planets === 'object') {
    lines.push('  Planetary placements:')
    for (const [planetName, pos] of Object.entries(vedic.planets)) {
      if (!pos || typeof pos !== 'object') continue
      const p = pos as { sign?: string; degree?: number; house?: number; isRetrograde?: boolean }
      const sign  = p.sign ? (p.sign.charAt(0).toUpperCase() + p.sign.slice(1)) : 'unknown'
      const deg   = p.degree !== undefined ? `${Math.round(p.degree * 100) / 100}°` : ''
      const house = p.house !== undefined ? `, House ${p.house}` : ''
      const retro = p.isRetrograde ? ' (R)' : ''
      lines.push(`    ${planetName.charAt(0).toUpperCase() + planetName.slice(1)}: ${sign}${deg ? ` ${deg}` : ''}${house}${retro}`)
    }
  }

  // Current Dasha
  try {
    const { mahaDasha, antarDasha } = getChartCurrentDasha(vedic)
    if (mahaDasha) {
      const planet = String(mahaDasha.planet)
      const start  = mahaDasha.startDate instanceof Date
        ? mahaDasha.startDate.getFullYear()
        : new Date(mahaDasha.startDate as unknown as string).getFullYear()
      const end    = mahaDasha.endDate instanceof Date
        ? mahaDasha.endDate.getFullYear()
        : new Date(mahaDasha.endDate as unknown as string).getFullYear()
      lines.push(`  Current Mahadasha: ${planet.charAt(0).toUpperCase() + planet.slice(1)} (${start}–${end})`)
    }
    if (antarDasha) {
      const planet = String(antarDasha.planet)
      lines.push(`  Current Antardasha: ${planet.charAt(0).toUpperCase() + planet.slice(1)}`)
    }
  } catch {
    // Dasha calculation may fail on partial data — continue without it
  }

  return lines
}

/**
 * Builds the system prompt context block for a given user's tier.
 *
 * FREE tier: type, strategy, authority, lagna, current dasha only.
 *            Shallow context encourages upgrade naturally.
 * CORE/VIP:  Full chart — all placements, all defined/undefined centers, full dasha.
 */
export function buildChatContext(
  tier: SubscriptionTier,
  hd: HDChartData,
  vedic: VedicChartCalculations | null
): string {
  if (tier === 'FREE') {
    const hdSummary = [
      `Human Design Type: ${hd.type ?? 'unknown'}.`,
      `Strategy: ${hd.strategy ?? 'unknown'}.`,
      `Authority: ${hd.authority ?? 'unknown'}.`,
    ].join(' ')

    let vedicSummary = 'Vedic chart is still being calculated.'
    if (vedic) {
      const lagnaStr = vedic.ascendant?.sign
        ? vedic.ascendant.sign.charAt(0).toUpperCase() + vedic.ascendant.sign.slice(1)
        : 'unknown'
      let dashaStr = ''
      try {
        const { mahaDasha } = getChartCurrentDasha(vedic)
        if (mahaDasha) {
          const planet = String(mahaDasha.planet)
          dashaStr = ` Current Mahadasha: ${planet.charAt(0).toUpperCase() + planet.slice(1)}.`
        }
      } catch { /* ignore */ }
      vedicSummary = `Lagna: ${lagnaStr}.${dashaStr}`
    }

    return [
      'USER CHART CONTEXT (partial — free tier):',
      hdSummary,
      vedicSummary,
      '',
      'INSTRUCTION: You have limited chart data for this user. Answer what you can.',
      'When the question requires deeper chart analysis, respond with what you know,',
      'then end naturally with: "Your full Life Blueprint goes much deeper on this —',
      'it includes [specific relevant section]." Do not say "free tier" or "upgrade".',
    ].join('\n')
  }

  // Premium (CORE / VIP): full context
  const hdLines    = buildHDLines(hd)
  const vedicLines = vedic ? buildVedicLines(vedic) : ['VEDIC ASTROLOGY: still calculating.']

  return [
    'USER CHART CONTEXT (complete):',
    ...vedicLines,
    '',
    ...hdLines,
  ].join('\n')
}

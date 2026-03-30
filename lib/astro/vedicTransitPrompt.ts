// STATUS: done | Task OA.13
/**
 * Formats today's sidereal transit chart (VedicChartCalculations) for LLM prompts.
 */
import type { VedicChartCalculations } from 'openastrology-library'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatVedicTransitSummary(transit: VedicChartCalculations): string {
  const lines: string[] = [
    "Today's sidereal snapshot (transit chart):",
    `Sun in ${transit.planets.sun.sign} ${transit.planets.sun.degreeDMSFormatted}`,
    `Moon in ${transit.planets.moon.sign} ${transit.planets.moon.degreeDMSFormatted} (${transit.planets.moon.nakshatra})`,
  ]
  for (const [key, p] of Object.entries(transit.planets)) {
    if (key === 'sun' || key === 'moon') continue
    lines.push(`  ${capitalize(key)} in ${p.sign}${p.isRetrograde ? ' (R)' : ''}`)
  }
  return lines.join('\n')
}

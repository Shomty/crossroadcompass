// STATUS: done | Task YG.8
/**
 * Runs all Parashara yoga detectors, applies dasha tagging, dedupes, summary stats.
 */

import type { YogaCategory, YogaChartInput, YogaDetectionResult, YogaResult } from '@/types'
import { calculateAllGrahaDrishtis } from '@/lib/astro/yoga/grahaDrishti'
import { detectNabhashaYogas } from '@/lib/astro/yoga/nabhasha'
import { detectMahapurushaYogas } from '@/lib/astro/yoga/mahapurusha'
import { detectLunarYogas, detectSolarYogas } from '@/lib/astro/yoga/lunarSolar'
import {
  detectNeechabhangaRajYoga,
  detectViparitaRajYoga,
  detectMahaRajYogaParivartana,
  detectYogaKaraka,
} from '@/lib/astro/yoga/neechabhangaViparita'
import { detectAuspiciousYogas } from '@/lib/astro/yoga/auspicious'
import {
  detectRajYogas,
  detectDhanaYogas,
  detectDaridraYogas,
} from '@/lib/astro/yoga/rajDhanaDaridra'

export function normalizeDashaLord(p: string | undefined): import('@/types').PlanetName | undefined {
  if (p == null || p === '') return undefined
  const m: Record<string, import('@/types').PlanetName> = {
    sun: 'Sun',
    moon: 'Moon',
    mars: 'Mars',
    mercury: 'Mercury',
    jupiter: 'Jupiter',
    venus: 'Venus',
    saturn: 'Saturn',
    rahu: 'Rahu',
    ketu: 'Ketu',
  }
  return m[p.toLowerCase()]
}

export function detectAllYogas(
  input: YogaChartInput,
  currentMahadasha?: import('@/types').PlanetName,
  currentAntardasha?: import('@/types').PlanetName
): YogaDetectionResult {
  const { lagnaSignNumber: lagnaSign, planets } = input

  const allDrishtis = calculateAllGrahaDrishtis(planets)

  const allYogas: YogaResult[] = [
    ...detectNabhashaYogas(planets, lagnaSign),
    ...detectMahapurushaYogas(planets, lagnaSign),
    ...detectLunarYogas(planets, lagnaSign),
    ...detectSolarYogas(planets, lagnaSign),
    ...detectRajYogas(planets, lagnaSign, allDrishtis),
    ...detectMahaRajYogaParivartana(planets, lagnaSign),
    ...detectYogaKaraka(planets, lagnaSign),
    ...detectDhanaYogas(planets, lagnaSign),
    ...detectDaridraYogas(planets, lagnaSign),
    ...detectNeechabhangaRajYoga(planets, lagnaSign),
    ...detectViparitaRajYoga(planets, lagnaSign),
    ...detectAuspiciousYogas(planets, lagnaSign, allDrishtis),
  ]

  const dashaLords = [currentMahadasha, currentAntardasha].filter(Boolean) as import('@/types').PlanetName[]
  const taggedYogas = allYogas.map((y) => ({
    ...y,
    dashaActivated: dashaLords.some((lord) => y.planetsInvolved.includes(lord)),
  }))

  const seen = new Set<string>()
  const unique = taggedYogas.filter((y) => {
    if (seen.has(y.name)) return false
    seen.add(y.name)
    return true
  })

  const activeYogas = unique.filter((y) => y.isActive)
  const strongYogas = unique.filter((y) => y.strength === 'strong')

  const catCount = activeYogas.reduce<Record<string, number>>((acc, y) => {
    acc[y.category] = (acc[y.category] ?? 0) + 1
    return acc
  }, {})
  const dominantCategory = (
    Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'other'
  ) as YogaCategory

  return {
    yogas: unique,
    activeCount: activeYogas.length,
    strongCount: strongYogas.length,
    dominantCategory,
    detectedAt: new Date().toISOString(),
  }
}

// Sanity checks — verify mentally before marking tasks done:
//
// NABHASHA: movable signs only → Rajju; all in Kendras spread → Kamal when 1,4,7,10 occupied;
//   7 signs → Veena; 1 sign → Gola; houses 1–7 continuous → Nauka.
// MAHAPURUSHA: Jupiter exalted Cancer + Kendra from Lagna → Hamsa; same in 3rd → not Hamsa.
// LUNAR: 2nd+12th from Moon occupied → Duradhara; Kemadruma = empty 2/12 from Moon + no graha in Kendras from Lagna.
// SOLAR: both sides Sun → Ubhayachari.
// NEECHABHANGA: debilitated Sun Libra + Saturn (lord) in Kendra → yes.
// VIPARITA: 8th lord in 12th (not own 8) → Sarala; 8th lord in 8th → not Viparita.
// GAJ KESARI: Jupiter Kendra from Moon, not debil, not combust → active.

// STATUS: done | Task YG.2–YG.7
/**
 * House sets and natural benefic/malefic lists for Parashara yoga rules.
 */

import type { PlanetName } from '@/types'

export const KENDRA_HOUSES = [1, 4, 7, 10] as const
export const KONA_HOUSES = [1, 5, 9] as const
export const TRIKA_HOUSES = [6, 8, 12] as const
export const UPACHAYA_HOUSES = [3, 6, 10, 11] as const
export const APOKLIMA_HOUSES = [3, 6, 9, 12] as const
export const PANAPHAR_HOUSES = [2, 5, 8, 11] as const

/** BPHS Nabhasha Maal/Sarpa — natural only; Mercury treated as benefic here */
export const NATURAL_BENEFICS: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon']

export const NATURAL_MALEFICS: PlanetName[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']

export const NABHASHA_PLANETS: PlanetName[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
]

// STATUS: done | Task YG.2
/** Whole-sign house from D1 lagna (1–12). */
import type { SignNumber } from '@/types'

export function signToHouse(signNumber: SignNumber, lagnaSign: SignNumber): number {
  return ((signNumber - lagnaSign + 12) % 12) + 1
}

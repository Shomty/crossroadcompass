// STATUS: done | Task YG.6
import type { SignNumber } from '@/types'

const NAMES: Record<SignNumber, string> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
}

export function getSignName(sign: SignNumber): string {
  return NAMES[sign]
}

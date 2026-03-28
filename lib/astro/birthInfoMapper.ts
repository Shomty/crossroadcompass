// STATUS: done | Task OA.4
/**
 * lib/astro/birthInfoMapper.ts
 * Maps a Prisma BirthProfile to the BirthInfo shape expected by openastrology-library.
 */

import type { BirthProfile } from '@prisma/client'
import type { BirthInfo } from 'openastrology-library'

export function prismaProfileToBirthInfo(profile: BirthProfile): BirthInfo {
  const hour   = profile.birthTimeKnown ? (profile.birthHour   ?? 12) : 12
  const minute = profile.birthTimeKnown ? (profile.birthMinute ?? 0)  : 0
  const timeOfBirth = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  const genderMap: Record<string, 'male' | 'female'> = { male: 'male', female: 'female' }
  const gender = genderMap[profile.gender ?? ''] as 'male' | 'female' | undefined

  const d = new Date(profile.birthDate)
  const dateOfBirth = [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-')

  return {
    name: profile.birthName,
    dateOfBirth,
    timeOfBirth,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
    gender,
  }
}

export function isBirthTimeKnown(profile: BirthProfile): boolean {
  return profile.birthTimeKnown === true
}

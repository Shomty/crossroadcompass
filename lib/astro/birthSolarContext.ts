// STATUS: done | Special Points V2 — [GL-1] local solar day in birth IANA timezone
/**
 * Birth instant vs sunrise/sunset using SunCalc on the profile’s local civil date.
 * Avoids `fromZonedTime(new Date(y,m,d,h,mi))` (server-local interpretation).
 */

import SunCalc from 'suncalc'
import { toDate } from 'date-fns-tz'

export interface BirthSolarContext {
  birthUtc: Date
  sunriseUtc: Date
  sunsetUtc: Date
  isDayBirth: boolean
  daytimeDurationMinutes: number
  /** JavaScript convention: 0 = Sunday … 6 = Saturday (birth instant in timezone). */
  dayOfWeek: number
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Wall-time ISO fragment interpreted in `timeZone` → UTC instant (date-fns-tz). */
function zonedWallToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const iso = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00`
  return toDate(iso, { timeZone })
}

const SHORT_WEEKDAY_TO_JS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/**
 * @param birthYear, birthMonth, birthDay — calendar date as stored with profile (same source as chart)
 * @param birthHour, birthMinute — wall clock in `timezoneIana` when time known; noon used only for date if needed
 */
export function computeBirthSolarContext(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  birthMinute: number,
  latitude: number,
  longitude: number,
  timezoneIana: string
): BirthSolarContext | null {
  const birthUtc = zonedWallToUtc(birthYear, birthMonth, birthDay, birthHour, birthMinute, timezoneIana)
  if (Number.isNaN(birthUtc.getTime())) return null

  const noonUtc = zonedWallToUtc(birthYear, birthMonth, birthDay, 12, 0, timezoneIana)
  if (Number.isNaN(noonUtc.getTime())) return null

  const times = SunCalc.getTimes(noonUtc, latitude, longitude)
  const sunrise = times.sunrise
  const sunset = times.sunset
  if (
    !sunrise ||
    !sunset ||
    Number.isNaN(sunrise.getTime()) ||
    Number.isNaN(sunset.getTime())
  ) {
    return null
  }

  const daytimeMs = sunset.getTime() - sunrise.getTime()
  const daytimeDurationMinutes = daytimeMs / 60000
  if (daytimeDurationMinutes <= 0) return null

  const t = birthUtc.getTime()
  const isDayBirth = t >= sunrise.getTime() && t < sunset.getTime()

  const wdStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: timezoneIana,
  }).format(birthUtc)
  const dayOfWeek = SHORT_WEEKDAY_TO_JS[wdStr]
  if (dayOfWeek === undefined) return null

  return {
    birthUtc,
    sunriseUtc: sunrise,
    sunsetUtc: sunset,
    isDayBirth,
    daytimeDurationMinutes,
    dayOfWeek,
  }
}

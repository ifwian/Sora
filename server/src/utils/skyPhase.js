/**
 * Sky palette phases — the server-side twin of client/src/utils/sky.js.
 * Used to tell the assistant what time of day it is for the user.
 */
export const SKY_PHASES = ['dawn', 'day', 'dusk', 'night']

export function skyPhaseForHour(hour) {
  if (hour >= 5 && hour < 9) return 'dawn'
  if (hour >= 9 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

/** The phase at `date` in `timeZone`. Returns null when the zone is unknown. */
export function skyPhaseAt(date, timeZone) {
  if (!timeZone || timeZone === 'system') return null
  try {
    const part = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone })
      .formatToParts(date)
      .find((entry) => entry.type === 'hour')
    if (!part) return null
    return skyPhaseForHour(Number(part.value) % 24)
  } catch {
    return null
  }
}

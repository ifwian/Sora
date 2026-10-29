/**
 * Sky palette phases. Kept in step with server/src/utils/skyPhase.js — the same
 * hour boundaries — because the assistant also describes the time of day.
 */
export const SKY_PHASES = ['dawn', 'day', 'dusk', 'night']

/** The phase for a local hour (0–23). Dawn 5–8, day 9–16, dusk 17–19, night 20–4. */
export function skyPhaseForHour(hour) {
  if (hour >= 5 && hour < 9) return 'dawn'
  if (hour >= 9 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

/** The hour in a specific IANA time zone ('system' uses this device). */
export function hourInZone(date, timeZone = 'system') {
  if (!timeZone || timeZone === 'system') return date.getHours()
  try {
    const part = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone })
      .formatToParts(date)
      .find((entry) => entry.type === 'hour')
    return Number(part?.value ?? date.getHours()) % 24
  } catch {
    // Unknown time zone: fall back to the device rather than breaking the app.
    return date.getHours()
  }
}

/** The sky phase at a moment, in the chosen time zone. */
export function skyPhaseAt(date = new Date(), timeZone = 'system') {
  return skyPhaseForHour(hourInZone(date, timeZone))
}

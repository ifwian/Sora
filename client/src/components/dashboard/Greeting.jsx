import { useAuth } from '../../hooks/useAuth'
import { usePreferences } from '../../hooks/usePreferences'
import { hourInZone, skyPhaseAt } from '../../utils/sky'

function greetingFor(phase, hour) {
  if (phase === 'dawn') return 'Good morning'
  if (phase === 'day') return hour < 12 ? 'Good morning' : 'Good afternoon'
  if (phase === 'dusk') return 'Good evening'
  return 'Winding down'
}

/**
 * Greeting — a sky-aware hello and today's date in the account's time zone.
 */
export function Greeting() {
  const { user } = useAuth()
  const { preferences } = usePreferences()
  const now = new Date()
  const timeZone = preferences.timezone === 'system' ? undefined : preferences.timezone

  const phase = skyPhaseAt(now, preferences.timezone)
  const greeting = greetingFor(phase, hourInZone(now, preferences.timezone))
  const name = user?.name?.trim().split(/\s+/)[0] || 'there'
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  }).format(now)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting}, {name}.
      </h1>
      <p className="text-sm text-muted mt-1">{dateLabel}</p>
    </div>
  )
}

import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useEvents } from '../../hooks/useEvents'
import { eventBadgeVariant } from '../../constants/eventOptions'
import { formatShortDate, formatTime, todayISO } from '../../utils/date'

/**
 * UpcomingWidget — upcoming events, reading from the real EventsContext
 * (connected in Milestone 12).
 */
export function UpcomingWidget() {
  const { events, loading } = useEvents()

  if (loading) {
    return (
      <Card>
        <WidgetHeader title="Upcoming" viewAllHref="/calendar" />
        <LoadingState label="Loading events..." />
      </Card>
    )
  }

  const today = todayISO()
  const upcoming = [...events]
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))
    .slice(0, 5)

  if (upcoming.length === 0) {
    return (
      <Card>
        <WidgetHeader title="Upcoming" viewAllHref="/calendar" />
        <p className="text-sm text-muted">Nothing on the horizon.</p>
      </Card>
    )
  }

  return (
    <Card>
      <WidgetHeader title="Upcoming" viewAllHref="/calendar" />
      <ul className="flex flex-col gap-3">
        {upcoming.map((event) => (
          <li key={event.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{event.title}</p>
              <p className="text-xs text-muted mt-0.5">
                {event.date === today ? 'Today' : formatShortDate(event.date)}
                {event.startTime ? ` · ${formatTime(event.startTime)}` : ''}
              </p>
            </div>
            <Badge variant={eventBadgeVariant(event.category)} className="shrink-0">
              {event.category}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

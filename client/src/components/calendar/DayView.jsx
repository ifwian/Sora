import { MapPin, CheckSquare } from 'lucide-react'
import { Card } from '../common/Card'
import { EmptyState } from '../common/EmptyState'
import { Badge } from '../common/Badge'
import { getItemsForDate } from '../../utils/calendarItems'
import { eventBadgeVariant } from '../../constants/eventOptions'
import { formatTime } from '../../utils/date'

/**
 * DayView — full detail agenda for a single day.
 */
export function DayView({ anchorDate, events, tasks, onCreate, onItemClick }) {
  const items = getItemsForDate(events, tasks, anchorDate)

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nothing scheduled."
          description="Create an event for this day."
          actionLabel="New event"
          onAction={onCreate}
        />
      </Card>
    )
  }

  return (
    <Card padding="none">
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const isTask = item.kind === 'task'
          return (
            <li key={`${item.kind}-${item.data.id}`}>
              <button
                type="button"
                onClick={!isTask ? () => onItemClick(item.data) : undefined}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left ${
                  isTask ? 'cursor-default' : 'hover:bg-surface-hover'
                }`}
              >
                <div className="w-16 shrink-0 text-xs text-muted pt-0.5">
                  {formatTime(item.time) ?? 'All day'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">{item.data.title}</span>
                    {isTask ? (
                      <Badge variant="default">
                        <CheckSquare size={11} className="mr-1" />
                        Task
                      </Badge>
                    ) : (
                      <Badge variant={eventBadgeVariant(item.data.category)}>{item.data.category}</Badge>
                    )}
                  </div>
                  {!isTask && item.data.location && (
                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <MapPin size={11} />
                      {item.data.location}
                    </p>
                  )}
                  {!isTask && item.data.description && (
                    <p className="text-xs text-muted mt-1">{item.data.description}</p>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

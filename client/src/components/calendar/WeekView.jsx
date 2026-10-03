import { getWeekDates, formatDayLabel, isToday } from '../../utils/calendar'
import { getItemsForDate } from '../../utils/calendarItems'
import { AgendaItem } from './AgendaItem'
import { cn } from '../../utils/cn'

/**
 * WeekView — 7 columns, each an agenda of that day's events + task deadlines.
 */
export function WeekView({ anchorDate, events, tasks, onDayClick, onItemClick }) {
  const dates = getWeekDates(anchorDate)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 border border-border rounded-md overflow-hidden">
      {dates.map((isoDate) => {
        const items = getItemsForDate(events, tasks, isoDate)
        return (
          <div key={isoDate} className="border-b sm:border-b-0 sm:border-r border-border last:border-0 flex flex-col">
            <button
              type="button"
              onClick={() => onDayClick(isoDate)}
              className="px-2 py-2 border-b border-border text-left hover:bg-surface-hover"
            >
              <span className={cn('text-xs font-medium', isToday(isoDate) ? 'text-accent' : 'text-muted')}>
                {formatDayLabel(isoDate)}
              </span>
            </button>
            <div className="flex flex-col gap-0.5 p-1.5 min-h-24">
              {items.length === 0 ? (
                <span className="text-xs text-muted px-1.5 py-1">—</span>
              ) : (
                items.map((item) => (
                  <AgendaItem key={`${item.kind}-${item.data.id}`} item={item} onClick={onItemClick} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

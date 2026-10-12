import { formatDayLabel, getMonthGrid, isSameMonth, isToday } from '../../utils/calendar'
import { getItemsForDate } from '../../utils/calendarItems'
import { AgendaItem } from './AgendaItem'
import { cn } from '../../utils/cn'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE = 3

/**
 * MonthView — 6x7 grid. Click empty space in a cell to create an event
 * on that date; click an item to edit it.
 */
export function MonthView({ anchorDate, events, tasks, onDayClick, onItemClick }) {
  const dates = getMonthGrid(anchorDate)

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-surface">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2 text-xs font-medium text-muted text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dates.map((isoDate) => {
          const items = getItemsForDate(events, tasks, isoDate)
          const visible = items.slice(0, MAX_VISIBLE)
          const overflow = items.length - visible.length
          const inMonth = isSameMonth(isoDate, anchorDate)

          return (
            <div
              key={isoDate}
              onClick={() => onDayClick(isoDate)}
              className={cn(
                'min-h-24 border-b border-r border-border p-1.5 text-left flex flex-col gap-1 last:border-r-0 cursor-pointer hover:bg-surface-hover/50',
                !inMonth && 'bg-background/50'
              )}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onDayClick(isoDate)
                }}
                aria-label={`Open ${formatDayLabel(isoDate, { weekday: 'long', month: 'long', day: 'numeric' })}`}
                className={cn(
                  'self-start text-xs h-5 w-5 flex items-center justify-center rounded-full',
                  isToday(isoDate)
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : inMonth
                      ? 'text-foreground'
                      : 'text-muted'
                )}
              >
                {Number(isoDate.slice(8, 10))}
              </button>
              <div className="flex flex-col gap-0.5">
                {visible.map((item) => (
                  <AgendaItem
                    key={`${item.kind}-${item.data.id}`}
                    item={item}
                    compact
                    onClick={onItemClick}
                  />
                ))}
                {overflow > 0 && <span className="text-xs text-muted px-1.5">+{overflow} more</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

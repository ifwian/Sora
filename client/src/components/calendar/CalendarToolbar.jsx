import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '../common/Button'
import { Tabs } from '../common/Tabs'

const VIEW_OPTIONS = [
  { value: 'MONTH', label: 'Month' },
  { value: 'WEEK', label: 'Week' },
  { value: 'DAY', label: 'Day' },
]

/**
 * CalendarToolbar — view switcher, prev/next/today navigation, period
 * label, and the "New event" action.
 */
export function CalendarToolbar({ view, onViewChange, periodLabel, onPrev, onNext, onToday, onCreate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous period"
            className="text-muted hover:text-foreground rounded-sm p-1.5"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next period"
            className="text-muted hover:text-foreground rounded-sm p-1.5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <h2 className="text-base font-semibold text-foreground min-w-40">{periodLabel}</h2>
        <Button variant="ghost" size="sm" onClick={onToday}>
          Today
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Tabs options={VIEW_OPTIONS} value={view} onChange={onViewChange} />
        <Button size="sm" onClick={onCreate}>
          <Plus size={14} />
          New event
        </Button>
      </div>
    </div>
  )
}

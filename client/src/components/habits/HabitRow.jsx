import { Flame, Pencil, Trash2 } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { calculateStreak, lastNDays, completionRate } from '../../utils/habitUtils'
import { formatDayLabel } from '../../utils/calendar'
import { cn } from '../../utils/cn'

/**
 * HabitRow — one habit with its streak, a clickable 7-day strip (tap a
 * day to toggle it), and this week's completion rate.
 */
export function HabitRow({ habit, onToggle, onEdit, onDelete }) {
  const done = new Set(habit.completedDates)
  const days = lastNDays(7)
  const streak = calculateStreak(habit.completedDates)

  return (
    <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{habit.name}</span>
          {habit.category && <Badge variant="default">{habit.category}</Badge>}
        </div>
        <p className="flex items-center gap-1 text-xs text-muted mt-1">
          <Flame size={12} className={streak > 0 ? 'text-warning' : undefined} />
          {streak} day streak · {completionRate(habit.completedDates, 7)}% this week
        </p>
      </div>

      <div className="flex items-center gap-1.5" role="group" aria-label={`Last 7 days for ${habit.name}`}>
        {days.map((date) => {
          const isDone = done.has(date)
          return (
            <button
              key={date}
              type="button"
              onClick={() => onToggle(habit.id, date)}
              aria-pressed={isDone}
              aria-label={`${formatDayLabel(date)} — ${isDone ? 'done' : 'not done'}`}
              title={formatDayLabel(date)}
              className={cn(
                'h-7 w-7 rounded-sm border text-xs transition-colors duration-150',
                isDone
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-surface border-control text-muted hover:border-accent'
              )}
            >
              {Number(date.slice(8, 10))}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(habit)}
          aria-label={`Edit "${habit.name}"`}
          className="text-muted hover:text-foreground rounded-sm p-1.5"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(habit)}
          aria-label={`Delete "${habit.name}"`}
          className="text-muted hover:text-danger rounded-sm p-1.5"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  )
}

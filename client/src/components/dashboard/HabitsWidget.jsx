import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { Card } from '../common/Card'
import { Checkbox } from '../common/Checkbox'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useHabits } from '../../hooks/useHabits'
import { calculateStreak } from '../../utils/habitUtils'
import { todayISO } from '../../utils/date'
import { cn } from '../../utils/cn'

/** HabitsWidget — today's habit checklist with streaks, from the real HabitsContext. */
export function HabitsWidget() {
  const { habits, loading, toggleCompletion } = useHabits()
  const today = todayISO()

  if (loading) {
    return (
      <Card>
        <WidgetHeader title="Habits" viewAllHref="/habits" />
        <LoadingState label="Loading habits..." />
      </Card>
    )
  }

  if (habits.length === 0) {
    return (
      <Card>
        <WidgetHeader title="Habits" viewAllHref="/habits" />
        <p className="text-sm text-muted">No habits yet.</p>
      </Card>
    )
  }

  const doneCount = habits.filter((h) => h.completedDates.includes(today)).length

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Habits</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {doneCount}/{habits.length} today
          </span>
          <Link to="/habits" className="text-xs text-muted hover:text-accent transition-colors">
            View all
          </Link>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {habits.map((habit) => {
          const doneToday = habit.completedDates.includes(today)
          const streak = calculateStreak(habit.completedDates)
          return (
            <li key={habit.id} className="flex items-center gap-3">
              <Checkbox
                checked={doneToday}
                onChange={() => toggleCompletion(habit.id, today)}
                label={`Mark "${habit.name}" as ${doneToday ? 'not done' : 'done'} today`}
              />
              <span className={cn('flex-1 text-sm text-foreground truncate', doneToday && 'text-muted')}>
                {habit.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted shrink-0">
                <Flame size={13} className={streak > 0 ? 'text-warning' : undefined} />
                {streak}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { Card } from '../common/Card'
import { Checkbox } from '../common/Checkbox'
import { cn } from '../../utils/cn'

/**
 * HabitsWidget — today's habit checklist with streaks.
 * Toggling is local/in-memory only until Milestone 14 connects real habits.
 */
export function HabitsWidget({ habits }) {
  const [localHabits, setLocalHabits] = useState(habits)

  const toggleHabit = (id) => {
    setLocalHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, doneToday: !habit.doneToday } : habit
      )
    )
  }

  const doneCount = localHabits.filter((habit) => habit.doneToday).length

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Habits</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {doneCount}/{localHabits.length} today
          </span>
          <Link to="/habits" className="text-xs text-muted hover:text-accent transition-colors">
            View all
          </Link>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {localHabits.map((habit) => (
          <li key={habit.id} className="flex items-center gap-3">
            <Checkbox
              checked={habit.doneToday}
              onChange={() => toggleHabit(habit.id)}
              label={`Mark "${habit.name}" as ${habit.doneToday ? 'not done' : 'done'} today`}
            />
            <span
              className={cn(
                'flex-1 text-sm text-foreground truncate',
                habit.doneToday && 'text-muted'
              )}
            >
              {habit.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted shrink-0">
              <Flame size={13} className={habit.streak > 0 ? 'text-warning' : undefined} />
              {habit.streak}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

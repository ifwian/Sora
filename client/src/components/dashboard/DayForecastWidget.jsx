import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { useTasks } from '../../hooks/useTasks'
import { useEvents } from '../../hooks/useEvents'
import { useHabits } from '../../hooks/useHabits'
import { usePreferences } from '../../hooks/usePreferences'
import { todayISO } from '../../utils/date'
import { skyPhaseAt } from '../../utils/sky'

const COPY = {
  dawn: { emoji: '🌅', title: 'A soft start', line: 'The morning is still quiet. Begin with one small thing.' },
  day: { emoji: '☀️', title: 'The day, in view', line: 'A calm look at what is left before the evening.' },
  dusk: { emoji: '🌇', title: 'Settling into evening', line: 'The light is changing. Finish gently, then rest.' },
  night: { emoji: '🌙', title: 'A quiet close', line: 'Most of the day is behind you. Keep tonight light.' },
}

/** DayForecastWidget — a gentle summary of the day, shaped by the Sky phase. */
export function DayForecastWidget() {
  const { tasks } = useTasks()
  const { events } = useEvents()
  const { habits } = useHabits()
  const { preferences } = usePreferences()

  const today = todayISO(preferences.timezone)
  const phase = skyPhaseAt(new Date(), preferences.timezone)
  const copy = COPY[phase] ?? COPY.day

  const dueToday = tasks.filter((task) => task.status !== 'COMPLETED' && task.dueDate === today).length
  const todayEvents = events.filter((event) => event.date === today).length
  const habitsLeft = habits.filter((habit) => !habit.completedDates.includes(today)).length
  const nothing = dueToday + todayEvents + habitsLeft === 0

  const stats = [
    { to: '/tasks', value: dueToday, label: dueToday === 1 ? 'task' : 'tasks' },
    { to: '/calendar', value: todayEvents, label: todayEvents === 1 ? 'event' : 'events' },
    { to: '/habits', value: habitsLeft, label: habitsLeft === 1 ? 'habit left' : 'habits left' },
  ]

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Day forecast</p>
          <h3 className="text-base font-semibold text-foreground mt-1">{copy.title}</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            {nothing ? 'A wide-open day. Nothing needs you right now.' : copy.line}
          </p>
        </div>
        <span aria-hidden="true" className="text-3xl leading-none">
          {copy.emoji}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <Link
            key={stat.to}
            to={stat.to}
            className="rounded-sm border border-border bg-background/60 px-2 py-2 text-center transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="block text-lg font-semibold text-foreground">{stat.value}</span>
            <span className="block text-[11px] text-muted leading-tight">{stat.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

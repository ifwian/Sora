import { useMemo, useState } from 'react'
import { Card } from '../components/common/Card'
import { Tabs } from '../components/common/Tabs'
import { BarChart } from '../components/common/BarChart'
import { ProgressBar } from '../components/common/ProgressBar'
import { LoadingState } from '../components/common/LoadingState'
import { useTasks } from '../hooks/useTasks'
import { useStudy } from '../hooks/useStudy'
import { useHabits } from '../hooks/useHabits'
import { useFinance } from '../hooks/useFinance'
import { useLibrary } from '../hooks/useLibrary'
import { useGoals } from '../hooks/useGoals'
import { buildAnalytics } from '../utils/analytics'
import { formatMoney } from '../utils/financeUtils'
import { formatHours } from '../utils/studyUtils'
import { todayISO } from '../utils/date'

const PERIODS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

function Stat({ label, value, hint }) {
  return (
    <Card padding="sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
      {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
    </Card>
  )
}

export function AnalyticsPage() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { sessions } = useStudy()
  const { habits } = useHabits()
  const { expenses } = useFinance()
  const { books, games, movies } = useLibrary()
  const { goals } = useGoals()
  const [periodDays, setPeriodDays] = useState(30)

  const loading = tasksLoading || sessions.loading || expenses.loading || books.loading
  const today = todayISO()

  const stats = useMemo(
    () =>
      buildAnalytics({
        today,
        periodDays,
        tasks,
        sessions: sessions.items,
        habits,
        expenses: expenses.items,
        books: books.items,
        games: games.items,
        movies: movies.items,
        goals,
      }),
    [today, periodDays, tasks, sessions.items, habits, expenses.items, books.items, games.items, movies.items, goals]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <Tabs options={PERIODS} value={periodDays} onChange={setPeriodDays} />
      </div>

      {loading ? (
        <LoadingState label="Crunching your numbers..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Tasks completed" value={stats.tasksCompleted} hint={`last ${periodDays} days`} />
            <Stat label="Study time" value={formatHours(stats.studyMinutes)} hint={`last ${periodDays} days`} />
            <Stat
              label="Habit completion"
              value={stats.habitRate === null ? '—' : `${stats.habitRate}%`}
              hint={stats.habitRate === null ? 'No habits yet' : `last ${periodDays} days`}
            />
            <Stat label="Spent" value={formatMoney(stats.spent)} hint={`last ${periodDays} days`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h2 className="text-sm font-semibold mb-4">Tasks completed</h2>
              <BarChart data={stats.taskSeries} ariaLabel="Tasks completed per period" />
            </Card>
            <Card>
              <h2 className="text-sm font-semibold mb-4">Study hours</h2>
              <BarChart
                data={stats.studySeries}
                ariaLabel="Study hours per period"
                formatValue={(v) => `${v.toFixed(1)}h`}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h2 className="text-sm font-semibold mb-3">Where the money went</h2>
              {stats.topCategories.length === 0 ? (
                <p className="text-sm text-muted">No expenses in this period.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {stats.topCategories.map(({ category, total }) => (
                    <li key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span className="text-muted">{formatMoney(total)}</span>
                      </div>
                      <ProgressBar value={stats.spent === 0 ? 0 : (total / stats.spent) * 100} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="text-sm font-semibold mb-3">All-time</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted">Books finished</dt>
                <dd className="text-right">{stats.booksCompleted}</dd>
                <dt className="text-muted">Currently reading</dt>
                <dd className="text-right">{stats.booksReading}</dd>
                <dt className="text-muted">Games completed</dt>
                <dd className="text-right">{stats.gamesCompleted}</dd>
                <dt className="text-muted">Movies &amp; series watched</dt>
                <dd className="text-right">{stats.moviesCompleted}</dd>
                <dt className="text-muted">Goals achieved</dt>
                <dd className="text-right">{stats.goalsAchieved}</dd>
                <dt className="text-muted">Goals in progress</dt>
                <dd className="text-right">{stats.goalsActive}</dd>
              </dl>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Card } from '../components/common/Card'
import { Greeting } from '../components/dashboard/Greeting'
import { QuickActions } from '../components/dashboard/QuickActions'
import { DayForecastWidget } from '../components/dashboard/DayForecastWidget'
import { MoodWidget } from '../components/dashboard/MoodWidget'
import { TasksWidget } from '../components/dashboard/TasksWidget'
import { UpcomingWidget } from '../components/dashboard/UpcomingWidget'
import { HabitsWidget } from '../components/dashboard/HabitsWidget'
import { GoalsWidget } from '../components/dashboard/GoalsWidget'
import { RecentNotesWidget } from '../components/dashboard/RecentNotesWidget'
import { StudyWidget } from '../components/dashboard/StudyWidget'
import { FinanceWidget } from '../components/dashboard/FinanceWidget'
import { usePreferences } from '../hooks/usePreferences'
import { dashboardWidgetsFor, FOCUS_MODES } from '../constants/preferences'

const RENDERERS = {
  tasks: TasksWidget,
  forecast: DayForecastWidget,
  upcoming: UpcomingWidget,
  habits: HabitsWidget,
  goals: GoalsWidget,
  notes: RecentNotesWidget,
  study: StudyWidget,
  finance: FinanceWidget,
}

function FocusNote({ focusMode }) {
  const mode = FOCUS_MODES.find((item) => item.id === focusMode)
  if (!mode || mode.id === 'none') return null

  return (
    <Card padding="sm" className="flex flex-wrap items-center justify-between gap-2 bg-accent/5">
      <p className="text-sm text-foreground">
        <span aria-hidden="true" className="mr-2">
          {mode.emoji}
        </span>
        <span className="font-medium">{mode.label} mode</span>
        <span className="text-muted"> — {mode.blurb.toLowerCase()}.</span>
      </p>
      <Link
        to="/settings"
        className="text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      >
        Change focus
      </Link>
    </Card>
  )
}

export function DashboardPage() {
  const { preferences } = usePreferences()
  const widgetIds = dashboardWidgetsFor(preferences)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <Greeting />
        <MoodWidget />
        <QuickActions />
      </div>

      <FocusNote focusMode={preferences.focusMode} />

      {widgetIds.length === 0 ? (
        <Card className="text-sm text-muted">
          Nothing is showing right now.{' '}
          <Link to="/settings" className="text-accent hover:underline">
            Choose a few widgets in Settings
          </Link>
          , or clear the current focus mode.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {widgetIds.map((id) => {
            const Widget = RENDERERS[id]
            if (!Widget) return null
            return (
              <div key={id} className={id === 'tasks' ? 'md:col-span-2' : undefined}>
                <Widget />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

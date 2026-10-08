import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { ProgressBar } from '../common/ProgressBar'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useGoals } from '../../hooks/useGoals'
import { goalProgress } from '../../utils/goalUtils'

/** GoalsWidget — active (not yet achieved) goals with progress, from the real GoalsContext. */
export function GoalsWidget() {
  const { goals, loading } = useGoals()

  if (loading) {
    return (
      <Card>
        <WidgetHeader title="Goals" viewAllHref="/goals" />
        <LoadingState label="Loading goals..." />
      </Card>
    )
  }

  const active = goals.filter((goal) => !goal.completed).slice(0, 4)

  if (active.length === 0) {
    return (
      <Card>
        <WidgetHeader title="Goals" viewAllHref="/goals" />
        <p className="text-sm text-muted">No active goals yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <WidgetHeader title="Goals" viewAllHref="/goals" />
      <ul className="flex flex-col gap-4">
        {active.map((goal) => {
          const progress = goalProgress(goal)
          return (
            <li key={goal.id}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-sm text-foreground truncate">{goal.title}</span>
                {goal.category && (
                  <Badge variant="default" className="shrink-0">
                    {goal.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar value={progress} />
                <span className="text-xs text-muted w-8 text-right shrink-0">{progress}%</span>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

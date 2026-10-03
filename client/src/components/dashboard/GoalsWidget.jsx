import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { ProgressBar } from '../common/ProgressBar'
import { WidgetHeader } from './WidgetHeader'

/**
 * GoalsWidget — active goals with progress.
 */
export function GoalsWidget({ goals }) {
  if (goals.length === 0) {
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
        {goals.map((goal) => (
          <li key={goal.id}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-sm text-foreground truncate">{goal.title}</span>
              <Badge variant="default" className="shrink-0">
                {goal.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <ProgressBar value={goal.progress} />
              <span className="text-xs text-muted w-8 text-right shrink-0">{goal.progress}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

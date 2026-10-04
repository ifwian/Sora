import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Checkbox } from '../common/Checkbox'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useTasks } from '../../hooks/useTasks'
import { filterByView, sortTasks } from '../../utils/taskUtils'
import { priorityBadgeVariant } from '../../constants/taskOptions'
import { formatTime } from '../../utils/date'
import { cn } from '../../utils/cn'

/**
 * TasksWidget — today's tasks, now reading from the real TasksContext
 * (connected in Milestone 10) instead of dashboard-only mock data.
 */
export function TasksWidget() {
  const { tasks, loading, toggleComplete } = useTasks()

  if (loading) {
    return (
      <Card>
        <WidgetHeader title="Today's tasks" viewAllHref="/tasks" />
        <LoadingState label="Loading tasks..." />
      </Card>
    )
  }

  const todaysTasks = sortTasks(filterByView(tasks, 'TODAY'), 'DUE_DATE')

  if (todaysTasks.length === 0) {
    return (
      <Card>
        <WidgetHeader title="Today's tasks" viewAllHref="/tasks" />
        <p className="text-sm text-muted">No tasks for today. Enjoy the breathing room.</p>
      </Card>
    )
  }

  return (
    <Card>
      <WidgetHeader title="Today's tasks" viewAllHref="/tasks" />
      <ul className="flex flex-col gap-3">
        {todaysTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3">
            <Checkbox
              checked={task.status === 'COMPLETED'}
              onChange={() => toggleComplete(task.id)}
              label={`Mark "${task.title}" as ${task.status === 'COMPLETED' ? 'incomplete' : 'complete'}`}
            />
            <span
              className={cn(
                'flex-1 text-sm text-foreground truncate',
                task.status === 'COMPLETED' && 'line-through text-muted'
              )}
            >
              {task.title}
            </span>
            {task.dueTime && task.status !== 'COMPLETED' && (
              <span className="text-xs text-muted shrink-0">{formatTime(task.dueTime)}</span>
            )}
            {task.status !== 'COMPLETED' && (
              <Badge variant={priorityBadgeVariant(task.priority)} className="shrink-0">
                {task.priority}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}

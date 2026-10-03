import { useState } from 'react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Checkbox } from '../common/Checkbox'
import { WidgetHeader } from './WidgetHeader'
import { cn } from '../../utils/cn'

const PRIORITY_VARIANT = {
  URGENT: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'default',
}

/**
 * TasksWidget — today's tasks with a checkable completion state.
 * Toggling is local/in-memory only until Milestone 10 connects real tasks.
 */
export function TasksWidget({ tasks }) {
  const [localTasks, setLocalTasks] = useState(tasks)

  const toggleTask = (id) => {
    setLocalTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    )
  }

  if (localTasks.length === 0) {
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
        {localTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3">
            <Checkbox
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <span
              className={cn(
                'flex-1 text-sm text-foreground truncate',
                task.completed && 'line-through text-muted'
              )}
            >
              {task.title}
            </span>
            {task.dueTime && !task.completed && (
              <span className="text-xs text-muted shrink-0">{task.dueTime}</span>
            )}
            {!task.completed && (
              <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'default'} className="shrink-0">
                {task.priority}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}

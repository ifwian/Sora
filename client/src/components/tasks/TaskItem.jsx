import { Pencil, Trash2, Repeat } from 'lucide-react'
import { Checkbox } from '../common/Checkbox'
import { Badge } from '../common/Badge'
import { priorityBadgeVariant } from '../../constants/taskOptions'
import { formatShortDate, formatTime } from '../../utils/date'
import { cn } from '../../utils/cn'

/**
 * TaskItem — a single row in the task list.
 */
export function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  const completed = task.status === 'COMPLETED'
  const dateLabel = formatShortDate(task.dueDate)
  const timeLabel = formatTime(task.dueTime)

  return (
    <li className="flex items-center gap-3 py-3 border-b border-border last:border-0 group">
      <Checkbox
        checked={completed}
        onChange={() => onToggleComplete(task.id)}
        label={`Mark "${task.title}" as ${completed ? 'incomplete' : 'complete'}`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm text-foreground truncate',
              completed && 'line-through text-muted'
            )}
          >
            {task.title}
          </span>
          {task.recurringFrequency && <Repeat size={12} className="text-muted shrink-0" />}
        </div>
        {(dateLabel || task.tags?.length > 0) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {dateLabel && (
              <span className="text-xs text-muted">
                {dateLabel}
                {timeLabel ? ` · ${timeLabel}` : ''}
              </span>
            )}
            {task.tags?.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {!completed && (
        <Badge variant={priorityBadgeVariant(task.priority)} className="shrink-0">
          {task.priority}
        </Badge>
      )}
      <Badge variant="default" className="shrink-0 max-sm:hidden">
        {task.category}
      </Badge>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="text-muted hover:text-foreground rounded-sm p-1.5"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          className="text-muted hover:text-danger rounded-sm p-1.5"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  )
}

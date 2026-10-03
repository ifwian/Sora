import { CheckSquare } from 'lucide-react'
import { Badge } from '../common/Badge'
import { eventBadgeVariant } from '../../constants/eventOptions'
import { formatTime } from '../../utils/date'
import { cn } from '../../utils/cn'

/**
 * AgendaItem — one row for either a real event (clickable, editable)
 * or a task deadline pulled in from Tasks (read-only here, badge only).
 */
export function AgendaItem({ item, onClick, compact }) {
  const isTask = item.kind === 'task'
  const time = formatTime(item.time)
  const variant = eventBadgeVariant(item.data.category)

  return (
    <button
      type="button"
      onClick={
        !isTask
          ? (event) => {
              event.stopPropagation()
              onClick(item.data)
            }
          : (event) => event.stopPropagation()
      }
      className={cn(
        'w-full flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-left transition-colors duration-150',
        isTask ? 'cursor-default' : 'hover:bg-surface-hover cursor-pointer',
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      {isTask ? (
        <CheckSquare size={12} className="text-muted shrink-0" />
      ) : (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            variant === 'danger' && 'bg-danger',
            variant === 'warning' && 'bg-warning',
            variant === 'accent' && 'bg-accent',
            variant === 'success' && 'bg-success',
            variant === 'default' && 'bg-muted'
          )}
        />
      )}
      {time && !compact && <span className="text-muted shrink-0">{time}</span>}
      <span className="truncate text-foreground">{item.data.title}</span>
      {isTask && !compact && (
        <Badge variant="default" className="ml-auto shrink-0">
          Task
        </Badge>
      )}
    </button>
  )
}

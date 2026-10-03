import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { WidgetHeader } from './WidgetHeader'

const TYPE_VARIANT = {
  Exam: 'danger',
  Deadline: 'warning',
  Class: 'default',
  Event: 'accent',
}

/**
 * UpcomingWidget — upcoming events, deadlines, and exams.
 */
export function UpcomingWidget({ items }) {
  if (items.length === 0) {
    return (
      <Card>
        <WidgetHeader title="Upcoming" viewAllHref="/calendar" />
        <p className="text-sm text-muted">Nothing on the horizon.</p>
      </Card>
    )
  }

  return (
    <Card>
      <WidgetHeader title="Upcoming" viewAllHref="/calendar" />
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted mt-0.5">
                {item.date} · {item.time}
              </p>
            </div>
            <Badge variant={TYPE_VARIANT[item.type] ?? 'default'} className="shrink-0">
              {item.type}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

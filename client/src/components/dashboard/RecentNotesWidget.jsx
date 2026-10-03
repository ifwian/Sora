import { Card } from '../common/Card'
import { WidgetHeader } from './WidgetHeader'

/**
 * RecentNotesWidget — recently updated notes.
 */
export function RecentNotesWidget({ notes }) {
  if (notes.length === 0) {
    return (
      <Card>
        <WidgetHeader title="Recent notes" viewAllHref="/notes" />
        <p className="text-sm text-muted">No notes yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <WidgetHeader title="Recent notes" viewAllHref="/notes" />
      <ul className="flex flex-col gap-4">
        {notes.map((note) => (
          <li key={note.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
              <span className="text-xs text-muted shrink-0">{note.updatedAt}</span>
            </div>
            <p className="text-xs text-muted mt-1 line-clamp-2">{note.excerpt}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

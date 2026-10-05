import { Card } from '../common/Card'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useNotes } from '../../hooks/useNotes'

/**
 * RecentNotesWidget — recently updated notes, reading from the real
 * NotesContext (connected in Milestone 11).
 */
export function RecentNotesWidget() {
  const { notes, loading } = useNotes()

  if (loading) {
    return (
      <Card>
        <WidgetHeader title="Recent notes" viewAllHref="/notes" />
        <LoadingState label="Loading notes..." />
      </Card>
    )
  }

  const recent = [...notes]
    .filter((note) => !note.archived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  if (recent.length === 0) {
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
        {recent.map((note) => (
          <li key={note.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
            </div>
            <p className="text-xs text-muted mt-1 line-clamp-2">{note.content}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

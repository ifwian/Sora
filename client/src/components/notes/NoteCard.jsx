import { Pin, Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { cn } from '../../utils/cn'

function relativeTime(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(timestamp))
}

/**
 * NoteCard — a single note in the notes grid.
 */
export function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive }) {
  return (
    <Card className="flex flex-col gap-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground truncate">{note.title}</h3>
        <button
          type="button"
          onClick={() => onTogglePin(note.id)}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          className={cn(
            'shrink-0 rounded-sm p-1',
            note.pinned ? 'text-accent' : 'text-muted hover:text-foreground'
          )}
        >
          <Pin size={14} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="text-xs text-muted whitespace-pre-line line-clamp-4 flex-1">{note.content}</p>

      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
        <span className="text-xs text-muted">{relativeTime(note.updatedAt)}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleArchive(note.id)}
            aria-label={note.archived ? 'Restore note' : 'Archive note'}
            className="text-muted hover:text-foreground rounded-sm p-1.5"
          >
            {note.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onEdit(note)}
            aria-label={`Edit "${note.title}"`}
            className="text-muted hover:text-foreground rounded-sm p-1.5"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            aria-label={`Delete "${note.title}"`}
            className="text-muted hover:text-danger rounded-sm p-1.5"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  )
}

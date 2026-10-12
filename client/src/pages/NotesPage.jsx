import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { Tabs } from '../components/common/Tabs'
import { NoteCard } from '../components/notes/NoteCard'
import { NoteForm } from '../components/notes/NoteForm'
import { useNotes } from '../hooks/useNotes'
import { useToast } from '../hooks/useToast'

const VIEW_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export function NotesPage() {
  const { notes, loading, error, addNote, updateNote, deleteNote, togglePin, toggleArchive, refetch } =
    useNotes()
  const { showToast } = useToast()

  const [view, setView] = useState('ACTIVE')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [deletingNote, setDeletingNote] = useState(null)

  const visibleNotes = useMemo(() => {
    const byView = notes.filter((note) => (view === 'ARCHIVED' ? note.archived : !note.archived))
    const filtered = search
      ? byView.filter((note) => {
          const needle = search.trim().toLowerCase()
          const haystack = [note.title, note.content, ...(note.tags ?? [])].join(' ').toLowerCase()
          return haystack.includes(needle)
        })
      : byView
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [notes, view, search])

  const openCreate = () => {
    setEditingNote(null)
    setFormOpen(true)
  }

  const openEdit = (note) => {
    setEditingNote(note)
    setFormOpen(true)
  }

  const handleSubmit = async (data) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, data)
        showToast({ message: 'Note updated.', variant: 'success' })
      } else {
        await addNote(data)
        showToast({ message: 'Note created.', variant: 'success' })
      }
      setFormOpen(false)
    } catch {
      // Error toast already shown by NotesContext; keep the form open.
    }
  }

  const handleDeleteConfirmed = async () => {
    try {
      await deleteNote(deletingNote.id)
      showToast({ message: 'Note deleted.', variant: 'info' })
    } catch {
      // Error toast already shown by NotesContext.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New note
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Tabs options={VIEW_OPTIONS} value={view} onChange={setView} />
        <label className="relative flex items-center sm:w-64">
          <Search size={15} className="absolute left-3 text-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes..."
            className="h-9 w-full pl-9 pr-3 rounded-sm bg-surface border border-control text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
      </div>

      {loading ? (
        <LoadingState label="Loading notes..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : visibleNotes.length === 0 ? (
        <EmptyState
          title={view === 'ARCHIVED' ? 'No archived notes.' : 'No notes yet.'}
          description={
            view === 'ARCHIVED'
              ? 'Notes you archive will show up here.'
              : 'Create your first note to get started.'
          }
          actionLabel={view === 'ACTIVE' ? 'New note' : undefined}
          onAction={view === 'ACTIVE' ? openCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEdit}
              onDelete={setDeletingNote}
              onTogglePin={togglePin}
              onToggleArchive={toggleArchive}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingNote ? 'Edit note' : 'New note'}
      >
        <NoteForm note={editingNote} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete note?"
        description={deletingNote ? `"${deletingNote.title}" will be permanently deleted.` : ''}
      />
    </div>
  )
}

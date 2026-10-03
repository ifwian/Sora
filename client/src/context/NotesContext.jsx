import { useMemo, useState } from 'react'
import { NotesContext } from './notes-context'
import { mockNotesData } from '../constants/mockNotesData'

/**
 * NotesProvider — in-memory CRUD store for notes.
 * Mock-seeded for now; Milestone 11 swaps the seed + these actions for
 * real API calls without changing how consumers call them.
 */
export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(mockNotesData)

  const actions = useMemo(
    () => ({
      addNote: (note) => {
        setNotes((current) => [
          {
            ...note,
            id: crypto.randomUUID(),
            pinned: false,
            archived: false,
            updatedAt: Date.now(),
          },
          ...current,
        ])
      },
      updateNote: (id, updates) => {
        setNotes((current) =>
          current.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
          )
        )
      },
      deleteNote: (id) => {
        setNotes((current) => current.filter((note) => note.id !== id))
      },
      togglePin: (id) => {
        setNotes((current) =>
          current.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note))
        )
      },
      toggleArchive: (id) => {
        setNotes((current) =>
          current.map((note) => (note.id === id ? { ...note, archived: !note.archived } : note))
        )
      },
    }),
    []
  )

  const value = useMemo(() => ({ notes, ...actions }), [notes, actions])

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

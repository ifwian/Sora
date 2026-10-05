import { useEffect, useMemo, useState, useCallback } from 'react'
import { NotesContext } from './notes-context'
import { noteService } from '../services/noteService'
import { useToast } from '../hooks/useToast'

/**
 * NotesProvider — loads notes from the real API and exposes CRUD actions.
 */
export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setNotes(await noteService.getNotes())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes()
  }, [loadNotes])

  const actions = useMemo(
    () => ({
      addNote: async (note) => {
        try {
          const created = await noteService.createNote(note)
          setNotes((current) => [created, ...current])
          return created
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      updateNote: async (id, updates) => {
        try {
          const updated = await noteService.updateNote(id, updates)
          setNotes((current) => current.map((note) => (note.id === id ? updated : note)))
          return updated
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      deleteNote: async (id) => {
        try {
          await noteService.deleteNote(id)
          setNotes((current) => current.filter((note) => note.id !== id))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      togglePin: async (id) => {
        const note = notes.find((n) => n.id === id)
        if (!note) return
        try {
          const updated = await noteService.updateNote(id, { pinned: !note.pinned })
          setNotes((current) => current.map((n) => (n.id === id ? updated : n)))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
        }
      },
      toggleArchive: async (id) => {
        const note = notes.find((n) => n.id === id)
        if (!note) return
        try {
          const updated = await noteService.updateNote(id, { archived: !note.archived })
          setNotes((current) => current.map((n) => (n.id === id ? updated : n)))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
        }
      },
      refetch: loadNotes,
    }),
    [notes, showToast, loadNotes]
  )

  const value = useMemo(
    () => ({ notes, loading, error, ...actions }),
    [notes, loading, error, actions]
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

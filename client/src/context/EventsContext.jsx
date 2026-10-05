import { useEffect, useMemo, useState, useCallback } from 'react'
import { EventsContext } from './events-context'
import { eventService } from '../services/eventService'
import { useToast } from '../hooks/useToast'

/**
 * EventsProvider — loads events from the real API and exposes CRUD actions.
 */
export function EventsProvider({ children }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEvents(await eventService.getEvents())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents()
  }, [loadEvents])

  const actions = useMemo(
    () => ({
      addEvent: async (event) => {
        try {
          const created = await eventService.createEvent(event)
          setEvents((current) => [...current, created])
          return created
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      updateEvent: async (id, updates) => {
        try {
          const updated = await eventService.updateEvent(id, updates)
          setEvents((current) => current.map((event) => (event.id === id ? updated : event)))
          return updated
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      deleteEvent: async (id) => {
        try {
          await eventService.deleteEvent(id)
          setEvents((current) => current.filter((event) => event.id !== id))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      refetch: loadEvents,
    }),
    [showToast, loadEvents]
  )

  const value = useMemo(
    () => ({ events, loading, error, ...actions }),
    [events, loading, error, actions]
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

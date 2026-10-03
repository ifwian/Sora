import { useMemo, useState } from 'react'
import { EventsContext } from './events-context'
import { mockEventsData } from '../constants/mockEventsData'

/**
 * EventsProvider — in-memory CRUD store for calendar events.
 * Mock-seeded for now; Milestone 12 swaps the seed + these actions for
 * real API calls without changing how consumers call them.
 */
export function EventsProvider({ children }) {
  const [events, setEvents] = useState(mockEventsData)

  const actions = useMemo(
    () => ({
      addEvent: (event) => {
        setEvents((current) => [...current, { ...event, id: crypto.randomUUID() }])
      },
      updateEvent: (id, updates) => {
        setEvents((current) =>
          current.map((event) => (event.id === id ? { ...event, ...updates } : event))
        )
      },
      deleteEvent: (id) => {
        setEvents((current) => current.filter((event) => event.id !== id))
      },
    }),
    []
  )

  const value = useMemo(() => ({ events, ...actions }), [events, actions])

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

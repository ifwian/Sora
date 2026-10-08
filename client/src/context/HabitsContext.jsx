import { useEffect, useMemo, useState, useCallback } from 'react'
import { HabitsContext } from './habits-context'
import { habitService } from '../services/habitService'
import { useToast } from '../hooks/useToast'

/** HabitsProvider — loads habits (with completion dates) from the API and exposes actions. */
export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const loadHabits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setHabits(await habitService.getHabits())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHabits()
  }, [loadHabits])

  const actions = useMemo(() => {
    const replace = (updated) =>
      setHabits((current) => current.map((h) => (h.id === updated.id ? updated : h)))
    const fail = (err) => {
      showToast({ message: err.message, variant: 'error' })
      throw err
    }
    return {
      addHabit: async (habit) => {
        try {
          const created = await habitService.createHabit(habit)
          setHabits((current) => [...current, created])
        } catch (err) {
          fail(err)
        }
      },
      updateHabit: async (id, updates) => {
        try {
          replace(await habitService.updateHabit(id, updates))
        } catch (err) {
          fail(err)
        }
      },
      deleteHabit: async (id) => {
        try {
          await habitService.deleteHabit(id)
          setHabits((current) => current.filter((h) => h.id !== id))
        } catch (err) {
          fail(err)
        }
      },
      toggleCompletion: async (id, date) => {
        try {
          replace(await habitService.toggleCompletion(id, date))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
        }
      },
      refetch: loadHabits,
    }
  }, [showToast, loadHabits])

  const value = useMemo(() => ({ habits, loading, error, ...actions }), [habits, loading, error, actions])

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
}

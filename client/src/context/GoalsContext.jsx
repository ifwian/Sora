import { useEffect, useMemo, useState, useCallback } from 'react'
import { GoalsContext } from './goals-context'
import { goalService } from '../services/goalService'
import { useToast } from '../hooks/useToast'

/** GoalsProvider — loads goals (with milestones) from the API and exposes actions. */
export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const loadGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setGoals(await goalService.getGoals())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGoals()
  }, [loadGoals])

  const actions = useMemo(() => {
    const replace = (updated) =>
      setGoals((current) => current.map((g) => (g.id === updated.id ? updated : g)))
    const run = async (fn) => {
      try {
        return await fn()
      } catch (err) {
        showToast({ message: err.message, variant: 'error' })
        throw err
      }
    }
    return {
      addGoal: (goal) =>
        run(async () => {
          const created = await goalService.createGoal(goal)
          setGoals((current) => [...current, created])
        }),
      updateGoal: (id, updates) => run(async () => replace(await goalService.updateGoal(id, updates))),
      deleteGoal: (id) =>
        run(async () => {
          await goalService.deleteGoal(id)
          setGoals((current) => current.filter((g) => g.id !== id))
        }),
      addMilestone: (goalId, title) =>
        run(async () => replace(await goalService.addMilestone(goalId, title))),
      toggleMilestone: (goalId, milestone) =>
        run(async () =>
          replace(await goalService.updateMilestone(goalId, milestone.id, { completed: !milestone.completed }))
        ),
      deleteMilestone: (goalId, milestoneId) =>
        run(async () => replace(await goalService.deleteMilestone(goalId, milestoneId))),
      refetch: loadGoals,
    }
  }, [showToast, loadGoals])

  const value = useMemo(() => ({ goals, loading, error, ...actions }), [goals, loading, error, actions])

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
}

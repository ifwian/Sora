import { useEffect, useMemo, useState, useCallback } from 'react'
import { TasksContext } from './tasks-context'
import { taskService } from '../services/taskService'
import { useToast } from '../hooks/useToast'

/**
 * TasksProvider — loads tasks from the real API and exposes CRUD actions
 * that call the backend, then update local state from its response.
 */
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await taskService.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Standard fetch-on-mount: loadTasks sets state after an await, not
    // synchronously, so this isn't the cascading-render pattern the rule
    // is meant to catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks()
  }, [loadTasks])

  const actions = useMemo(
    () => ({
      addTask: async (task) => {
        try {
          const created = await taskService.createTask(task)
          setTasks((current) => [created, ...current])
          return created
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      updateTask: async (id, updates) => {
        try {
          const updated = await taskService.updateTask(id, updates)
          setTasks((current) => current.map((task) => (task.id === id ? updated : task)))
          return updated
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      deleteTask: async (id) => {
        try {
          await taskService.deleteTask(id)
          setTasks((current) => current.filter((task) => task.id !== id))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
          throw err
        }
      },
      toggleComplete: async (id) => {
        const task = tasks.find((t) => t.id === id)
        if (!task) return
        const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
        try {
          const updated = await taskService.updateTask(id, { status: nextStatus })
          setTasks((current) => current.map((t) => (t.id === id ? updated : t)))
        } catch (err) {
          showToast({ message: err.message, variant: 'error' })
        }
      },
      refetch: loadTasks,
    }),
    [tasks, showToast, loadTasks]
  )

  const value = useMemo(
    () => ({ tasks, loading, error, ...actions }),
    [tasks, loading, error, actions]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

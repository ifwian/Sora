import { useMemo, useState } from 'react'
import { TasksContext } from './tasks-context'
import { mockTasksData } from '../constants/mockTasksData'

/**
 * TasksProvider — in-memory CRUD store for tasks.
 * Mock-seeded for now; Milestone 10 swaps the seed + these actions for
 * real API calls without changing how consumers call them.
 */
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasksData)

  const actions = useMemo(
    () => ({
      addTask: (task) => {
        setTasks((current) => [
          { ...task, id: crypto.randomUUID(), status: 'TODO', createdAt: Date.now() },
          ...current,
        ])
      },
      updateTask: (id, updates) => {
        setTasks((current) =>
          current.map((task) => (task.id === id ? { ...task, ...updates } : task))
        )
      },
      deleteTask: (id) => {
        setTasks((current) => current.filter((task) => task.id !== id))
      },
      toggleComplete: (id) => {
        setTasks((current) =>
          current.map((task) =>
            task.id === id
              ? { ...task, status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }
              : task
          )
        )
      },
    }),
    []
  )

  const value = useMemo(() => ({ tasks, ...actions }), [tasks, actions])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

import { todayISO } from './date'

const PRIORITY_WEIGHT = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

/** Filters tasks into a named view: TODAY | UPCOMING | COMPLETED | ALL */
export function filterByView(tasks, view) {
  const today = todayISO()
  switch (view) {
    case 'TODAY':
      return tasks.filter((task) => task.dueDate === today && task.status !== 'COMPLETED')
    case 'UPCOMING':
      return tasks.filter(
        (task) => task.dueDate && task.dueDate > today && task.status !== 'COMPLETED'
      )
    case 'COMPLETED':
      return tasks.filter((task) => task.status === 'COMPLETED')
    case 'ALL':
    default:
      return tasks
  }
}

/** Applies search text + priority/category filters. */
export function applyFilters(tasks, { search, priority, category }) {
  return tasks.filter((task) => {
    if (priority && task.priority !== priority) return false
    if (category && task.category !== category) return false
    if (search) {
      const needle = search.trim().toLowerCase()
      const haystack = [task.title, ...(task.tags ?? [])].join(' ').toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })
}

/** Sorts tasks by DUE_DATE | PRIORITY | NEWEST. */
export function sortTasks(tasks, sortBy) {
  const sorted = [...tasks]
  switch (sortBy) {
    case 'PRIORITY':
      return sorted.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
    case 'NEWEST':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'DUE_DATE':
    default:
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate) || (a.dueTime ?? '').localeCompare(b.dueTime ?? '')
      })
  }
}

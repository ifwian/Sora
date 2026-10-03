/**
 * Combines calendar events with tasks that have a matching due date,
 * so deadlines show up on the calendar too (read-only there — edited
 * from the Tasks page). Sorted by time, all-day items last.
 */
export function getItemsForDate(events, tasks, isoDate) {
  const dayEvents = events
    .filter((event) => event.date === isoDate)
    .map((event) => ({ kind: 'event', time: event.startTime, data: event }))

  const dayTasks = tasks
    .filter((task) => task.dueDate === isoDate && task.status !== 'COMPLETED')
    .map((task) => ({ kind: 'task', time: task.dueTime, data: task }))

  return [...dayEvents, ...dayTasks].sort((a, b) => {
    if (!a.time && !b.time) return 0
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })
}

import { useCallback, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { usePreferences } from './usePreferences'
import { useTasks } from './useTasks'
import { useEvents } from './useEvents'
import { useHabits } from './useHabits'
import { useGoals } from './useGoals'
import { useStudy } from './useStudy'
import { useFinance } from './useFinance'
import { buildNotifications } from '../utils/notificationRules'
import { timeInZone, todayISO } from '../utils/date'

const storageKeyFor = (userId) => `sora-dismissed:${userId}`

function readDismissed(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (parsed && typeof parsed.date === 'string' && Array.isArray(parsed.ids)) return parsed
  } catch {
    // Corrupt or unavailable storage — start fresh.
  }
  return { date: '', ids: [] }
}

/**
 * useNotifications — derives reminders from everything already loaded in the
 * app (tasks, events, habits, goals, study, finance). Dismissals are kept per
 * user in localStorage and reset each day, so a reminder comes back tomorrow
 * if it's still relevant.
 */
export function useNotifications() {
  const { user } = useAuth()
  const { preferences } = usePreferences()
  const { tasks } = useTasks()
  const { events } = useEvents()
  const { habits } = useHabits()
  const { goals } = useGoals()
  const { assignments } = useStudy()
  const { expenses, budgets } = useFinance()

  const today = todayISO(preferences.timezone)
  const timeOfDay = timeInZone(new Date(), preferences.timezone)
  const key = storageKeyFor(user.id)
  const [stored, setStored] = useState(() => readDismissed(key))

  const all = useMemo(
    () =>
      buildNotifications({
        today,
        timeOfDay,
        tasks,
        events,
        habits,
        goals,
        assignments: assignments.items,
        expenses: expenses.items,
        budgets: budgets.items,
        settings: preferences.notifications,
        focusMode: preferences.focusMode,
      }),
    [
      today,
      timeOfDay,
      tasks,
      events,
      habits,
      goals,
      assignments.items,
      expenses.items,
      budgets.items,
      preferences.notifications,
      preferences.focusMode,
    ]
  )

  // Dismissals only count for the day they were made.
  const dismissedIds = useMemo(() => new Set(stored.date === today ? stored.ids : []), [stored, today])
  const notifications = useMemo(() => all.filter((n) => !dismissedIds.has(n.id)), [all, dismissedIds])

  const dismiss = useCallback(
    (ids) => {
      const list = Array.isArray(ids) ? ids : [ids]
      setStored((current) => {
        const base = current.date === today ? current.ids : []
        const next = { date: today, ids: [...new Set([...base, ...list])] }
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Storage full/blocked — dismissal just won't persist across reloads.
        }
        return next
      })
    },
    [key, today]
  )

  return { notifications, dismiss }
}

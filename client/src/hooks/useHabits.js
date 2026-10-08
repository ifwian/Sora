import { useContext } from 'react'
import { HabitsContext } from '../context/habits-context'

export function useHabits() {
  const context = useContext(HabitsContext)
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider')
  }
  return context
}

import { useContext } from 'react'
import { StudyContext } from '../context/study-context'

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider')
  }
  return context
}

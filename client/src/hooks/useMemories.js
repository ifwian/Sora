import { useContext } from 'react'
import { MemoriesContext } from '../context/memories-context'

export function useMemories() {
  const context = useContext(MemoriesContext)
  if (!context) {
    throw new Error('useMemories must be used within a MemoriesProvider')
  }
  return context
}

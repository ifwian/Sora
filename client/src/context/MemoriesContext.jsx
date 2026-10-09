import { MemoriesContext } from './memories-context'
import { useResource } from '../hooks/useResource'
import { createResourceService } from '../services/resourceService'

const memoryService = createResourceService('/memories')
const placeService = createResourceService('/places')

/** MemoriesProvider — the memories timeline and visited places. */
export function MemoriesProvider({ children }) {
  const memories = useResource(memoryService)
  const places = useResource(placeService)

  return <MemoriesContext.Provider value={{ memories, places }}>{children}</MemoriesContext.Provider>
}

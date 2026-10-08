import { useCallback, useEffect, useState } from 'react'
import { useToast } from './useToast'

/**
 * useResource — loads a REST collection and exposes add/update/remove that
 * keep local state in sync with the server's response. `service` must be a
 * stable reference (create it once at module level with createResourceService).
 */
export function useResource(service) {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await service.list())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
  }, [refetch])

  const run = useCallback(
    async (fn) => {
      try {
        return await fn()
      } catch (err) {
        showToast({ message: err.message, variant: 'error' })
        throw err
      }
    },
    [showToast]
  )

  const add = useCallback(
    (data) =>
      run(async () => {
        const created = await service.create(data)
        setItems((current) => [...current, created])
        return created
      }),
    [service, run]
  )

  const update = useCallback(
    (id, data) =>
      run(async () => {
        const updated = await service.update(id, data)
        setItems((current) => current.map((item) => (item.id === id ? updated : item)))
        return updated
      }),
    [service, run]
  )

  const remove = useCallback(
    (id) =>
      run(async () => {
        await service.remove(id)
        setItems((current) => current.filter((item) => item.id !== id))
      }),
    [service, run]
  )

  return { items, loading, error, add, update, remove, refetch }
}

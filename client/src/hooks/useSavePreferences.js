import { useCallback } from 'react'
import { usePreferences } from './usePreferences'
import { useToast } from './useToast'

/** Saves a preferences patch and turns a failure into a visible, friendly toast. */
export function useSavePreferences() {
  const { savePreferences, saving } = usePreferences()
  const { showToast } = useToast()

  const save = useCallback(
    async (patch) => {
      try {
        return await savePreferences(patch)
      } catch (err) {
        showToast({ message: err?.message || "Couldn't save that setting. Please try again.", variant: 'error' })
        return null
      }
    },
    [savePreferences, showToast]
  )

  return { save, saving }
}

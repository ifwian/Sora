import { useCallback, useEffect, useMemo, useState } from 'react'
import { PreferencesContext } from './preferences-context'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { resolvePreferences } from '../constants/preferences'
import { applyRuntimePreferences } from '../utils/preferencesRuntime'
import { skyPhaseAt } from '../utils/sky'

const SKY_REFRESH_MS = 5 * 60 * 1000

/**
 * PreferencesProvider — resolves the signed-in account's settings into a complete
 * object, keeps the pure date/money formatters in step, and moves the Sky palette
 * through dawn/day/dusk/night as local time passes.
 */
export function PreferencesProvider({ children }) {
  const { user, savePreferences: saveToAccount } = useAuth()
  const { palette } = useTheme()
  const [saving, setSaving] = useState(false)

  const preferences = useMemo(() => resolvePreferences(user?.preferences), [user])

  // Applied during render (it only assigns four primitives) so formatting helpers
  // called by children in this same render already see the account's choices.
  applyRuntimePreferences(preferences)

  const savePreferences = useCallback(
    async (patch) => {
      setSaving(true)
      try {
        return await saveToAccount(patch)
      } finally {
        setSaving(false)
      }
    },
    [saveToAccount]
  )

  // The Sky palette reads data-sky-phase; other palettes ignore it. Refreshing every
  // few minutes is enough for a calm shift and costs nothing while Sky is not in use.
  useEffect(() => {
    const applyPhase = () => {
      document.documentElement.dataset.skyPhase = skyPhaseAt(new Date(), preferences.timezone)
    }
    applyPhase()
    if (palette !== 'sky') return undefined
    const timer = window.setInterval(applyPhase, SKY_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [palette, preferences.timezone])

  const value = useMemo(
    () => ({ preferences, savePreferences, saving }),
    [preferences, savePreferences, saving]
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

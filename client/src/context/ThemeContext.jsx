import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeContext } from './theme-context'
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  LEGACY_THEME_KEY,
  pickValidAppearance,
  resolveAppearance,
} from '../constants/appearance'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredAppearance() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(APPEARANCE_STORAGE_KEY) ?? 'null')
    if (stored) return resolveAppearance(stored)
    // Migrate the old light/dark-only setting.
    return resolveAppearance({ mode: window.localStorage.getItem(LEGACY_THEME_KEY) })
  } catch {
    return { ...DEFAULT_APPEARANCE }
  }
}

/**
 * ThemeProvider — the app's look: mode (light/dark/system), palette, corner shape and text size.
 *
 * Changes made by the user are applied immediately, kept in localStorage (so the very next page load
 * paints correctly — see public/theme-init.js), and handed to a "sync" function (registered by
 * AuthProvider) that saves them to the account. Values arriving FROM the account (applyPreferences)
 * are applied without syncing back.
 */
export function ThemeProvider({ children }) {
  const [appearance, setAppearanceState] = useState(readStoredAppearance)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)
  const syncRef = useRef(null)

  const resolvedTheme = appearance.mode === 'system' ? systemTheme : appearance.mode

  // Follow the operating system while mode is "system".
  useEffect(() => {
    if (appearance.mode !== 'system') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light')
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [appearance.mode])

  // Apply to <html> and remember locally.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.dataset.palette = appearance.palette
    root.dataset.radius = appearance.radius
    root.dataset.text = appearance.textSize
    try {
      window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance))
    } catch {
      // Storage blocked — the look still applies for this session.
    }
  }, [appearance, resolvedTheme])

  /** A change the user made. `patch` is e.g. { palette: 'sakura' }. */
  const setAppearance = useCallback((patch) => {
    const valid = pickValidAppearance(patch)
    if (Object.keys(valid).length === 0) return
    setAppearanceState((current) => ({ ...current, ...valid }))
    syncRef.current?.(valid)
  }, [])

  /** Settings loaded from the account. The account is authoritative: an empty/partial record is filled with defaults, so a new account never inherits the previous user's look from this device. Applied without saving back. */
  const applyPreferences = useCallback((preferences) => {
    setAppearanceState(resolveAppearance(preferences))
  }, [])

  const resetAppearance = useCallback(() => setAppearance({ ...DEFAULT_APPEARANCE }), [setAppearance])

  /** AuthProvider registers how to save changes to the account; returns a function that unregisters it. */
  const registerSync = useCallback((fn) => {
    syncRef.current = fn
    return () => {
      if (syncRef.current === fn) syncRef.current = null
    }
  }, [])

  const setTheme = useCallback((mode) => setAppearance({ mode }), [setAppearance])

  const value = useMemo(
    () => ({
      ...appearance,
      appearance,
      theme: appearance.mode, // kept so existing code (ThemeToggle) keeps working
      resolvedTheme,
      setTheme,
      setAppearance,
      applyPreferences,
      resetAppearance,
      registerSync,
    }),
    [appearance, resolvedTheme, setTheme, setAppearance, applyPreferences, resetAppearance, registerSync]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

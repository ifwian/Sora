import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'sora-theme'
const THEMES = ['light', 'dark', 'system']

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme() {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return THEMES.includes(stored) ? stored : 'system'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    theme === 'system' ? getSystemTheme() : theme
  )

  // Apply the resolved theme to <html> and keep it in sync with the
  // preference (including live system-theme changes when set to "system").
  useEffect(() => {
    const applyResolved = () => {
      const next = theme === 'system' ? getSystemTheme() : theme
      setResolvedTheme(next)
      document.documentElement.classList.toggle('dark', next === 'dark')
    }

    applyResolved()

    if (theme !== 'system') return undefined

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', applyResolved)
    return () => media.removeEventListener('change', applyResolved)
  }, [theme])

  const setTheme = (next) => {
    if (!THEMES.includes(next)) return
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

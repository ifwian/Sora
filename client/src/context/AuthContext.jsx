import { useEffect, useMemo, useState, useCallback } from 'react'
import { AuthContext } from './auth-context'
import { authService } from '../services/authService'
import { AUTH_TOKEN_KEY } from '../constants/auth'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'

/**
 * AuthProvider — holds the current user and auth actions. On mount, if a
 * token is already stored, it verifies it against GET /me rather than
 * trusting it blindly. Also listens for 'auth:logout', dispatched by
 * services/api.js whenever a request comes back 401, so an expired
 * session logs the person out everywhere, not just on their next click.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { applyPreferences, registerSync } = useTheme()
  const { showToast } = useToast()

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const me = await authService.getMe()
      applyPreferences(me.preferences)
      setUser(me)
    } catch {
      // A 401 has already cleared the token (see services/api.js). For anything else — being offline,
      // a server hiccup, hitting the rate limit — keep the token so a reload can recover, instead of
      // silently signing the person out.
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [applyPreferences])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMe()
  }, [loadMe])

  useEffect(() => {
    const handleLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  // While signed in, appearance changes are saved to the account (see ThemeContext).
  const signedIn = Boolean(user)
  useEffect(() => {
    if (!signedIn) return undefined
    return registerSync((patch) => {
      authService.updatePreferences(patch).catch(() => {
        showToast({ message: "Couldn't save that to your account — it's still applied on this device.", variant: 'info' })
      })
    })
  }, [signedIn, registerSync, showToast])

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await authService.login(credentials)
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    applyPreferences(loggedInUser.preferences)
    setUser(loggedInUser)
  }, [applyPreferences])

  const register = useCallback(async (data) => {
    const { user: newUser, token } = await authService.register(data)
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    applyPreferences(newUser.preferences)
    setUser(newUser)
  }, [applyPreferences])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

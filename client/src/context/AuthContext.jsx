import { useEffect, useMemo, useState, useCallback } from 'react'
import { AuthContext } from './auth-context'
import { authService } from '../services/authService'
import { AUTH_TOKEN_KEY } from '../constants/auth'

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

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    try {
      setUser(await authService.getMe())
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMe()
  }, [loadMe])

  useEffect(() => {
    const handleLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await authService.login(credentials)
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    setUser(loggedInUser)
  }, [])

  const register = useCallback(async (data) => {
    const { user: newUser, token } = await authService.register(data)
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    setUser(newUser)
  }, [])

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

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../common/LoadingState'

/**
 * ProtectedRoute — redirects to /login if there's no authenticated user.
 * Shows a full-page loading state while the initial session check
 * (GET /me, from AuthProvider) is in flight, so a logged-in person
 * doesn't flash through the login page on refresh.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label="Loading..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

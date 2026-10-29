import { useState } from 'react'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { authService } from '../../services/authService'

export function AccountSettings() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      showToast({ message: 'Password updated.', variant: 'success' })
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-4">Profile</h2>
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-foreground">{user?.name || 'No name set'}</p>
          <p className="text-muted">{user?.email}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-4">Change password</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText={!error ? 'At least 8 characters.' : undefined}
            error={error}
            autoComplete="new-password"
            required
          />
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-foreground mb-4">Account</h2>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </Card>
    </div>
  )
}

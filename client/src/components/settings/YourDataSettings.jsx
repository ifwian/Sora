import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ShieldAlert, Trash2 } from 'lucide-react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Modal } from '../common/Modal'
import { SettingsSection } from './SettingsSection'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { authService } from '../../services/authService'
import { todayISO } from '../../utils/date'

/** Settings → Your data. Download a complete copy, or close the account for good. */
export function YourDataSettings() {
  const { logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [exporting, setExporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await authService.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sora-export-${todayISO()}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      showToast({ message: 'Your data has been downloaded.', variant: 'success' })
    } catch (err) {
      showToast({ message: err?.message || "Couldn't export your data. Please try again.", variant: 'error' })
    } finally {
      setExporting(false)
    }
  }

  const closeConfirm = () => {
    if (deleting) return
    setConfirmOpen(false)
    setPassword('')
    setError('')
  }

  const handleDelete = async (event) => {
    event.preventDefault()
    setError('')
    setDeleting(true)
    try {
      await authService.deleteAccount({ password })
      logout()
      showToast({ message: 'Your account and all of its data have been deleted.', variant: 'info' })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.message || "Couldn't delete your account. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <SettingsSection
        title="Export your data"
        description="A single JSON file with your tasks, notes, calendar, habits, goals, study, finance, library, memories and places."
      >
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          <Download size={15} />
          {exporting ? 'Preparing your file…' : 'Download my data'}
        </Button>
        <p className="mt-3 text-xs text-muted">Your password hash is never included.</p>
      </SettingsSection>

      <SettingsSection
        title="Delete your account"
        description="This removes your account and every row that belongs to it. It cannot be undone."
      >
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          <Trash2 size={15} />
          Delete my account
        </Button>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          Consider downloading a copy of your data first.
        </p>
      </SettingsSection>

      <Modal
        open={confirmOpen}
        onClose={closeConfirm}
        title="Delete your account?"
        description="Every task, note, event, habit, goal, study record, expense and memory will be permanently removed."
      >
        <form onSubmit={handleDelete} className="flex flex-col gap-4 mt-2">
          <Input
            label="Confirm your password"
            type="password"
            autoComplete="current-password"
            value={password}
            error={error}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeConfirm} disabled={deleting}>
              Keep my account
            </Button>
            <Button type="submit" variant="danger" disabled={deleting || password.length === 0}>
              {deleting ? 'Deleting…' : 'Delete everything'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

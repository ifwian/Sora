import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Bell, Clock, Info, X } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { cn } from '../../utils/cn'

const SEVERITY = {
  danger: { icon: AlertCircle, className: 'text-danger' },
  warning: { icon: Clock, className: 'text-warning' },
  info: { icon: Info, className: 'text-accent' },
}

/** NotificationBell — in-app reminders (overdue, due today, upcoming) with a count badge. */
export function NotificationBell() {
  const navigate = useNavigate()
  const { notifications, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const handleClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const count = notifications.length

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={count > 0 ? `Notifications, ${count} new` : 'Notifications'}
        aria-expanded={open}
        className="relative h-8 w-8 flex items-center justify-center rounded-sm text-muted hover:text-foreground hover:bg-surface-hover"
      >
        <Bell size={17} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-md shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {count > 0 && (
              <button
                type="button"
                onClick={() => dismiss(notifications.map((n) => n.id))}
                className="text-xs text-muted hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>

          {count === 0 ? (
            <p className="px-3 py-6 text-sm text-muted text-center">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto p-1">
              {notifications.map((notification) => {
                const { icon: Icon, className } = SEVERITY[notification.severity]
                return (
                  <li key={notification.id} className="flex items-start gap-1 rounded-sm hover:bg-surface-hover">
                    <button
                      type="button"
                      onClick={() => {
                        dismiss(notification.id)
                        setOpen(false)
                        navigate(notification.to)
                      }}
                      className="flex-1 min-w-0 flex items-start gap-3 px-2 py-2 text-left"
                    >
                      <Icon size={16} className={cn('mt-0.5 shrink-0', className)} />
                      <span className="min-w-0">
                        <span className="block text-sm text-foreground truncate">{notification.title}</span>
                        {notification.detail && (
                          <span className="block text-xs text-muted truncate">{notification.detail}</span>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => dismiss(notification.id)}
                      aria-label={`Dismiss: ${notification.title}`}
                      className="text-muted hover:text-foreground rounded-sm p-1.5 mt-1 shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

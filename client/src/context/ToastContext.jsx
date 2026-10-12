import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { ToastContext } from './toast-context'

const DEFAULT_DURATION = 4000

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const ICON_COLOR = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-accent',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, variant = 'info', duration = DEFAULT_DURATION }) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, variant }])
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration)
      }
      return id
    },
    [dismissToast]
  )

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-20 inset-x-4 md:inset-x-auto md:bottom-4 md:right-4 z-50 flex flex-col gap-2 md:w-full md:max-w-sm">
          <AnimatePresence>
            {toasts.map((toast) => {
              const Icon = ICONS[toast.variant] ?? Info
              return (
                <m.div
                  key={toast.id}
                  role="status"
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={cn(
                    'pointer-events-auto flex items-start gap-3 bg-surface border border-border rounded-md shadow-lg p-4'
                  )}
                >
                  <Icon size={18} className={cn('shrink-0 mt-0.5', ICON_COLOR[toast.variant])} />
                  <p className="text-sm text-foreground flex-1">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    aria-label="Dismiss notification"
                    className="text-muted hover:text-foreground rounded-sm p-0.5 -m-0.5"
                  >
                    <X size={16} />
                  </button>
                </m.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

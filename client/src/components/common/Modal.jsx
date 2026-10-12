import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Modal — accessible dialog rendered in a portal.
 * Closes on Escape or backdrop click, traps focus while open,
 * and restores focus to the trigger element on close.
 */
export function Modal({ open, onClose, title, description, className, children }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    triggerRef.current = document.activeElement

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
        return
      }
      if (event.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      triggerRef.current?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-surface border border-border rounded-lg shadow-lg p-6',
              className
            )}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {title && (
                  <h2 id={titleId} className="text-base font-semibold text-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="text-sm text-muted mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-muted hover:text-foreground rounded-sm p-1 -m-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

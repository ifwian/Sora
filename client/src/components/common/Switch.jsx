import { cn } from '../../utils/cn'

/**
 * Switch — an accessible on/off control. The whole row is the button (role="switch"),
 * so tapping the label works too.
 */
export function Switch({ checked, onChange, label, description, disabled = false, hideLabel = false, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-start justify-between gap-4 rounded-sm text-left',
        hideLabel ? 'w-auto' : 'w-full',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {!hideLabel && (
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">{label}</span>
          {description && <span className="block text-xs text-muted mt-0.5 leading-snug">{description}</span>}
        </span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-150',
          checked ? 'bg-accent border-accent' : 'bg-surface-hover border-control'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full transition-[left] duration-150',
            checked ? 'left-6 bg-accent-foreground' : 'left-0.5 bg-surface'
          )}
        />
      </span>
    </button>
  )
}

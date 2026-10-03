import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Checkbox — accessible checkable control used for task/habit completion.
 */
export function Checkbox({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'flex items-center justify-center h-5 w-5 rounded-sm border shrink-0 transition-colors duration-150',
        checked
          ? 'bg-accent border-accent text-accent-foreground'
          : 'border-border bg-surface hover:border-accent',
        className
      )}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  )
}

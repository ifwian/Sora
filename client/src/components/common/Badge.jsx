import { cn } from '../../utils/cn'

const VARIANTS = {
  default: 'bg-surface-hover text-muted border-border',
  accent: 'bg-accent/10 text-accent border-accent/20',
  success: 'bg-success-bg text-success border-transparent',
  warning: 'bg-warning-bg text-warning border-transparent',
  danger: 'bg-danger-bg text-danger border-transparent',
}

/**
 * Badge — small status/category label.
 * variant: 'default' | 'accent' | 'success' | 'warning' | 'danger'
 */
export function Badge({ variant = 'default', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-6 px-2 rounded-sm border text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

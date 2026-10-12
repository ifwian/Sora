import { cn } from '../../utils/cn'

const VARIANTS = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent-hover',
  secondary:
    'bg-surface text-foreground border border-border hover:bg-surface-hover',
  ghost:
    'bg-transparent text-foreground hover:bg-surface-hover',
  danger:
    'bg-danger text-danger-foreground hover:bg-danger-hover',
}

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
}

/**
 * Button — the base action element for the app.
 *
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'sm' | 'md' | 'lg'
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-sm font-medium',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

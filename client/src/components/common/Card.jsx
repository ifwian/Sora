import { cn } from '../../utils/cn'

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

/**
 * Card — the base surface container used to group related content.
 * Separation comes from a hairline border, not a shadow.
 */
export function Card({ padding = 'md', className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-md',
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-base font-semibold text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

Card.Description = function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-muted mt-1', className)} {...props}>
      {children}
    </p>
  )
}

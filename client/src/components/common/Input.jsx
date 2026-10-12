import { useId } from 'react'
import { cn } from '../../utils/cn'

/**
 * Input — labeled text field with optional helper/error text.
 */
export function Input({
  label,
  helperText,
  error,
  id,
  className,
  ...props
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedById = error || helperText ? `${inputId}-description` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedById}
        className={cn(
          'h-10 px-3 rounded-sm bg-surface border text-sm text-foreground',
          'placeholder:text-muted',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          error ? 'border-danger' : 'border-control',
          className
        )}
        {...props}
      />
      {(error || helperText) && (
        <p
          id={describedById}
          className={cn('text-xs', error ? 'text-danger' : 'text-muted')}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}

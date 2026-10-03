import { useId } from 'react'
import { cn } from '../../utils/cn'

/**
 * Textarea — multi-line field, styled to match Input.
 */
export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  rows = 4,
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
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedById}
        className={cn(
          'px-3 py-2 rounded-sm bg-surface border text-sm text-foreground resize-y',
          'placeholder:text-muted',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          error ? 'border-danger' : 'border-border',
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

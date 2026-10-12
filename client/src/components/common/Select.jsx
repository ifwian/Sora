import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Select — native <select> styled to match Input, with an optional
 * "All" / blank option handled by the caller via options[0].
 */
export function Select({ label, options, className, id, error, ...props }) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            'h-10 w-full appearance-none pl-3 pr-8 rounded-sm bg-surface border text-sm text-foreground',
            error ? 'border-danger' : 'border-control',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

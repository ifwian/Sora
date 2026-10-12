import { useRef } from 'react'
import { cn } from '../../utils/cn'

/**
 * Tabs — controlled tab strip. Follows the ARIA tabs pattern: only the active
 * tab is in the Tab order, and ← → Home End move between tabs. On narrow
 * screens the strip scrolls sideways instead of wrapping.
 */
export function Tabs({ options, value, onChange, className }) {
  const refs = useRef([])

  const handleKeyDown = (event, index) => {
    const last = options.length - 1
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-border overflow-x-auto max-w-full', className)}>
      {options.map((option, index) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'px-3 h-9 shrink-0 whitespace-nowrap text-sm font-medium border-b-2 -mb-px transition-colors duration-150',
              active ? 'border-accent text-foreground' : 'border-transparent text-muted hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

import { cn } from '../../utils/cn'

/**
 * Tabs — simple segmented tab control (controlled).
 * options: [{ value, label }], value/onChange for the active tab.
 */
export function Tabs({ options, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('inline-flex items-center gap-1 border-b border-border', className)}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 h-9 text-sm font-medium border-b-2 -mb-px transition-colors duration-150',
              active
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

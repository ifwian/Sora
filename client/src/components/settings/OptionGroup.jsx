import { useRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * OptionGroup — a set of card-style radio choices (palette, shape, text size…).
 * Follows the ARIA radio-group pattern: one option is in the Tab order, and the arrow keys move
 * between options (and select them). Each option can show a `preview` above its label.
 */
export function OptionGroup({ label, options, value, onChange, columns = 'grid-cols-3', renderPreview }) {
  const refs = useRef([])

  const handleKeyDown = (event, index) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn('grid gap-3', columns)}>
      {options.map((option, index) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'relative flex flex-col gap-2 p-2.5 rounded-md border text-left transition-colors duration-150',
              selected
                ? 'border-accent ring-2 ring-accent bg-surface'
                : 'border-border bg-surface hover:bg-surface-hover',
            )}
          >
            {renderPreview?.(option)}
            <span className="flex items-center justify-between gap-2 px-0.5">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                {option.blurb && <span className="block text-xs text-muted leading-snug">{option.blurb}</span>}
              </span>
              {selected && <Check size={15} className="text-accent shrink-0" aria-hidden="true" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../utils/cn'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

/**
 * ThemeToggle — segmented control for light / dark / system preference.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className="inline-flex items-center gap-0.5 p-0.5 bg-surface-hover border border-border rounded-sm"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center justify-center h-7 w-7 rounded-sm transition-colors duration-150',
              active
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            )}
          >
            <Icon size={15} />
          </button>
        )
      })}
    </div>
  )
}

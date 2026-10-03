import { Search, Menu } from 'lucide-react'
import { ThemeToggle } from '../common/ThemeToggle'

/**
 * Header — top bar with global search, theme toggle, and profile.
 * The search input is visual-only for now; wired up in Milestone 20.
 */
export function Header({ onOpenMobileNav }) {
  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-4 md:px-6 sticky top-0 bg-background/95 backdrop-blur z-30">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="md:hidden text-muted hover:text-foreground rounded-sm p-1.5 -ml-1.5"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 max-w-md">
        <label className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search everything..."
            className="h-9 w-full pl-9 pr-3 rounded-sm bg-surface border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div
          className="h-8 w-8 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center shrink-0"
          title="Guest"
        >
          G
        </div>
      </div>
    </header>
  )
}

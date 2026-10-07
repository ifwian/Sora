import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Menu, LogOut } from 'lucide-react'
import { ThemeToggle } from '../common/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'

function initialsFor(user) {
  const source = user?.name || user?.email || '?'
  return source.charAt(0).toUpperCase()
}

/**
 * Header — top bar with global search, theme toggle, and profile menu.
 * The search input is visual-only for now; wired up in Milestone 20.
 */
export function Header({ onOpenMobileNav }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

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

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            className="h-8 w-8 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center shrink-0"
          >
            {initialsFor(user)}
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-56 bg-surface border border-border rounded-md shadow-lg p-2">
                <div className="px-2 py-1.5 mb-1 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || 'Account'}
                  </p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-foreground hover:bg-surface-hover"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

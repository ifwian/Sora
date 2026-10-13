import { NavLink } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'
import { MoreHorizontal, X } from 'lucide-react'
import { MOBILE_PRIMARY_ITEMS, NAV_SECTIONS, SETTINGS_ITEM } from '../../constants/navigation'
import { cn } from '../../utils/cn'

function BottomNavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium',
          isActive ? 'text-accent' : 'text-muted'
        )
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )
}

/**
 * MobileNav — fixed bottom bar for the most-used sections, plus a
 * "More" button that opens a full-height drawer with the rest of the
 * navigation (mirrors the desktop Sidebar's grouping).
 */
export function MobileNav({ drawerOpen, onOpenDrawer, onCloseDrawer }) {
  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-surface border-t border-border flex items-stretch z-30"
        aria-label="Primary"
      >
        {MOBILE_PRIMARY_ITEMS.map((item) => (
          <BottomNavItem key={item.to} {...item} />
        ))}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium text-muted"
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      {createPortal(
        <AnimatePresence>
          {drawerOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <m.div
                className="absolute inset-0 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={onCloseDrawer}
                aria-hidden="true"
              />
              <m.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-background border-r border-border flex flex-col"
              >
                <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                  <span className="text-sm font-semibold tracking-tight">Sora</span>
                  <button
                    type="button"
                    onClick={onCloseDrawer}
                    aria-label="Close navigation menu"
                    className="text-muted hover:text-foreground rounded-sm p-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
                  {NAV_SECTIONS.map((section, index) => (
                    <div key={section.label ?? `section-${index}`} className="flex flex-col gap-1">
                      {section.label && (
                        <p className="px-3 mb-1 text-xs font-medium text-muted uppercase tracking-wide">
                          {section.label}
                        </p>
                      )}
                      {section.items.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={end}
                          onClick={onCloseDrawer}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 h-9 px-3 rounded-sm text-sm font-medium transition-colors duration-150',
                              isActive
                                ? 'bg-surface-hover text-foreground'
                                : 'text-muted hover:text-foreground hover:bg-surface-hover'
                            )
                          }
                        >
                          <Icon size={17} className="shrink-0" />
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </nav>

                <div className="border-t border-border p-3">
                  <NavLink
                    to={SETTINGS_ITEM.to}
                    onClick={onCloseDrawer}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 h-9 px-3 rounded-sm text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-surface-hover text-foreground'
                          : 'text-muted hover:text-foreground hover:bg-surface-hover'
                      )
                    }
                  >
                    <SETTINGS_ITEM.icon size={17} className="shrink-0" />
                    {SETTINGS_ITEM.label}
                  </NavLink>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

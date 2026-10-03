import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NAV_SECTIONS, SETTINGS_ITEM } from '../../constants/navigation'
import { cn } from '../../utils/cn'

function NavItem({ to, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 h-9 px-3 rounded-sm text-sm font-medium transition-colors duration-150',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-surface-hover text-foreground'
            : 'text-muted hover:text-foreground hover:bg-surface-hover'
        )
      }
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

/**
 * Sidebar — primary desktop navigation, collapsible to icon-only.
 * Hidden below md; MobileNav takes over on small screens.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-border bg-background h-screen sticky top-0',
        'transition-[width] duration-150',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div
        className={cn(
          'h-14 flex items-center border-b border-border',
          collapsed ? 'justify-center px-0' : 'justify-between px-4'
        )}
      >
        {!collapsed && <span className="text-sm font-semibold tracking-tight">Personal OS</span>}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-muted hover:text-foreground rounded-sm p-1 transition-colors"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {NAV_SECTIONS.map((section, index) => (
          <div key={section.label ?? `section-${index}`} className="flex flex-col gap-1">
            {section.label && !collapsed && (
              <p className="px-3 mb-1 text-xs font-medium text-muted uppercase tracking-wide">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <NavItem {...SETTINGS_ITEM} collapsed={collapsed} />
      </div>
    </aside>
  )
}

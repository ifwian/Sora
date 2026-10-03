import { Link } from 'react-router-dom'

/**
 * WidgetHeader — title + "View all" link, shared across dashboard widgets.
 */
export function WidgetHeader({ title, viewAllHref }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {viewAllHref && (
        <Link to={viewAllHref} className="text-xs text-muted hover:text-accent transition-colors">
          View all
        </Link>
      )}
    </div>
  )
}

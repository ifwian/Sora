import { Card } from '../common/Card'

/** SettingsSection — a titled card used by every Settings tab. */
export function SettingsSection({ title, description, children, className }) {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted mt-1">{description}</p>}
      </div>
      {children}
    </Card>
  )
}

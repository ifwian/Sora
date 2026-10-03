import { Plus } from 'lucide-react'
import { Button } from '../common/Button'
import { useToast } from '../../hooks/useToast'

const ACTIONS = [
  { label: 'New task', milestone: 'Milestone 05' },
  { label: 'New note', milestone: 'Milestone 06' },
  { label: 'New event', milestone: 'Milestone 07' },
]

/**
 * QuickActions — shortcuts for the most common things to create.
 * Not wired to real creation yet (that lands with each module's own
 * milestone) — clicking is honest about that instead of doing nothing.
 */
export function QuickActions() {
  const { showToast } = useToast()

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Button
          key={action.label}
          variant="secondary"
          size="sm"
          onClick={() =>
            showToast({ message: `${action.label} arrives in ${action.milestone}.`, variant: 'info' })
          }
        >
          <Plus size={14} />
          {action.label}
        </Button>
      ))}
    </div>
  )
}

import { useState } from 'react'
import { Pencil, Trash2, X, Plus } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Checkbox } from '../common/Checkbox'
import { ProgressBar } from '../common/ProgressBar'
import { goalProgress } from '../../utils/goalUtils'
import { formatShortDate } from '../../utils/date'
import { cn } from '../../utils/cn'

/** GoalCard — a goal with progress, a milestone checklist, and an inline "add milestone" field. */
export function GoalCard({ goal, onEdit, onDelete, onToggleGoal, onAddMilestone, onToggleMilestone, onDeleteMilestone }) {
  const [draft, setDraft] = useState('')
  const progress = goalProgress(goal)

  const handleAdd = async (event) => {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return
    try {
      await onAddMilestone(goal.id, title)
      setDraft('')
    } catch {
      // Error toast already shown by GoalsContext; keep the draft.
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={goal.completed}
          onChange={() => onToggleGoal(goal)}
          label={`Mark "${goal.title}" as ${goal.completed ? 'not achieved' : 'achieved'}`}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <h3 className={cn('text-sm font-semibold text-foreground', goal.completed && 'line-through text-muted')}>
            {goal.title}
          </h3>
          {goal.description && <p className="text-xs text-muted mt-1">{goal.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {goal.category && <Badge variant="default">{goal.category}</Badge>}
            {goal.deadline && <span className="text-xs text-muted">Due {formatShortDate(goal.deadline)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label={`Edit "${goal.title}"`}
            className="text-muted hover:text-foreground rounded-sm p-1.5"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label={`Delete "${goal.title}"`}
            className="text-muted hover:text-danger rounded-sm p-1.5"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ProgressBar value={progress} />
        <span className="text-xs text-muted w-8 text-right shrink-0">{progress}%</span>
      </div>

      <ul className="flex flex-col gap-2">
        {goal.milestones.map((milestone) => (
          <li key={milestone.id} className="flex items-center gap-3">
            <Checkbox
              checked={milestone.completed}
              onChange={() => onToggleMilestone(goal.id, milestone)}
              label={`Mark "${milestone.title}" as ${milestone.completed ? 'incomplete' : 'complete'}`}
            />
            <span className={cn('flex-1 text-sm text-foreground', milestone.completed && 'line-through text-muted')}>
              {milestone.title}
            </span>
            <button
              type="button"
              onClick={() => onDeleteMilestone(goal.id, milestone.id)}
              aria-label={`Remove milestone "${milestone.title}"`}
              className="text-muted hover:text-danger rounded-sm p-1"
            >
              <X size={13} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a milestone"
          aria-label={`Add a milestone to ${goal.title}`}
          className="h-8 flex-1 px-3 rounded-sm bg-surface border border-control text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          aria-label="Add milestone"
          className="h-8 w-8 flex items-center justify-center rounded-sm border border-control text-muted hover:text-foreground hover:bg-surface-hover"
        >
          <Plus size={14} />
        </button>
      </form>
    </Card>
  )
}

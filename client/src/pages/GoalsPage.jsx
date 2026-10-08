import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { GoalForm } from '../components/goals/GoalForm'
import { GoalCard } from '../components/goals/GoalCard'
import { useGoals } from '../hooks/useGoals'
import { useToast } from '../hooks/useToast'

export function GoalsPage() {
  const { goals, loading, error, addGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone, refetch } =
    useGoals()
  const { showToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [deletingGoal, setDeletingGoal] = useState(null)

  const openCreate = () => {
    setEditingGoal(null)
    setFormOpen(true)
  }

  const handleSubmit = async (data) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, data)
        showToast({ message: 'Goal updated.', variant: 'success' })
      } else {
        await addGoal(data)
        showToast({ message: 'Goal created.', variant: 'success' })
      }
      setFormOpen(false)
    } catch {
      // Error toast already shown by GoalsContext.
    }
  }

  const handleDeleteConfirmed = async () => {
    try {
      await deleteGoal(deletingGoal.id)
      showToast({ message: 'Goal deleted.', variant: 'info' })
    } catch {
      // Error toast already shown by GoalsContext.
    }
  }

  const safe = (fn) => async (...args) => {
    try {
      await fn(...args)
    } catch {
      // Error toast already shown by GoalsContext.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New goal
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading goals..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals yet."
          description="Set something you want to achieve and break it into milestones."
          actionLabel="New goal"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => {
                setEditingGoal(g)
                setFormOpen(true)
              }}
              onDelete={setDeletingGoal}
              onToggleGoal={safe((g) => updateGoal(g.id, { completed: !g.completed }))}
              onAddMilestone={addMilestone}
              onToggleMilestone={safe(toggleMilestone)}
              onDeleteMilestone={safe(deleteMilestone)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingGoal ? 'Edit goal' : 'New goal'}>
        <GoalForm goal={editingGoal} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete goal?"
        description={deletingGoal ? `"${deletingGoal.title}" and its milestones will be permanently deleted.` : ''}
      />
    </div>
  )
}

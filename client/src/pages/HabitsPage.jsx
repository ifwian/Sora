import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { HabitForm } from '../components/habits/HabitForm'
import { HabitRow } from '../components/habits/HabitRow'
import { useHabits } from '../hooks/useHabits'
import { useToast } from '../hooks/useToast'
import { completionRate } from '../utils/habitUtils'

function averageRate(habits, days) {
  if (habits.length === 0) return 0
  const total = habits.reduce((sum, h) => sum + completionRate(h.completedDates, days), 0)
  return Math.round(total / habits.length)
}

export function HabitsPage() {
  const { habits, loading, error, addHabit, updateHabit, deleteHabit, toggleCompletion, refetch } = useHabits()
  const { showToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deletingHabit, setDeletingHabit] = useState(null)

  const openCreate = () => {
    setEditingHabit(null)
    setFormOpen(true)
  }

  const handleSubmit = async (data) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, data)
        showToast({ message: 'Habit updated.', variant: 'success' })
      } else {
        await addHabit(data)
        showToast({ message: 'Habit created.', variant: 'success' })
      }
      setFormOpen(false)
    } catch {
      // Error toast already shown by HabitsContext.
    }
  }

  const handleDeleteConfirmed = async () => {
    try {
      await deleteHabit(deletingHabit.id)
      showToast({ message: 'Habit deleted.', variant: 'info' })
    } catch {
      // Error toast already shown by HabitsContext.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New habit
        </Button>
      </div>

      {!loading && !error && habits.length > 0 && (
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <Card padding="sm">
            <p className="text-xs text-muted">Last 7 days</p>
            <p className="text-xl font-semibold mt-1">{averageRate(habits, 7)}%</p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-muted">Last 30 days</p>
            <p className="text-xl font-semibold mt-1">{averageRate(habits, 30)}%</p>
          </Card>
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading habits..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : habits.length === 0 ? (
        <EmptyState
          title="No habits yet."
          description="Start tracking something you want to do every day."
          actionLabel="New habit"
          onAction={openCreate}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onToggle={toggleCompletion}
              onEdit={(h) => {
                setEditingHabit(h)
                setFormOpen(true)
              }}
              onDelete={setDeletingHabit}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingHabit ? 'Edit habit' : 'New habit'}>
        <HabitForm habit={editingHabit} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingHabit)}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete habit?"
        description={deletingHabit ? `"${deletingHabit.name}" and its history will be permanently deleted.` : ''}
      />
    </div>
  )
}

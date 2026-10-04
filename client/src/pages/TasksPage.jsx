import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { Tabs } from '../components/common/Tabs'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskItem } from '../components/tasks/TaskItem'
import { TaskFilters } from '../components/tasks/TaskFilters'
import { useTasks } from '../hooks/useTasks'
import { useToast } from '../hooks/useToast'
import { VIEW_OPTIONS } from '../constants/taskOptions'
import { filterByView, applyFilters, sortTasks } from '../utils/taskUtils'

const EMPTY_FILTERS = { search: '', priority: '', category: '', sortBy: 'DUE_DATE' }

export function TasksPage() {
  const { tasks, loading, error, addTask, updateTask, deleteTask, toggleComplete, refetch } = useTasks()
  const { showToast } = useToast()

  const [view, setView] = useState('TODAY')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)

  const visibleTasks = useMemo(() => {
    const byView = filterByView(tasks, view)
    const filtered = applyFilters(byView, filters)
    return sortTasks(filtered, filters.sortBy)
  }, [tasks, view, filters])

  const openCreate = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data)
        showToast({ message: 'Task updated.', variant: 'success' })
      } else {
        await addTask(data)
        showToast({ message: 'Task created.', variant: 'success' })
      }
      setFormOpen(false)
    } catch {
      // Error toast is already shown by TasksContext; keep the form open
      // so the person doesn't lose what they typed.
    }
  }

  const handleDeleteConfirmed = async () => {
    try {
      await deleteTask(deletingTask.id)
      showToast({ message: 'Task deleted.', variant: 'info' })
    } catch {
      // Error toast already shown by TasksContext.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New task
        </Button>
      </div>

      <Tabs options={VIEW_OPTIONS} value={view} onChange={setView} />

      <TaskFilters filters={filters} onChange={setFilters} />

      <Card padding="none">
        {loading ? (
          <LoadingState label="Loading tasks..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : visibleTasks.length === 0 ? (
          <EmptyState
            title="No tasks here."
            description="Try a different view, clear your filters, or create a new task."
            actionLabel="New task"
            onAction={openCreate}
          />
        ) : (
          <ul className="px-4">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                onEdit={openEdit}
                onDelete={setDeletingTask}
              />
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingTask ? 'Edit task' : 'New task'}
      >
        <TaskForm task={editingTask} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete task?"
        description={deletingTask ? `"${deletingTask.title}" will be permanently deleted.` : ''}
      />
    </div>
  )
}

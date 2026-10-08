import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { FieldsForm } from './FieldsForm'
import { useToast } from '../../hooks/useToast'

/**
 * ResourcePanel — a complete list + add/edit modal + delete confirmation for
 * one resource, driven by a field config. `resource` is what useResource returns.
 */
export function ResourcePanel({
  resource,
  entity,
  fields,
  createDefaults,
  renderItem,
  disabledReason,
  emptyDescription,
}) {
  const { items, loading, error, add, update, remove, refetch } = resource
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.id, data)
      showToast({ message: `${entity} updated.`, variant: 'success' })
    } else {
      await add(data)
      showToast({ message: `${entity} added.`, variant: 'success' })
    }
    setFormOpen(false)
  }

  const handleDelete = async () => {
    try {
      await remove(deleting.id)
      showToast({ message: `${entity} deleted.`, variant: 'info' })
    } catch {
      // Error toast already shown by useResource.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        {disabledReason && <p className="text-xs text-muted">{disabledReason}</p>}
        <Button size="sm" onClick={openCreate} disabled={Boolean(disabledReason)}>
          <Plus size={14} />
          Add {entity.toLowerCase()}
        </Button>
      </div>

      <Card padding="none">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            title={`No ${entity.toLowerCase()} entries yet.`}
            description={emptyDescription}
            actionLabel={disabledReason ? undefined : `Add ${entity.toLowerCase()}`}
            onAction={disabledReason ? undefined : openCreate}
          />
        ) : (
          <ul className="px-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">{renderItem(item, { update })}</div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(item)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit ${entity.toLowerCase()}`}
                  className="text-muted hover:text-foreground rounded-sm p-1.5"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(item)}
                  aria-label={`Delete ${entity.toLowerCase()}`}
                  className="text-muted hover:text-danger rounded-sm p-1.5"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${entity.toLowerCase()}` : `Add ${entity.toLowerCase()}`}
      >
        <FieldsForm
          key={editing?.id ?? 'new'}
          fields={fields}
          initial={editing ?? createDefaults}
          submitLabel={editing ? 'Save changes' : `Add ${entity.toLowerCase()}`}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${entity.toLowerCase()}?`}
        description="This can't be undone."
      />
    </div>
  )
}

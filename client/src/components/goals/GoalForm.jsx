import { useState } from 'react'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { Button } from '../common/Button'

/** GoalForm — create or edit a goal. Milestones are managed on the goal card itself. */
export function GoalForm({ goal, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: goal?.title ?? '',
    description: goal?.description ?? '',
    category: goal?.category ?? '',
    deadline: goal?.deadline ?? '',
  })
  const [error, setError] = useState('')

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Give the goal a title.')
      return
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      deadline: form.deadline || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        value={form.title}
        onChange={(e) => {
          update('title', e.target.value)
          if (error) setError('')
        }}
        error={error}
        placeholder="Learn React"
        autoFocus
      />
      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Optional"
        rows={2}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Category"
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => update('deadline', e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{goal ? 'Save changes' : 'Create goal'}</Button>
      </div>
    </form>
  )
}

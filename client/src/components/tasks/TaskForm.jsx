import { useState } from 'react'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { Select } from '../common/Select'
import { Checkbox } from '../common/Checkbox'
import { Button } from '../common/Button'
import { TagInput } from '../common/TagInput'
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  RECURRING_FREQUENCY_OPTIONS,
} from '../../constants/taskOptions'

const EMPTY_TASK = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  category: 'School',
  tags: [],
  dueDate: '',
  dueTime: '',
  recurringFrequency: null,
}

/**
 * TaskForm — create or edit a task. Pass `task` to edit, omit to create.
 */
export function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_TASK,
    ...task,
    dueDate: task?.dueDate ?? '',
    dueTime: task?.dueTime ?? '',
  }))
  const [titleError, setTitleError] = useState('')

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setTitleError('Give the task a name.')
      return
    }
    onSubmit({
      ...form,
      title: form.title.trim(),
      dueDate: form.dueDate || null,
      dueTime: form.dueTime || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        value={form.title}
        onChange={(event) => {
          update('title', event.target.value)
          if (titleError) setTitleError('')
        }}
        error={titleError}
        placeholder="Finish SQL assignment"
        autoFocus
      />

      <Textarea
        label="Description"
        value={form.description}
        onChange={(event) => update('description', event.target.value)}
        placeholder="Optional detail..."
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={form.priority}
          onChange={(event) => update('priority', event.target.value)}
          options={PRIORITY_OPTIONS}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(event) => update('status', event.target.value)}
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Due date"
          type="date"
          value={form.dueDate}
          onChange={(event) => update('dueDate', event.target.value)}
        />
        <Input
          label="Due time"
          type="time"
          value={form.dueTime}
          onChange={(event) => update('dueTime', event.target.value)}
        />
      </div>

      <Select
        label="Category"
        value={form.category}
        onChange={(event) => update('category', event.target.value)}
        options={CATEGORY_OPTIONS}
      />

      <TagInput label="Tags" tags={form.tags} onChange={(tags) => update('tags', tags)} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={Boolean(form.recurringFrequency)}
            onChange={(checked) => update('recurringFrequency', checked ? 'WEEKLY' : null)}
            label="Repeat this task"
          />
          <span className="text-sm text-foreground">Repeat this task</span>
        </div>
        {form.recurringFrequency && (
          <Select
            value={form.recurringFrequency}
            onChange={(event) => update('recurringFrequency', event.target.value)}
            options={RECURRING_FREQUENCY_OPTIONS}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  )
}

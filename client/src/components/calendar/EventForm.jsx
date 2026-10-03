import { useState } from 'react'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import { EVENT_CATEGORY_OPTIONS } from '../../constants/eventOptions'

function emptyEvent(defaultDate) {
  return {
    title: '',
    description: '',
    location: '',
    category: 'Event',
    date: defaultDate,
    startTime: '09:00',
    endTime: '10:00',
  }
}

/**
 * EventForm — create or edit a calendar event. Pass `event` to edit,
 * or `defaultDate` to pre-fill the date when creating from a day cell.
 */
export function EventForm({ event, defaultDate, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...emptyEvent(defaultDate), ...event }))
  const [errors, setErrors] = useState({})

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (formEvent) => {
    formEvent.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Give the event a name.'
    if (!form.date) nextErrors.date = 'Pick a date.'
    if (form.startTime && form.endTime && form.endTime < form.startTime) {
      nextErrors.endTime = 'End time must be after start time.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onSubmit({ ...form, title: form.title.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        error={errors.title}
        placeholder="Database Management — Lab"
        autoFocus
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
          error={errors.date}
        />
        <Input
          label="Start time"
          type="time"
          value={form.startTime}
          onChange={(e) => update('startTime', e.target.value)}
        />
        <Input
          label="End time"
          type="time"
          value={form.endTime}
          onChange={(e) => update('endTime', e.target.value)}
          error={errors.endTime}
        />
      </div>

      <Select
        label="Category"
        value={form.category}
        onChange={(e) => update('category', e.target.value)}
        options={EVENT_CATEGORY_OPTIONS}
      />

      <Input
        label="Location"
        value={form.location}
        onChange={(e) => update('location', e.target.value)}
        placeholder="Optional"
      />

      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Optional detail..."
        rows={2}
      />

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {event ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </form>
  )
}

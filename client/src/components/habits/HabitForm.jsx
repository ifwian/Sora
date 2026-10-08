import { useState } from 'react'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

/** HabitForm — create or edit a habit. Pass `habit` to edit. */
export function HabitForm({ habit, onSubmit, onCancel }) {
  const [name, setName] = useState(habit?.name ?? '')
  const [category, setCategory] = useState(habit?.category ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give the habit a name.')
      return
    }
    onSubmit({ name: name.trim(), category: category.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (error) setError('')
        }}
        error={error}
        placeholder="Coding practice"
        autoFocus
      />
      <Input
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Optional"
      />
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{habit ? 'Save changes' : 'Create habit'}</Button>
      </div>
    </form>
  )
}

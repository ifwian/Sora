import { useState } from 'react'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
import { TagInput } from '../common/TagInput'
import { Button } from '../common/Button'

const EMPTY_NOTE = { title: '', content: '', tags: [] }

/**
 * NoteForm — create or edit a note. Pass `note` to edit, omit to create.
 * Plain text for now — Markdown support is a later enhancement per spec.
 */
export function NoteForm({ note, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_NOTE, ...note }))
  const [titleError, setTitleError] = useState('')

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setTitleError('Give the note a title.')
      return
    }
    onSubmit({ ...form, title: form.title.trim() })
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
        placeholder="Note title"
        autoFocus
      />
      <Textarea
        label="Content"
        value={form.content}
        onChange={(event) => update('content', event.target.value)}
        placeholder="Write your note..."
        rows={6}
      />
      <TagInput label="Tags" tags={form.tags} onChange={(tags) => update('tags', tags)} />

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {note ? 'Save changes' : 'Create note'}
        </Button>
      </div>
    </form>
  )
}

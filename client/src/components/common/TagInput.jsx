import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '../common/Badge'

/**
 * TagInput — type a tag and press Enter or comma to add it as a chip.
 */
export function TagInput({ label, tags, onChange }) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const value = draft.trim().toLowerCase()
    if (value && !tags.includes(value)) {
      onChange([...tags, value])
    }
    setDraft('')
  }

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Backspace' && !draft && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div className="flex flex-wrap items-center gap-1.5 min-h-10 px-2 py-1.5 rounded-sm bg-surface border border-border focus-within:ring-2 focus-within:ring-accent">
        {tags.map((tag) => (
          <Badge key={tag} variant="default" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="hover:text-foreground"
            >
              <X size={11} />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? 'Add a tag and press Enter' : ''}
          className="flex-1 min-w-[6rem] bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
      </div>
    </div>
  )
}

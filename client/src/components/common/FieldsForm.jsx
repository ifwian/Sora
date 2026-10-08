import { useState } from 'react'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Select } from './Select'
import { Button } from './Button'

function toFormValues(fields, initial) {
  const values = {}
  for (const field of fields) {
    const raw = initial?.[field.name]
    values[field.name] = raw === null || raw === undefined ? '' : String(raw)
  }
  return values
}

/**
 * FieldsForm — a small config-driven form. Each field:
 *  { name, label, type: 'text'|'number'|'date'|'select'|'textarea', required,
 *    options (for select), nullable (send null when cleared), placeholder, step }
 * Empty optional fields are omitted from the payload unless `nullable` is set,
 * in which case they're sent as null so a value can be cleared when editing.
 */
export function FieldsForm({ fields, initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState(() => toFormValues(fields, initial))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    const payload = {}

    for (const field of fields) {
      const raw = values[field.name].trim()
      if (raw === '') {
        if (field.required) nextErrors[field.name] = `${field.label} is required.`
        else if (field.nullable) payload[field.name] = null
        continue
      }
      if (field.type === 'number') {
        const number = Number(raw)
        if (Number.isNaN(number)) nextErrors[field.name] = `${field.label} must be a number.`
        else payload[field.name] = number
      } else {
        payload[field.name] = raw
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch {
      // The caller surfaces the error (toast); keep the form open so nothing typed is lost.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map((field, index) => {
        const common = {
          label: field.label,
          value: values[field.name],
          error: errors[field.name],
        }
        if (field.type === 'select') {
          const options = field.required
            ? field.options
            : [{ value: '', label: field.blankLabel ?? 'None' }, ...field.options]
          return (
            <Select
              key={field.name}
              {...common}
              options={options}
              onChange={(e) => setValue(field.name, e.target.value)}
            />
          )
        }
        if (field.type === 'textarea') {
          return (
            <Textarea
              key={field.name}
              {...common}
              rows={3}
              placeholder={field.placeholder}
              onChange={(e) => setValue(field.name, e.target.value)}
            />
          )
        }
        return (
          <Input
            key={field.name}
            {...common}
            type={field.type ?? 'text'}
            step={field.type === 'number' ? (field.step ?? 'any') : undefined}
            placeholder={field.placeholder}
            helperText={field.helperText}
            autoFocus={index === 0}
            onChange={(e) => setValue(field.name, e.target.value)}
          />
        )
      })}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

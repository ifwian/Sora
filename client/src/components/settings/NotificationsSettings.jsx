import { useState } from 'react'
import { BellRing, RotateCcw } from 'lucide-react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Switch } from '../common/Switch'
import { SettingsSection } from './SettingsSection'
import { usePreferences } from '../../hooks/usePreferences'
import { useSavePreferences } from '../../hooks/useSavePreferences'
import { DEFAULT_PREFERENCES, LEAD_TIME_FIELDS, NOTIFICATION_TYPES } from '../../constants/preferences'

/**
 * A small number field that saves when the person leaves it (or presses Enter).
 * While typing, the draft is tied to the account value it started from, so a
 * fresh value from the server (or another tab) simply takes over again.
 */
function LeadDaysInput({ field, value, onSave }) {
  const [draft, setDraft] = useState(null)
  const text = draft?.base === value ? draft.text : String(value)

  const commit = () => {
    const days = Number(text)
    setDraft(null)
    const empty = text.trim() === ''
    if (empty || !Number.isInteger(days) || days < 0 || days > field.maxDays || days === value) return
    onSave(days)
  }

  return (
    <Input
      label={`${field.label} — days before`}
      type="number"
      min={0}
      max={field.maxDays}
      step={1}
      value={text}
      onChange={(event) => setDraft({ base: value, text: event.target.value })}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}

/** Settings → Notifications. Which reminders appear, quiet hours and lead times. */
export function NotificationsSettings() {
  const { preferences } = usePreferences()
  const { save } = useSavePreferences()
  const { notifications } = preferences

  const toggleType = (id, value) => save({ notifications: { types: { [id]: value } } })

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <SettingsSection
        title="Reminder types"
        description="Sora only shows reminders for the things you choose here. Dismissed reminders return the next day if they still matter."
      >
        <div className="flex flex-col gap-4">
          {NOTIFICATION_TYPES.map((type) => (
            <Switch
              key={type.id}
              label={type.label}
              description={type.blurb}
              checked={notifications.types[type.id]}
              onChange={(value) => toggleType(type.id, value)}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Quiet hours"
        description="Pause reminders during a window of the day. Uses your time zone from Preferences."
      >
        <Switch
          label="Quiet hours"
          description="Nothing new will appear until the window ends."
          checked={notifications.quietHours.enabled}
          onChange={(enabled) => save({ notifications: { quietHours: { enabled } } })}
        />
        <div
          className={
            notifications.quietHours.enabled
              ? 'mt-4 grid gap-4 sm:grid-cols-2'
              : 'mt-4 grid gap-4 sm:grid-cols-2 opacity-50'
          }
        >
          <Input
            label="Start"
            type="time"
            value={notifications.quietHours.start}
            disabled={!notifications.quietHours.enabled}
            onChange={(event) => save({ notifications: { quietHours: { start: event.target.value } } })}
          />
          <Input
            label="End"
            type="time"
            value={notifications.quietHours.end}
            disabled={!notifications.quietHours.enabled}
            onChange={(event) => save({ notifications: { quietHours: { end: event.target.value } } })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="How early to remind you"
        description="How many days before a deadline a reminder should appear. Overdue items always appear."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {LEAD_TIME_FIELDS.map((field) => (
            <LeadDaysInput
              key={field.id}
              field={field}
              value={notifications.leadDays[field.id]}
              onSave={(days) => save({ notifications: { leadDays: { [field.id]: days } } })}
            />
          ))}
        </div>
      </SettingsSection>

      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            save({
              notifications: {
                types: { ...DEFAULT_PREFERENCES.notifications.types },
                quietHours: { ...DEFAULT_PREFERENCES.notifications.quietHours },
                leadDays: { ...DEFAULT_PREFERENCES.notifications.leadDays },
              },
            })
          }
        >
          <RotateCcw size={14} />
          Reset notifications
        </Button>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted">
        <BellRing size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Reminders are calculated from what is already on this device and are never sent as push notifications.
      </p>
    </div>
  )
}

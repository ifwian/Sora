import { Select } from '../common/Select'
import { SettingsSection } from './SettingsSection'
import { OptionGroup } from './OptionGroup'
import { usePreferences } from '../../hooks/usePreferences'
import { useSavePreferences } from '../../hooks/useSavePreferences'
import {
  CURRENCY_SYMBOLS,
  DATE_FORMATS,
  FOCUS_MODES,
  TIMEZONES,
  TIME_FORMATS,
  WEEK_STARTS,
} from '../../constants/preferences'

const toOptions = (list) => list.map((item) => ({ value: item.id, label: item.label }))

const FOCUS_PREVIEW = {
  none: 'Clear the extra cues and show your normal dashboard.',
  focus: 'Keep one task in view and quiet the rest of the reminders.',
  study: 'Surface deadlines and study time first.',
  rest: 'Hide the productivity nudges and leave room to breathe.',
}

/** Settings → Preferences. Region, formats, week start and focus mode. */
export function PreferencesSettings() {
  const { preferences } = usePreferences()
  const { save } = useSavePreferences()

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <SettingsSection
        title="Region & formats"
        description="How dates, times and money appear everywhere in Sora. Today is calculated in your chosen time zone."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Time zone"
            value={preferences.timezone}
            options={toOptions(TIMEZONES)}
            onChange={(event) => save({ timezone: event.target.value })}
          />
          <Select
            label="Week starts on"
            value={preferences.weekStartsOn}
            options={toOptions(WEEK_STARTS)}
            onChange={(event) => save({ weekStartsOn: event.target.value })}
          />
          <Select
            label="Currency symbol"
            value={preferences.currencySymbol}
            options={toOptions(CURRENCY_SYMBOLS)}
            onChange={(event) => save({ currencySymbol: event.target.value })}
          />
          <Select
            label="Date format"
            value={preferences.dateFormat}
            options={toOptions(DATE_FORMATS)}
            onChange={(event) => save({ dateFormat: event.target.value })}
          />
          <Select
            label="Time format"
            value={preferences.timeFormat}
            options={toOptions(TIME_FORMATS)}
            onChange={(event) => save({ timeFormat: event.target.value })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Focus mode"
        description="A gentle preset for the dashboard and reminders. You can change it whenever you like."
      >
        <OptionGroup
          label="Focus mode"
          options={FOCUS_MODES}
          value={preferences.focusMode}
          onChange={(focusMode) => save({ focusMode })}
          columns="grid-cols-2"
          renderPreview={(option) => (
            <span
              aria-hidden="true"
              className="flex flex-col items-center justify-center gap-1 rounded-sm bg-surface-hover py-4"
            >
              <span className="text-2xl leading-none">{option.emoji}</span>
              <span className="text-[11px] text-muted text-center px-1">{FOCUS_PREVIEW[option.id]}</span>
            </span>
          )}
        />
      </SettingsSection>
    </div>
  )
}

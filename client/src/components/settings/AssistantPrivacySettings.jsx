import { Lock, ShieldCheck } from 'lucide-react'
import { Switch } from '../common/Switch'
import { SettingsSection } from './SettingsSection'
import { usePreferences } from '../../hooks/usePreferences'
import { useSavePreferences } from '../../hooks/useSavePreferences'
import { ASSISTANT_CATEGORIES } from '../../constants/preferences'

const NEVER_SHARED = ['Notes', 'Memories', 'Places', 'Photos', 'Email address', 'Password']

/** Settings → Assistant & privacy. The server enforces these choices before building the prompt. */
export function AssistantPrivacySettings() {
  const { preferences } = usePreferences()
  const { save } = useSavePreferences()

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <SettingsSection
        title="What the assistant may read"
        description="The assistant only sees the summaries you allow here. Changes apply to your next message."
      >
        <div className="flex flex-col gap-4">
          {ASSISTANT_CATEGORIES.map((category) => (
            <Switch
              key={category.id}
              label={category.label}
              description={category.blurb}
              checked={preferences.assistant[category.id]}
              onChange={(enabled) => save({ assistant: { [category.id]: enabled } })}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Always private">
        <ul className="flex flex-col gap-2">
          {NEVER_SHARED.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-foreground">
              <Lock size={14} className="text-muted shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted leading-relaxed">
          These are never included in an assistant request, even when every category above is on. Amounts are sent as
          plain numbers, and text from your own records is flattened so it cannot act like instructions.
        </p>
      </SettingsSection>

      <p className="flex items-start gap-2 text-xs text-muted">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        The assistant is read-only. It cannot create, edit or delete anything in your account.
      </p>
    </div>
  )
}

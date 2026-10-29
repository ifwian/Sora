import { useState } from 'react'
import { ArrowDown, ArrowUp, CalendarDays, CloudSun, GraduationCap, ListTodo, RotateCcw, StickyNote, Target, Wallet } from 'lucide-react'
import { Button } from '../common/Button'
import { Switch } from '../common/Switch'
import { SettingsSection } from './SettingsSection'
import { usePreferences } from '../../hooks/usePreferences'
import { useSavePreferences } from '../../hooks/useSavePreferences'
import { DEFAULT_PREFERENCES, DASHBOARD_WIDGETS } from '../../constants/preferences'

const ICONS = {
  tasks: ListTodo,
  forecast: CloudSun,
  upcoming: CalendarDays,
  habits: Target,
  goals: Target,
  notes: StickyNote,
  study: GraduationCap,
  finance: Wallet,
}

const WIDGET_META = Object.fromEntries(DASHBOARD_WIDGETS.map((widget) => [widget.id, widget]))

/** Settings → Dashboard. Choose which widgets appear, and in what order. */
export function DashboardSettings() {
  const { preferences } = usePreferences()
  const { save } = useSavePreferences()
  const serverWidgets = preferences.dashboard.widgets

  // Local order while a save is in flight. `base` ties the draft to the server
  // snapshot it came from, so a fresh account update simply takes over again.
  const [draft, setDraft] = useState(null)
  const widgets = draft?.base === serverWidgets ? draft.widgets : serverWidgets

  const commit = (next) => {
    setDraft({ base: serverWidgets, widgets: next })
    save({ dashboard: { widgets: next } })
  }

  const toggle = (id, visible) => commit(widgets.map((widget) => (widget.id === id ? { ...widget, visible } : widget)))

  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= widgets.length) return
    const next = [...widgets]
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }

  const reset = () => commit(DEFAULT_PREFERENCES.dashboard.widgets.map((widget) => ({ ...widget })))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <SettingsSection
        title="Dashboard widgets"
        description="Turn cards on or off and move the ones you use most to the top. Everything stays saved to your account."
      >
        <ul className="divide-y divide-border">
          {widgets.map((widget, index) => {
            const meta = WIDGET_META[widget.id]
            const Icon = ICONS[widget.id] ?? ListTodo
            return (
              <li key={widget.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-hover text-muted"
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{meta?.label ?? widget.id}</span>
                  {meta?.blurb && <span className="block text-xs text-muted">{meta.blurb}</span>}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${meta?.label ?? widget.id} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${meta?.label ?? widget.id} down`}
                    disabled={index === widgets.length - 1}
                    onClick={() => move(index, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <span className="ml-2">
                    <Switch
                      label={`Show ${meta?.label ?? widget.id}`}
                      checked={widget.visible}
                      onChange={(visible) => toggle(widget.id, visible)}
                      hideLabel
                    />
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw size={14} />
            Reset dashboard
          </Button>
        </div>
      </SettingsSection>
    </div>
  )
}

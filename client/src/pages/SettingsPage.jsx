import { useState } from 'react'
import { Tabs } from '../components/common/Tabs'
import { AccountSettings } from '../components/settings/AccountSettings'
import { AppearanceSettings } from '../components/settings/AppearanceSettings'
import { AssistantPrivacySettings } from '../components/settings/AssistantPrivacySettings'
import { DashboardSettings } from '../components/settings/DashboardSettings'
import { NotificationsSettings } from '../components/settings/NotificationsSettings'
import { PreferencesSettings } from '../components/settings/PreferencesSettings'
import { YourDataSettings } from '../components/settings/YourDataSettings'

const TABS = [
  { value: 'PREFERENCES', label: 'Preferences' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'NOTIFICATIONS', label: 'Notifications' },
  { value: 'ASSISTANT', label: 'Assistant & privacy' },
  { value: 'DATA', label: 'Your data' },
  { value: 'APPEARANCE', label: 'Appearance' },
  { value: 'ACCOUNT', label: 'Account' },
]

export function SettingsPage() {
  const [tab, setTab] = useState('PREFERENCES')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Tabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'PREFERENCES' && <PreferencesSettings />}
      {tab === 'DASHBOARD' && <DashboardSettings />}
      {tab === 'NOTIFICATIONS' && <NotificationsSettings />}
      {tab === 'ASSISTANT' && <AssistantPrivacySettings />}
      {tab === 'DATA' && <YourDataSettings />}
      {tab === 'APPEARANCE' && <AppearanceSettings />}
      {tab === 'ACCOUNT' && <AccountSettings />}
    </div>
  )
}

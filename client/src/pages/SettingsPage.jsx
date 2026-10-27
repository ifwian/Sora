import { useState } from 'react'
import { Tabs } from '../components/common/Tabs'
import { AccountSettings } from '../components/settings/AccountSettings'
import { AppearanceSettings } from '../components/settings/AppearanceSettings'

const TABS = [
  { value: 'APPEARANCE', label: 'Appearance' },
  { value: 'ACCOUNT', label: 'Account' },
]

export function SettingsPage() {
  const [tab, setTab] = useState('APPEARANCE')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Tabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'APPEARANCE' && <AppearanceSettings />}
      {tab === 'ACCOUNT' && <AccountSettings />}
    </div>
  )
}

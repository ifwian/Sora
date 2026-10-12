import { useState } from 'react'
import { Tabs } from '../common/Tabs'
import { ResourcePanel } from '../common/ResourcePanel'

/**
 * LibraryList — a status-tabbed ResourcePanel, shared by Games, Reading and
 * Movies. Each tab shows the items with that status, and "Add" pre-selects it.
 */
export function LibraryList({ title, resource, entity, statuses, fields, renderItem, emptyDescription }) {
  const [status, setStatus] = useState(statuses[0].value)
  const filtered = { ...resource, items: resource.items.filter((item) => item.status === status) }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Tabs options={statuses} value={status} onChange={setStatus} />
      <ResourcePanel
        resource={filtered}
        entity={entity}
        fields={fields}
        createDefaults={{ status }}
        emptyDescription={emptyDescription}
        renderItem={renderItem}
      />
    </div>
  )
}

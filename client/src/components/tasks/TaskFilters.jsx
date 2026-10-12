import { Search } from 'lucide-react'
import { Select } from '../common/Select'
import { PRIORITY_OPTIONS, CATEGORY_OPTIONS, SORT_OPTIONS } from '../../constants/taskOptions'

/**
 * TaskFilters — search box + priority/category filters + sort control.
 */
export function TaskFilters({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value })

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <label className="relative flex items-center flex-1">
        <Search size={15} className="absolute left-3 text-muted pointer-events-none" />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Search tasks..."
          className="h-10 w-full pl-9 pr-3 rounded-sm bg-surface border border-control text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <Select
        value={filters.priority}
        onChange={(event) => update('priority', event.target.value)}
        options={[{ value: '', label: 'All priorities' }, ...PRIORITY_OPTIONS]}
        className="sm:w-40"
      />
      <Select
        value={filters.category}
        onChange={(event) => update('category', event.target.value)}
        options={[{ value: '', label: 'All categories' }, ...CATEGORY_OPTIONS]}
        className="sm:w-40"
      />
      <Select
        value={filters.sortBy}
        onChange={(event) => update('sortBy', event.target.value)}
        options={SORT_OPTIONS}
        className="sm:w-40"
      />
    </div>
  )
}

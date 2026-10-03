export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', badge: 'default' },
  { value: 'MEDIUM', label: 'Medium', badge: 'warning' },
  { value: 'HIGH', label: 'High', badge: 'danger' },
  { value: 'URGENT', label: 'Urgent', badge: 'danger' },
]

export const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To do', badge: 'default' },
  { value: 'IN_PROGRESS', label: 'In progress', badge: 'accent' },
  { value: 'COMPLETED', label: 'Completed', badge: 'success' },
]

export const CATEGORY_OPTIONS = [
  { value: 'School', label: 'School' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Work', label: 'Work' },
  { value: 'Health', label: 'Health' },
  { value: 'Other', label: 'Other' },
]

export const RECURRING_FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
]

export const SORT_OPTIONS = [
  { value: 'DUE_DATE', label: 'Due date' },
  { value: 'PRIORITY', label: 'Priority' },
  { value: 'NEWEST', label: 'Newest' },
]

export const VIEW_OPTIONS = [
  { value: 'TODAY', label: 'Today' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ALL', label: 'All' },
]

export function priorityBadgeVariant(priority) {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.badge ?? 'default'
}

export function statusBadgeVariant(status) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.badge ?? 'default'
}

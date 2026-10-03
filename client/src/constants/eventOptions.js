export const EVENT_CATEGORY_OPTIONS = [
  { value: 'Class', label: 'Class', badge: 'default' },
  { value: 'Deadline', label: 'Deadline', badge: 'warning' },
  { value: 'Exam', label: 'Exam', badge: 'danger' },
  { value: 'Personal', label: 'Personal', badge: 'accent' },
  { value: 'Event', label: 'Event', badge: 'success' },
]

export function eventBadgeVariant(category) {
  return EVENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.badge ?? 'default'
}

function getGreeting(hour) {
  if (hour < 12) return 'Good morning.'
  if (hour < 18) return 'Good afternoon.'
  return 'Good evening.'
}

/**
 * Greeting — time-adaptive greeting + today's date.
 */
export function Greeting() {
  const now = new Date()
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{getGreeting(now.getHours())}</h1>
      <p className="text-sm text-muted mt-1">{dateLabel}</p>
    </div>
  )
}

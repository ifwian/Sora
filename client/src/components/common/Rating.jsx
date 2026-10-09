/** Rating — read-only 1–5 star display. Renders nothing if there's no rating. */
export function Rating({ value }) {
  if (!value) return null
  return (
    <span className="text-xs tracking-tight" role="img" aria-label={`${value} out of 5`}>
      <span className="text-warning">{'★'.repeat(value)}</span>
      <span className="text-border">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

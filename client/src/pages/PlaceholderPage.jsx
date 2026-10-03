/**
 * PlaceholderPage — used for routes whose real UI hasn't been built yet.
 * Each feature page replaces this with its real implementation in its
 * own milestone.
 */
export function PlaceholderPage({ title, description, milestone }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted max-w-md">{description}</p>
      {milestone && (
        <p className="text-xs text-muted mt-4">Coming in {milestone}.</p>
      )}
    </div>
  )
}

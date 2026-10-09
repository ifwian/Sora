/**
 * BarChart — minimal, dependency-free bar chart. `data` is [{ label, value }].
 * Exposes a text summary to screen readers; each bar has a hover tooltip.
 */
export function BarChart({ data, formatValue = (v) => String(v), ariaLabel, height = 128 }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const lastIndex = data.length - 1
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      <div
        role="img"
        aria-label={`${ariaLabel}. Total ${formatValue(total)} across ${data.length} periods.`}
        className="flex items-end gap-1"
        style={{ height }}
      >
        {data.map((d, index) => (
          <div
            key={`${d.label}-${index}`}
            className="flex-1 min-w-0 bg-accent rounded-sm"
            title={`${d.label}: ${formatValue(d.value)}`}
            style={{ height: d.value === 0 ? 2 : `${Math.max(4, (d.value / max) * 100)}%`, opacity: d.value === 0 ? 0.25 : 1 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-muted" aria-hidden="true">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(lastIndex / 2)].label}</span>}
        <span>{data[lastIndex]?.label}</span>
      </div>
    </div>
  )
}

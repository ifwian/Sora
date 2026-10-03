import { cn } from '../../utils/cn'

/**
 * ProgressBar — minimal horizontal progress indicator.
 * value: 0-100
 */
export function ProgressBar({ value, className }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full rounded-full bg-surface-hover overflow-hidden', className)}
    >
      <div
        className="h-full bg-accent rounded-full transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

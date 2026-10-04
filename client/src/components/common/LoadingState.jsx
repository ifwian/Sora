import { Loader2 } from 'lucide-react'

/**
 * LoadingState — shown while a page/section's data is being fetched.
 */
export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted">
      <Loader2 size={18} className="animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

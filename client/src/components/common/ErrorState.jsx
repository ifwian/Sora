import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

/**
 * ErrorState — shown when a request failed, with a way to retry.
 */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center text-center gap-2 py-12">
      <AlertTriangle size={18} className="text-danger" />
      <p className="text-sm text-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

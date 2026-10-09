import { LibraryList } from '../components/library/LibraryList'
import { Rating } from '../components/common/Rating'
import { useLibrary } from '../hooks/useLibrary'

const STATUSES = [
  { value: 'PLAYING', label: 'Playing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'WISHLIST', label: 'Wishlist' },
]

const FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES },
  { name: 'platform', label: 'Platform', nullable: true, placeholder: 'PC, Switch, ...' },
  { name: 'rating', label: 'Rating', type: 'select', numeric: true, nullable: true, blankLabel: 'Not rated', options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: '★'.repeat(n) })) },
  { name: 'notes', label: 'Notes', type: 'textarea', nullable: true },
]

export function GamesPage() {
  const { games } = useLibrary()
  return (
    <LibraryList
      title="Games"
      resource={games}
      entity="Game"
      statuses={STATUSES}
      fields={FIELDS}
      emptyDescription="Track what you're playing, finished, and want to play."
      renderItem={(item) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm truncate">{item.title}</p>
            <Rating value={item.rating} />
          </div>
          {(item.platform || item.notes) && (
            <p className="text-xs text-muted truncate">{[item.platform, item.notes].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      )}
    />
  )
}

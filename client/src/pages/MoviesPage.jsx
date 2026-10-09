import { LibraryList } from '../components/library/LibraryList'
import { Rating } from '../components/common/Rating'
import { Badge } from '../components/common/Badge'
import { useLibrary } from '../hooks/useLibrary'

const STATUSES = [
  { value: 'WATCHING', label: 'Watching' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WATCHLIST', label: 'Watchlist' },
]

const FIELDS = [
  { name: 'title', label: 'Title', required: true },
  {
    name: 'kind',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'Movie', label: 'Movie' },
      { value: 'Series', label: 'Series' },
    ],
  },
  { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES },
  { name: 'rating', label: 'Rating', type: 'select', numeric: true, nullable: true, blankLabel: 'Not rated', options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: '★'.repeat(n) })) },
  { name: 'notes', label: 'Notes', type: 'textarea', nullable: true },
]

export function MoviesPage() {
  const { movies } = useLibrary()
  return (
    <LibraryList
      title="Movies"
      resource={movies}
      entity="Title"
      statuses={STATUSES}
      fields={FIELDS}
      emptyDescription="Track what you're watching, finished, and want to watch."
      renderItem={(item) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm truncate">{item.title}</p>
            <Badge variant="default">{item.kind}</Badge>
            <Rating value={item.rating} />
          </div>
          {item.notes && <p className="text-xs text-muted truncate">{item.notes}</p>}
        </div>
      )}
    />
  )
}

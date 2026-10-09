import { LibraryList } from '../components/library/LibraryList'
import { Rating } from '../components/common/Rating'
import { ProgressBar } from '../components/common/ProgressBar'
import { useLibrary } from '../hooks/useLibrary'

const STATUSES = [
  { value: 'READING', label: 'Currently reading' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WANT_TO_READ', label: 'Want to read' },
]

const FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'author', label: 'Author', nullable: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES },
  { name: 'totalPages', label: 'Total pages', type: 'number', step: 1, nullable: true },
  { name: 'currentPage', label: 'Current page', type: 'number', step: 1 },
  { name: 'rating', label: 'Rating', type: 'select', numeric: true, nullable: true, blankLabel: 'Not rated', options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: '★'.repeat(n) })) },
  { name: 'notes', label: 'Notes', type: 'textarea', nullable: true },
]

export function ReadingPage() {
  const { books } = useLibrary()
  return (
    <LibraryList
      title="Reading"
      resource={books}
      entity="Book"
      statuses={STATUSES}
      fields={FIELDS}
      emptyDescription="Track books you're reading, finished, and want to read."
      renderItem={(item) => {
        const percent = item.totalPages ? Math.min(100, Math.round((item.currentPage / item.totalPages) * 100)) : null
        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm truncate">{item.title}</p>
              <Rating value={item.rating} />
            </div>
            {item.author && <p className="text-xs text-muted truncate">{item.author}</p>}
            {item.status === 'READING' && percent !== null && (
              <div className="flex items-center gap-2 mt-2">
                <ProgressBar value={percent} />
                <span className="text-xs text-muted shrink-0">
                  {item.currentPage}/{item.totalPages}
                </span>
              </div>
            )}
          </div>
        )
      }}
    />
  )
}

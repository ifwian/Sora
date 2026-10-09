import { MapPin } from 'lucide-react'
import { Rating } from '../components/common/Rating'
import { ResourcePanel } from '../components/common/ResourcePanel'
import { PhotoStrip } from '../components/memories/PhotoStrip'
import { useMemories } from '../hooks/useMemories'
import { formatShortDate } from '../utils/date'

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'location', label: 'Location', nullable: true, placeholder: 'City, country' },
  { name: 'visitedDate', label: 'Date visited', type: 'date', nullable: true },
  { name: 'rating', label: 'Rating', type: 'select', numeric: true, nullable: true, blankLabel: 'Not rated', options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: '★'.repeat(n) })) },
  { name: 'notes', label: 'Notes', type: 'textarea', nullable: true },
  {
    name: 'photos',
    label: 'Photo links',
    type: 'list',
    separator: '\n',
    helperText: 'One image link per line (https://…).',
  },
]

export function PlacesPage() {
  const { places } = useMemories()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
      <ResourcePanel
        resource={places}
        entity="Place"
        fields={FIELDS}
        emptyDescription="Keep track of the places you've been."
        renderItem={(item) => (
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <Rating value={item.rating} />
            </div>
            <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
              <MapPin size={11} />
              {[item.location, item.visitedDate && formatShortDate(item.visitedDate)].filter(Boolean).join(' · ') ||
                'No details'}
            </p>
            {item.notes && <p className="text-sm text-muted mt-1 whitespace-pre-line">{item.notes}</p>}
            <PhotoStrip photos={item.photos} label={item.name} />
          </div>
        )}
      />
    </div>
  )
}

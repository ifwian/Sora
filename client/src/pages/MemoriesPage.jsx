import { MapPin } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { ResourcePanel } from '../components/common/ResourcePanel'
import { PhotoStrip } from '../components/memories/PhotoStrip'
import { useMemories } from '../hooks/useMemories'
import { formatShortDate, todayISO } from '../utils/date'
import { formatMonthKey } from '../utils/financeUtils'

const FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'location', label: 'Location', nullable: true },
  { name: 'description', label: 'Description', type: 'textarea', nullable: true },
  { name: 'tags', label: 'Tags', type: 'list', separator: ',', placeholder: 'friends, outdoors' },
  {
    name: 'photos',
    label: 'Photo links',
    type: 'list',
    separator: '\n',
    helperText: 'One image link per line (https://…). Photo uploads aren’t supported yet.',
  },
]

export function MemoriesPage() {
  const { memories } = useMemories()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Memories</h1>
      <ResourcePanel
        resource={memories}
        entity="Memory"
        fields={FIELDS}
        createDefaults={{ date: todayISO() }}
        groupBy={(item) => formatMonthKey(item.date.slice(0, 7))}
        emptyDescription="Capture moments worth remembering — they'll appear here as a timeline."
        renderItem={(item) => (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">{item.title}</p>
              <span className="text-xs text-muted">{formatShortDate(item.date)}</span>
            </div>
            {item.location && (
              <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
                <MapPin size={11} />
                {item.location}
              </p>
            )}
            {item.description && <p className="text-sm text-muted mt-1 whitespace-pre-line">{item.description}</p>}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <PhotoStrip photos={item.photos} label={item.title} />
          </div>
        )}
      />
    </div>
  )
}

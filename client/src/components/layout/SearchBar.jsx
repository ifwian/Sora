import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchService } from '../../services/searchService'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { cn } from '../../utils/cn'

const MIN_LENGTH = 2

/**
 * SearchBar — global search across every module. Debounced, ignores stale
 * responses, and works with the keyboard (↑ ↓ Enter Esc) as an ARIA combobox.
 * Picking a result opens the page that module lives on.
 */
export function SearchBar() {
  const navigate = useNavigate()
  const listboxId = useId()
  const containerRef = useRef(null)

  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounced = useDebouncedValue(query.trim(), 250)

  useEffect(() => {
    if (debounced.length < MIN_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGroups([])
      setStatus('idle')
      return undefined
    }

    // Ignore a response if the query changed (or the bar unmounted) while it was in flight.
    let cancelled = false
    setStatus('loading')
    searchService
      .search(debounced)
      .then((data) => {
        if (cancelled) return
        setGroups(data)
        setStatus('idle')
        setActiveIndex(-1)
      })
      .catch(() => {
        if (cancelled) return
        setGroups([])
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [debounced])

  // Close when clicking anywhere outside the search bar.
  useEffect(() => {
    const handleClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Give every result a flat index (for keyboard navigation) and its group's route.
  const indexedGroups = useMemo(() => {
    let next = 0
    return groups.map((group) => ({
      ...group,
      results: group.results.map((result) => ({ ...result, to: group.to, index: next++ })),
    }))
  }, [groups])
  const options = useMemo(() => indexedGroups.flatMap((group) => group.results), [indexedGroups])

  const choose = (option) => {
    setOpen(false)
    setQuery('')
    navigate(option.to)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (options.length === 0 ? -1 : (index + 1) % options.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (options.length === 0 ? -1 : (index - 1 + options.length) % options.length))
    } else if (event.key === 'Enter' && activeIndex >= 0 && options[activeIndex]) {
      event.preventDefault()
      choose(options[activeIndex])
    }
  }

  const typed = query.trim().length >= MIN_LENGTH
  const showPanel = open && typed
  const activeId = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined

  return (
    <div ref={containerRef} className="relative">
      <label className="relative flex items-center">
        <span className="sr-only">Search everything</span>
        <Search size={15} className="absolute left-3 text-muted pointer-events-none" />
        <input
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search everything..."
          className="h-9 w-full pl-9 pr-3 rounded-sm bg-surface border border-control text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      {showPanel && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto bg-surface border border-border rounded-md shadow-lg p-1">
          <div id={listboxId} role="listbox" aria-label="Search results">
            {status === 'error' && <p className="px-3 py-3 text-sm text-danger">Search failed. Try again.</p>}
            {status === 'loading' && options.length === 0 && <p className="px-3 py-3 text-sm text-muted">Searching…</p>}
            {status === 'idle' && debounced === query.trim() && options.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted">No results for “{query.trim()}”.</p>
            )}
            {indexedGroups.map((group) => (
              <div key={group.label} role="group" aria-label={group.label}>
                <p className="px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted">{group.label}</p>
                {group.results.map((result) => (
                  <div
                    key={`${group.label}-${result.id}`}
                    id={`${listboxId}-opt-${result.index}`}
                    role="option"
                    aria-selected={result.index === activeIndex}
                    onMouseEnter={() => setActiveIndex(result.index)}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      choose(result)
                    }}
                    className={cn(
                      'px-3 py-2 rounded-sm cursor-pointer',
                      result.index === activeIndex ? 'bg-surface-hover' : undefined,
                    )}
                  >
                    <p className="text-sm text-foreground truncate">{result.title}</p>
                    {result.subtitle && <p className="text-xs text-muted truncate">{result.subtitle}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

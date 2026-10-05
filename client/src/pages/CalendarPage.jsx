import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Button } from '../components/common/Button'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { EventForm } from '../components/calendar/EventForm'
import { useEvents } from '../hooks/useEvents'
import { useTasks } from '../hooks/useTasks'
import { useToast } from '../hooks/useToast'
import {
  addDays,
  addMonths,
  formatMonthLabel,
  formatWeekRangeLabel,
  formatDayLabel,
} from '../utils/calendar'
import { todayISO } from '../utils/date'

export function CalendarPage() {
  const { events, loading, error, addEvent, updateEvent, deleteEvent, refetch } = useEvents()
  const { tasks } = useTasks()
  const { showToast } = useToast()

  const [view, setView] = useState('MONTH')
  const [anchorDate, setAnchorDate] = useState(todayISO())
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [createDate, setCreateDate] = useState(null)
  const [deletingEvent, setDeletingEvent] = useState(null)

  const periodLabel = useMemo(() => {
    if (view === 'MONTH') return formatMonthLabel(anchorDate)
    if (view === 'WEEK') return formatWeekRangeLabel(anchorDate)
    return formatDayLabel(anchorDate, { weekday: 'long', month: 'long', day: 'numeric' })
  }, [view, anchorDate])

  const step = view === 'MONTH' ? 1 : view === 'WEEK' ? 7 : 1
  const goPrev = () => setAnchorDate((d) => (view === 'MONTH' ? addMonths(d, -1) : addDays(d, -step)))
  const goNext = () => setAnchorDate((d) => (view === 'MONTH' ? addMonths(d, 1) : addDays(d, step)))
  const goToday = () => setAnchorDate(todayISO())

  const openCreate = (date) => {
    setEditingEvent(null)
    setCreateDate(date ?? anchorDate)
    setFormOpen(true)
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setFormOpen(true)
  }

  const handleDayClick = (isoDate) => {
    if (view === 'DAY') return
    setAnchorDate(isoDate)
    if (view === 'MONTH') setView('DAY')
  }

  const handleSubmit = async (data) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data)
        showToast({ message: 'Event updated.', variant: 'success' })
      } else {
        await addEvent(data)
        showToast({ message: 'Event created.', variant: 'success' })
      }
      setFormOpen(false)
    } catch {
      // Error toast already shown by EventsContext; keep the form open.
    }
  }

  const handleDeleteConfirmed = async () => {
    try {
      await deleteEvent(deletingEvent.id)
      showToast({ message: 'Event deleted.', variant: 'info' })
      setFormOpen(false)
    } catch {
      // Error toast already shown by EventsContext.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>

      <CalendarToolbar
        view={view}
        onViewChange={setView}
        periodLabel={periodLabel}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onCreate={() => openCreate(anchorDate)}
      />

      {loading ? (
        <LoadingState label="Loading calendar..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          {view === 'MONTH' && (
            <MonthView
              anchorDate={anchorDate}
              events={events}
              tasks={tasks}
              onDayClick={handleDayClick}
              onItemClick={openEdit}
            />
          )}
          {view === 'WEEK' && (
            <WeekView
              anchorDate={anchorDate}
              events={events}
              tasks={tasks}
              onDayClick={handleDayClick}
              onItemClick={openEdit}
            />
          )}
          {view === 'DAY' && (
            <DayView
              anchorDate={anchorDate}
              events={events}
              tasks={tasks}
              onCreate={() => openCreate(anchorDate)}
              onItemClick={openEdit}
            />
          )}
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingEvent ? 'Edit event' : 'New event'}
      >
        <EventForm
          event={editingEvent}
          defaultDate={createDate}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
        {editingEvent && (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger mt-2 -ml-2"
            onClick={() => setDeletingEvent(editingEvent)}
          >
            <Trash2 size={14} />
            Delete event
          </Button>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingEvent)}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete event?"
        description={deletingEvent ? `"${deletingEvent.title}" will be permanently deleted.` : ''}
      />
    </div>
  )
}

import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useStudy } from '../../hooks/useStudy'
import { averageGrade, formatHours, minutesInLastDays, nextUpcoming } from '../../utils/studyUtils'
import { formatShortDate } from '../../utils/date'

/** StudyWidget — next assignment/exam, current grade, and study time this week. */
export function StudyWidget() {
  const { assignments, grades, sessions } = useStudy()

  if (assignments.loading || grades.loading || sessions.loading) {
    return (
      <Card>
        <WidgetHeader title="Study" viewAllHref="/study" />
        <LoadingState />
      </Card>
    )
  }

  const assignment = nextUpcoming(assignments.items, 'ASSIGNMENT')
  const exam = nextUpcoming(assignments.items, 'EXAM')
  const avg = averageGrade(grades.items)

  return (
    <Card>
      <WidgetHeader title="Study" viewAllHref="/study" />
      <ul className="flex flex-col gap-3 text-sm">
        <li className="flex items-center justify-between gap-3">
          <span className="truncate">{assignment?.title ?? 'No assignments due'}</span>
          {assignment && <Badge variant="warning">{formatShortDate(assignment.dueDate)}</Badge>}
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="truncate">{exam?.title ?? 'No exams scheduled'}</span>
          {exam && <Badge variant="danger">{formatShortDate(exam.dueDate)}</Badge>}
        </li>
        <li className="flex items-center justify-between gap-3 text-muted">
          <span>Current grade</span>
          <span>{avg === null ? '—' : `${avg.toFixed(1)}%`}</span>
        </li>
        <li className="flex items-center justify-between gap-3 text-muted">
          <span>Studied this week</span>
          <span>{formatHours(minutesInLastDays(sessions.items, 7))}</span>
        </li>
      </ul>
    </Card>
  )
}

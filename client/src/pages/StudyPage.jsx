import { useState } from 'react'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Checkbox } from '../components/common/Checkbox'
import { Tabs } from '../components/common/Tabs'
import { ProgressBar } from '../components/common/ProgressBar'
import { ResourcePanel } from '../components/common/ResourcePanel'
import { useStudy } from '../hooks/useStudy'
import { averageGrade, gradePercent, nextUpcoming, minutesInLastDays, formatHours } from '../utils/studyUtils'
import { formatShortDate, todayISO } from '../utils/date'
import { cn } from '../utils/cn'

const TABS = [
  { value: 'OVERVIEW', label: 'Overview' },
  { value: 'ASSIGNMENTS', label: 'Assignments & exams' },
  { value: 'SUBJECTS', label: 'Subjects' },
  { value: 'SESSIONS', label: 'Study sessions' },
  { value: 'GRADES', label: 'Grades' },
]

function StatCard({ label, value, hint }) {
  return (
    <Card padding="sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-semibold mt-1 truncate">{value}</p>
      {hint && <p className="text-xs text-muted mt-0.5 truncate">{hint}</p>}
    </Card>
  )
}

function Overview({ subjects, assignments, sessions, grades }) {
  const avg = averageGrade(grades.items)
  const nextAssignment = nextUpcoming(assignments.items, 'ASSIGNMENT')
  const nextExam = nextUpcoming(assignments.items, 'EXAM')
  const doneCount = assignments.items.filter((a) => a.completed).length
  const total = assignments.items.length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current grade" value={avg === null ? '—' : `${avg.toFixed(1)}%`} hint={`${grades.items.length} graded`} />
        <StatCard
          label="Next assignment"
          value={nextAssignment?.title ?? 'None due'}
          hint={nextAssignment && formatShortDate(nextAssignment.dueDate)}
        />
        <StatCard
          label="Next exam"
          value={nextExam?.title ?? 'None scheduled'}
          hint={nextExam && formatShortDate(nextExam.dueDate)}
        />
        <StatCard label="Study time (7 days)" value={formatHours(minutesInLastDays(sessions.items, 7))} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Assignment progress</h2>
          <span className="text-xs text-muted">
            {doneCount}/{total} done
          </span>
        </div>
        <ProgressBar value={total === 0 ? 0 : (doneCount / total) * 100} />
      </Card>

      {subjects.items.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold mb-3">By subject</h2>
          <ul className="flex flex-col gap-3">
            {subjects.items.map((subject) => {
              const subjectGrades = grades.items.filter((g) => g.subjectId === subject.id)
              const subjectAvg = averageGrade(subjectGrades)
              const minutes = sessions.items.filter((s) => s.subjectId === subject.id).reduce((sum, s) => sum + s.minutes, 0)
              const exam = nextUpcoming(assignments.items.filter((a) => a.subjectId === subject.id), 'EXAM')
              return (
                <li key={subject.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{subject.name}</span>
                  <span className="text-xs text-muted shrink-0">
                    {subjectAvg === null ? 'No grades' : `${subjectAvg.toFixed(1)}%`} · {formatHours(minutes)} studied
                    {exam ? ` · exam ${formatShortDate(exam.dueDate)}` : ''}
                  </span>
                </li>
              )
            })}
          </ul>
          {assignments.items.some((a) => !a.subjectId) && (
            <p className="text-xs text-muted mt-3">Some assignments have no subject.</p>
          )}
        </Card>
      )}
    </div>
  )
}

export function StudyPage() {
  const { subjects, assignments, sessions, grades } = useStudy()
  const [tab, setTab] = useState('OVERVIEW')

  const subjectOptions = subjects.items.map((s) => ({ value: s.id, label: s.name }))
  const subjectName = (id) => subjects.items.find((s) => s.id === id)?.name ?? 'No subject'
  const needSubject = subjects.items.length === 0 ? 'Add a subject first.' : null
  const today = todayISO()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
      <Tabs options={TABS} value={tab} onChange={setTab} className="flex-wrap" />

      {tab === 'OVERVIEW' && (
        <Overview subjects={subjects} assignments={assignments} sessions={sessions} grades={grades} />
      )}

      {tab === 'ASSIGNMENTS' && (
        <ResourcePanel
          resource={assignments}
          entity="Assignment"
          emptyDescription="Track assignments and exams with their due dates."
          createDefaults={{ kind: 'ASSIGNMENT', dueDate: today }}
          fields={[
            { name: 'title', label: 'Title', required: true },
            {
              name: 'kind',
              label: 'Type',
              type: 'select',
              required: true,
              options: [
                { value: 'ASSIGNMENT', label: 'Assignment' },
                { value: 'EXAM', label: 'Exam' },
              ],
            },
            { name: 'dueDate', label: 'Due date', type: 'date', required: true },
            { name: 'subjectId', label: 'Subject', type: 'select', options: subjectOptions, nullable: true, blankLabel: 'No subject' },
          ]}
          renderItem={(item, { update }) => (
            <div className="flex items-center gap-3">
              <Checkbox
                checked={item.completed}
                onChange={(checked) => update(item.id, { completed: checked }).catch(() => {})}
                label={`Mark "${item.title}" as ${item.completed ? 'not done' : 'done'}`}
              />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm truncate', item.completed && 'line-through text-muted')}>{item.title}</p>
                <p className="text-xs text-muted">
                  {subjectName(item.subjectId)} · due {formatShortDate(item.dueDate)}
                </p>
              </div>
              <Badge variant={item.kind === 'EXAM' ? 'danger' : 'default'}>
                {item.kind === 'EXAM' ? 'Exam' : 'Assignment'}
              </Badge>
            </div>
          )}
        />
      )}

      {tab === 'SUBJECTS' && (
        <ResourcePanel
          resource={subjects}
          entity="Subject"
          emptyDescription="Add the subjects you're taking, e.g. Data Structures."
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'code', label: 'Course code', nullable: true, placeholder: 'Optional' },
          ]}
          renderItem={(item) => (
            <div>
              <p className="text-sm">{item.name}</p>
              {item.code && <p className="text-xs text-muted">{item.code}</p>}
            </div>
          )}
        />
      )}

      {tab === 'SESSIONS' && (
        <ResourcePanel
          resource={sessions}
          entity="Session"
          disabledReason={needSubject}
          emptyDescription="Log time you spend studying to see your weekly total."
          createDefaults={{ date: today }}
          fields={[
            { name: 'subjectId', label: 'Subject', type: 'select', required: true, options: subjectOptions },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'minutes', label: 'Minutes', type: 'number', required: true, step: 1 },
            { name: 'notes', label: 'Notes', type: 'textarea', nullable: true },
          ]}
          renderItem={(item) => (
            <div>
              <p className="text-sm">
                {subjectName(item.subjectId)} · {item.minutes} min
              </p>
              <p className="text-xs text-muted">
                {formatShortDate(item.date)}
                {item.notes ? ` · ${item.notes}` : ''}
              </p>
            </div>
          )}
        />
      )}

      {tab === 'GRADES' && (
        <ResourcePanel
          resource={grades}
          entity="Grade"
          disabledReason={needSubject}
          emptyDescription="Record scores to see your running average."
          createDefaults={{ maxScore: 100 }}
          fields={[
            { name: 'subjectId', label: 'Subject', type: 'select', required: true, options: subjectOptions },
            { name: 'title', label: 'Title', required: true, placeholder: 'Midterm' },
            { name: 'score', label: 'Score', type: 'number', required: true },
            { name: 'maxScore', label: 'Out of', type: 'number' },
          ]}
          renderItem={(item) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted">{subjectName(item.subjectId)}</p>
              </div>
              <span className="text-sm shrink-0">
                {item.score}/{item.maxScore} · {gradePercent(item).toFixed(1)}%
              </span>
            </div>
          )}
        />
      )}
    </div>
  )
}

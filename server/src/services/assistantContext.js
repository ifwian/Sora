import { prisma } from '../config/prisma.js'
import { fromDateOnly, toDateOnly } from '../utils/serializeDate.js'

const MAX_TASKS = 40

/** Single-line, length-capped text so a title can't forge new sections or smuggle in long payloads. */
function clean(text, max = 120) {
  const flat = String(text ?? '').replace(/\s+/g, ' ').trim()
  const safe = flat.replace(/<\/?\s*user_data\s*>/gi, '')
  return safe.length > max ? `${safe.slice(0, max)}…` : safe
}

function addDays(iso, amount) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + amount)).toISOString().slice(0, 10)
}

function weekday(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

/**
 * buildAssistantContext — the ONLY place that decides what the AI can see.
 *
 * Included (summaries, scoped to this user): open tasks, recent completions,
 * upcoming events, habit progress, active goals, upcoming study deadlines,
 * study time, grade averages, and this month's spending — each only when the
 * user has left that category enabled in Settings → Assistant & privacy.
 *
 * Deliberately NOT included: notes, memories, places, descriptions, photos,
 * email, password hash, or anything belonging to another user.
 */
export async function buildAssistantContext({ userId, today, userName, preferences }) {
  const weekAgo = addDays(today, -6)
  const monthStart = `${today.slice(0, 7)}-01`
  const where = { userId }
  const allowed = (category) => preferences?.assistant?.[category] !== false
  const none = Promise.resolve([])

  // `today`, `weekAgo`, `monthStart` and the horizon are "YYYY-MM-DD" strings.
  // Every column they filter on is a DATE, so Prisma needs real Dates for the
  // gte/lte bounds — it rejects a bare date string.
  const [openTasks, doneTasks, events, habits, goals, assignments, sessions, grades, subjects, expenses, budgets] =
    await Promise.all([
      allowed('tasks')
        ? prisma.task.findMany({ where: { ...where, status: { not: 'COMPLETED' } }, orderBy: [{ dueDate: 'asc' }], take: MAX_TASKS + 1 })
        : none,
      allowed('tasks')
        ? prisma.task.findMany({ where: { ...where, status: 'COMPLETED', completedAt: { gte: new Date(`${weekAgo}T00:00:00`) } } })
        : none,
      allowed('events')
        ? prisma.event.findMany({ where: { ...where, date: { gte: fromDateOnly(today), lte: fromDateOnly(addDays(today, 14)) } }, orderBy: [{ date: 'asc' }] })
        : none,
      allowed('habits') ? prisma.habit.findMany({ where, include: { completions: true } }) : none,
      allowed('goals') ? prisma.goal.findMany({ where: { ...where, completed: false }, include: { milestones: true } }) : none,
      allowed('study')
        ? prisma.assignment.findMany({ where: { ...where, completed: false, dueDate: { lte: fromDateOnly(addDays(today, 30)) } }, orderBy: [{ dueDate: 'asc' }] })
        : none,
      allowed('study') ? prisma.studySession.findMany({ where: { ...where, date: { gte: fromDateOnly(weekAgo) } } }) : none,
      allowed('study') ? prisma.grade.findMany({ where }) : none,
      allowed('study') ? prisma.subject.findMany({ where }) : none,
      allowed('finance') ? prisma.expense.findMany({ where: { ...where, date: { gte: fromDateOnly(monthStart) } } }) : none,
      allowed('finance') ? prisma.budget.findMany({ where: { ...where, month: today.slice(0, 7) } }) : none,
    ])

  const subjectName = (id) => clean(subjects.find((s) => s.id === id)?.name ?? 'No subject', 60)
  const lines = []

  lines.push(`TODAY: ${today} (${weekday(today)})`)
  if (userName) lines.push(`USER'S NAME: ${clean(userName, 60)}`)

  // Tasks
  if (allowed('tasks')) {
    const shownTasks = openTasks.slice(0, MAX_TASKS)
    lines.push('', 'OPEN TASKS (soonest first):')
    if (shownTasks.length === 0) lines.push('- none')
    for (const t of shownTasks) {
      const due = t.dueDate ? `due ${toDateOnly(t.dueDate)}${t.dueTime ? ` ${t.dueTime}` : ''}` : 'no due date'
      lines.push(`- [${t.priority}] ${clean(t.title)} — ${due}${t.category ? ` — ${clean(t.category, 40)}` : ''} — ${t.status.toLowerCase().replace('_', ' ')}`)
    }
    if (openTasks.length > MAX_TASKS) lines.push('- (more open tasks exist but are not shown)')
    lines.push(`Tasks completed in the last 7 days: ${doneTasks.length}`)
  }

  // Calendar
  if (allowed('events')) {
    lines.push('', 'EVENTS (today through the next 14 days):')
    if (events.length === 0) lines.push('- none')
    for (const e of events) {
      lines.push(`- ${toDateOnly(e.date)}${e.startTime ? ` ${e.startTime}` : ''} ${clean(e.title)} (${clean(e.category, 30)})${e.location ? ` @ ${clean(e.location, 60)}` : ''}`)
    }
  }

  // Habits (last 7 days)
  if (allowed('habits')) {
    const lastWeek = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
    lines.push('', 'HABITS (last 7 days):')
    if (habits.length === 0) lines.push('- none')
    for (const h of habits) {
      const done = new Set(h.completions.map((c) => toDateOnly(c.date)))
      const count = lastWeek.filter((d) => done.has(d)).length
      lines.push(`- ${clean(h.name, 60)}: ${count}/7 days; today: ${done.has(today) ? 'done' : 'not done'}`)
    }
  }

  // Goals
  if (allowed('goals')) {
    lines.push('', 'ACTIVE GOALS:')
    if (goals.length === 0) lines.push('- none')
    for (const g of goals) {
      const total = g.milestones.length
      const finished = g.milestones.filter((m) => m.completed).length
      const progress = total === 0 ? 'no milestones' : `${finished}/${total} milestones`
      const open = g.milestones.filter((m) => !m.completed).slice(0, 5).map((m) => clean(m.title, 60))
      lines.push(`- ${clean(g.title)} — ${progress}${g.deadline ? ` — deadline ${toDateOnly(g.deadline)}` : ''}${open.length ? ` — remaining: ${open.join('; ')}` : ''}`)
    }
  }

  // Study
  if (allowed('study')) {
    lines.push('', 'STUDY DEADLINES (not completed; overdue or due within 30 days):')
    if (assignments.length === 0) lines.push('- none')
    for (const a of assignments) {
      lines.push(`- ${toDateOnly(a.dueDate)} ${a.kind} "${clean(a.title)}" (${subjectName(a.subjectId)})`)
    }
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)
    lines.push(`Study time in the last 7 days: ${totalMinutes} minutes`)
    const bySubject = new Map()
    for (const g of grades) {
      const entry = bySubject.get(g.subjectId) ?? { sum: 0, n: 0 }
      entry.sum += (g.score / g.maxScore) * 100
      entry.n += 1
      bySubject.set(g.subjectId, entry)
    }
    if (bySubject.size > 0) {
      lines.push('Grade averages:')
      for (const [id, { sum, n }] of bySubject) lines.push(`- ${subjectName(id)}: ${(sum / n).toFixed(1)}% over ${n} grade(s)`)
    }
  }

  // Finance
  if (allowed('finance')) {
    const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const byCategory = new Map()
    for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + Number(e.amount))
    const budget = budgets[0] ? Number(budgets[0].amount) : null
    lines.push('', `SPENDING THIS MONTH (${today.slice(0, 7)}): ${spent.toFixed(2)}${budget !== null ? ` of a ${budget.toFixed(2)} budget` : ' (no budget set)'}`)
    for (const [category, total] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${clean(category, 40)}: ${total.toFixed(2)}`)
    }
  }

  return lines.join('\n')
}

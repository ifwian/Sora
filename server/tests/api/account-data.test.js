import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { client, registerUser, startServer, today } from '../helpers/server.js'

/**
 * Account data: the export must be a complete, portable copy of everything the
 * user owns (and nothing they don't), and deletion must be password-confirmed
 * and remove every row.
 */
describe('account export and deletion', () => {
  let server, prisma, alice, bob

  before(async () => {
    server = await startServer()
    ;({ prisma } = await import('../../src/config/prisma.js'))
    alice = await registerUser(server.base, 'data-alice')
    bob = await registerUser(server.base, 'data-bob')

    const created = async (user, path, body = {}, expected = 201) => {
      const res = await user.api.post(path, body)
      assert.equal(res.status, expected, `${path}: ${res.status} ${JSON.stringify(res.body)}`)
      return res.data
    }

    await alice.api.patch('/auth/preferences', { palette: 'sakura', timezone: 'Asia/Manila' })

    await created(alice, '/tasks', { title: 'Export task', priority: 'HIGH', dueDate: today() })
    await created(alice, '/notes', { title: 'Export note', content: 'Note body' })
    await created(alice, '/events', { title: 'Export event', date: today(), startTime: '09:00' })

    const habit = await created(alice, '/habits', { name: 'Export habit' })
    await created(alice, `/habits/${habit.id}/toggle`, { date: today() }, 200)

    const goal = await created(alice, '/goals', { title: 'Export goal', deadline: today() })
    await created(alice, `/goals/${goal.id}/milestones`, { title: 'Export milestone' })

    const subject = await created(alice, '/study/subjects', { name: 'Export subject' })
    await created(alice, '/study/assignments', { title: 'Export assignment', dueDate: today(), subjectId: subject.id })
    await created(alice, '/study/sessions', { subjectId: subject.id, date: today(), minutes: 30 })
    await created(alice, '/study/grades', { subjectId: subject.id, title: 'Export grade', score: 90, maxScore: 100 })

    await created(alice, '/finance/expenses', { amount: 12.5, category: 'Food', date: today() })
    await created(alice, '/finance/budgets', { month: today().slice(0, 7), amount: 100 })

    await created(alice, '/library/games', { title: 'Export game' })
    await created(alice, '/library/books', { title: 'Export book' })
    await created(alice, '/library/movies', { title: 'Export movie' })
    await created(alice, '/memories', { title: 'Export memory', date: today() })
    await created(alice, '/places', { name: 'Export place', visitedDate: today() })

    // Bob's data must never appear in Alice's export.
    await created(bob, '/tasks', { title: 'BOB PRIVATE TASK', dueDate: today() })
  })

  after(async () => {
    await server.close()
  })

  test('export requires authentication', async () => {
    assert.equal((await client(server.base).get('/auth/export')).status, 401)
  })

  test('export contains every collection the user owns, with dates and amounts in client shape', async () => {
    const res = await alice.api.get('/auth/export')
    assert.equal(res.status, 200)
    const data = res.data

    assert.equal(data.format, 'sora-export')
    assert.equal(data.version, 1)
    assert.ok(!Number.isNaN(Date.parse(data.exportedAt)))
    assert.equal(data.account.email, alice.email)
    assert.equal(data.account.preferences.palette, 'sakura')

    assert.equal(data.tasks.length, 1)
    assert.equal(data.tasks[0].title, 'Export task')
    assert.equal(data.tasks[0].dueDate, today(), 'task dueDate should be YYYY-MM-DD, not a full timestamp')
    assert.equal(data.notes.length, 1)
    assert.equal(data.events.length, 1)
    assert.equal(data.events[0].date, today())
    assert.equal(data.habits.length, 1)
    assert.equal(data.habits[0].completions.length, 1)
    assert.equal(data.habits[0].completions[0].date, today())
    assert.equal(data.goals.length, 1)
    assert.equal(data.goals[0].deadline, today(), 'goal deadline should be YYYY-MM-DD')
    assert.equal(data.goals[0].milestones.length, 1)

    assert.equal(data.study.subjects.length, 1)
    assert.equal(data.study.assignments[0].dueDate, today())
    assert.equal(data.study.sessions[0].date, today())
    assert.equal(data.study.grades.length, 1)

    assert.equal(data.finance.expenses.length, 1)
    assert.equal(data.finance.expenses[0].amount, 12.5)
    assert.equal(typeof data.finance.expenses[0].amount, 'number')
    assert.equal(data.finance.expenses[0].date, today())
    assert.equal(data.finance.budgets[0].amount, 100)
    assert.equal(typeof data.finance.budgets[0].amount, 'number')

    assert.equal(data.library.games.length, 1)
    assert.equal(data.library.books.length, 1)
    assert.equal(data.library.movies.length, 1)
    assert.equal(data.memories.length, 1)
    assert.equal(data.memories[0].date, today())
    assert.equal(data.places.length, 1)
    assert.equal(data.places[0].visitedDate, today())
  })

  test('export never contains the password hash or another user’s data', async () => {
    const res = await alice.api.get('/auth/export')
    const raw = JSON.stringify(res.body)
    assert.ok(!raw.includes('passwordHash'), 'password hash field leaked')
    assert.ok(!/\$2[aby]\$/.test(raw), 'a bcrypt hash leaked')
    assert.ok(!raw.includes('BOB PRIVATE TASK'), "another user's task leaked")
    assert.ok(!raw.includes(bob.email), "another user's email leaked")
    assert.equal(res.data.account.passwordHash, undefined)
  })

  test('deletion is refused with the wrong password and leaves the account usable', async () => {
    const res = await alice.api.del('/auth/account', { password: 'not-the-password' })
    assert.equal(res.status, 400)
    assert.equal((await alice.api.get('/auth/me')).status, 200)
    assert.equal((await client(server.base).post('/auth/login', { email: alice.email, password: alice.password })).status, 200)
  })

  test('deletion with the correct password removes the account and every owned row', async () => {
    const habit = await prisma.habit.findFirst({ where: { userId: alice.id } })
    const goal = await prisma.goal.findFirst({ where: { userId: alice.id } })

    const res = await alice.api.del('/auth/account', { password: alice.password })
    assert.equal(res.status, 200)

    assert.equal(await prisma.user.count({ where: { id: alice.id } }), 0)
    assert.equal((await alice.api.get('/auth/me')).status, 401, 'the old token must stop working')
    assert.equal((await client(server.base).post('/auth/login', { email: alice.email, password: alice.password })).status, 401)

    for (const model of [
      'task',
      'note',
      'event',
      'habit',
      'goal',
      'subject',
      'assignment',
      'studySession',
      'grade',
      'expense',
      'budget',
      'game',
      'book',
      'movie',
      'memory',
      'place',
    ]) {
      assert.equal(await prisma[model].count({ where: { userId: alice.id } }), 0, `${model} rows survived deletion`)
    }

    // Nested rows go with their parents, not just the direct children.
    assert.equal(await prisma.habitCompletion.count({ where: { habitId: habit.id } }), 0)
    assert.equal(await prisma.goalMilestone.count({ where: { goalId: goal.id } }), 0)
  })

  test("another user's account and data are untouched", async () => {
    assert.equal((await bob.api.get('/auth/me')).status, 200)
    const tasks = await bob.api.get('/tasks')
    assert.equal(tasks.data.length, 1)
    assert.equal(tasks.data[0].title, 'BOB PRIVATE TASK')
    assert.equal(await prisma.user.count({ where: { id: bob.id } }), 1)
  })
})

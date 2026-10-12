import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { registerUser, startServer } from '../helpers/server.js'

describe('study, finance, library, memories, places (generic resources)', () => {
  let server, alice, bob

  before(async () => {
    server = await startServer()
    alice = await registerUser(server.base, 'alice')
    bob = await registerUser(server.base, 'bob')
  })
  after(() => server.close())

  test('study: assignment defaults, date format, and validation', async () => {
    const { data: subject } = await alice.api.post('/study/subjects', { name: 'Database Management', code: 'CS301' })
    const res = await alice.api.post('/study/assignments', { title: 'SQL HW', dueDate: '2026-10-10', subjectId: subject.id })
    assert.equal(res.status, 201)
    assert.equal(res.data.kind, 'ASSIGNMENT')
    assert.equal(res.data.completed, false)
    assert.equal(res.data.dueDate, '2026-10-10')
    assert.equal((await alice.api.post('/study/sessions', { subjectId: subject.id, date: '2026-10-07', minutes: 0 })).status, 400)
    assert.equal((await alice.api.post('/study/grades', { subjectId: subject.id, title: 'x', score: -1 })).status, 400)
  })

  test("study: cannot attach my data to someone else's subject, nor touch their rows", async () => {
    const { data: subject } = await alice.api.post('/study/subjects', { name: 'Private subject' })
    const { data: assignment } = await alice.api.post('/study/assignments', { title: 'Alice HW', dueDate: '2026-10-10', subjectId: subject.id })

    const sneaky = await bob.api.post('/study/assignments', { title: 'Sneaky', dueDate: '2026-10-10', subjectId: subject.id })
    assert.equal(sneaky.status, 400)
    assert.equal((await bob.api.patch(`/study/assignments/${assignment.id}`, { completed: true })).status, 404)
    assert.equal((await bob.api.del(`/study/subjects/${subject.id}`)).status, 404)
    assert.equal((await bob.api.get('/study/subjects')).data.length, 0)
  })

  test('study: deleting a subject keeps its assignments (unlinked) but removes its sessions and grades', async () => {
    const { data: subject } = await alice.api.post('/study/subjects', { name: 'Doomed' })
    const { data: assignment } = await alice.api.post('/study/assignments', { title: 'Keep me', dueDate: '2026-10-10', subjectId: subject.id })
    const { data: session } = await alice.api.post('/study/sessions', { subjectId: subject.id, date: '2026-10-07', minutes: 60 })
    const { data: grade } = await alice.api.post('/study/grades', { subjectId: subject.id, title: 'Quiz', score: 9, maxScore: 10 })

    assert.equal((await alice.api.del(`/study/subjects/${subject.id}`)).status, 200)

    const assignments = (await alice.api.get('/study/assignments')).data
    assert.equal(assignments.find((a) => a.id === assignment.id).subjectId, null)
    assert.ok(!(await alice.api.get('/study/sessions')).data.some((s) => s.id === session.id))
    assert.ok(!(await alice.api.get('/study/grades')).data.some((g) => g.id === grade.id))
  })

  test('finance: amounts are numbers; zero/negative rejected; one budget per month (409)', async () => {
    const expense = await alice.api.post('/finance/expenses', { amount: 12.5, category: 'Food', date: '2026-10-07' })
    assert.equal(expense.data.amount, 12.5)
    assert.equal(typeof expense.data.amount, 'number')
    assert.equal((await alice.api.post('/finance/expenses', { amount: 0, category: 'Food', date: '2026-10-07' })).status, 400)
    assert.equal((await alice.api.post('/finance/expenses', { amount: -5, category: 'Food', date: '2026-10-07' })).status, 400)

    assert.equal((await alice.api.post('/finance/budgets', { month: '2026-10', amount: 5000 })).status, 201)
    assert.equal((await alice.api.post('/finance/budgets', { month: '2026-10', amount: 6000 })).status, 409)
    assert.equal((await alice.api.post('/finance/budgets', { month: 'October', amount: 6000 })).status, 400)
    // a different user can have their own budget for the same month
    assert.equal((await bob.api.post('/finance/budgets', { month: '2026-10', amount: 100 })).status, 201)
  })

  test('library: default status, enum + rating validation, book progress updates', async () => {
    assert.equal((await alice.api.post('/library/games', { title: 'Hades', rating: 5 })).data.status, 'BACKLOG')
    assert.equal((await alice.api.post('/library/games', { title: 'x', status: 'FINISHED' })).status, 400)
    assert.equal((await alice.api.post('/library/games', { title: 'x', rating: 9 })).status, 400)
    const { data: book } = await alice.api.post('/library/books', { title: 'Clean Code', status: 'READING', totalPages: 400, currentPage: 120 })
    assert.equal((await alice.api.patch(`/library/books/${book.id}`, { currentPage: 200 })).data.currentPage, 200)
    assert.equal((await alice.api.post('/library/movies', { title: 'Dune', kind: 'Series' })).data.status, 'WATCHLIST')
    assert.equal((await alice.api.post('/library/movies', { title: 'x', kind: 'Podcast' })).status, 400)
  })

  test('memories: arrays round-trip, tags can be cleared, plain dates, unsafe photo links rejected', async () => {
    const { status, data } = await alice.api.post('/memories', { title: 'Hiking', date: '2026-09-20', tags: ['outdoors', 'friends'], photos: ['https://example.com/a.jpg'] })
    assert.equal(status, 201)
    assert.equal(data.date, '2026-09-20')
    assert.deepEqual(data.tags, ['outdoors', 'friends'])
    assert.deepEqual((await alice.api.patch(`/memories/${data.id}`, { tags: [] })).data.tags, [])

    for (const photos of [['javascript:alert(1)'], ['data:text/html,<script>1</script>'], ['ftp://example.com/a.jpg'], ['not a url']]) {
      assert.equal((await alice.api.post('/memories', { title: 'Bad', date: '2026-09-20', photos })).status, 400, photos[0])
    }
    assert.equal((await alice.api.post('/memories', { title: 'Too many', date: '2026-09-20', photos: Array(13).fill('https://example.com/a.jpg') })).status, 400)
  })

  test('places: visited date is optional; isolated per user', async () => {
    const { data } = await alice.api.post('/places', { name: 'Taal Lake', rating: 5 })
    assert.equal(data.visitedDate, null)
    assert.equal((await bob.api.get('/places')).data.length, 0)
    assert.equal((await bob.api.del(`/places/${data.id}`)).status, 404)
  })
})

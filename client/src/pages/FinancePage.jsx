import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Tabs } from '../components/common/Tabs'
import { ProgressBar } from '../components/common/ProgressBar'
import { ResourcePanel } from '../components/common/ResourcePanel'
import { useFinance } from '../hooks/useFinance'
import { useToast } from '../hooks/useToast'
import { EXPENSE_CATEGORIES } from '../constants/finance'
import {
  categoryBreakdown,
  currentMonthKey,
  formatMoney,
  formatMonthKey,
  lastMonths,
  monthTotal,
  shiftMonth,
} from '../utils/financeUtils'
import { formatShortDate, todayISO } from '../utils/date'

const TABS = [
  { value: 'OVERVIEW', label: 'Overview' },
  { value: 'EXPENSES', label: 'Expenses' },
]

function BudgetCard({ month, spent, budget, budgets }) {
  const { showToast } = useToast()
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const ratio = budget && budget.amount > 0 ? spent / budget.amount : null
  const over = ratio !== null && ratio > 1
  const warn = ratio !== null && ratio >= 0.8 && !over

  const save = async (event) => {
    event.preventDefault()
    const amount = Number(draft)
    if (draft.trim() === '' || Number.isNaN(amount) || amount < 0) {
      showToast({ message: 'Enter a budget of 0 or more.', variant: 'error' })
      return
    }
    setSaving(true)
    try {
      if (budget) await budgets.update(budget.id, { amount })
      else await budgets.add({ month, amount })
      showToast({ message: 'Budget saved.', variant: 'success' })
      setDraft('')
    } catch {
      // Error toast already shown by useResource.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Budget</h2>
        {over && <Badge variant="danger">Over budget</Badge>}
        {warn && <Badge variant="warning">Nearly there</Badge>}
      </div>
      {budget ? (
        <>
          <ProgressBar value={Math.min(100, (ratio ?? 0) * 100)} />
          <p className="text-xs text-muted mt-2">
            {formatMoney(spent)} of {formatMoney(budget.amount)} ·{' '}
            {over ? `${formatMoney(spent - budget.amount)} over` : `${formatMoney(budget.amount - spent)} left`}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">No budget set for this month.</p>
      )}
      <form onSubmit={save} className="flex items-end gap-2 mt-4">
        <div className="flex-1">
          <Input
            label={budget ? 'Change budget' : 'Set budget'}
            type="number"
            step="any"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={budget ? String(budget.amount) : '0.00'}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={saving}>
          Save
        </Button>
      </form>
    </Card>
  )
}

function Overview({ expenses, budgets }) {
  const [month, setMonth] = useState(currentMonthKey())
  const spent = monthTotal(expenses.items, month)
  const budget = budgets.items.find((b) => b.month === month) ?? null
  const breakdown = categoryBreakdown(expenses.items, month)
  const trend = lastMonths(6, month).map((key) => ({ key, total: monthTotal(expenses.items, key) }))
  const trendMax = Math.max(1, ...trend.map((t) => t.total))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          aria-label="Previous month"
          className="text-muted hover:text-foreground rounded-sm p-1.5"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-base font-semibold min-w-36 text-center">{formatMonthKey(month)}</h2>
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          aria-label="Next month"
          className="text-muted hover:text-foreground rounded-sm p-1.5"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-muted">Spent this month</p>
          <p className="text-2xl font-semibold mt-1">{formatMoney(spent)}</p>
        </Card>
        <BudgetCard month={month} spent={spent} budget={budget} budgets={budgets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold mb-3">By category</h2>
          {breakdown.length === 0 ? (
            <p className="text-sm text-muted">No expenses this month.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {breakdown.map(({ category, total }) => (
                <li key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category}</span>
                    <span className="text-muted">{formatMoney(total)}</span>
                  </div>
                  <ProgressBar value={spent === 0 ? 0 : (total / spent) * 100} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold mb-3">Last 6 months</h2>
          <div className="flex items-end gap-2 h-32">
            {trend.map(({ key, total }) => (
              <div key={key} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                <div
                  className="w-full bg-accent rounded-sm"
                  style={{ height: `${Math.max(2, (total / trendMax) * 100)}%`, opacity: key === month ? 1 : 0.45 }}
                  title={`${formatMonthKey(key)}: ${formatMoney(total)}`}
                />
                <span className="text-xs text-muted">{key.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function FinancePage() {
  const { expenses, budgets } = useFinance()
  const [tab, setTab] = useState('OVERVIEW')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
      <Tabs options={TABS} value={tab} onChange={setTab} />

      {tab === 'OVERVIEW' && <Overview expenses={expenses} budgets={budgets} />}

      {tab === 'EXPENSES' && (
        <ResourcePanel
          resource={expenses}
          entity="Expense"
          emptyDescription="Log what you spend to see monthly totals and trends."
          createDefaults={{ date: todayISO(), category: 'Food' }}
          fields={[
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            {
              name: 'category',
              label: 'Category',
              type: 'select',
              required: true,
              options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
            },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'description', label: 'Description', nullable: true, placeholder: 'Optional' },
          ]}
          renderItem={(item) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm truncate">{item.description || item.category}</p>
                <p className="text-xs text-muted">
                  {item.category} · {formatShortDate(item.date)}
                </p>
              </div>
              <span className="text-sm font-medium shrink-0">{formatMoney(item.amount)}</span>
            </div>
          )}
        />
      )}
    </div>
  )
}

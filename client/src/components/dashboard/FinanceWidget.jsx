import { Card } from '../common/Card'
import { ProgressBar } from '../common/ProgressBar'
import { LoadingState } from '../common/LoadingState'
import { WidgetHeader } from './WidgetHeader'
import { useFinance } from '../../hooks/useFinance'
import { currentMonthKey, formatMoney, monthTotal } from '../../utils/financeUtils'

/** FinanceWidget — this month's spending against its budget. */
export function FinanceWidget() {
  const { expenses, budgets } = useFinance()

  if (expenses.loading || budgets.loading) {
    return (
      <Card>
        <WidgetHeader title="Finance" viewAllHref="/finance" />
        <LoadingState />
      </Card>
    )
  }

  const month = currentMonthKey()
  const spent = monthTotal(expenses.items, month)
  const budget = budgets.items.find((b) => b.month === month)
  const ratio = budget && budget.amount > 0 ? spent / budget.amount : null

  return (
    <Card>
      <WidgetHeader title="Finance" viewAllHref="/finance" />
      <p className="text-xs text-muted">Spent this month</p>
      <p className="text-xl font-semibold mt-1">{formatMoney(spent)}</p>
      {budget ? (
        <div className="mt-3">
          <ProgressBar value={Math.min(100, (ratio ?? 0) * 100)} />
          <p className="text-xs text-muted mt-2">
            {ratio !== null && ratio > 1
              ? `${formatMoney(spent - budget.amount)} over budget`
              : `${formatMoney(budget.amount - spent)} left of ${formatMoney(budget.amount)}`}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted mt-2">No budget set for this month.</p>
      )}
    </Card>
  )
}

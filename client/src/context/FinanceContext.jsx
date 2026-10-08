import { FinanceContext } from './finance-context'
import { useResource } from '../hooks/useResource'
import { createResourceService } from '../services/resourceService'

const expenseService = createResourceService('/finance/expenses')
const budgetService = createResourceService('/finance/budgets')

/** FinanceProvider — expenses and monthly budgets. */
export function FinanceProvider({ children }) {
  const expenses = useResource(expenseService)
  const budgets = useResource(budgetService)

  return <FinanceContext.Provider value={{ expenses, budgets }}>{children}</FinanceContext.Provider>
}

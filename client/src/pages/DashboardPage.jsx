import { Greeting } from '../components/dashboard/Greeting'
import { QuickActions } from '../components/dashboard/QuickActions'
import { TasksWidget } from '../components/dashboard/TasksWidget'
import { UpcomingWidget } from '../components/dashboard/UpcomingWidget'
import { HabitsWidget } from '../components/dashboard/HabitsWidget'
import { GoalsWidget } from '../components/dashboard/GoalsWidget'
import { RecentNotesWidget } from '../components/dashboard/RecentNotesWidget'
import { mockUpcoming, mockHabits, mockGoals, mockNotes } from '../constants/mockDashboardData'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <Greeting />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TasksWidget />
        </div>
        <UpcomingWidget items={mockUpcoming} />
        <HabitsWidget habits={mockHabits} />
        <GoalsWidget goals={mockGoals} />
        <RecentNotesWidget notes={mockNotes} />
      </div>
    </div>
  )
}

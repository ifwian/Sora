import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { NotesPage } from './pages/NotesPage'
import { CalendarPage } from './pages/CalendarPage'
import { GoalsPage } from './pages/GoalsPage'
import { HabitsPage } from './pages/HabitsPage'
import { StudyPage } from './pages/StudyPage'
import { FinancePage } from './pages/FinancePage'
import { GamesPage } from './pages/GamesPage'
import { ReadingPage } from './pages/ReadingPage'
import { MoviesPage } from './pages/MoviesPage'
import { MemoriesPage } from './pages/MemoriesPage'
import { PlacesPage } from './pages/PlacesPage'
import { SettingsPage } from './pages/SettingsPage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="reading" element={<ReadingPage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="memories" element={<MemoriesPage />} />
          <Route path="places" element={<PlacesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="dev/design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

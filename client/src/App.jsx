import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { TasksProvider } from './context/TasksContext'
import { NotesProvider } from './context/NotesContext'
import { EventsProvider } from './context/EventsContext'
import { HabitsProvider } from './context/HabitsContext'
import { GoalsProvider } from './context/GoalsContext'
import { StudyProvider } from './context/StudyContext'
import { FinanceProvider } from './context/FinanceContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
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

/** DataProviders — the per-user data contexts, only mounted once authenticated. */
function DataProviders() {
  return (
    <TasksProvider>
      <NotesProvider>
        <EventsProvider>
          <HabitsProvider>
            <GoalsProvider>
              <StudyProvider>
                <FinanceProvider>
                  <Outlet />
                </FinanceProvider>
              </StudyProvider>
            </GoalsProvider>
          </HabitsProvider>
        </EventsProvider>
      </NotesProvider>
    </TasksProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DataProviders />}>
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

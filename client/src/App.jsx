import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { TasksProvider } from './context/TasksContext'
import { NotesProvider } from './context/NotesContext'
import { EventsProvider } from './context/EventsContext'
import { HabitsProvider } from './context/HabitsContext'
import { GoalsProvider } from './context/GoalsContext'
import { StudyProvider } from './context/StudyContext'
import { FinanceProvider } from './context/FinanceContext'
import { LibraryProvider } from './context/LibraryContext'
import { MemoriesProvider } from './context/MemoriesContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'

// Every other page is loaded on demand, so the first screen only downloads what it needs.
const page = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })))
const TasksPage = page(() => import('./pages/TasksPage'), 'TasksPage')
const NotesPage = page(() => import('./pages/NotesPage'), 'NotesPage')
const CalendarPage = page(() => import('./pages/CalendarPage'), 'CalendarPage')
const GoalsPage = page(() => import('./pages/GoalsPage'), 'GoalsPage')
const HabitsPage = page(() => import('./pages/HabitsPage'), 'HabitsPage')
const StudyPage = page(() => import('./pages/StudyPage'), 'StudyPage')
const FinancePage = page(() => import('./pages/FinancePage'), 'FinancePage')
const AnalyticsPage = page(() => import('./pages/AnalyticsPage'), 'AnalyticsPage')
const AssistantPage = page(() => import('./pages/AssistantPage'), 'AssistantPage')
const GamesPage = page(() => import('./pages/GamesPage'), 'GamesPage')
const ReadingPage = page(() => import('./pages/ReadingPage'), 'ReadingPage')
const MoviesPage = page(() => import('./pages/MoviesPage'), 'MoviesPage')
const MemoriesPage = page(() => import('./pages/MemoriesPage'), 'MemoriesPage')
const PlacesPage = page(() => import('./pages/PlacesPage'), 'PlacesPage')
const SettingsPage = page(() => import('./pages/SettingsPage'), 'SettingsPage')
const DesignSystemPage = page(() => import('./pages/DesignSystemPage'), 'DesignSystemPage')
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage')

/** Data every signed-in screen (dashboard widgets, search, notifications) relies on. */
function CoreProviders() {
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

/** Wraps a group of routes in a provider that only loads its data when one of them is visited. */
function ProviderRoute({ Provider }) {
  return (
    <Provider>
      <Outlet />
    </Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<CoreProviders />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="study" element={<StudyPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="dev/design-system" element={<DesignSystemPage />} />

              {/* Library data is only fetched on the pages (and Analytics) that use it */}
              <Route element={<ProviderRoute Provider={LibraryProvider} />}>
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="reading" element={<ReadingPage />} />
                <Route path="movies" element={<MoviesPage />} />
              </Route>

              <Route element={<ProviderRoute Provider={MemoriesProvider} />}>
                <Route path="memories" element={<MemoriesPage />} />
                <Route path="places" element={<PlacesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

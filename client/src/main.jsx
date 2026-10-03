import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { TasksProvider } from './context/TasksContext.jsx'
import { NotesProvider } from './context/NotesContext.jsx'
import { EventsProvider } from './context/EventsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <TasksProvider>
          <NotesProvider>
            <EventsProvider>
              <App />
            </EventsProvider>
          </NotesProvider>
        </TasksProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)

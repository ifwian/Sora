import { todayISO } from '../utils/date'
import { addDays } from '../utils/calendar'

const today = todayISO()

/** MOCK DATA — Milestone 07 only, replaced by real API data in Milestone 12. */
export const mockEventsData = [
  {
    id: 'evt-1',
    title: 'Database Management — Lab',
    description: 'Bring the ERD assignment.',
    location: 'Room 204',
    category: 'Class',
    date: today,
    startTime: '15:00',
    endTime: '16:30',
  },
  {
    id: 'evt-2',
    title: 'Networking Assignment due',
    description: '',
    location: '',
    category: 'Deadline',
    date: addDays(today, 1),
    startTime: '23:59',
    endTime: '23:59',
  },
  {
    id: 'evt-3',
    title: 'OOP Midterm',
    description: 'Covers chapters 1–6.',
    location: 'Main Hall',
    category: 'Exam',
    date: addDays(today, 2),
    startTime: '10:00',
    endTime: '12:00',
  },
  {
    id: 'evt-4',
    title: 'Study group — Data Structures',
    description: 'Trees and graphs review.',
    location: 'Library, 2nd floor',
    category: 'Personal',
    date: addDays(today, 3),
    startTime: '18:00',
    endTime: '19:30',
  },
  {
    id: 'evt-5',
    title: "Badminton with friends",
    description: '',
    location: 'Campus gym',
    category: 'Event',
    date: addDays(today, 5),
    startTime: '17:00',
    endTime: '18:00',
  },
]

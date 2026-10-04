/**
 * MOCK DATA — Milestone 04 only, for widgets not yet connected to the
 * backend. Tasks were removed from here in Milestone 10 — TasksWidget
 * now reads from the real TasksContext instead.
 */

export const mockUpcoming = [
  { id: 'u1', title: 'Database Management — Lab', type: 'Class', date: 'Today', time: '3:00 PM' },
  { id: 'u2', title: 'Networking Assignment due', type: 'Deadline', date: 'Tomorrow', time: '11:59 PM' },
  { id: 'u3', title: 'OOP Midterm', type: 'Exam', date: 'Fri, Sep 5', time: '10:00 AM' },
]

export const mockHabits = [
  { id: 'h1', name: 'Coding practice', streak: 12, doneToday: true },
  { id: 'h2', name: 'Read 20 minutes', streak: 5, doneToday: false },
  { id: 'h3', name: 'Exercise', streak: 2, doneToday: false },
  { id: 'h4', name: 'Guitar', streak: 8, doneToday: true },
]

export const mockGoals = [
  { id: 'g1', title: 'Learn React', category: 'Skill', progress: 65 },
  { id: 'g2', title: 'Finish Personal OS v1', category: 'Project', progress: 30 },
  { id: 'g3', title: 'Maintain 3.5+ GPA', category: 'Academic', progress: 80 },
]

export const mockNotes = [
  { id: 'n1', title: 'SQL Joins — cheat sheet', updatedAt: '2h ago', excerpt: 'INNER vs LEFT vs RIGHT join, with examples from the lab exercise.' },
  { id: 'n2', title: 'Networking — OSI model', updatedAt: 'Yesterday', excerpt: 'Layer 3 handles routing; layer 4 handles end-to-end connections...' },
  { id: 'n3', title: 'Project ideas', updatedAt: '2 days ago', excerpt: 'Personal OS, habit tracker widget, a small CLI tool for...' },
]

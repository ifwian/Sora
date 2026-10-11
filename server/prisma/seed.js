import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: this script creates a demo account with a publicly known password.')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@personalos.dev' },
    update: {},
    create: {
      id: 'demo-user-0001', // fixed id for easy reference while testing
      email: 'demo@personalos.dev',
      passwordHash,
      name: 'Demo User',
    },
  })

  await prisma.task.deleteMany({ where: { userId: user.id } })
  await prisma.note.deleteMany({ where: { userId: user.id } })
  await prisma.event.deleteMany({ where: { userId: user.id } })

  const today = new Date()
  const tomorrow = new Date(Date.now() + 86400000)

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Finish SQL assignment',
        priority: 'HIGH',
        category: 'School',
        tags: ['sql', 'database'],
        dueDate: today,
        dueTime: '17:00',
      },
      {
        userId: user.id,
        title: 'Read Chapter 4 — Data Structures',
        priority: 'MEDIUM',
        category: 'School',
        tags: ['reading'],
        dueDate: today,
        dueTime: '20:00',
      },
      {
        userId: user.id,
        title: 'Push project commits',
        status: 'COMPLETED',
        priority: 'LOW',
        category: 'Personal',
        tags: ['git'],
        dueDate: today,
      },
    ],
  })

  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: 'SQL Joins — cheat sheet',
        content: 'INNER vs LEFT vs RIGHT join, with examples from the lab exercise.',
        tags: ['sql', 'database'],
        pinned: true,
      },
      {
        userId: user.id,
        title: 'Project ideas',
        content: 'Personal OS, a habit tracker widget, a small CLI tool.',
        tags: ['ideas'],
      },
    ],
  })

  await prisma.event.createMany({
    data: [
      {
        userId: user.id,
        title: 'Database Management — Lab',
        category: 'Class',
        location: 'Room 204',
        date: today,
        startTime: '15:00',
        endTime: '16:30',
      },
      {
        userId: user.id,
        title: 'OOP Midterm',
        category: 'Exam',
        location: 'Main Hall',
        date: tomorrow,
        startTime: '10:00',
        endTime: '12:00',
      },
    ],
  })

  console.log('Seeded 1 user (demo@personalos.dev / password123), 3 tasks, 2 notes, 2 events.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

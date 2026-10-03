# Personal OS

A private, full-stack personal productivity and life-management application — a single command center for tasks, notes, calendar, habits, goals, study, finances, entertainment tracking, memories, and more.

Built as a long-term learning and portfolio project, following professional engineering practices without over-engineering.

## Status

🚧 In active development, built milestone by milestone. Currently at **Milestone 01 — Project Initialization**.

## Tech Stack

**Frontend:** React, Vite, JavaScript, Tailwind CSS, React Router, Framer Motion
**Backend:** Node.js, Express.js, REST API
**Database:** PostgreSQL, Prisma ORM
**Auth:** JWT, bcrypt

## Project Structure

```
personal-os/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # Reusable UI, organized by feature
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── context/
│       ├── services/     # API service layer
│       ├── utils/
│       └── constants/
│
└── server/          # Express backend (scaffolded, not yet implemented)
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   ├── services/
    │   ├── utils/
    │   ├── config/
    │   └── validators/
    └── prisma/       # Database schema & migrations
```

## Getting Started

```bash
cd client
npm install
npm run dev
```

## Development Approach

This project is built incrementally in milestones — one feature area at a time, with each milestone inspected, planned, implemented, tested, and explained before moving to the next. See the project's development plan for the full milestone list.

## License

Personal project — not licensed for public use.

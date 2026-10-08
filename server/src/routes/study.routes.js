import { Router } from 'express'
import { createCrudRouter } from '../utils/crud.js'
import {
  createSubjectSchema,
  updateSubjectSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  createSessionSchema,
  updateSessionSchema,
  createGradeSchema,
  updateGradeSchema,
} from '../validators/study.validator.js'

const router = Router()
const subjectParent = { field: 'subjectId', model: 'subject', label: 'Subject' }

router.use(
  '/subjects',
  createCrudRouter({
    model: 'subject',
    label: 'Subject',
    createSchema: createSubjectSchema,
    updateSchema: updateSubjectSchema,
    orderBy: { name: 'asc' },
  })
)
router.use(
  '/assignments',
  createCrudRouter({
    model: 'assignment',
    label: 'Assignment',
    createSchema: createAssignmentSchema,
    updateSchema: updateAssignmentSchema,
    dateFields: ['dueDate'],
    orderBy: { dueDate: 'asc' },
    parent: subjectParent,
  })
)
router.use(
  '/sessions',
  createCrudRouter({
    model: 'studySession',
    label: 'Study session',
    createSchema: createSessionSchema,
    updateSchema: updateSessionSchema,
    dateFields: ['date'],
    orderBy: { date: 'desc' },
    parent: subjectParent,
  })
)
router.use(
  '/grades',
  createCrudRouter({
    model: 'grade',
    label: 'Grade',
    createSchema: createGradeSchema,
    updateSchema: updateGradeSchema,
    orderBy: { createdAt: 'desc' },
    parent: subjectParent,
  })
)

export default router

import { z } from 'zod'

const subjectFields = {
  name: z.string().trim().min(1, 'Name is required').max(100),
  code: z.string().trim().max(30).nullable().optional(),
}
export const createSubjectSchema = z.object(subjectFields)
export const updateSubjectSchema = z.object(subjectFields).partial()

const assignmentFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  kind: z.enum(['ASSIGNMENT', 'EXAM']).optional(),
  dueDate: z.string().date('dueDate must be YYYY-MM-DD'),
  completed: z.boolean().optional(),
  subjectId: z.string().nullable().optional(),
}
export const createAssignmentSchema = z.object(assignmentFields)
export const updateAssignmentSchema = z.object(assignmentFields).partial()

const sessionFields = {
  subjectId: z.string().min(1, 'Subject is required'),
  date: z.string().date('date must be YYYY-MM-DD'),
  minutes: z.number().int().min(1, 'Minutes must be at least 1').max(1440),
  notes: z.string().max(1000).nullable().optional(),
}
export const createSessionSchema = z.object(sessionFields)
export const updateSessionSchema = z.object(sessionFields).partial()

const gradeFields = {
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  score: z.number().min(0, 'Score cannot be negative'),
  maxScore: z.number().gt(0, 'Max score must be greater than 0').optional(),
}
export const createGradeSchema = z.object(gradeFields)
export const updateGradeSchema = z.object(gradeFields).partial()

import { StudyContext } from './study-context'
import { useResource } from '../hooks/useResource'
import { createResourceService } from '../services/resourceService'

const subjectService = createResourceService('/study/subjects')
const assignmentService = createResourceService('/study/assignments')
const sessionService = createResourceService('/study/sessions')
const gradeService = createResourceService('/study/grades')

/** StudyProvider — subjects, assignments/exams, study sessions, and grades. */
export function StudyProvider({ children }) {
  const subjects = useResource(subjectService)
  const assignments = useResource(assignmentService)
  const sessions = useResource(sessionService)
  const grades = useResource(gradeService)

  return (
    <StudyContext.Provider value={{ subjects, assignments, sessions, grades }}>
      {children}
    </StudyContext.Provider>
  )
}

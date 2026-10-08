/** Progress 0–100 based on completed milestones; falls back to the goal's own flag if it has none. */
export function goalProgress(goal) {
  const total = goal.milestones?.length ?? 0
  if (total === 0) return goal.completed ? 100 : 0
  const done = goal.milestones.filter((m) => m.completed).length
  return Math.round((done / total) * 100)
}

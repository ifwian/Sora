export const MAX_HISTORY = 19

/**
 * trimHistory — keeps the most recent messages that fit the server's limit,
 * making sure the conversation still starts with a user message.
 */
export function trimHistory(messages) {
  const recent = messages.slice(-MAX_HISTORY)
  while (recent.length > 0 && recent[0].role !== 'user') recent.shift()
  return recent
}

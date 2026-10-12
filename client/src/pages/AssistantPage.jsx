import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, RotateCcw, Lock } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { assistantService } from '../services/assistantService'
import { trimHistory } from '../utils/chatHistory'
import { cn } from '../utils/cn'

const SUGGESTIONS = [
  'What should I focus on today?',
  'What assignments are due this week?',
  'How much have I spent this month?',
  'Show me my unfinished goals.',
  'What habits am I falling behind on?',
  'Create a study plan for my next exam.',
]

export function AssistantPage() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, sending, error])

  const ask = async (history) => {
    setError('')
    setSending(true)
    try {
      const reply = await assistantService.chat(trimHistory(history))
      setMessages([...history, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const send = (text) => {
    const content = text.trim()
    if (!content || sending) return
    const history = [...messages, { role: 'user', content }]
    setMessages(history)
    setDraft('')
    ask(history)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(draft)
    }
  }

  const reset = () => {
    setMessages([])
    setError('')
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Assistant</h1>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw size={14} />
            New chat
          </Button>
        )}
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col gap-4">
            <Card padding="sm" className="flex gap-3 items-start">
              <Lock size={15} className="text-muted mt-0.5 shrink-0" />
              <p className="text-xs text-muted">
                The assistant can see a summary of your tasks, events, habits, goals, study and spending — only for this
                conversation. It never sees your notes, memories or places, and it can&apos;t change anything: it only
                reads and advises.
              </p>
            </Card>
            <div>
              <p className="text-sm text-muted mb-2 flex items-center gap-1.5">
                <Sparkles size={14} /> Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="px-3 py-1.5 rounded-sm border border-border bg-surface text-sm text-foreground hover:bg-surface-hover text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap break-words',
                  message.role === 'user'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-surface border border-border text-foreground'
                )}
              >
                <span className="sr-only">{message.role === 'user' ? 'You: ' : 'Assistant: '}</span>
                {message.content}
              </div>
            </div>
          ))
        )}

        {sending && <p className="text-sm text-muted">Thinking…</p>}

        {error && (
          <div className="flex items-center gap-3 text-sm text-danger" role="alert">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={() => ask(messages)}>
              Try again
            </Button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          send(draft)
        }}
        className="flex items-end gap-2"
      >
        <label className="flex-1">
          <span className="sr-only">Message the assistant</span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            maxLength={4000}
            placeholder="Ask about your day, deadlines, spending… (Enter to send, Shift+Enter for a new line)"
            className="w-full px-3 py-2 rounded-sm bg-surface border border-control text-sm text-foreground placeholder:text-muted resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
        <Button type="submit" disabled={sending || draft.trim() === ''} aria-label="Send message">
          <Send size={16} />
        </Button>
      </form>
    </div>
  )
}

import { useState } from 'react'

/**
 * MoodWidget — a daily mood check-in with a small trend sparkline.
 * The selected mood is stored locally and displayed as a subtle
 * emoticon above the dashboard greeting.
 */
export function MoodWidget() {
  const emojis = ['😊', '🙂', '😐', '😔', '😫']
  const labels = ['Great', 'Good', 'Okay', 'Tough', 'Exhausted']

  // persisted choice (or default 'Okay')
  const stored = localStorage.getItem('sora-mood')
  const initial = stored ? parseInt(stored, 10) : 2
  const [moodIndex, setMoodIndex] = useState(initial)

  // simple 7-day trend stored in localStorage
  const trendKey = 'sora-mood-trend'
  const rawTrend = localStorage.getItem(trendKey)
  const trend = rawTrend ? rawTrend.split(',').map(Number) : []

  const saveMood = (index) => {
    setMoodIndex(index)
    localStorage.setItem('sora-mood', index.toString())
    // append to trend (keep last 7)
    const newTrend = [...trend, index].slice(-7)
    localStorage.setItem(trendKey, newTrend.join(','))
  }

  return (
    <div className="flex items-center gap-3 text-xs font-medium">
      <span aria-hidden="true" className="text-2xl">
        {emojis[moodIndex]}
      </span>
      <span className="text-muted cursor-pointer hover:text-foreground"
        onClick={() => saveMood(0)} title="Great">
        {labels[0]}
      </span>
      <span className="text-muted cursor-pointer hover:text-foreground"
        onClick={() => saveMood(1)} title="Good">
        {labels[1]}
      </span>
      <span className="text-muted cursor-pointer hover:text-foreground"
        onClick={() => saveMood(2)} title="Okay">
        {labels[2]}
      </span>
      <span className="text-muted cursor-pointer hover:text-foreground"
        onClick={() => saveMood(3)} title="Tough">
        {labels[3]}
      </span>
      <span className="text-muted cursor-pointer hover:text-foreground"
        onClick={() => saveMood(4)} title="Exhausted">
        {labels[4]}
      </span>
    </div>
  )
}
import { useEffect, useRef, useState } from 'react'

/**
 * HabitConstellation — renders a small starfield constellations based on habit data.
 * Each habit contributes a star; position is hash-derived for consistency.
 * Intended as a subtle decorative element in the dashboard or sidebar.
 * Respects `prefers-reduced-motion` — static only when the user prefers it.
 */
export function HabitConstellation({ habitIds = [], className }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (reducedMotion.matches) {
    return null
  }

  const [stars, setStars] = useState(() => {
    const stars = []
    for (let i = 0; i < Math.min(habitIds.length, 20); i++) {
      const hash = habitIds[i].split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      const x = (hash % 90 + 10) / 100 * window.innerWidth
      const y = ((hash / 37) % 90 + 10) / 100 * window.innerHeight
      const size = 2 + (hash % 4) * 1.5
      const opacity = 0.4 + (hash % 6) * 0.1
      stars.push({ x, y, size, opacity, dx: (hash % 3 - 1) * 0.2, dy: (hash % 3 - 1) * 0.2 })
    }
    return stars
  })

  useEffect(() => {
    const frame = () => {
      setStars((prev) => {
        return prev.map((star) => {
          const x = (star.x + star.dx + window.innerWidth + 1) % (window.innerWidth + 1)
          const y = (star.y + star.dy + window.innerHeight + 1) % (window.innerHeight + 1)
          return { ...star, x, y }
        })
      })
      requestAnimationFrame(frame)
    }

    const raf = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(raf)
  }, [stars.length])

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden',
        className
      )}
    >
      {stars.map((star, i) => (
        <svg
          key={i}
          aria-hidden="true"
          style={{
            left: star.x + 'px',
            top: star.y + 'px',
            width: star.size + 'px',
            height: star.size + 'px',
            opacity: star.opacity,
          }}
        >
          <circle cx="5" cy="5" r="2" fill="white" />
        </svg>
      ))}
    </div>
  )
}
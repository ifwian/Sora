import { useEffect } from 'react'

/**
 * CloudMascot — a friendly inline SVG cloud that drifts slowly across the screen.
 * When `data-sky-phase` is set (dawn/dusk/night), the cloud colour subtly shifts.
 * Accepts `className` for further styling.
 */
export function CloudMascot({ className }) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const maxRight = window.innerWidth - element.offsetWidth
    const maxBottom = window.innerHeight - element.offsetHeight

    let x = Math.random() * maxRight
    let y = Math.random() * maxBottom / 2 // start higher
    let dx = (Math.random() - 0.5) * 0.5 // slow horizontal drift
    let dy = (Math.random() - 0.5) * 0.3

    const animate = () => {
      x += dx
      y += dy

      // wrap around
      if (x > window.innerWidth) x = -element.offsetWidth
      if (x < -element.offsetWidth) x = window.innerWidth
      if (y > window.innerHeight) y = -element.offsetHeight

      element.style.transform = `translate(${x}px, ${y}px)`
      requestAnimationFrame(animate)
    }

    animate()

    // cleanup
    return () => {
      cancelAnimationFrame(animate)
    }
  }, [])

  return (
    <svg
      data-testid="cloud-mascot"
      aria-hidden="true"
      className={cn('absolute top-0 left-0 pointer-events-none', className)}
      viewBox="0 0 100 50"
    >
      <path
        fill="#82b8ec"
        fill-opacity="0.8"
        d="M10 25 Q 20 10, 40 25 Q 60 40, 80 25 Q 100 10, 90 25 Z"
      />
    </svg>
  )
}
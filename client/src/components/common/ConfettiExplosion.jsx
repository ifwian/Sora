import { useEffect, useRef, useState } from 'react'

/**
 * ConfettiExplosion — renders a burst of confetti particles from a source position.
 * Intended for celebration on task completion, habit streaks, milestone achievement.
 * Respects `prefers-reduced-motion` — no particles when the user prefers it.
 */
export function ConfettiExplosion({ sourceX, sourceY, className }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (reducedMotion.matches) {
    return null
  }

  const particleCount = 30
  const [particles, setParticles] = useState(() => {
    const particles = []
    const colors = ['#82b8ec', '#7db4e8', '#ff6b6b', '#ff8c42', '#4ecdc4']
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 8 + 4
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const velocity = Math.random() * 20 + 10
      particles.push({
        x: sourceX,
        y: sourceY,
        color,
        size,
        angle,
        velocity,
        friction: 0.99,
        gravity: 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
      })
    }
    return particles
  })

  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.velocity *= p.friction
        p.gravity *= p.friction
        p.x += Math.cos(p.angle) * p.velocity
        p.y += Math.sin(p.angle) * p.velocity + p.gravity
        p.rotation += p.rotationSpeed

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [particles.length])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    />
  )
}
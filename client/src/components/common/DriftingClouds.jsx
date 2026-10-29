import { useEffect, useRef, useState } from 'react'
import { CloudMascot } from './CloudMascot'

/**
 * DriftingClouds — renders multiple CloudMasots that drift across the screen.
 * Intended for the login/registration page background.
 * Respects `prefers-reduced-motion` — no animation when the user prefers it.
 */
export function DriftingClouds({ className }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const [isReduced, setIsReduced] = useState(reducedMotion.matches)

  useEffect(() => {
    const handler = () => setIsReduced(reducedMotion.matches)
    reducedMotion.addEventListener('change', handler)
    return () => reducedMotion.removeEventListener('change', handler)
  }, [])

  if (isReduced) {
    return (
      <div className="relative overflow-hidden">
        <CloudMascot className="absolute top-1/2 left-1/4" />
      </div>
    )
  }

  const cloudRef = useRef([])
  const cloudData = useRef([
    { dx: -2, dy: 0 },
    { dx: -1, dy: 0.5 },
    { dx: -3, dy: -0.5 },
    { dx: -1.5, dy: 0 }
  ])

  useEffect(() => {
    const data = cloudData.current
    while (data.length < 4) {
      data.push({ dx: -2 - Math.random() * 2, dy: Math.random() * 1 - 0.5 })
    }
  }, [])

  useEffect(() => {
    const container = document.querySelector('.relative.overflow-hidden')
    if (!container) return

    const nodes = []
    for (let i = 0; i < 4; i++) {
      const el = document.createElement('div')
      el.style.position = 'absolute'
      el.style.width = '100px'
      el.style.height = '50px'
      container.appendChild(el)
      nodes.push(el)
    }
    cloudRef.current = nodes

    for (let j = 0; j < cloudRef.current.length; j++) {
      cloudRef.current[j].style.transform = 'translate(' + (Math.random() * window.innerWidth) + 'px, ' + (Math.random() * window.innerHeight) + 'px)'
    }
  }, [])

  const initialX = [-200, -100, -300, -150]
  const initialY = [50, 100, 150, 200]
  const cloudsX = useRef(initialX)
  const cloudsY = useRef(initialY)

  useEffect(() => {
    const frame = (time) => {
      for (let k = 0; k < 4; k++) {
        cloudsX.current[k] += cloudData.current[k].dx
        cloudsY.current[k] += cloudData.current[k].dy

        const nodes = cloudRef.current
        if (!nodes[k]) continue

        if (cloudsX.current[k] > window.innerWidth + 100) {
          cloudsX.current[k] = -100
        }
        if (cloudsY.current[k] > window.innerHeight + 100) {
          cloudsY.current[k] = -50
        }

        nodes[k].style.transform = 'translate(' + cloudsX.current[k] + 'px, ' + cloudsY.current[k] + 'px)'
      }
      requestAnimationFrame(frame)
    }

    const raf = requestAnimationFrame(frame)

    const handleResize = () => {
      // recalculate positions on resize
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative overflow-hidden min-h-64">
      {Array.from({ length: 4 }, (_, i) => (
        <CloudMascot key={i} className="absolute opacity-80" />
      ))}
    </div>
  )
}
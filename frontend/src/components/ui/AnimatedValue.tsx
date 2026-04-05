import { useEffect, useRef, useState } from 'react'

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function useAnimatedValue(target: number, duration = 800): number {
  const [display, setDisplay] = useState(0)
  const prevTarget = useRef(0)
  const rafId = useRef(0)

  useEffect(() => {
    const from = prevTarget.current
    const delta = target - from
    if (delta === 0) return

    const start = performance.now()
    cancelAnimationFrame(rafId.current)

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = from + delta * eased
      setDisplay(current)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick)
      } else {
        prevTarget.current = target
      }
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [target, duration])

  return display
}

interface AnimatedValueProps {
  value: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}

export function AnimatedValue({
  value,
  duration = 800,
  formatter = (v) => Math.round(v).toLocaleString('en-US'),
  className,
}: AnimatedValueProps) {
  const animated = useAnimatedValue(value, duration)
  return <span className={className}>{formatter(animated)}</span>
}

export function AnimatedCurrency({
  value,
  duration = 800,
  className,
}: Omit<AnimatedValueProps, 'formatter'>) {
  const animated = useAnimatedValue(value, duration)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(animated))
  return <span className={className}>{formatted}</span>
}

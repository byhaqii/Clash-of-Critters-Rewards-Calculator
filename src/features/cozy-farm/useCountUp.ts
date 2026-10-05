import { useEffect, useState } from 'react'

export function useCountUp(value: number, duration = 500) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const startValue = shown
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || duration <= 0) { setShown(value); return }
    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setShown(Math.round(startValue + (value - startValue) * eased))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // shown intentionally anchors each animation at the last rendered count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])
  return shown
}

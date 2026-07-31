import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic dwell-to-select behavior (NFR1/NFR3): the pointer (mouse, touch,
 * or an assistive device emulating a pointer — e.g. head-pointer or eye-gaze
 * software) must rest over a target for `durationMs` before it fires.
 * Leaving the target before then cancels it, so brushing past a target
 * doesn't trigger an accidental selection.
 */
export function useDwell(onComplete: () => void, durationMs = 600) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startRef.current = null
    completedRef.current = false
    setProgress(0)
  }, [])

  const tick = useCallback(
    (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const next = Math.min(1, elapsed / durationMs)
      setProgress(next)
      if (next >= 1) {
        if (!completedRef.current) {
          completedRef.current = true
          onCompleteRef.current()
        }
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [durationMs],
  )

  const start = useCallback(() => {
    stop()
    rafRef.current = requestAnimationFrame(tick)
  }, [stop, tick])

  useEffect(() => stop, [stop])

  return {
    progress,
    bind: {
      onPointerEnter: start,
      onPointerLeave: stop,
      onPointerCancel: stop,
    },
  }
}

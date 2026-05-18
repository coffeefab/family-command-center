import { useEffect, useRef } from 'react'

const EVENTS = ['mousemove', 'keydown', 'touchstart', 'click', 'pointerdown', 'wheel']

export function useIdleTimeout({ seconds, onIdle, paused = false }) {
  const timerRef = useRef(null)
  const onIdleRef = useRef(onIdle)

  useEffect(() => { onIdleRef.current = onIdle }, [onIdle])

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const arm = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onIdleRef.current?.(), seconds * 1000)
    }

    const reset = () => arm()

    EVENTS.forEach(ev => window.addEventListener(ev, reset, { passive: true }))
    arm()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTS.forEach(ev => window.removeEventListener(ev, reset))
    }
  }, [seconds, paused])
}

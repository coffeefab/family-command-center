import { useEffect, useMemo } from 'react'
import { palette } from '../utils/palette.js'

const CONFETTI_COLORS = [
  'bg-coral-500', 'bg-coral-200',
  'bg-sage-500',  'bg-sage-200',
  'bg-plum-500',  'bg-plum-200',
  'bg-butter-500','bg-butter-200'
]

const PRAISE = [
  'Great job',
  'You crushed it',
  'Way to go',
  'Look at you',
  'So proud of you',
  'High five'
]

export default function CelebrationOverlay({
  child,
  starsThisPeriod,
  starsToday,
  doneCount,
  totalCount,
  reset,
  onClose,
  autoCloseMs = 4500
}) {
  const p = palette[child.color] || palette.coral

  // Build a fresh confetti config once per show.
  const confetti = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const left = Math.random() * 100
      const size = 6 + Math.random() * 8
      const drift = (Math.random() * 200 - 100).toFixed(0) + 'px'
      const spin = (Math.random() * 720 + 360).toFixed(0) + 'deg'
      const dur = (1.8 + Math.random() * 1.6).toFixed(2) + 's'
      const delay = (Math.random() * 0.4).toFixed(2) + 's'
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      const rounded = i % 3 === 0 ? 'rounded-sm' : 'rounded-full'
      return { left, size, drift, spin, dur, delay, color, rounded, key: `${i}-${Math.random()}` }
    })
  }, [child.id, starsThisPeriod, starsToday])

  const praise = useMemo(
    () => PRAISE[Math.floor(Math.random() * PRAISE.length)],
    [child.id, starsThisPeriod]
  )

  useEffect(() => {
    if (!autoCloseMs) return
    const t = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(t)
  }, [autoCloseMs, onClose])

  const allDone = totalCount > 0 && doneCount === totalCount

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-label={`${child.name} finished`}
    >
      <div className="absolute inset-0 bg-cream/95 backdrop-blur-md" />

      {/* Confetti rain */}
      <div className="absolute inset-0 pointer-events-none">
        {confetti.map(c => (
          <span
            key={c.key}
            className={`confetti-fall ${c.color} ${c.rounded}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              '--drift': c.drift,
              '--spin': c.spin,
              '--dur': c.dur,
              animationDelay: c.delay
            }}
          />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-xl w-full px-6 text-center">
        <div className="hero-pop">
          <div className="text-xs uppercase tracking-[0.22em] text-muted">
            {allDone ? 'All tasks done today' : 'Saved'}
          </div>
          <h1 className={`font-display text-5xl md:text-7xl ${p.text} mt-2`}>
            {praise}, {child.name}.
          </h1>
        </div>

        <div
          className="hero-pop mt-6 inline-flex items-center gap-3 rounded-full bg-white border border-line shadow-card px-6 py-3"
          style={{ animationDelay: '120ms' }}
        >
          <span className={`inline-block w-3 h-3 rounded-full ${p.dot}`} />
          <span className="text-ink">
            <span className="font-display text-2xl mr-1.5">{starsThisPeriod}</span>
            <span className="text-muted text-sm">
              {reset === 'daily' ? 'stars today' : 'stars this week'}
            </span>
          </span>
          {reset !== 'daily' && (
            <>
              <span className="text-line">·</span>
              <span className="text-ink">
                <span className="font-display text-2xl mr-1.5">{starsToday}</span>
                <span className="text-muted text-sm">today</span>
              </span>
            </>
          )}
        </div>

        <div className="hero-pop mt-4 text-muted" style={{ animationDelay: '220ms' }}>
          {doneCount} of {totalCount} tasks done today
        </div>

        <div
          className="hero-pop mt-8 inline-flex items-center gap-2 rounded-full bg-sage-50 border border-sage-200 text-sage-700 px-4 py-2 saved-pulse"
          style={{ animationDelay: '320ms' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 12 10 17 19 7" />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider">Your work is saved</span>
        </div>

        <div className="mt-10 text-xs text-muted">
          Tap anywhere to head back to the home screen.
        </div>
      </div>
    </div>
  )
}

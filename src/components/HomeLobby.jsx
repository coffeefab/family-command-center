import { useEffect, useMemo, useState } from 'react'
import { palette } from '../utils/palette.js'
import { greeting, prettyDate } from '../utils/date.js'

const ASSET = (name) => `${import.meta.env.BASE_URL}${name}`

const PROMPTS = [
  "Who's checking in?",
  "Tap your name.",
  "Ready for today?",
  "Pick yourself."
]

const TILT = ['-3deg', '2deg', '-1deg']

export default function HomeLobby({
  children,
  starsByChild,
  doneByChild,
  totalByChild,
  reset,
  onPick,
  onParent,
  onOpenCalendar
}) {
  const [promptIdx, setPromptIdx] = useState(0)
  const [pressedId, setPressedId] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setPromptIdx(i => (i + 1) % PROMPTS.length), 5200)
    return () => clearInterval(t)
  }, [])

  const orbs = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    left: `${(i * 83) % 100}%`,
    top: `${(i * 47) % 100}%`,
    size: 14 + ((i * 7) % 22),
    delay: `${(i % 5) * 0.6}s`,
    hue: i % 4
  })), [])

  const handlePick = (id) => {
    setPressedId(id)
    setTimeout(() => { onPick(id); setPressedId(null) }, 380)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Floating decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbs.map((o, i) => {
          const color = ['bg-coral-200', 'bg-sage-200', 'bg-plum-200', 'bg-butter-200'][o.hue]
          return (
            <span
              key={i}
              className={`absolute rounded-full ${color} float-orb opacity-60`}
              style={{
                left: o.left,
                top: o.top,
                width: o.size,
                height: o.size,
                animationDelay: o.delay
              }}
            />
          )
        })}
      </div>

      {/* Top bar with brand and date */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6">
        <div className="text-xs md:text-sm uppercase tracking-[0.22em] text-muted">
          Castelan Family Command Center
        </div>
        <div className="text-xs md:text-sm text-muted hidden sm:block">
          {prettyDate()}
        </div>
      </div>

      {/* Center column */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="text-muted text-sm uppercase tracking-[0.22em]">
          {greeting()}
        </div>
        <h1
          key={promptIdx}
          className="font-display text-4xl md:text-7xl text-ink mt-2 text-center enter-pop"
        >
          {PROMPTS[promptIdx]}
        </h1>
        <p className="text-muted mt-3 text-base md:text-lg text-center max-w-md">
          Tap your tile to see chores, lessons, and stars for today.
        </p>

        {/* Avatar tiles */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 w-full max-w-4xl">
          {children.map((child, i) => {
            const p = palette[child.color] || palette.coral
            const stars = starsByChild[child.id] || 0
            const done = doneByChild[child.id] || 0
            const total = totalByChild[child.id] || 0
            const isPressed = pressedId === child.id
            return (
              <button
                key={child.id}
                onClick={() => handlePick(child.id)}
                className="group relative flex flex-col items-center enter-pop focus:outline-none"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {/* Outer halo */}
                <span
                  className={`absolute -inset-3 rounded-full ${p.soft} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden
                />
                {/* Tilted avatar disc */}
                <span
                  className={`relative bob ${isPressed ? 'pop' : ''}`}
                  style={{ '--rot': TILT[i % TILT.length], animationDelay: `${i * 0.4}s` }}
                >
                  <span
                    className={`relative flex items-center justify-center rounded-full overflow-hidden ${p.dot} shadow-card transition-transform duration-300 group-hover:scale-105 group-active:scale-95`}
                    style={{
                      width: 'clamp(160px, 22vw, 220px)',
                      height: 'clamp(160px, 22vw, 220px)',
                      boxShadow: '0 18px 50px -18px rgba(43,38,32,0.45), inset 0 -10px 24px rgba(0,0,0,0.08)',
                      padding: 6
                    }}
                  >
                    {child.photo ? (
                      <img
                        src={ASSET(child.photo)}
                        alt={child.name}
                        className="w-full h-full rounded-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="font-display text-white" style={{ fontSize: 'clamp(72px, 10vw, 110px)', lineHeight: 1 }}>
                        {child.name[0]}
                      </span>
                    )}
                  </span>
                  {/* Decorative arc behind */}
                  <span
                    className={`absolute -z-10 inset-0 rounded-full border-4 ${p.border}`}
                    style={{ transform: 'translate(8px, 10px)' }}
                    aria-hidden
                  />
                </span>

                <div className="mt-5 font-display text-3xl md:text-4xl text-ink group-hover:scale-105 transition-transform">
                  {child.name}
                </div>

                <div className={`mt-1 inline-flex items-center gap-1.5 text-sm ${p.text}`}>
                  <span className="font-semibold">{stars}</span>
                  <span className="text-muted">
                    {reset === 'daily' ? 'stars today' : 'stars this week'}
                  </span>
                </div>

                <div className="mt-1 text-xs text-muted">
                  {total > 0 ? `${done} of ${total} done today` : 'No tasks today'}
                </div>

                {/* Confetti burst on press */}
                {isPressed && (
                  <>
                    {[0, 60, 120, 180, 240].map((d, k) => (
                      <span
                        key={k}
                        className={`confetti-dot absolute w-2 h-2 rounded-full ${['bg-butter-500','bg-coral-500','bg-sage-500','bg-plum-500','bg-butter-200'][k]}`}
                        style={{
                          left: `${30 + k * 12}%`,
                          top: '40%',
                          animationDelay: `${d}ms`
                        }}
                      />
                    ))}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Family calendar CTA */}
      <div className="relative z-10 px-6 md:px-10 mt-2 flex justify-center">
        <button
          onClick={onOpenCalendar}
          className="rounded-full bg-white border border-line shadow-card px-6 py-3 text-ink hover:bg-cream tap inline-flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="font-semibold">Open family calendar</span>
        </button>
      </div>

      {/* Footer with parent mode */}
      <div className="relative z-10 px-6 md:px-10 pt-4 pb-6 flex items-center justify-between">
        <div className="text-xs text-muted">
          Returns home after a minute of quiet.
        </div>
        <button
          onClick={onParent}
          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink rounded-full border border-line bg-cream px-4 py-2"
        >
          Parent mode
        </button>
      </div>
    </div>
  )
}

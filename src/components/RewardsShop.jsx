import { useMemo } from 'react'
import { palette } from '../utils/palette.js'

export default function RewardsShop({ child, rewards, stars, reset }) {
  const p = palette[child.color] || palette.coral

  const sorted = useMemo(
    () => [...(rewards || [])].sort((a, b) => a.cost - b.cost),
    [rewards]
  )

  const periodLabel = reset === 'daily' ? 'today' : 'this week'

  return (
    <section className={`rounded-card border ${p.border} bg-white shadow-card overflow-hidden`}>
      <div className={`flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/70 ${p.soft}`}>
        <div>
          <h2 className={`font-display text-2xl ${p.text}`}>What I can get</h2>
          <p className="text-xs text-muted mt-0.5">With my stars {periodLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted">My stars</div>
          <div className={`font-display text-2xl ${p.text}`}>★ {stars}</div>
        </div>
      </div>

      <div className="p-4">
        {sorted.length === 0 ? (
          <div className="text-sm text-muted italic text-center py-6 px-2">
            Ask a grown up to add some rewards.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {sorted.map(r => {
              const affordable = stars >= r.cost
              const gap = r.cost - stars

              if (affordable) {
                return (
                  <div
                    key={r.id}
                    className={`relative rounded-2xl border ${p.border} ${p.soft} px-3 py-3 flex flex-col gap-1.5 shadow-card`}
                  >
                    <div className={`text-sm font-semibold ${p.text} leading-tight`}>{r.label}</div>
                    <div className="flex items-center justify-between gap-1.5 mt-auto">
                      <span className={`text-xs ${p.text}`}>★ {r.cost}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold ${p.dot} text-white px-2 py-0.5 rounded-full whitespace-nowrap leading-none`}>
                        Can get!
                      </span>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-line bg-cream/60 px-3 py-3 flex flex-col gap-1.5"
                >
                  <div className="text-sm font-semibold text-ink/70 leading-tight">{r.label}</div>
                  <div className="flex items-center justify-between gap-1.5 mt-auto">
                    <span className="text-xs text-muted">★ {r.cost}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted whitespace-nowrap">
                      {gap} more
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

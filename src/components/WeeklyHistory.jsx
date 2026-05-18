import { useMemo, useState } from 'react'
import { weekDates, weekRangeLabel, weekKey } from '../utils/date.js'
import { palette } from '../utils/palette.js'

export default function WeeklyHistory({
  children,
  starLog,
  rewards,
  redemptions,
  onToggleRedemption,
  weeksBack = 4
}) {
  const [openIdx, setOpenIdx] = useState(0)

  const sortedRewards = useMemo(
    () => [...rewards].sort((a, b) => a.cost - b.cost),
    [rewards]
  )

  const pastWeeks = useMemo(() => {
    const out = []
    for (let i = 1; i <= weeksBack; i++) {
      const ref = new Date()
      ref.setDate(ref.getDate() - 7 * i)
      const days = weekDates(ref)
      const wKey = weekKey(ref)
      const rangeLabel = weekRangeLabel(ref)

      const byChild = {}
      let familyTotal = 0
      let anyActivity = false
      for (const child of children) {
        let stars = 0
        for (const { key } of days) {
          const v = (starLog?.[key]?.[child.id]) || 0
          stars += v
          if (v > 0) anyActivity = true
        }
        const earned = sortedRewards.filter(r => stars >= r.cost)
        const redeemed = (redemptions?.[wKey]?.[child.id]) || []
        byChild[child.id] = { stars, earned, redeemed }
        familyTotal += stars
      }
      out.push({ wKey, rangeLabel, byChild, familyTotal, anyActivity, weeksAgo: i })
    }
    return out
  }, [children, starLog, sortedRewards, redemptions, weeksBack])

  const hasAnyHistory = pastWeeks.some(w => w.anyActivity || (redemptions?.[w.wKey] && Object.keys(redemptions[w.wKey]).length > 0))

  return (
    <section className="rounded-card border border-line bg-white/85 backdrop-blur-sm shadow-card overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-line/70 bg-cream/60">
        <div className="text-xs uppercase tracking-[0.22em] text-muted">History</div>
        <h2 className="font-display text-2xl text-ink mt-0.5">Last {weeksBack} weeks</h2>
      </div>

      {!hasAnyHistory ? (
        <div className="p-5 text-sm text-muted italic">
          No history yet. Once a week passes, you'll see it here.
        </div>
      ) : (
        <div className="p-5 space-y-3">
          {pastWeeks.map((w, i) => {
            const expanded = openIdx === i
            const label =
              i === 0 ? 'Last week' :
              i === 1 ? 'Two weeks ago' :
              i === 2 ? 'Three weeks ago' :
                        'Four weeks ago'
            return (
              <div key={w.wKey} className="rounded-2xl border border-line bg-cream/40 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(expanded ? -1 : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-cream/80 transition"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
                    <div className="font-display text-lg text-ink">{w.rangeLabel}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Mini per-kid totals */}
                    <div className="hidden sm:flex items-center gap-2">
                      {children.map(c => {
                        const p = palette[c.color] || palette.coral
                        const stars = w.byChild[c.id].stars
                        return (
                          <div key={c.id} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                            <span className="text-sm text-ink font-semibold">{stars}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted">Family</div>
                      <div className="font-display text-lg text-ink">{w.familyTotal}</div>
                    </div>
                    <div className="text-muted text-lg">{expanded ? '−' : '+'}</div>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {children.map(child => {
                      const p = palette[child.color] || palette.coral
                      const data = w.byChild[child.id]
                      return (
                        <div key={child.id} className={`rounded-xl border ${p.border} ${p.soft} p-3`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {child.photo ? (
                                <span className={`inline-block rounded-full p-0.5 ${p.dot}`}>
                                  <img
                                    src={`${import.meta.env.BASE_URL}${child.photo}`}
                                    alt={child.name}
                                    className="w-7 h-7 rounded-full object-cover block"
                                    draggable={false}
                                  />
                                </span>
                              ) : (
                                <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                              )}
                              <span className={`font-semibold ${p.text}`}>{child.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-display text-xl text-ink">{data.stars}</span>
                              <span className="text-muted text-xs ml-1">stars</span>
                            </div>
                          </div>

                          {data.earned.length === 0 ? (
                            <div className="text-xs text-muted mt-1.5">No rewards earned.</div>
                          ) : (
                            <div className="mt-2 space-y-1">
                              {data.earned.map(r => {
                                const isRedeemed = data.redeemed.includes(r.id)
                                return (
                                  <label key={r.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer text-sm ${
                                    isRedeemed ? 'bg-cream border-line' : 'bg-white border-line'
                                  }`}>
                                    <input
                                      type="checkbox"
                                      checked={isRedeemed}
                                      onChange={() => onToggleRedemption(w.wKey, child.id, r.id)}
                                      className="w-4 h-4 accent-ink"
                                    />
                                    <span className={`flex-1 ${isRedeemed ? 'line-through text-muted' : 'text-ink'}`}>
                                      {r.label}
                                    </span>
                                    <span className="text-xs text-muted">{r.cost}</span>
                                    {isRedeemed && (
                                      <span className="text-[10px] uppercase tracking-wider text-sage-700">
                                        Handed out
                                      </span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { weekDates, weekRangeLabel, weekKey, todayKey } from '../utils/date.js'
import { palette } from '../utils/palette.js'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DOW_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklySummary({
  children,
  tasks,
  starLog,
  rewards,
  redemptions,
  onToggleRedemption,
  onResetWeek
}) {
  const today = todayKey()
  const days = useMemo(() => weekDates(), [])
  const currentWeekKey = useMemo(() => weekKey(), [])
  const sortedRewards = useMemo(() => [...rewards].sort((a, b) => a.cost - b.cost), [rewards])

  const [expanded, setExpanded] = useState(true)

  // Per child stats
  const stats = useMemo(() => {
    return children.map(child => {
      let weekStars = 0
      const perDayStars = days.map(({ key }) => {
        const v = (starLog?.[key]?.[child.id]) || 0
        weekStars += v
        return v
      })

      let weekDone = 0
      const perDayDone = days.map(({ key }) => {
        let n = 0
        for (const t of tasks) {
          if (t.childId === child.id && t.completedBy?.[key]) n++
        }
        weekDone += n
        return n
      })

      const earned = sortedRewards.filter(r => weekStars >= r.cost)
      const nextReward = sortedRewards.find(r => weekStars < r.cost)
      const topEarned = earned[earned.length - 1] || null
      const redeemed = (redemptions?.[currentWeekKey]?.[child.id]) || []

      return { child, weekStars, perDayStars, weekDone, perDayDone, earned, topEarned, nextReward, redeemed }
    })
  }, [children, days, starLog, tasks, sortedRewards, redemptions, currentWeekKey])

  const totalWeekStars = stats.reduce((s, x) => s + x.weekStars, 0)

  return (
    <section className="rounded-card border border-line bg-white/85 backdrop-blur-sm shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/70 bg-cream/60 text-left"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted">Weekly summary</div>
          <h2 className="font-display text-2xl text-ink mt-0.5">
            Week of {weekRangeLabel()}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted">Family total</div>
          <div className="font-display text-2xl text-ink">{totalWeekStars} stars</div>
        </div>
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {stats.map(({ child, weekStars, perDayStars, weekDone, earned, nextReward, redeemed }) => {
            const p = palette[child.color] || palette.coral
            const remaining = nextReward ? nextReward.cost - weekStars : 0
            return (
              <div key={child.id} className={`rounded-2xl border ${p.border} ${p.soft} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {child.photo ? (
                      <span className={`inline-block rounded-full p-0.5 ${p.dot}`}>
                        <img
                          src={`${import.meta.env.BASE_URL}${child.photo}`}
                          alt={child.name}
                          className="w-10 h-10 rounded-full object-cover block"
                          draggable={false}
                        />
                      </span>
                    ) : (
                      <span className={`w-3 h-3 rounded-full ${p.dot}`} />
                    )}
                    <div className="min-w-0">
                      <div className={`font-display text-xl ${p.text} truncate`}>{child.name}</div>
                      <div className="text-xs text-muted">
                        {weekDone} {weekDone === 1 ? 'task' : 'tasks'} done this week
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-display text-3xl ${p.text} leading-none`}>{weekStars}</div>
                    <div className="text-xs text-muted">stars</div>
                  </div>
                </div>

                {/* Per-day bars */}
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {days.map(({ key }, i) => {
                    const v = perDayStars[i]
                    const isToday = key === today
                    const isPast = key < today
                    const filled = v > 0
                    return (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-lg border ${
                            filled
                              ? `${p.dot} border-transparent text-white`
                              : isPast
                                ? 'bg-cream border-line text-muted'
                                : 'bg-white border-line text-muted'
                          } ${isToday ? 'ring-2 ring-ink ring-offset-1 ring-offset-white' : ''}`}
                          style={{ minHeight: 36 }}
                          title={`${DOW_FULL[i]}: ${v} ${v === 1 ? 'star' : 'stars'}`}
                        >
                          <div className="flex items-center justify-center h-9 text-sm font-semibold">
                            {v > 0 ? v : ''}
                          </div>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted">
                          {DOW[i]}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Reward eligibility with handed-out checkboxes */}
                <div className="mt-3 space-y-1.5">
                  {earned.length === 0 ? (
                    <div className="text-xs text-muted">
                      {nextReward
                        ? `${remaining} more for ${nextReward.label}.`
                        : 'No reward goals set yet.'}
                    </div>
                  ) : (
                    <>
                      {earned.map(r => {
                        const isRedeemed = redeemed.includes(r.id)
                        return (
                          <label
                            key={r.id}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition ${
                              isRedeemed
                                ? 'bg-cream border-line'
                                : `bg-white ${p.border}`
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isRedeemed}
                              onChange={() => onToggleRedemption(currentWeekKey, child.id, r.id)}
                              className="w-5 h-5 accent-ink"
                            />
                            <span className="flex-1 min-w-0">
                              <span className={`text-sm font-semibold ${isRedeemed ? 'line-through text-muted' : 'text-ink'}`}>
                                {r.label}
                              </span>
                              <span className="text-xs text-muted ml-2">{r.cost} stars</span>
                            </span>
                            {isRedeemed && (
                              <span className="text-xs text-sage-700 uppercase tracking-wider">
                                Handed out
                              </span>
                            )}
                          </label>
                        )
                      })}
                      {nextReward && (
                        <div className="text-xs text-muted pl-1">
                          {remaining} more for {nextReward.label}.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
            <p className="text-xs text-muted">
              Stars carry through the week, then a new week starts Monday. Reset only if you handed out rewards early.
            </p>
            <button
              onClick={onResetWeek}
              className="rounded-xl bg-cream border border-line text-ink px-3 py-1.5 text-sm hover:bg-sand"
            >
              Reset this week's stars
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

import { useMemo } from 'react'
import { eventsForDate, formatTime, eventCategoryMeta } from '../utils/events.js'
import { todayKey } from '../utils/date.js'

export default function TodaySchedule({
  events,
  children,
  childId = null,
  title = "Today's schedule",
  compact = false,
  emptyHint = null
}) {
  const today = todayKey()
  const list = useMemo(
    () => eventsForDate(events, today, childId),
    [events, today, childId]
  )

  return (
    <section className={`rounded-card bg-white/85 backdrop-blur-sm border border-line shadow-card ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted">Today</div>
          <h3 className="font-display text-xl text-ink">{title}</h3>
        </div>
        <div className="text-xs text-muted">
          {list.length === 0 ? 'nothing planned' : `${list.length} on the agenda`}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-muted italic">
          {emptyHint || 'A clear day. Plenty of space for play.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map(ev => {
            const m = eventCategoryMeta[ev.category] || eventCategoryMeta.family
            const forKids = ev.childIds?.length > 0
              ? children.filter(c => ev.childIds.includes(c.id))
              : null
            return (
              <li
                key={ev.id}
                className={`flex items-center gap-3 rounded-2xl border ${m.border} ${m.soft} px-3 py-2.5`}
              >
                <div className="w-16 shrink-0 text-right">
                  <div className="text-xs font-semibold text-ink">
                    {ev.allDay ? 'All day' : formatTime(ev.time)}
                  </div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${m.accent} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-ink font-semibold truncate">{ev.title}</div>
                  <div className="text-xs text-muted truncate">
                    <span className={m.text}>{m.label}</span>
                    {forKids ? ` · ${forKids.map(c => c.name).join(', ')}` : ' · Whole family'}
                    {ev.notes ? ` · ${ev.notes}` : ''}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { eventsForDate, formatTime, eventCategoryMeta, rangeInfo, weeklyWindowLabel, upcomingDays, dayLabel } from '../utils/events.js'
import { todayKey } from '../utils/date.js'

export default function CalendarPanel({
  events,
  children,
  onAdd,
  onEdit
}) {
  const today = todayKey()
  const [days] = useState(() => upcomingDays(7))

  const grouped = useMemo(
    () => days.map(d => ({
      ...d,
      events: eventsForDate(events, d.key)
    })),
    [days, events]
  )

  return (
    <section className="rounded-card border border-line bg-white/85 backdrop-blur-sm shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/70 bg-cream/60">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted">Calendar</div>
          <h2 className="font-display text-2xl text-ink mt-0.5">Next 7 days</h2>
        </div>
        <button
          onClick={() => onAdd(today)}
          className="rounded-xl bg-ink text-cream px-3 py-2 text-sm hover:opacity-90"
        >
          + New event
        </button>
      </div>

      <div className="p-5 space-y-3">
        {grouped.map(({ key, date, events: dayEvents }) => {
          const isToday = key === today
          return (
            <div
              key={key}
              className={`rounded-2xl border ${isToday ? 'border-ink bg-cream' : 'border-line bg-cream/40'} overflow-hidden`}
            >
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className={`text-xs uppercase tracking-wider ${isToday ? 'text-ink font-semibold' : 'text-muted'}`}>
                    {isToday ? 'Today' : dayLabel(date)}
                  </div>
                  {isToday && (
                    <span className="text-[10px] uppercase tracking-wider rounded-full bg-ink text-cream px-2 py-0.5">
                      Now
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onAdd(key)}
                  className="text-xs px-2 py-1 rounded-lg bg-white border border-line hover:bg-sand"
                >
                  + Add
                </button>
              </div>

              {dayEvents.length === 0 ? (
                <div className="px-4 pb-3 text-xs text-muted italic">No events. A free day.</div>
              ) : (
                <ul className="px-3 pb-3 space-y-1.5">
                  {dayEvents.map(ev => {
                    const m = eventCategoryMeta[ev.category] || eventCategoryMeta.family
                    const forKids = ev.childIds?.length > 0
                      ? children.filter(c => ev.childIds.includes(c.id)).map(c => c.name).join(', ')
                      : null
                    const ri = rangeInfo(ev, key)
                    return (
                      <li key={ev.id}>
                        <button
                          onClick={() => onEdit(ev)}
                          className={`w-full text-left flex items-center gap-3 rounded-xl border ${m.border} ${m.soft} px-3 py-2 hover:shadow-card transition`}
                        >
                          <div className="w-16 shrink-0 text-right">
                            <div className="text-xs font-semibold text-ink">
                              {ev.allDay ? 'All day' : formatTime(ev.time)}
                            </div>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${m.accent} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-semibold text-ink truncate">{ev.title}</span>
                              {ri && (
                                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${m.text} border ${m.border} bg-white shrink-0`}>
                                  {ri.isFirst ? 'Starts' : ri.isLast ? 'Ends' : `Day ${ri.dayNum}/${ri.total}`}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted truncate">
                              <span className={m.text}>{m.label}</span>
                              {forKids ? ` · ${forKids}` : ' · Whole family'}
                              {ev.repeat === 'weekly' ? ` · ${weeklyWindowLabel(ev)}` : ''}
                              {ev.repeat === 'range' ? ` · ${ev.startDate} to ${ev.endDate}` : ''}
                            </div>
                          </div>
                          <span className="text-xs text-muted">Edit</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-5 pb-4 text-xs text-muted">
        Tap any event to edit. New events default to weekly repeat on weekdays.
      </div>
    </section>
  )
}

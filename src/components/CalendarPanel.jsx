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
  const [panelOpen, setPanelOpen] = useState(true)
  const [openDays, setOpenDays] = useState(() => new Set([today]))

  const grouped = useMemo(
    () => days.map(d => ({
      ...d,
      events: eventsForDate(events, d.key)
    })),
    [days, events]
  )

  const totalEvents = grouped.reduce((s, d) => s + d.events.length, 0)

  const toggleDay = (key) => setOpenDays(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const allOpen = grouped.every(d => openDays.has(d.key))
  const toggleAll = () => setOpenDays(allOpen ? new Set() : new Set(grouped.map(d => d.key)))

  return (
    <section className="rounded-card border border-line bg-white/85 backdrop-blur-sm shadow-card overflow-hidden">
      {/* Panel header (collapses the whole section) */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/70 bg-cream/60">
        <button
          onClick={() => setPanelOpen(v => !v)}
          className="flex items-center gap-3 text-left flex-1 min-w-0"
        >
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-muted">Calendar</div>
            <h2 className="font-display text-2xl text-ink mt-0.5 truncate">Next 7 days</h2>
          </div>
          <div className="text-xs text-muted ml-auto pr-2">
            {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
          </div>
          <span className="text-muted text-xl shrink-0">{panelOpen ? '−' : '+'}</span>
        </button>
        <button
          onClick={() => onAdd(today)}
          className="ml-2 rounded-xl bg-ink text-cream px-3 py-2 text-sm hover:opacity-90 shrink-0"
        >
          + New event
        </button>
      </div>

      {panelOpen && (
        <>
          <div className="px-5 pt-3 flex items-center justify-between">
            <p className="text-xs text-muted">Today is open by default. Tap any day to expand.</p>
            <button
              onClick={toggleAll}
              className="text-xs text-muted hover:text-ink underline-offset-2 hover:underline"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          <div className="p-5 pt-3 space-y-2">
            {grouped.map(({ key, date, events: dayEvents }) => {
              const isToday = key === today
              const isOpen = openDays.has(key)
              return (
                <div
                  key={key}
                  className={`rounded-2xl border ${isToday ? 'border-ink bg-cream' : 'border-line bg-cream/40'} overflow-hidden`}
                >
                  {/* Day header (clickable to toggle) */}
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <button
                      onClick={() => toggleDay(key)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <div className={`text-xs uppercase tracking-wider ${isToday ? 'text-ink font-semibold' : 'text-muted'}`}>
                        {isToday ? 'Today' : dayLabel(date)}
                      </div>
                      {isToday && (
                        <span className="text-[10px] uppercase tracking-wider rounded-full bg-ink text-cream px-2 py-0.5">
                          Now
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted">
                        {dayEvents.length === 0 ? 'free day' : `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
                      </span>
                      <span className="text-muted text-base shrink-0">{isOpen ? '−' : '+'}</span>
                    </button>
                    <button
                      onClick={() => onAdd(key)}
                      className="text-xs px-2 py-1 rounded-lg bg-white border border-line hover:bg-sand shrink-0"
                    >
                      + Add
                    </button>
                  </div>

                  {isOpen && (
                    dayEvents.length === 0 ? (
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
                    )
                  )}
                </div>
              )
            })}
          </div>

          <div className="px-5 pb-4 text-xs text-muted">
            Tap a day to expand. Tap any event to edit. New events default to weekly on weekdays.
          </div>
        </>
      )}
    </section>
  )
}

import { useMemo, useState } from 'react'
import { eventsForDate, formatTime, eventCategoryMeta } from '../utils/events.js'
import { todayKey } from '../utils/date.js'

const DOW_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dateKeyOf(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const firstDow = first.getDay()
  const start = new Date(year, month, 1 - firstDow)
  const out = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    out.push({ key: dateKeyOf(d), date: d, inMonth: d.getMonth() === month })
  }
  return out
}

export default function FamilyCalendar({
  events,
  children,
  adminMode = false,
  onAdd,
  onEdit,
  onBack,
  onParent
}) {
  const today = todayKey()
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(today)

  const refDate = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  }, [monthOffset])

  const monthLabel = refDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cells = useMemo(
    () => buildMonthGrid(refDate.getFullYear(), refDate.getMonth())
      .map(c => ({ ...c, events: eventsForDate(events, c.key) })),
    [refDate, events]
  )

  const totalThisMonth = useMemo(
    () => cells.filter(c => c.inMonth).reduce((s, c) => s + c.events.length, 0),
    [cells]
  )

  const selectedEvents = useMemo(
    () => eventsForDate(events, selectedDay),
    [events, selectedDay]
  )
  const selectedDate = new Date(selectedDay + 'T00:00:00')

  const goToday = () => {
    setMonthOffset(0)
    setSelectedDay(today)
  }

  return (
    <div className="paper relative min-h-screen">
      {/* Top nav */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6">
        <button
          onClick={onBack}
          className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:bg-sand tap"
        >
          ← Back to home
        </button>
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.22em] text-muted hidden sm:block">
            Returns home in 1 minute of quiet
          </div>
          {!adminMode && (
            <button
              onClick={onParent}
              className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:bg-sand tap"
            >
              Parent mode
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 md:px-10 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-muted text-sm uppercase tracking-[0.22em]">Family calendar</div>
            <h1 className="font-display text-4xl md:text-5xl text-ink mt-1">{monthLabel}</h1>
            <div className="mt-1 text-muted">
              {totalThisMonth} {totalThisMonth === 1 ? 'event' : 'events'} this month
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMonthOffset(o => o - 1)}
              className="rounded-full border border-line bg-cream px-3 py-2 text-sm hover:bg-sand tap"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              onClick={goToday}
              className={`rounded-full px-4 py-2 text-sm tap border ${
                monthOffset === 0
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-cream text-ink border-line hover:bg-sand'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setMonthOffset(o => o + 1)}
              className="rounded-full border border-line bg-cream px-3 py-2 text-sm hover:bg-sand tap"
              aria-label="Next month"
            >
              →
            </button>
            {adminMode && (
              <button
                onClick={() => onAdd(selectedDay)}
                className="ml-2 rounded-full bg-ink text-cream px-4 py-2 text-sm hover:opacity-90 tap"
              >
                + New event
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Month grid */}
      <main className="relative z-10 px-6 md:px-10 py-6">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-1.5">
          {DOW_HEADERS.map((d, i) => (
            <div
              key={d}
              className={`text-[11px] uppercase tracking-[0.18em] text-center py-1 ${
                i === 0 || i === 6 ? 'text-muted' : 'text-muted'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {cells.map(({ key, date, inMonth, events: dayEvents }) => {
            const isToday = key === today
            const isSelected = key === selectedDay
            const isWeekend = date.getDay() === 0 || date.getDay() === 6

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={`group flex flex-col text-left rounded-2xl border transition overflow-hidden min-h-[78px] md:min-h-[112px] p-1.5 md:p-2 ${
                  !inMonth
                    ? 'bg-white/30 border-line opacity-50'
                    : isToday
                      ? 'bg-cream border-ink shadow-card'
                      : isSelected
                        ? 'bg-sand border-ink'
                        : isWeekend
                          ? 'bg-cream/50 border-line hover:bg-cream'
                          : 'bg-white/85 border-line hover:bg-cream'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-sm font-semibold ${
                      isToday
                        ? 'bg-ink text-cream rounded-full w-6 h-6'
                        : 'text-ink'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-muted">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event chips on md+ */}
                <div className="mt-1 space-y-0.5 hidden md:block">
                  {dayEvents.slice(0, 3).map(ev => {
                    const m = eventCategoryMeta[ev.category] || eventCategoryMeta.family
                    return (
                      <div
                        key={ev.id}
                        className={`text-[10px] rounded px-1 py-0.5 truncate flex items-center gap-1 border ${m.border} ${m.soft} ${m.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.accent} shrink-0`} />
                        <span className="truncate">
                          {!ev.allDay && ev.time ? `${formatTime(ev.time).replace(' ', '')} ` : ''}
                          {ev.title}
                        </span>
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted">+{dayEvents.length - 3} more</div>
                  )}
                </div>

                {/* Dots on mobile */}
                <div className="mt-1 md:hidden flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 5).map((ev, idx) => {
                    const m = eventCategoryMeta[ev.category] || eventCategoryMeta.family
                    return <span key={idx} className={`w-1.5 h-1.5 rounded-full ${m.accent}`} />
                  })}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
          {Object.entries(eventCategoryMeta).map(([key, m]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${m.accent}`} />
              <span>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Selected day detail */}
        <section className="mt-6 rounded-card border border-line bg-white/85 backdrop-blur-sm shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/70 bg-cream/60">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted">
                {DOW_LONG[selectedDate.getDay()]}
              </div>
              <h2 className="font-display text-2xl text-ink mt-0.5">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted">Planned</div>
              <div className="font-display text-2xl text-ink">{selectedEvents.length}</div>
            </div>
          </div>

          <div className="p-5">
            {selectedEvents.length === 0 ? (
              <div className="text-sm text-muted italic">
                Nothing scheduled. {adminMode ? 'Tap below to add an event.' : 'A free day.'}
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map(ev => {
                  const m = eventCategoryMeta[ev.category] || eventCategoryMeta.family
                  const forKids = ev.childIds?.length > 0
                    ? children.filter(c => ev.childIds.includes(c.id)).map(c => c.name).join(', ')
                    : null
                  const Tag = adminMode ? 'button' : 'div'
                  return (
                    <li key={ev.id}>
                      <Tag
                        {...(adminMode ? { onClick: () => onEdit(ev) } : {})}
                        className={`w-full text-left flex items-center gap-3 rounded-2xl border ${m.border} ${m.soft} px-3 py-2.5 ${adminMode ? 'hover:shadow-card transition cursor-pointer' : ''}`}
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
                            {forKids ? ` · ${forKids}` : ' · Whole family'}
                            {ev.repeat === 'weekly' ? ' · weekly' : ''}
                            {ev.notes ? ` · ${ev.notes}` : ''}
                          </div>
                        </div>
                        {adminMode && <span className="text-xs text-muted">Edit</span>}
                      </Tag>
                    </li>
                  )
                })}
              </ul>
            )}
            {adminMode && (
              <button
                onClick={() => onAdd(selectedDay)}
                className="mt-3 w-full rounded-xl border border-dashed border-line bg-white/70 text-muted hover:bg-sand hover:text-ink py-2 text-sm"
              >
                + Add an event on this day
              </button>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-6 md:px-10 pb-10 pt-2 text-center text-xs text-muted">
        Castelan Family Command Center.
      </footer>
    </div>
  )
}

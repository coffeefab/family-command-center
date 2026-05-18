import { useEffect, useState } from 'react'
import { eventCategoryMeta, addDaysKey } from '../utils/events.js'
import { todayKey } from '../utils/date.js'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const empty = {
  title: '',
  category: 'homeschool',
  repeat: 'weekly',
  daysOfWeek: [1, 2, 3, 4, 5],
  date: null,
  startDate: null,
  endDate: null,
  time: '09:00',
  allDay: false,
  notes: '',
  childIds: []
}

export default function EventEditor({ open, initial, children, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({ ...empty, ...initial, daysOfWeek: initial.daysOfWeek || [], childIds: initial.childIds || [] })
    } else {
      setForm({ ...empty })
    }
  }, [open, initial])

  if (!open) return null
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const toggleDay = (n) => set('daysOfWeek',
    form.daysOfWeek.includes(n) ? form.daysOfWeek.filter(d => d !== n) : [...form.daysOfWeek, n].sort()
  )
  const toggleChild = (id) => set('childIds',
    form.childIds.includes(id) ? form.childIds.filter(c => c !== id) : [...form.childIds, id]
  )

  const setRepeat = (r) => {
    setForm(prev => {
      const next = { ...prev, repeat: r }
      if (r === 'range') {
        const start = prev.startDate || todayKey()
        next.startDate = start
        next.endDate = prev.endDate || addDaysKey(start, 6)
        next.allDay = true
        if (!prev.category || prev.category === 'homeschool') next.category = 'family'
      }
      return next
    })
  }

  const weeklyWindowValid = !form.startDate || !form.endDate || form.endDate >= form.startDate

  const canSave = form.title.trim() && (
    form.repeat === 'weekly' ? ((form.daysOfWeek?.length > 0) && weeklyWindowValid) :
    form.repeat === 'range'  ? !!(form.startDate && form.endDate && form.endDate >= form.startDate) :
    !!form.date
  )

  const rangeDays = (form.repeat === 'range' && form.startDate && form.endDate && form.endDate >= form.startDate)
    ? Math.round(
        (new Date(form.endDate + 'T00:00:00') - new Date(form.startDate + 'T00:00:00')) / 86400000
      ) + 1
    : 0

  return (
    <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm flex items-end md:items-center justify-center p-3">
      <div className="w-full max-w-lg rounded-card bg-cream border border-line shadow-card p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-2xl text-ink">
            {initial?.id ? 'Edit event' : 'New event'}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink">Close</button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Title</div>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2"
              placeholder="Math time"
            />
          </label>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Category</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(eventCategoryMeta).map(([key, m]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('category', key)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    form.category === key
                      ? `${m.accent} text-white border-transparent`
                      : `bg-white text-ink ${m.border} hover:${m.soft}`
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Repeats</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'weekly', label: 'Every week' },
                { k: 'none',   label: 'One day' },
                { k: 'range',  label: 'Date range' }
              ].map(({ k, label }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRepeat(k)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    form.repeat === k
                      ? 'bg-ink text-cream border-ink'
                      : 'bg-white text-ink border-line hover:bg-sand'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-1.5">
              {form.repeat === 'weekly' && 'Repeats on the days you pick below.'}
              {form.repeat === 'none' && 'Appears once on a specific date.'}
              {form.repeat === 'range' && 'Spans every day from start to end. Great for vacations and trips.'}
            </p>
          </div>

          {form.repeat === 'weekly' && (
            <>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted mb-1">Days of the week</div>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_LABELS.map((lbl, idx) => {
                    const active = form.daysOfWeek.includes(idx)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`text-xs px-3 py-1.5 rounded-full border ${
                          active
                            ? 'bg-ink text-cream border-ink'
                            : 'bg-white text-ink border-line hover:bg-sand'
                        }`}
                      >
                        {lbl}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs uppercase tracking-wider text-muted">Optional window</div>
                  {(form.startDate || form.endDate) && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, startDate: null, endDate: null }))}
                      className="text-xs text-muted hover:text-ink"
                    >
                      Clear window
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-[11px] text-muted mb-1">From</div>
                    <input
                      type="date"
                      value={form.startDate || ''}
                      onChange={e => set('startDate', e.target.value || null)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    <div className="text-[11px] text-muted mb-1">Until</div>
                    <input
                      type="date"
                      value={form.endDate || ''}
                      min={form.startDate || ''}
                      onChange={e => set('endDate', e.target.value || null)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2"
                    />
                  </label>
                </div>
                <p className="text-xs text-muted mt-1.5">
                  Leave blank to repeat forever. Use this for a summer schedule, a class block, or any limited stretch.
                </p>
                {!weeklyWindowValid && (
                  <div className="text-xs text-coral-700 mt-1">Until date must be on or after From date.</div>
                )}
              </div>
            </>
          )}

          {form.repeat === 'none' && (
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Date</div>
              <input
                type="date"
                value={form.date || ''}
                onChange={e => set('date', e.target.value || null)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2"
              />
            </label>
          )}

          {form.repeat === 'range' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">Start</div>
                  <input
                    type="date"
                    value={form.startDate || ''}
                    onChange={e => set('startDate', e.target.value || null)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2"
                  />
                </label>
                <label className="block">
                  <div className="text-xs uppercase tracking-wider text-muted mb-1">End</div>
                  <input
                    type="date"
                    value={form.endDate || ''}
                    min={form.startDate || ''}
                    onChange={e => set('endDate', e.target.value || null)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2"
                  />
                </label>
              </div>
              {rangeDays > 0 && (
                <div className="text-xs text-muted">
                  Spans {rangeDays} {rangeDays === 1 ? 'day' : 'days'}.
                </div>
              )}
              {form.startDate && form.endDate && form.endDate < form.startDate && (
                <div className="text-xs text-coral-700">End date must be on or after the start date.</div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Time</div>
              <input
                type="time"
                value={form.time || ''}
                onChange={e => set('time', e.target.value)}
                disabled={form.allDay}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 disabled:opacity-40"
              />
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={e => set('allDay', e.target.checked)}
              />
              <span className="text-sm text-ink">All day</span>
            </label>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1">For</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => set('childIds', [])}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  form.childIds.length === 0
                    ? 'bg-ink text-cream border-ink'
                    : 'bg-white text-ink border-line hover:bg-sand'
                }`}
              >
                Whole family
              </button>
              {children.map(c => {
                const active = form.childIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChild(c.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      active
                        ? 'bg-ink text-cream border-ink'
                        : 'bg-white text-ink border-line hover:bg-sand'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Notes</div>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-line bg-white px-3 py-2"
              placeholder="Optional details. Example: bring water bottle."
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {initial?.id ? (
            <button
              onClick={() => onDelete(initial.id)}
              className="px-4 py-2 rounded-xl border border-coral-200 bg-coral-50 text-coral-700 hover:bg-coral-200"
            >
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-line bg-cream text-ink hover:bg-sand">
              Cancel
            </button>
            <button
              onClick={() => canSave && onSave(form)}
              disabled={!canSave}
              className="px-4 py-2 rounded-xl bg-ink text-cream disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

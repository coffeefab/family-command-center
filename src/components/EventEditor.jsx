import { useEffect, useState } from 'react'
import { eventCategoryMeta } from '../utils/events.js'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const empty = {
  title: '',
  category: 'homeschool',
  repeat: 'weekly',
  daysOfWeek: [1, 2, 3, 4, 5],
  date: null,
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

  const canSave = form.title.trim() && (
    form.repeat === 'none' ? !!form.date : (form.daysOfWeek?.length > 0)
  )

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
            <div className="grid grid-cols-2 gap-2">
              {['weekly', 'none'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('repeat', r)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    form.repeat === r
                      ? 'bg-ink text-cream border-ink'
                      : 'bg-white text-ink border-line hover:bg-sand'
                  }`}
                >
                  {r === 'weekly' ? 'Every week' : 'One day only'}
                </button>
              ))}
            </div>
          </div>

          {form.repeat === 'weekly' ? (
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
          ) : (
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

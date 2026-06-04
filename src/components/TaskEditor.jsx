import { useEffect, useState } from 'react'

const empty = {
  title: '',
  category: 'chore',
  childId: '',
  stars: 1,
  notes: '',
  dueToday: true
}

const ADD_NEW = '__add_new__'
export const ALL_CHILDREN = '__everyone__'

export default function TaskEditor({ open, initial, children, categories, onAddCategory, onClose, onSave }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (!open) return
    setForm(initial ? { ...empty, ...initial } : { ...empty, childId: children[0]?.id || '' })
  }, [open, initial, children])

  if (!open) return null

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const cats = Array.isArray(categories) && categories.length > 0
    ? categories
    : [{ id: 'chore', label: 'Chore' }]

  const handleCategoryChange = (value) => {
    if (value !== ADD_NEW) {
      set('category', value)
      return
    }
    const name = window.prompt('Name this category (for example: Practice)')
    if (name === null) return
    const trimmed = name.trim()
    if (!trimmed) return
    if (typeof onAddCategory !== 'function') return
    const newId = onAddCategory({ label: trimmed })
    if (newId) set('category', newId)
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm flex items-end md:items-center justify-center p-3">
      <div className="w-full max-w-lg rounded-card bg-cream border border-line shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-2xl text-ink">
            {initial?.id ? 'Edit task' : 'New task'}
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
              placeholder="Make bed"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Category</div>
              <select
                value={cats.some(c => c.id === form.category) ? form.category : ''}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2"
              >
                {!cats.some(c => c.id === form.category) && (
                  <option value="" disabled>Pick a category</option>
                )}
                {cats.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
                <option value={ADD_NEW}>+ Add new category…</option>
              </select>
            </label>

            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Assigned to</div>
              <select
                value={form.childId}
                onChange={e => set('childId', e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2"
              >
                <option value={ALL_CHILDREN}>Everyone</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Stars</div>
              <input
                type="number"
                min="1"
                value={form.stars}
                onChange={e => set('stars', parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.dueToday}
                onChange={e => set('dueToday', e.target.checked)}
              />
              <span className="text-sm text-ink">Due today</span>
            </label>
          </div>

          <label className="block">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Notes</div>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-line bg-white px-3 py-2"
              placeholder="Optional. Example: read for fifteen minutes."
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-line bg-cream text-ink hover:bg-sand">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.title.trim() || !form.childId) return
              onSave(form)
            }}
            className="px-4 py-2 rounded-xl bg-ink text-cream"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

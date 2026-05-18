import { useState } from 'react'

export default function Reminders({ reminders, adminMode, onAdd, onDelete }) {
  const [text, setText] = useState('')

  return (
    <section className="rounded-card bg-butter-50 border border-butter-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-butter-700">Family reminders</h2>
        <span className="text-xs text-muted">{reminders.length} pinned</span>
      </div>

      {reminders.length === 0 ? (
        <div className="text-sm text-muted italic">No reminders pinned. Add one in parent mode.</div>
      ) : (
        <ul className="space-y-2">
          {reminders.map(r => (
            <li key={r.id} className="flex items-start gap-3 bg-white rounded-xl border border-butter-200 px-3 py-2">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-butter-500 shrink-0" />
              <span className="flex-1 text-ink">{r.text}</span>
              {adminMode && (
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-xs text-muted hover:text-coral-700"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {adminMode && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const v = text.trim()
            if (!v) return
            onAdd(v)
            setText('')
          }}
        >
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a reminder. Example: bring sunscreen."
            className="flex-1 rounded-xl border border-butter-200 bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-xl bg-ink text-cream px-4 py-2 text-sm">Pin</button>
        </form>
      )}
    </section>
  )
}

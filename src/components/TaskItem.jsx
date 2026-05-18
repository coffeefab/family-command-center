import { useState } from 'react'
import { categoryMeta, palette } from '../utils/palette.js'

export default function TaskItem({ task, childColor, dateKey, onToggle, onEdit, onDelete, adminMode }) {
  const done = !!task.completedBy?.[dateKey]
  const meta = categoryMeta[task.category] || categoryMeta.chore
  const p = palette[childColor] || palette.coral
  const [poof, setPoof] = useState(false)

  const handleToggle = () => {
    if (!done) {
      setPoof(true)
      setTimeout(() => setPoof(false), 700)
    }
    onToggle()
  }

  return (
    <div className={`relative flex items-center gap-3 rounded-2xl border ${done ? 'bg-cream/60 border-line' : 'bg-white border-line'} px-3 py-2.5 tap`}>
      <button
        onClick={handleToggle}
        aria-pressed={done}
        className={`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition ${
          done ? `${p.btn} border-transparent ${poof ? 'pop' : ''}` : 'border-line bg-cream hover:bg-sand'
        }`}
      >
        {done ? (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 12 10 17 19 7" />
          </svg>
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`font-semibold truncate ${done ? 'line-through text-muted' : 'text-ink'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs">
          <span className={`px-2 py-0.5 rounded-full border ${p.chip}`}>{meta.label}</span>
          <span className="text-muted">{task.stars} {task.stars === 1 ? 'star' : 'stars'}</span>
          {task.notes ? <span className="text-muted italic truncate">· {task.notes}</span> : null}
        </div>
      </div>

      {adminMode && (
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="text-xs text-muted hover:text-ink px-2 py-1 rounded-lg hover:bg-sand">Edit</button>
          <button onClick={onDelete} className="text-xs text-muted hover:text-coral-700 px-2 py-1 rounded-lg hover:bg-coral-50">Delete</button>
        </div>
      )}

      {poof && (
        <>
          <span className="confetti-dot absolute -top-1 left-6 w-1.5 h-1.5 rounded-full bg-butter-500" />
          <span className="confetti-dot absolute -top-2 left-9 w-1.5 h-1.5 rounded-full bg-coral-500" style={{animationDelay: '60ms'}} />
          <span className="confetti-dot absolute -top-1 left-12 w-1.5 h-1.5 rounded-full bg-sage-500" style={{animationDelay: '120ms'}} />
        </>
      )}
    </div>
  )
}

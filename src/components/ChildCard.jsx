import { useMemo, useState } from 'react'
import TaskItem from './TaskItem.jsx'
import { palette } from '../utils/palette.js'

const SECTIONS = [
  { key: 'chore',      title: 'Chores' },
  { key: 'homeschool', title: 'Homeschool' },
  { key: 'routine',    title: 'Daily routine' }
]

export default function ChildCard({
  child,
  tasks,
  dateKey,
  starsToday,
  starsThisPeriod,
  reset, // 'daily' | 'weekly'
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
  adminMode,
  rewards
}) {
  const p = palette[child.color] || palette.coral
  const [filter, setFilter] = useState('all')

  const myTasks = useMemo(
    () => tasks.filter(t => t.childId === child.id && t.dueToday),
    [tasks, child.id]
  )

  const totalToday = myTasks.length
  const doneToday = myTasks.filter(t => t.completedBy?.[dateKey]).length

  const nextReward = useMemo(() => {
    const sorted = [...rewards].sort((a, b) => a.cost - b.cost)
    return sorted.find(r => r.cost > starsThisPeriod) || sorted[sorted.length - 1]
  }, [rewards, starsThisPeriod])

  const progressPct = nextReward
    ? Math.min(100, Math.round((starsThisPeriod / nextReward.cost) * 100))
    : 0

  const filteredSections = SECTIONS.filter(s => filter === 'all' || filter === s.key)

  return (
    <section className={`rounded-card border ${p.border} ${p.soft} shadow-card overflow-hidden`}>
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line/70 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
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
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${p.dot} font-display text-xl text-white`}>
              {child.name[0]}
            </span>
          )}
          <h2 className={`font-display text-2xl ${p.text}`}>{child.name}</h2>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted">
            {reset === 'daily' ? 'Stars today' : 'Stars this week'}
          </div>
          <div className={`font-display text-2xl ${p.text}`}>{starsThisPeriod}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between text-xs text-muted mb-1.5">
          <span>
            {doneToday} of {totalToday} done today
          </span>
          <span>
            {nextReward
              ? `Next: ${nextReward.label} at ${nextReward.cost}`
              : 'Add a reward goal'}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white border border-line overflow-hidden">
          <div
            className={`h-full ${p.dot} transition-all`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pt-4 flex flex-wrap gap-1.5">
        {['all', 'chore', 'homeschool', 'routine'].map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${
              filter === key
                ? `${p.dot} text-white border-transparent`
                : 'bg-white text-muted border-line hover:bg-sand'
            }`}
          >
            {key === 'all' ? 'All' : key === 'chore' ? 'Chores' : key === 'homeschool' ? 'Homeschool' : 'Routine'}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="px-5 pb-5 pt-3 space-y-4">
        {filteredSections.map(section => {
          const items = myTasks.filter(t => t.category === section.key)
          if (items.length === 0 && !adminMode) return null
          return (
            <div key={section.key}>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                  {section.title}
                </h3>
                {adminMode && (
                  <button
                    onClick={() => onAddTask(section.key)}
                    className="text-xs px-2 py-1 rounded-lg bg-white border border-line hover:bg-sand"
                  >
                    Add
                  </button>
                )}
              </div>
              {items.length === 0 ? (
                <div className="text-xs text-muted italic px-1 py-2">
                  Nothing assigned yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {items.map(t => (
                    <TaskItem
                      key={t.id}
                      task={t}
                      childColor={child.color}
                      dateKey={dateKey}
                      adminMode={adminMode}
                      onToggle={() => onToggleTask(t.id)}
                      onEdit={() => onEditTask(t)}
                      onDelete={() => onDeleteTask(t.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

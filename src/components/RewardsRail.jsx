import { useState } from 'react'

export default function RewardsRail({ rewards, adminMode, onAdd, onDelete, onUpdate }) {
  const [draftLabel, setDraftLabel] = useState('')
  const [draftCost, setDraftCost] = useState('')

  return (
    <section className="rounded-card bg-white border border-line shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-2xl text-ink">Rewards</h2>
        <span className="text-xs text-muted">{rewards.length} goals set</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {rewards.map(r => (
          <div
            key={r.id}
            className="rounded-2xl border border-line bg-cream px-3 py-2.5 flex items-center justify-between"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{r.label}</div>
              <div className="text-xs text-muted">{r.cost} stars</div>
            </div>
            {adminMode && (
              <button
                onClick={() => onDelete(r.id)}
                className="text-xs text-muted hover:text-coral-700 px-2 py-1 rounded-lg hover:bg-coral-50"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>

      {adminMode && (
        <form
          className="mt-3 flex gap-2 flex-wrap"
          onSubmit={(e) => {
            e.preventDefault()
            const label = draftLabel.trim()
            const cost = parseInt(draftCost, 10)
            if (!label || !cost || cost <= 0) return
            onAdd({ label, cost })
            setDraftLabel('')
            setDraftCost('')
          }}
        >
          <input
            value={draftLabel}
            onChange={e => setDraftLabel(e.target.value)}
            placeholder="Reward name"
            className="flex-1 min-w-[160px] rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
          <input
            value={draftCost}
            onChange={e => setDraftCost(e.target.value)}
            type="number"
            min="1"
            placeholder="Stars"
            className="w-24 rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          />
          <button className="rounded-xl bg-ink text-cream px-4 py-2 text-sm">Add reward</button>
        </form>
      )}
    </section>
  )
}

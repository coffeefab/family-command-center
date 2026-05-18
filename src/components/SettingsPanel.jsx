import { useState } from 'react'
import { palette, KID_COLORS } from '../utils/palette.js'

function ChildrenSection({ children, onAdd, onUpdate, onRemove }) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(() => {
    const used = new Set((children || []).map(c => c.color))
    return KID_COLORS.find(c => !used.has(c)) || KID_COLORS[0]
  })

  const submitAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAdd({ name, color: newColor })
    setNewName('')
    const used = new Set([...(children || []).map(c => c.color), newColor])
    setNewColor(KID_COLORS.find(c => !used.has(c)) || KID_COLORS[0])
  }

  return (
    <div className="space-y-2">
      {children.map(c => {
        const p = palette[c.color] || palette.coral
        return (
          <div key={c.id} className="rounded-xl border border-line bg-white p-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${p.dot} text-white font-display text-base shrink-0`}>
                {c.name?.[0] || '?'}
              </span>
              <input
                value={c.name}
                onChange={e => onUpdate(c.id, { name: e.target.value })}
                className="flex-1 rounded-lg border border-line bg-cream px-2 py-1.5 text-sm"
                placeholder="Name"
              />
              <button
                onClick={() => onRemove(c.id)}
                className="text-xs text-muted hover:text-coral-700 px-2 py-1 rounded-lg hover:bg-coral-50"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pl-10">
              {KID_COLORS.map(color => {
                const pc = palette[color]
                const active = c.color === color
                return (
                  <button
                    key={color}
                    onClick={() => onUpdate(c.id, { color })}
                    aria-label={color}
                    className={`w-7 h-7 rounded-full ${pc.dot} border-2 transition ${active ? 'border-ink scale-110' : 'border-transparent'}`}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Add new */}
      <div className="rounded-xl border border-dashed border-line bg-cream/40 p-3">
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitAdd()}
            placeholder="Add a child"
            className="flex-1 rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
          />
          <button
            onClick={submitAdd}
            disabled={!newName.trim()}
            className="rounded-lg bg-ink text-cream px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {KID_COLORS.map(color => {
            const pc = palette[color]
            const active = newColor === color
            return (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                aria-label={color}
                className={`w-6 h-6 rounded-full ${pc.dot} border-2 transition ${active ? 'border-ink scale-110' : 'border-transparent'}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPanel({
  open,
  settings,
  children,
  familyCode,
  syncStatus,
  onClose,
  onChange,
  onResetDay,
  onResetAll,
  onClearEvents,
  onManageSync,
  onDisconnectSync,
  onAddChild,
  onUpdateChild,
  onRemoveChild
}) {
  if (!open) return null

  const statusLabel = syncStatus === 'synced'
    ? 'Synced'
    : syncStatus === 'connecting'
      ? 'Connecting'
      : syncStatus === 'error'
        ? 'Offline'
        : 'Idle'
  const statusColor = syncStatus === 'synced'
    ? 'bg-sage-500'
    : syncStatus === 'connecting'
      ? 'bg-butter-500'
      : syncStatus === 'error'
        ? 'bg-coral-500'
        : 'bg-line'

  const copyCode = async () => {
    if (!familyCode) return
    try { await navigator.clipboard.writeText(familyCode) } catch {}
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm flex items-end md:items-center justify-center p-3">
      <div className="w-full max-w-lg rounded-card bg-cream border border-line shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-2xl text-ink">Settings</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">Close</button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1.5">Children</div>
            <ChildrenSection
              children={children || []}
              onAdd={onAddChild}
              onUpdate={onUpdateChild}
              onRemove={onRemoveChild}
            />
            <p className="text-xs text-muted mt-2">
              Rename, recolor, add, or remove. Removing a child also removes their tasks, stars, and reward history.
            </p>
          </div>

          <div className="pt-2 border-t border-line">
            <div className="text-xs uppercase tracking-wider text-muted mb-1.5">Star tracking</div>
            <div className="grid grid-cols-2 gap-2">
              {['daily', 'weekly'].map(mode => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...settings, starResetMode: mode })}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    settings.starResetMode === mode
                      ? 'bg-ink text-cream border-ink'
                      : 'bg-white text-ink border-line hover:bg-sand'
                  }`}
                >
                  {mode === 'daily' ? 'Reset daily' : 'Roll up weekly'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              {settings.starResetMode === 'daily'
                ? 'Stars reset every morning. Great for daily wins.'
                : 'Stars accumulate Monday through Sunday for bigger rewards.'}
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted mb-1.5">Parent PIN</div>
            <input
              value={settings.adminPin}
              onChange={e => onChange({ ...settings, adminPin: e.target.value })}
              className="w-full rounded-xl border border-line bg-white px-3 py-2"
              placeholder="1234"
            />
            <p className="text-xs text-muted mt-1">
              Used for parent mode. This is a friendly gate, not real security.
            </p>
          </div>

          <div className="pt-2 border-t border-line">
            <div className="text-xs uppercase tracking-wider text-muted mb-1.5">Sync across devices</div>
            {familyCode ? (
              <div className="rounded-xl border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted">Family code</div>
                    <div className="font-display text-lg text-ink truncate select-all">{familyCode}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                    <span className="text-xs text-muted">{statusLabel}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={copyCode}
                    className="rounded-xl bg-cream border border-line px-3 py-1.5 text-sm hover:bg-sand"
                  >
                    Copy code
                  </button>
                  <button
                    onClick={onManageSync}
                    className="rounded-xl bg-cream border border-line px-3 py-1.5 text-sm hover:bg-sand"
                  >
                    Join a different family
                  </button>
                  <button
                    onClick={onDisconnectSync}
                    className="rounded-xl bg-coral-50 border border-coral-200 text-coral-700 px-3 py-1.5 text-sm hover:bg-coral-200"
                  >
                    Stop syncing
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">
                  Share this code with Mari and Abe so every device shows the same chores, schedule, and stars. The wall tablet also uses this code.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-white p-3">
                <div className="text-sm text-ink">This device is not synced.</div>
                <p className="text-xs text-muted mt-1">Connect to share progress across devices.</p>
                <button
                  onClick={onManageSync}
                  className="mt-3 rounded-xl bg-ink text-cream px-3 py-1.5 text-sm"
                >
                  Set up sync
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-line">
            <div className="text-xs uppercase tracking-wider text-muted mb-1.5">Maintenance</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onResetDay}
                className="rounded-xl bg-white border border-line px-3 py-2 text-sm hover:bg-sand"
              >
                Clear today's checkmarks
              </button>
              <button
                onClick={onClearEvents}
                className="rounded-xl bg-white border border-line px-3 py-2 text-sm hover:bg-sand"
              >
                Clear all calendar events
              </button>
              <button
                onClick={onResetAll}
                className="rounded-xl bg-coral-50 border border-coral-200 text-coral-700 px-3 py-2 text-sm hover:bg-coral-200"
              >
                Reset everything to defaults
              </button>
            </div>
            <p className="text-xs text-muted mt-2">
              Reset everything restores starter chores for Dana, Matteo, and Camila.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

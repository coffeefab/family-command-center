import { useState } from 'react'

export default function PinModal({ open, expectedPin, onCancel, onSuccess }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  if (!open) return null

  const submit = () => {
    if (pin === expectedPin) {
      setPin('')
      onSuccess()
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-3">
      <div className={`w-full max-w-sm rounded-card bg-cream border border-line shadow-card p-6 ${shake ? 'animate-pulse' : ''}`}>
        <h3 className="font-display text-2xl text-ink mb-1">Parent mode</h3>
        <p className="text-sm text-muted mb-4">Enter the family PIN for Mari or Abe.</p>

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
          className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border border-line bg-white px-3 py-3"
          placeholder="••••"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-line bg-cream hover:bg-sand">
            Cancel
          </button>
          <button onClick={submit} className="px-4 py-2 rounded-xl bg-ink text-cream">
            Unlock
          </button>
        </div>
      </div>
    </div>
  )
}

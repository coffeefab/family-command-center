import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const ADJ  = ['warm', 'sunny', 'cozy', 'bright', 'quiet', 'happy', 'merry', 'gentle', 'silver', 'amber']
const NOUN = ['cottage', 'kitchen', 'garden', 'meadow', 'hearth', 'orchard', 'window', 'porch', 'lantern', 'cricket']

function generateCode() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)]
  const n = NOUN[Math.floor(Math.random() * NOUN.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${a}-${n}-${num}`
}

export default function SyncSetup({ open, onComplete, onSkip }) {
  const [mode, setMode] = useState(null)
  const [newCode] = useState(generateCode)
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(newCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const startNew = async () => {
    setBusy(true); setError(null)
    onComplete({ code: newCode, replaceState: null })
  }

  const join = async () => {
    const code = joinCode.trim().toLowerCase()
    if (!code) return
    setBusy(true); setError(null)
    try {
      const { data, error: e } = await supabase
        .from('family_state')
        .select('state')
        .eq('family_code', code)
        .maybeSingle()
      if (e) throw e
      if (!data) {
        setError("No family found with that code. Double check the spelling or start a new family.")
        setBusy(false)
        return
      }
      onComplete({ code, replaceState: data.state })
    } catch {
      setError("Could not connect. Check your internet and try again.")
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-md rounded-card bg-cream border border-line shadow-card p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-muted">Sync setup</div>
        <h2 className="font-display text-3xl text-ink mt-1">Sync across devices</h2>
        <p className="text-sm text-muted mt-2">
          Use a family code so Mari and Abe see the same chores, schedule, and stars on every device. The wall tablet uses the same code.
        </p>

        {mode === null && (
          <div className="mt-5 grid gap-2">
            <button
              onClick={() => setMode('new')}
              className="rounded-2xl border border-line bg-white px-4 py-3 text-left hover:bg-sand transition"
            >
              <div className="font-semibold text-ink">Start a new family</div>
              <div className="text-xs text-muted mt-0.5">Generates a unique code you save once and use on every device.</div>
            </button>
            <button
              onClick={() => setMode('join')}
              className="rounded-2xl border border-line bg-white px-4 py-3 text-left hover:bg-sand transition"
            >
              <div className="font-semibold text-ink">Join an existing family</div>
              <div className="text-xs text-muted mt-0.5">Type the code already shared with the family.</div>
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-xs text-muted hover:text-ink mt-2 self-center"
              >
                Skip for now and use this device only
              </button>
            )}
          </div>
        )}

        {mode === 'new' && (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-line bg-white p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-muted">Your family code</div>
              <div className="font-display text-2xl text-ink mt-1 select-all">{newCode}</div>
              <button
                onClick={copy}
                className="mt-3 text-sm rounded-full border border-line bg-cream px-3 py-1.5 hover:bg-sand"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-muted">
              Save this somewhere safe. You will enter it on Abe's phone, the wall tablet, or any other device that should share this family's data.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMode(null)}
                className="px-4 py-2 rounded-xl border border-line bg-cream hover:bg-sand"
              >
                Back
              </button>
              <button
                onClick={startNew}
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-ink text-cream disabled:opacity-40"
              >
                {busy ? 'Starting...' : 'Use this code'}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="mt-5 space-y-3">
            <label className="block">
              <div className="text-xs uppercase tracking-wider text-muted mb-1">Family code</div>
              <input
                autoFocus
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value); setError(null) }}
                onKeyDown={e => e.key === 'Enter' && join()}
                placeholder="warm-kitchen-1234"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-lg"
              />
            </label>
            {error && <div className="text-sm text-coral-700">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setMode(null); setError(null) }}
                className="px-4 py-2 rounded-xl border border-line bg-cream hover:bg-sand"
              >
                Back
              </button>
              <button
                onClick={join}
                disabled={busy || !joinCode.trim()}
                className="px-4 py-2 rounded-xl bg-ink text-cream disabled:opacity-40"
              >
                {busy ? 'Joining...' : 'Join family'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

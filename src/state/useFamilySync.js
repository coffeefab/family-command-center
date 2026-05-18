import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

// Syncs the entire local state to a single Supabase row keyed by familyCode.
// - On familyCode change: fetch remote, replace local if remote exists,
//   otherwise push current local as the seed for that family.
// - Subscribes to realtime updates and applies them when they differ.
// - Pushes local changes to Supabase debounced to avoid chatter.
export function useFamilySync({ familyCode, state, setState, onStatus }) {
  const lastSyncedRef  = useRef(null)
  const debounceRef    = useRef(null)
  const initialDoneRef = useRef(false)
  const stateRef       = useRef(state)

  useEffect(() => { stateRef.current = state }, [state])

  // ---- Initial load + subscribe ----
  useEffect(() => {
    if (!familyCode) return

    let cancelled = false
    let channel = null
    initialDoneRef.current = false
    onStatus?.('connecting')

    const run = async () => {
      try {
        const { data, error } = await supabase
          .from('family_state')
          .select('state')
          .eq('family_code', familyCode)
          .maybeSingle()

        if (cancelled) return
        if (error) { onStatus?.('error'); return }

        if (data?.state) {
          lastSyncedRef.current = JSON.stringify(data.state)
          setState(data.state)
        } else {
          const seed = stateRef.current
          const { error: ue } = await supabase
            .from('family_state')
            .upsert({ family_code: familyCode, state: seed, updated_at: new Date().toISOString() })
          if (ue) { onStatus?.('error'); return }
          lastSyncedRef.current = JSON.stringify(seed)
        }

        initialDoneRef.current = true
        onStatus?.('synced')

        channel = supabase
          .channel(`fcc-${familyCode}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'family_state', filter: `family_code=eq.${familyCode}` },
            payload => {
              const next = payload?.new?.state
              if (!next) return
              const nextStr = JSON.stringify(next)
              if (nextStr === lastSyncedRef.current) return
              lastSyncedRef.current = nextStr
              setState(next)
            }
          )
          .subscribe()
      } catch {
        if (!cancelled) onStatus?.('error')
      }
    }

    run()

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (channel) supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyCode])

  // ---- Push local edits ----
  useEffect(() => {
    if (!familyCode || !initialDoneRef.current) return
    const stateStr = JSON.stringify(state)
    if (stateStr === lastSyncedRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        lastSyncedRef.current = stateStr
        const { error } = await supabase
          .from('family_state')
          .upsert({ family_code: familyCode, state, updated_at: new Date().toISOString() })
        onStatus?.(error ? 'error' : 'synced')
      } catch {
        onStatus?.('error')
      }
    }, 600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, familyCode])
}

import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'familyCommandCenter_v1'

// ---------- Defaults ----------
const defaultChildren = [
  { id: 'dana',    name: 'Dana',    color: 'coral', photo: null },
  { id: 'matteo',  name: 'Matteo',  color: 'sage',  photo: null },
  { id: 'camila',  name: 'Camila',  color: 'plum',  photo: null }
]

// Drop in photo files at public/<id>.png to enable avatars.
const PHOTO_MAP = {}

const everyday = [
  { title: 'Make bed',              category: 'chore',     stars: 1 },
  { title: 'Brush teeth',           category: 'routine',   stars: 1 },
  { title: 'Get dressed',           category: 'routine',   stars: 1 },
  { title: 'Clean room',            category: 'chore',     stars: 2 },
  { title: 'Pick up toys',          category: 'chore',     stars: 1 },
  { title: 'Put dirty clothes away',category: 'chore',     stars: 1 },
  { title: 'Help with dishes',      category: 'chore',     stars: 2 },
  { title: 'Reading time',          category: 'homeschool',stars: 2 },
  { title: 'Math practice',         category: 'homeschool',stars: 2 },
  { title: 'Writing practice',      category: 'homeschool',stars: 2 }
]

function seedTasks() {
  const tasks = []
  let id = 1
  for (const c of defaultChildren) {
    for (const t of everyday) {
      tasks.push({
        id: `t${id++}`,
        title: t.title,
        category: t.category,
        childId: c.id,
        stars: t.stars,
        notes: '',
        dueToday: true,
        completedBy: {} // map of dateKey -> true
      })
    }
  }
  return tasks
}

const defaultRewards = [
  { id: 'r1', label: 'Screen time',  cost: 10 },
  { id: 'r2', label: 'Small prize',  cost: 20 },
  { id: 'r3', label: 'Outing or treat', cost: 30 }
]

const defaultState = {
  children: defaultChildren,
  tasks: seedTasks(),
  reminders: [
    { id: 'rem1', text: 'Water bottles by the door before park time.' }
  ],
  rewards: defaultRewards,
  settings: {
    starResetMode: 'weekly', // 'daily' or 'weekly'
    adminPin: '1234'
  },
  // Stars earned by date and child
  starLog: {}, // { 'YYYY-MM-DD': { childId: number } }
  // Rewards handed out per week per child
  redemptions: {} // { 'YYYY-Www': { childId: [rewardId, ...] } }
}

// ---------- Hook ----------
export function useStore() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultState
      const parsed = JSON.parse(raw)
      // shallow merge to forward-fill new fields
      const merged = { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...(parsed.settings || {}) } }
      // Always source photo paths from the current PHOTO_MAP so stale
      // references in stored state never point at missing files.
      merged.children = (merged.children || defaultChildren).map(c => ({
        ...c,
        photo: PHOTO_MAP[c.id] || null
      }))
      // Migration: ensure redemptions map exists.
      merged.redemptions = merged.redemptions || {}
      return merged
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const update = useCallback((mut) => {
    setState(prev => {
      const next = structuredClone(prev)
      mut(next)
      return next
    })
  }, [])

  const reset = useCallback(() => setState(defaultState), [])

  return { state, setState, update, reset }
}

export { defaultState }

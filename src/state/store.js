import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'familyCommandCenter_v1'

// ---------- Defaults ----------
const defaultChildren = [
  { id: 'dana',    name: 'Dana',    color: 'coral', photo: null },
  { id: 'matteo',  name: 'Matteo',  color: 'sage',  photo: null },
  { id: 'camila',  name: 'Camila',  color: 'plum',  photo: null }
]

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

const WEEKDAYS = [1, 2, 3, 4, 5]
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

const defaultTaskCategories = [
  { id: 'chore',      label: 'Chore',      sectionTitle: 'Chores',        builtIn: true },
  { id: 'homeschool', label: 'Homeschool', sectionTitle: 'Homeschool',    builtIn: true },
  { id: 'routine',    label: 'Routine',    sectionTitle: 'Daily routine', builtIn: true },
  { id: 'reminder',   label: 'Reminder',   sectionTitle: 'Reminders',     builtIn: true }
]

const defaultEvents = [
  { id: 'ev1', title: 'Morning circle',       category: 'homeschool', repeat: 'weekly', daysOfWeek: WEEKDAYS, date: null, time: '09:00', allDay: false, notes: 'Hello, calendar, weather, song.', childIds: [] },
  { id: 'ev2', title: 'Math time',            category: 'homeschool', repeat: 'weekly', daysOfWeek: WEEKDAYS, date: null, time: '09:30', allDay: false, notes: '', childIds: [] },
  { id: 'ev3', title: 'Reading hour',         category: 'homeschool', repeat: 'weekly', daysOfWeek: WEEKDAYS, date: null, time: '10:30', allDay: false, notes: '', childIds: [] },
  { id: 'ev4', title: 'Outside play',         category: 'fun',        repeat: 'weekly', daysOfWeek: WEEKDAYS, date: null, time: '11:30', allDay: false, notes: '', childIds: [] },
  { id: 'ev5', title: 'Lunch',                category: 'family',     repeat: 'weekly', daysOfWeek: ALL_DAYS, date: null, time: '12:00', allDay: false, notes: '', childIds: [] },
  { id: 'ev6', title: 'Quiet time',           category: 'family',     repeat: 'weekly', daysOfWeek: WEEKDAYS, date: null, time: '13:00', allDay: false, notes: 'Books, drawing, naps.', childIds: [] },
  { id: 'ev7', title: 'Art or science',       category: 'homeschool', repeat: 'weekly', daysOfWeek: [1, 3, 5], date: null, time: '14:00', allDay: false, notes: 'Alternates each day.', childIds: [] },
  { id: 'ev8', title: 'Bible or devotional',  category: 'homeschool', repeat: 'weekly', daysOfWeek: [2, 4], date: null, time: '14:00', allDay: false, notes: '', childIds: [] }
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
  redemptions: {}, // { 'YYYY-Www': { childId: [rewardId, ...] } }
  // Calendar events. Single dated or weekly recurring.
  events: defaultEvents,
  // Editable task categories used to label and group daily tasks.
  taskCategories: defaultTaskCategories
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
      merged.children = merged.children || defaultChildren
      // Migration: ensure redemptions map exists.
      merged.redemptions = merged.redemptions || {}
      // Migration: ensure events array exists. Seed with defaults the first
      // time a previously saved state opens after upgrade.
      if (!Array.isArray(merged.events)) merged.events = defaultEvents
      // Migration: ensure taskCategories exists. Seeds defaults for state
      // saved before task categories were editable.
      if (!Array.isArray(merged.taskCategories) || merged.taskCategories.length === 0) {
        merged.taskCategories = defaultTaskCategories
      }
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

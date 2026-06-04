import { useCallback, useMemo, useState } from 'react'
import { useStore } from './state/store.js'
import { todayKey, weekKey, weekDates, shiftKey, prettyDate } from './utils/date.js'
import { useIdleTimeout } from './utils/useIdle.js'
import { palette } from './utils/palette.js'
import Header from './components/Header.jsx'
import ChildCard from './components/ChildCard.jsx'
import Reminders from './components/Reminders.jsx'
import RewardsRail from './components/RewardsRail.jsx'
import RewardsShop from './components/RewardsShop.jsx'
import TaskEditor from './components/TaskEditor.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import PinModal from './components/PinModal.jsx'
import HomeLobby from './components/HomeLobby.jsx'
import WeeklySummary from './components/WeeklySummary.jsx'
import WeeklyHistory from './components/WeeklyHistory.jsx'
import CelebrationOverlay from './components/CelebrationOverlay.jsx'
import TodaySchedule from './components/TodaySchedule.jsx'
import CalendarPanel from './components/CalendarPanel.jsx'
import EventEditor from './components/EventEditor.jsx'
import FamilyCalendar from './components/FamilyCalendar.jsx'
import MonthCalendar from './components/MonthCalendar.jsx'
import SyncSetup from './components/SyncSetup.jsx'
import { useFamilySync } from './state/useFamilySync.js'
import { getStoredFamilyCode, setStoredFamilyCode, clearStoredFamilyCode } from './lib/supabase.js'

const IDLE_SECONDS = 60

export default function App() {
  const { state, setState, update, reset } = useStore()
  const dKey = todayKey()
  const wKey = weekKey()

  const [familyCode, setFamilyCode] = useState(() => getStoredFamilyCode())
  const [syncSetupOpen, setSyncSetupOpen] = useState(() => !getStoredFamilyCode())
  const [syncStatus, setSyncStatus] = useState('idle')

  useFamilySync({
    familyCode,
    state,
    setState,
    onStatus: setSyncStatus
  })

  const handleSyncComplete = ({ code, replaceState }) => {
    setStoredFamilyCode(code)
    if (replaceState) setState(replaceState)
    setFamilyCode(code)
    setSyncSetupOpen(false)
  }

  const disconnectSync = () => {
    if (!confirm('Stop syncing with other devices? Your data will stay on this device but will not update from or push to other devices.')) return
    clearStoredFamilyCode()
    setFamilyCode(null)
  }

  // view: { kind: 'lobby' } | { kind: 'kid', id } | { kind: 'parent' }
  const [view, setView] = useState({ kind: 'lobby' })
  // In parent mode, the day whose checkmarks are being edited. Defaults to today,
  // reset each time parent mode is entered. Kids always edit today only.
  const [activeDateKey, setActiveDateKey] = useState(dKey)
  // Parent mode is split into tabs: tasks | calendar | history.
  const [parentTab, setParentTab] = useState('tasks')
  const [pinOpen, setPinOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorInitial, setEditorInitial] = useState(null)
  const [eventEditorOpen, setEventEditorOpen] = useState(false)
  const [eventInitial, setEventInitial] = useState(null)
  const [welcomeFor, setWelcomeFor] = useState(null)
  const [celebratingFor, setCelebratingFor] = useState(null)

  const adminMode = view.kind === 'parent'
  const anyModalOpen = pinOpen || settingsOpen || editorOpen || eventEditorOpen || syncSetupOpen || !!celebratingFor

  // ----- Idle timeout: resets to lobby from kid view or calendar -----
  const handleIdle = useCallback(() => {
    if ((view.kind === 'kid' || view.kind === 'calendar') && !anyModalOpen) {
      setView({ kind: 'lobby' })
      setWelcomeFor(null)
    }
  }, [view.kind, anyModalOpen])

  useIdleTimeout({
    seconds: IDLE_SECONDS,
    onIdle: handleIdle,
    paused: (view.kind !== 'kid' && view.kind !== 'calendar') || anyModalOpen
  })

  // ----- Star totals -----
  const starsByChild = useMemo(() => {
    const map = Object.fromEntries(state.children.map(c => [c.id, 0]))
    const log = state.starLog || {}
    if (state.settings.starResetMode === 'daily') {
      const today = log[dKey] || {}
      for (const cid of Object.keys(map)) map[cid] = today[cid] || 0
    } else {
      for (const date of Object.keys(log)) {
        if (weekKey(new Date(date + 'T00:00:00')) === wKey) {
          const day = log[date]
          for (const cid of Object.keys(day)) map[cid] = (map[cid] || 0) + day[cid]
        }
      }
    }
    return map
  }, [state.starLog, state.settings.starResetMode, state.children, dKey, wKey])

  const doneByChild = useMemo(() => {
    const map = Object.fromEntries(state.children.map(c => [c.id, 0]))
    for (const t of state.tasks) {
      if (t.dueToday && t.completedBy?.[dKey]) map[t.childId] = (map[t.childId] || 0) + 1
    }
    return map
  }, [state.tasks, state.children, dKey])

  const totalByChild = useMemo(() => {
    const map = Object.fromEntries(state.children.map(c => [c.id, 0]))
    for (const t of state.tasks) {
      if (t.dueToday) map[t.childId] = (map[t.childId] || 0) + 1
    }
    return map
  }, [state.tasks, state.children, dKey])

  // ----- Mutations -----
  const toggleTask = (taskId, forKey = dKey) => {
    update(s => {
      const t = s.tasks.find(x => x.id === taskId)
      if (!t) return
      t.completedBy = t.completedBy || {}
      const wasDone = !!t.completedBy[forKey]
      if (wasDone) {
        delete t.completedBy[forKey]
        s.starLog[forKey] = s.starLog[forKey] || {}
        s.starLog[forKey][t.childId] = Math.max(0, (s.starLog[forKey][t.childId] || 0) - (t.stars || 0))
      } else {
        t.completedBy[forKey] = true
        s.starLog[forKey] = s.starLog[forKey] || {}
        s.starLog[forKey][t.childId] = (s.starLog[forKey][t.childId] || 0) + (t.stars || 0)
      }
    })
  }

  const openAddTask = (defaultCategory, childId) => {
    setEditorInitial({
      title: '',
      category: defaultCategory || 'chore',
      childId: childId || state.children[0]?.id,
      stars: 1,
      notes: '',
      dueToday: true
    })
    setEditorOpen(true)
  }

  const openEditTask = (task) => {
    setEditorInitial(task)
    setEditorOpen(true)
  }

  const saveTask = (form) => {
    update(s => {
      if (form.id) {
        const idx = s.tasks.findIndex(t => t.id === form.id)
        if (idx >= 0) s.tasks[idx] = { ...s.tasks[idx], ...form }
      } else {
        s.tasks.push({ id: `t${Date.now()}`, completedBy: {}, ...form })
      }
    })
    setEditorOpen(false)
    setEditorInitial(null)
  }

  const deleteTask = (id) => {
    if (!confirm('Delete this task?')) return
    update(s => { s.tasks = s.tasks.filter(t => t.id !== id) })
  }

  const addReminder = (text) => update(s => {
    s.reminders.push({ id: `rem${Date.now()}`, text })
  })
  const deleteReminder = (id) => update(s => {
    s.reminders = s.reminders.filter(r => r.id !== id)
  })

  const addReward = ({ label, cost }) => update(s => {
    s.rewards.push({ id: `rw${Date.now()}`, label, cost })
  })
  const deleteReward = (id) => update(s => {
    s.rewards = s.rewards.filter(r => r.id !== id)
  })

  const changeSettings = (next) => update(s => { s.settings = next })

  const clearToday = () => {
    if (!confirm("Clear today's checkmarks and stars?")) return
    update(s => {
      for (const t of s.tasks) {
        if (t.completedBy && t.completedBy[dKey]) delete t.completedBy[dKey]
      }
      if (s.starLog && s.starLog[dKey]) delete s.starLog[dKey]
    })
  }

  const fullReset = () => {
    if (!confirm('Reset everything to defaults? This cannot be undone.')) return
    reset()
  }

  const clearAllEvents = () => {
    if (!confirm('Clear every calendar event? This wipes the homeschool template and any events you added. This cannot be undone.')) return
    update(s => { s.events = [] })
  }

  const openNewEvent = (dateKey) => {
    setEventInitial({
      title: '',
      category: 'homeschool',
      repeat: 'weekly',
      daysOfWeek: [1, 2, 3, 4, 5],
      date: dateKey || null,
      time: '09:00',
      allDay: false,
      notes: '',
      childIds: []
    })
    setEventEditorOpen(true)
  }

  const openEditEvent = (ev) => {
    setEventInitial(ev)
    setEventEditorOpen(true)
  }

  const saveEvent = (form) => {
    update(s => {
      s.events = s.events || []
      if (form.id) {
        const idx = s.events.findIndex(e => e.id === form.id)
        if (idx >= 0) s.events[idx] = { ...s.events[idx], ...form }
      } else {
        s.events.push({ id: `ev${Date.now()}`, ...form })
      }
    })
    setEventEditorOpen(false)
    setEventInitial(null)
  }

  const deleteEvent = (id) => {
    if (!confirm('Delete this event?')) return
    update(s => { s.events = (s.events || []).filter(e => e.id !== id) })
    setEventEditorOpen(false)
    setEventInitial(null)
  }

  const toggleRedemption = (wKey, childId, rewardId) => update(s => {
    s.redemptions = s.redemptions || {}
    s.redemptions[wKey] = s.redemptions[wKey] || {}
    s.redemptions[wKey][childId] = s.redemptions[wKey][childId] || []
    const arr = s.redemptions[wKey][childId]
    const idx = arr.indexOf(rewardId)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(rewardId)
  })

  const addTaskCategory = ({ label }) => {
    const trimmed = String(label || '').trim()
    if (!trimmed) return null
    const base = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const existing = new Set((state.taskCategories || []).map(c => c.id))
    let id = base || `cat${Date.now()}`
    let n = 2
    while (existing.has(id)) id = `${base || 'cat'}-${n++}`
    update(s => {
      s.taskCategories = s.taskCategories || []
      s.taskCategories.push({ id, label: trimmed, sectionTitle: trimmed, builtIn: false })
    })
    return id
  }

  const addChild = ({ name, color }) => update(s => {
    const id = `c${Date.now()}`
    s.children = s.children || []
    s.children.push({ id, name, color, photo: null })
  })

  const updateChild = (id, updates) => update(s => {
    const idx = (s.children || []).findIndex(c => c.id === id)
    if (idx >= 0) s.children[idx] = { ...s.children[idx], ...updates }
  })

  const removeChild = (id) => {
    const target = state.children.find(c => c.id === id)
    if (!target) return
    if (!confirm(`Remove ${target.name}? Their tasks, stars, and rewards history will be removed too.`)) return
    update(s => {
      s.children = (s.children || []).filter(c => c.id !== id)
      s.tasks    = (s.tasks    || []).filter(t => t.childId !== id)
      if (s.starLog) {
        for (const date of Object.keys(s.starLog)) {
          if (s.starLog[date] && s.starLog[date][id] !== undefined) delete s.starLog[date][id]
        }
      }
      if (s.redemptions) {
        for (const week of Object.keys(s.redemptions)) {
          if (s.redemptions[week] && s.redemptions[week][id]) delete s.redemptions[week][id]
        }
      }
      if (s.events) {
        s.events = s.events.map(e => ({
          ...e,
          childIds: (e.childIds || []).filter(cid => cid !== id)
        }))
      }
    })
  }

  const resetThisWeek = () => {
    if (!confirm("Reset this week's stars? Daily checkmarks stay, only star totals for Monday through Sunday are cleared.")) return
    const keys = weekDates().map(d => d.key)
    update(s => {
      for (const k of keys) {
        if (s.starLog && s.starLog[k]) delete s.starLog[k]
      }
    })
  }

  // ----- Navigation -----
  const pickKid = (id) => {
    setView({ kind: 'kid', id })
    setWelcomeFor(id)
    setTimeout(() => setWelcomeFor(null), 2200)
  }

  const goLobby = () => {
    setView({ kind: 'lobby' })
    setWelcomeFor(null)
  }

  const requestParent = () => setPinOpen(true)
  const enterParent = () => { setActiveDateKey(dKey); setParentTab('tasks'); setPinOpen(false); setView({ kind: 'parent' }) }
  const exitParent = () => setView({ kind: 'lobby' })
  const openCalendar = () => setView({ kind: 'calendar' })

  // ===== RENDER =====
  if (view.kind === 'lobby') {
    return (
      <div className="paper relative min-h-screen">
        <HomeLobby
          children={state.children}
          starsByChild={starsByChild}
          doneByChild={doneByChild}
          totalByChild={totalByChild}
          reset={state.settings.starResetMode}
          onPick={pickKid}
          onParent={requestParent}
          onOpenCalendar={openCalendar}
        />

        {/* Today's family schedule strip */}
        <section className="relative z-10 px-6 md:px-10 pt-10 md:pt-14 pb-12 max-w-3xl mx-auto">
          <TodaySchedule
            events={state.events}
            children={state.children}
            title="Today's family schedule"
            emptyHint="No events scheduled. Parents can add some in parent mode."
          />
        </section>

        <PinModal
          open={pinOpen}
          expectedPin={state.settings.adminPin}
          onCancel={() => setPinOpen(false)}
          onSuccess={enterParent}
        />
        <SyncSetup
          open={syncSetupOpen}
          onComplete={handleSyncComplete}
          onSkip={() => setSyncSetupOpen(false)}
        />
      </div>
    )
  }

  if (view.kind === 'calendar') {
    return (
      <div className="paper relative min-h-screen">
        <FamilyCalendar
          events={state.events}
          children={state.children}
          adminMode={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onBack={goLobby}
          onParent={requestParent}
        />
        <PinModal
          open={pinOpen}
          expectedPin={state.settings.adminPin}
          onCancel={() => setPinOpen(false)}
          onSuccess={enterParent}
        />
      </div>
    )
  }

  if (view.kind === 'kid') {
    const child = state.children.find(c => c.id === view.id)
    if (!child) { setView({ kind: 'lobby' }); return null }
    const p = palette[child.color] || palette.coral

    const myTasksToday = state.tasks.filter(t => t.childId === child.id && t.dueToday)
    const myDoneToday = myTasksToday.filter(t => t.completedBy?.[dKey]).length
    const myTotalToday = myTasksToday.length
    const myStarsToday = (state.starLog?.[dKey]?.[child.id]) || 0
    const myStarsPeriod = starsByChild[child.id] || 0
    const allDone = myTotalToday > 0 && myDoneToday === myTotalToday

    const handleDone = () => {
      setCelebratingFor(child.id)
    }

    const closeCelebration = () => {
      setCelebratingFor(null)
      setView({ kind: 'lobby' })
      setWelcomeFor(null)
    }

    return (
      <div className="paper relative min-h-screen">
        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6">
          <button
            onClick={goLobby}
            className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:bg-sand tap"
          >
            ← Back to home
          </button>
          <div className="text-xs uppercase tracking-[0.22em] text-muted">
            Returns home in 1 minute of quiet
          </div>
        </div>

        {/* Welcome banner */}
        {welcomeFor === child.id && (
          <div className="relative z-10 px-6 md:px-10 pt-4">
            <div className={`slide-in inline-flex items-center gap-3 rounded-full ${p.soft} border ${p.border} px-4 py-2 shadow-card`}>
              <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
              <span className={`font-display text-lg ${p.text}`}>Hi {child.name}!</span>
              <span className="text-muted text-sm">Let's see your day.</span>
            </div>
          </div>
        )}

        {/* Today's schedule for this kid */}
        <section className="relative z-10 px-6 md:px-10 pt-6 max-w-3xl mx-auto">
          <TodaySchedule
            events={state.events}
            children={state.children}
            childId={child.id}
            title={`${child.name}'s day`}
            emptyHint="No scheduled lessons or activities today."
          />
        </section>

        {/* Focused kid card */}
        <main className="relative z-10 px-6 md:px-10 pt-5 pb-4 max-w-3xl mx-auto">
          <ChildCard
            child={child}
            tasks={state.tasks}
            categories={state.taskCategories}
            dateKey={dKey}
            starsToday={(state.starLog?.[dKey]?.[child.id]) || 0}
            starsThisPeriod={starsByChild[child.id]}
            reset={state.settings.starResetMode}
            rewards={state.rewards}
            adminMode={false}
            onToggleTask={toggleTask}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            onAddTask={() => {}}
          />
        </main>

        {/* What I can get with my stars */}
        <section className="relative z-10 px-6 md:px-10 pt-1 max-w-3xl mx-auto">
          <RewardsShop
            child={child}
            rewards={state.rewards}
            stars={starsByChild[child.id] || 0}
            reset={state.settings.starResetMode}
          />
        </section>

        {/* Reminders */}
        <section className="relative z-10 px-6 md:px-10 pt-5 max-w-3xl mx-auto">
          <Reminders
            reminders={state.reminders}
            adminMode={false}
            onAdd={() => {}}
            onDelete={() => {}}
          />
        </section>

        {/* Big I'm done button */}
        <section className="relative z-10 px-6 md:px-10 pt-6 pb-10 max-w-3xl mx-auto">
          <button
            onClick={handleDone}
            className={`w-full tap rounded-card ${p.btn} font-display text-2xl md:text-3xl py-6 shadow-card flex items-center justify-center gap-3 transition active:translate-y-[1px]`}
            style={{ minHeight: 84 }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 12 10 17 19 7" />
            </svg>
            <span>{allDone ? "Yay, all done!" : "I'm done!"}</span>
          </button>
          <p className="text-xs text-muted text-center mt-2">
            Your work is saved automatically. Tap this to celebrate and head home.
          </p>
        </section>

        {celebratingFor === child.id && (
          <CelebrationOverlay
            child={child}
            starsThisPeriod={myStarsPeriod}
            starsToday={myStarsToday}
            doneCount={myDoneToday}
            totalCount={myTotalToday}
            reset={state.settings.starResetMode}
            onClose={closeCelebration}
          />
        )}
      </div>
    )
  }

  // PARENT VIEW
  const isToday = activeDateKey === dKey
  const activeDate = new Date(activeDateKey + 'T00:00:00')
  const activeDoneCount = state.tasks.filter(t => t.dueToday && t.completedBy?.[activeDateKey]).length
  const totalDueToday = state.tasks.filter(t => t.dueToday).length
  const goToToday = () => setActiveDateKey(dKey)
  const stepDay = (delta) => {
    const next = shiftKey(activeDateKey, delta)
    if (next > dKey) return // never edit a future day
    setActiveDateKey(next)
  }

  return (
    <div className="paper relative min-h-screen">
      <Header
        adminMode={adminMode}
        onToggleAdmin={exitParent}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Parent tab bar */}
      <div className="relative z-10 px-6 md:px-10 pt-1 pb-4">
        <div className="inline-flex gap-1 rounded-full border border-line bg-white/70 p-1 shadow-card">
          {[{ key: 'tasks', label: 'Tasks' }, { key: 'calendar', label: 'Calendar' }, { key: 'history', label: 'History' }].map(t => (
            <button
              key={t.key}
              onClick={() => setParentTab(t.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition tap ${parentTab === t.key ? 'bg-ink text-cream' : 'text-muted hover:text-ink hover:bg-sand'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {parentTab === 'tasks' && (<>
      <div className="relative z-10 px-6 md:px-10 pb-6 space-y-5">
        {/* Day picker: edit checkmarks for today or any past day */}
        <div className={`rounded-card border shadow-card px-5 py-3 backdrop-blur-sm ${isToday ? 'border-line bg-white/70' : 'border-butter-500 bg-butter-50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepDay(-1)}
                aria-label="Previous day"
                className="w-9 h-9 rounded-full border border-line bg-white text-ink flex items-center justify-center hover:bg-sand tap"
              >
                ‹
              </button>
              <div className="text-center min-w-[12rem]">
                <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  {isToday ? 'Editing today' : 'Editing a past day'}
                </div>
                <label className="font-display text-lg text-ink cursor-pointer">
                  {prettyDate(activeDate)}
                  <input
                    type="date"
                    value={activeDateKey}
                    max={dKey}
                    onChange={e => { if (e.target.value && e.target.value <= dKey) setActiveDateKey(e.target.value) }}
                    className="sr-only"
                  />
                </label>
              </div>
              <button
                onClick={() => stepDay(1)}
                disabled={isToday}
                aria-label="Next day"
                className={`w-9 h-9 rounded-full border flex items-center justify-center tap ${isToday ? 'border-line/60 bg-white/50 text-muted/50 cursor-not-allowed' : 'border-line bg-white text-ink hover:bg-sand'}`}
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted">
                <span className="font-semibold text-ink">{activeDoneCount}</span> of{' '}
                <span className="font-semibold text-ink">{totalDueToday}</span> done
              </div>
              {!isToday && (
                <button
                  onClick={goToToday}
                  className="text-xs px-3 py-1.5 rounded-full bg-ink text-cream hover:translate-y-[-1px] transition tap"
                >
                  Jump to today
                </button>
              )}
            </div>
          </div>
          {!isToday && (
            <p className="text-xs text-muted mt-2">
              Checking a box here fills in a missed day. Stars are added to {prettyDate(activeDate)}.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white/70 backdrop-blur-sm px-5 py-3 shadow-card">
          <div className="text-sm text-muted">
            Tracking mode:{' '}
            <span className="font-semibold text-ink">
              {state.settings.starResetMode === 'daily' ? 'Daily reset' : 'Weekly roll up'}
            </span>
          </div>
        </div>

      </div>

      <main
        className="relative z-10 px-6 md:px-10 pb-6 grid gap-4 grid-cols-1 md:grid-cols-3 items-start"
      >
        {state.children.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-white/60 p-6 text-center text-muted">
            No children yet. Open Settings to add the first one.
          </div>
        ) : null}
        {state.children.map(child => (
          <ChildCard
            key={child.id}
            child={child}
            tasks={state.tasks}
            categories={state.taskCategories}
            dateKey={activeDateKey}
            starsToday={(state.starLog?.[activeDateKey]?.[child.id]) || 0}
            starsThisPeriod={starsByChild[child.id]}
            reset={state.settings.starResetMode}
            rewards={state.rewards}
            adminMode={true}
            onToggleTask={(id) => toggleTask(id, activeDateKey)}
            onEditTask={openEditTask}
            onDeleteTask={deleteTask}
            onAddTask={(cat) => openAddTask(cat, child.id)}
          />
        ))}
      </main>

      <section className="relative z-10 px-6 md:px-10 pb-6 grid gap-5 grid-cols-1 md:grid-cols-2">
        <Reminders
          reminders={state.reminders}
          adminMode={true}
          onAdd={addReminder}
          onDelete={deleteReminder}
        />
        <RewardsRail
          rewards={state.rewards}
          adminMode={true}
          onAdd={addReward}
          onDelete={deleteReward}
        />
      </section>
      </>
      )}

      {parentTab === 'calendar' && (
        <div className="relative z-10 px-6 md:px-10 pb-6 space-y-6">
          <MonthCalendar
            events={state.events}
            children={state.children}
            adminMode={true}
            onAdd={openNewEvent}
            onEdit={openEditEvent}
          />
          <CalendarPanel
            events={state.events}
            children={state.children}
            onAdd={openNewEvent}
            onEdit={openEditEvent}
          />
        </div>
      )}

      {parentTab === 'history' && (
        <div className="relative z-10 px-6 md:px-10 pb-6 space-y-5">
          <WeeklySummary
            children={state.children}
            tasks={state.tasks}
            starLog={state.starLog}
            rewards={state.rewards}
            redemptions={state.redemptions}
            onToggleRedemption={toggleRedemption}
            onResetWeek={resetThisWeek}
          />
          <WeeklyHistory
            children={state.children}
            starLog={state.starLog}
            rewards={state.rewards}
            redemptions={state.redemptions}
            onToggleRedemption={toggleRedemption}
          />
        </div>
      )}

      {parentTab === 'tasks' && (
      <button
        onClick={() => openAddTask('chore', state.children[0]?.id)}
        className="fixed bottom-6 right-6 z-30 rounded-full bg-ink text-cream px-5 py-3 shadow-card hover:translate-y-[-1px] transition"
      >
        + New task
      </button>
      )}

      <footer className="relative z-10 px-6 md:px-10 pb-10 pt-4">
        <div className="text-xs text-muted text-center">
          Parent mode. Tap exit to return the kids' home screen.
        </div>
      </footer>

      <TaskEditor
        open={editorOpen}
        initial={editorInitial}
        children={state.children}
        categories={state.taskCategories}
        onAddCategory={addTaskCategory}
        onClose={() => { setEditorOpen(false); setEditorInitial(null) }}
        onSave={saveTask}
      />
      <SettingsPanel
        open={settingsOpen}
        settings={state.settings}
        children={state.children}
        familyCode={familyCode}
        syncStatus={syncStatus}
        onChange={changeSettings}
        onClose={() => setSettingsOpen(false)}
        onResetDay={clearToday}
        onResetAll={fullReset}
        onClearEvents={clearAllEvents}
        onManageSync={() => { setSettingsOpen(false); setSyncSetupOpen(true) }}
        onDisconnectSync={disconnectSync}
        onAddChild={addChild}
        onUpdateChild={updateChild}
        onRemoveChild={removeChild}
      />
      <SyncSetup
        open={syncSetupOpen}
        onComplete={handleSyncComplete}
        onSkip={() => setSyncSetupOpen(false)}
      />
      <EventEditor
        open={eventEditorOpen}
        initial={eventInitial}
        children={state.children}
        onClose={() => { setEventEditorOpen(false); setEventInitial(null) }}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />
    </div>
  )
}

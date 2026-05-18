export const eventCategoryMeta = {
  homeschool: { label: 'Homeschool',  accent: 'bg-sage-500',   soft: 'bg-sage-50',   text: 'text-sage-700',   border: 'border-sage-200' },
  family:     { label: 'Family',      accent: 'bg-butter-500', soft: 'bg-butter-50', text: 'text-butter-700', border: 'border-butter-200' },
  appointment:{ label: 'Appointment', accent: 'bg-plum-500',   soft: 'bg-plum-50',   text: 'text-plum-700',   border: 'border-plum-200' },
  fun:        { label: 'Fun',         accent: 'bg-coral-500',  soft: 'bg-coral-50',  text: 'text-coral-700',  border: 'border-coral-200' }
}

export function eventOnDate(event, dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  const dow = d.getDay() // 0=Sun .. 6=Sat
  if (event.repeat === 'weekly') {
    return (event.daysOfWeek || []).includes(dow)
  }
  return event.date === dateKey
}

export function eventsForDate(events, dateKey, childId = null) {
  let list = (events || []).filter(e => eventOnDate(e, dateKey))
  if (childId) {
    list = list.filter(e => !e.childIds || e.childIds.length === 0 || e.childIds.includes(childId))
  }
  return list.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1
    if (!a.allDay && b.allDay) return 1
    return (a.time || '').localeCompare(b.time || '')
  })
}

export function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export function dayLabel(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function dayLabelLong(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// Generate the next N dates including today.
export function upcomingDays(n = 7, from = new Date()) {
  const out = []
  for (let i = 0; i < n; i++) {
    const x = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    const y = x.getFullYear()
    const m = String(x.getMonth() + 1).padStart(2, '0')
    const day = String(x.getDate()).padStart(2, '0')
    out.push({ key: `${y}-${m}-${day}`, date: x })
  }
  return out
}

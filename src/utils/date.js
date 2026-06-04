export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekKey(d = new Date()) {
  // ISO week: Monday start. Returns YYYY-Www
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Shift a YYYY-MM-DD key by a number of days (negative for past). Returns a new key.
export function shiftKey(key, deltaDays) {
  const d = new Date(key + 'T00:00:00')
  d.setDate(d.getDate() + deltaDays)
  return todayKey(d)
}

export function prettyDate(d = new Date()) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Returns array of 7 YYYY-MM-DD strings, Monday through Sunday, for the ISO week containing d.
export function weekDates(d = new Date()) {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = base.getDay() // 0 Sun .. 6 Sat
  const offsetToMonday = (dow === 0 ? -6 : 1 - dow)
  const monday = new Date(base)
  monday.setDate(base.getDate() + offsetToMonday)
  const out = []
  for (let i = 0; i < 7; i++) {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    const y = x.getFullYear()
    const m = String(x.getMonth() + 1).padStart(2, '0')
    const day = String(x.getDate()).padStart(2, '0')
    out.push({ key: `${y}-${m}-${day}`, date: x })
  }
  return out
}

export function weekRangeLabel(d = new Date()) {
  const dates = weekDates(d)
  const start = dates[0].date
  const end = dates[6].date
  const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} to ${fmt(end)}`
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

import { createClient } from '@supabase/supabase-js'

// Public anon key. Safe to ship in the bundle. Family privacy depends on
// keeping the family code unguessable and on the RLS policies in Supabase.
const SUPABASE_URL = 'https://vjenwhjnyjyjtksbwbvr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZW53aGpueWp5anRrc2J3YnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTA5MzQsImV4cCI6MjA5NDY4NjkzNH0.QYytult_r5p6u3_yfm3nT_Spy8leccjq5VsSc5sWfQQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 5 } }
})

export const FAMILY_CODE_KEY = 'familyCommandCenter_v1_familyCode'

export function getStoredFamilyCode() {
  try { return localStorage.getItem(FAMILY_CODE_KEY) || null }
  catch { return null }
}
export function setStoredFamilyCode(code) {
  try { localStorage.setItem(FAMILY_CODE_KEY, code) } catch {}
}
export function clearStoredFamilyCode() {
  try { localStorage.removeItem(FAMILY_CODE_KEY) } catch {}
}

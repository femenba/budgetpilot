/**
 * transactionService.js
 * All Supabase queries for the incomes and expenses tables.
 */
import { supabase } from '../lib/supabase'

const WITH_CATEGORY = '*, category:categories(id, name, color, icon, type)'

// Generate YYYY-MM-DD strings for each of the next `count` months from a base date string.
function recurringDates(dateStr, count = 12) {
  const dates = [dateStr]
  const [y, m, d] = dateStr.split('-').map(Number)
  for (let i = 1; i < count; i++) {
    const next = new Date(y, m - 1 + i, d)
    // If day overflowed (e.g. Jan 31 → Mar 3), back up to last day of target month
    if (next.getDate() !== d) next.setDate(0)
    dates.push(next.toISOString().split('T')[0])
  }
  return dates
}

// ── Read ────────────────────────────────────────────────────────

export async function fetchIncomes(userId, from, to) {
  return supabase
    .from('incomes')
    .select(WITH_CATEGORY)
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date',       { ascending: false })
    .order('created_at', { ascending: false })
}

export async function fetchExpenses(userId, from, to) {
  return supabase
    .from('expenses')
    .select(WITH_CATEGORY)
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date',       { ascending: false })
    .order('created_at', { ascending: false })
}

export async function fetchTrendAmounts(userId, from, to) {
  return Promise.all([
    supabase.from('incomes').select('amount, date').eq('user_id', userId).gte('date', from).lte('date', to),
    supabase.from('expenses').select('amount, date').eq('user_id', userId).gte('date', from).lte('date', to),
  ])
}

// ── Create ──────────────────────────────────────────────────────

function buildRow(userId, payload, date) {
  return {
    user_id:      userId,
    amount:       payload.amount,
    description:  payload.description || null,
    category_id:  payload.category_id || null,
    date,
    is_recurring: payload.is_recurring ?? false,
  }
}

export async function createIncome(userId, payload) {
  if (payload.is_recurring) {
    const rows = recurringDates(payload.date).map(d => buildRow(userId, payload, d))
    return supabase.from('incomes').insert(rows)
  }
  return supabase.from('incomes').insert(buildRow(userId, payload, payload.date))
}

export async function createExpense(userId, payload) {
  if (payload.is_recurring) {
    const rows = recurringDates(payload.date).map(d => buildRow(userId, payload, d))
    return supabase.from('expenses').insert(rows)
  }
  return supabase.from('expenses').insert(buildRow(userId, payload, payload.date))
}

// ── Update ──────────────────────────────────────────────────────

function sanitisePayload(payload) {
  return {
    amount:       payload.amount,
    description:  payload.description || null,
    category_id:  payload.category_id || null,
    date:         payload.date,
    is_recurring: payload.is_recurring ?? false,
  }
}

export async function updateIncome(id, userId, payload) {
  return supabase.from('incomes').update(sanitisePayload(payload)).eq('id', id).eq('user_id', userId)
}

export async function updateExpense(id, userId, payload) {
  return supabase.from('expenses').update(sanitisePayload(payload)).eq('id', id).eq('user_id', userId)
}

// ── Delete ──────────────────────────────────────────────────────

export async function deleteIncome(id, userId) {
  return supabase.from('incomes').delete().eq('id', id).eq('user_id', userId)
}

export async function deleteExpense(id, userId) {
  return supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
}

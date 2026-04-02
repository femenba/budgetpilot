/**
 * transactionService.js
 * All Supabase queries for the incomes and expenses tables.
 * Hooks and pages import from here — they never touch supabase directly.
 */
import { supabase } from '../lib/supabase'

const WITH_CATEGORY = '*, category:categories(id, name, color, icon, type)'

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

/**
 * Lightweight fetch for trend charts — only amount + date columns.
 * Returns [incomeResult, expenseResult] in parallel.
 */
export async function fetchTrendAmounts(userId, from, to) {
  return Promise.all([
    supabase
      .from('incomes')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to),
    supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to),
  ])
}

// ── Create ──────────────────────────────────────────────────────

export async function createIncome(userId, payload) {
  return supabase.from('incomes').insert({
    user_id:      userId,
    amount:       payload.amount,
    description:  payload.description  || null,
    category_id:  payload.category_id  || null,
    date:         payload.date,
    is_recurring: payload.is_recurring ?? false,
  })
}

export async function createExpense(userId, payload) {
  return supabase.from('expenses').insert({
    user_id:      userId,
    amount:       payload.amount,
    description:  payload.description  || null,
    category_id:  payload.category_id  || null,
    date:         payload.date,
    is_recurring: payload.is_recurring ?? false,
  })
}

// ── Update ──────────────────────────────────────────────────────

const UPDATE_COLS = {
  amount:       true,
  description:  true,
  category_id:  true,
  date:         true,
  is_recurring: true,
}

function sanitisePayload(payload) {
  return {
    amount:       payload.amount,
    description:  payload.description  || null,
    category_id:  payload.category_id  || null,
    date:         payload.date,
    is_recurring: payload.is_recurring ?? false,
  }
}

export async function updateIncome(id, userId, payload) {
  return supabase
    .from('incomes')
    .update(sanitisePayload(payload))
    .eq('id', id)
    .eq('user_id', userId)
}

export async function updateExpense(id, userId, payload) {
  return supabase
    .from('expenses')
    .update(sanitisePayload(payload))
    .eq('id', id)
    .eq('user_id', userId)
}

// ── Delete ──────────────────────────────────────────────────────

export async function deleteIncome(id, userId) {
  return supabase
    .from('incomes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

export async function deleteExpense(id, userId) {
  return supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

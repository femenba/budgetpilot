/**
 * transactionService.js
 * All Supabase queries for the incomes and expenses tables.
 */
import { endOfMonth, format } from 'date-fns'
import { supabase } from '../lib/supabase'

const WITH_CATEGORY = '*, category:categories(id, name, color, icon, type)'

// ── Date helpers ────────────────────────────────────────────────

function monthRange(month, year) {
  const start = new Date(year, month - 1, 1)
  return {
    from: format(start, 'yyyy-MM-dd'),
    to:   format(endOfMonth(start), 'yyyy-MM-dd'),
  }
}

// Project a source date string into a different month/year, clamping to last day on overflow.
function projectDate(sourceDateStr, targetMonth, targetYear) {
  const src = new Date(sourceDateStr + 'T00:00:00Z')
  const day = src.getUTCDate()
  const candidate = new Date(Date.UTC(targetYear, targetMonth - 1, day))
  // Month overflowed (e.g. Jan 31 → Feb doesn't have 31 days)
  if (candidate.getUTCMonth() !== targetMonth - 1) candidate.setUTCDate(0)
  return candidate.toISOString().split('T')[0]
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
  const row = buildRow(userId, payload, payload.date)
  if (payload.is_recurring) row.recurring_group_id = crypto.randomUUID()
  return supabase.from('incomes').insert(row)
}

export async function createExpense(userId, payload) {
  const row = buildRow(userId, payload, payload.date)
  if (payload.is_recurring) row.recurring_group_id = crypto.randomUUID()
  return supabase.from('expenses').insert(row)
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

// ── Recurring: backfill ─────────────────────────────────────────
// Assign recurring_group_id to existing recurring rows that predate the column.
// Groups rows by (amount, category_id, description, day-of-month) — one UUID per group.

async function backfillTable(tableName, userId) {
  const { data: rows } = await supabase
    .from(tableName)
    .select('id, amount, category_id, description, date')
    .eq('user_id', userId)
    .eq('is_recurring', true)
    .is('recurring_group_id', null)

  if (!rows?.length) return

  const groups = new Map()
  for (const row of rows) {
    const day = new Date(row.date + 'T00:00:00Z').getUTCDate()
    const key = `${Number(row.amount).toFixed(2)}|${row.category_id ?? ''}|${(row.description ?? '').trim()}|${day}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row.id)
  }

  for (const ids of groups.values()) {
    const gid = crypto.randomUUID()
    await supabase
      .from(tableName)
      .update({ recurring_group_id: gid })
      .in('id', ids)
      .eq('user_id', userId)
  }
}

export async function backfillRecurringGroupIds(userId) {
  if (!userId) return
  await Promise.all([
    backfillTable('incomes',  userId),
    backfillTable('expenses', userId),
  ])
}

// ── Recurring: generate ─────────────────────────────────────────
// For each recurring template (group_id) that exists before the target month,
// insert a copy into the target month if one doesn't already exist.
// Idempotent: safe to call multiple times for the same month.

async function generateForTable(tableName, userId, month, year) {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  const prevEnd   = format(endOfMonth(new Date(prevYear, prevMonth - 1, 1)), 'yyyy-MM-dd')
  const { from: tFrom, to: tTo } = monthRange(month, year)

  // Fetch all recurring rows with a group_id from before this month
  const { data: source } = await supabase
    .from(tableName)
    .select('amount, description, category_id, date, recurring_group_id')
    .eq('user_id', userId)
    .eq('is_recurring', true)
    .not('recurring_group_id', 'is', null)
    .lte('date', prevEnd)

  if (!source?.length) return

  // Deduplicate: one template per group_id (any occurrence is fine as date reference)
  const templates = new Map()
  for (const row of source) {
    if (!templates.has(row.recurring_group_id)) templates.set(row.recurring_group_id, row)
  }

  for (const [gid, t] of templates) {
    // Check if an entry already exists for this group in the target month
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', userId)
      .eq('recurring_group_id', gid)
      .gte('date', tFrom)
      .lte('date', tTo)
      .maybeSingle()

    if (existing) continue

    await supabase.from(tableName).insert({
      user_id:            userId,
      amount:             t.amount,
      description:        t.description,
      category_id:        t.category_id,
      is_recurring:       true,
      recurring_group_id: gid,
      date:               projectDate(t.date, month, year),
    })
  }
}

export async function generateRecurringForMonth(userId, month, year) {
  if (!userId) return
  await Promise.all([
    generateForTable('incomes',  userId, month, year),
    generateForTable('expenses', userId, month, year),
  ])
}

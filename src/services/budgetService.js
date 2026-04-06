/**
 * budgetService.js
 * Supabase queries for the budgets table.
 */
import { supabase } from '../lib/supabase'

const WITH_CATEGORY = '*, category:categories(id, name, color, icon)'

/** Fetch all budgets for a user in a given month/year. */
export async function fetchBudgets(userId, month, year) {
  return supabase
    .from('budgets')
    .select(WITH_CATEGORY)
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: true })
}

/** Upsert a budget (insert or update by unique constraint). */
export async function upsertBudget(userId, { category_id, amount, month, year }) {
  return supabase
    .from('budgets')
    .upsert(
      { user_id: userId, category_id, amount, month, year },
      { onConflict: 'user_id,category_id,month,year' }
    )
    .select(WITH_CATEGORY)
    .single()
}

/** Delete a budget row by id. */
export async function deleteBudget(id, userId) {
  return supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

/**
 * categoryService.js
 * Supabase queries for the categories table.
 */
import { supabase } from '../lib/supabase'

/**
 * Fetch categories visible to the current user.
 * Includes global defaults (is_default = true) and user-owned categories.
 * @param {'income'|'expense'|null} type  Optional type filter.
 */
export async function fetchCategories(type = null) {
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order')
    .order('name')

  if (type) query = query.eq('type', type)
  return query
}

/**
 * Create a custom category for the current user.
 */
export async function createCategory(userId, payload) {
  return supabase.from('categories').insert({
    user_id:    userId,
    name:       payload.name,
    type:       payload.type,
    color:      payload.color      ?? '#6b7280',
    icon:       payload.icon       ?? 'circle',
    is_default: false,
  })
}

/**
 * Delete a user-owned category. Cannot delete default categories (RLS blocks it).
 */
export async function deleteCategory(id, userId) {
  return supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

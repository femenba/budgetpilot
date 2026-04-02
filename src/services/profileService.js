/**
 * profileService.js
 * Supabase queries for the profiles table.
 */
import { supabase } from '../lib/supabase'

/**
 * Upsert a profile row from a Supabase auth User object.
 * Called on every SIGNED_IN event so the row always exists even if
 * the DB trigger from schema.sql was never applied.
 */
export async function upsertProfile(user) {
  if (!user) return { error: null }
  return supabase
    .from('profiles')
    .upsert(
      {
        id:         user.id,
        email:      user.email,
        full_name:  user.user_metadata?.full_name  ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
}

/**
 * Fetch a single profile by user ID.
 */
export async function fetchProfile(userId) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

/**
 * Update mutable profile fields (full_name, avatar_url, currency …).
 */
export async function updateProfile(userId, updates) {
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
}

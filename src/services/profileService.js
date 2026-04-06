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
  const meta = user.user_metadata ?? {}
  return supabase
    .from('profiles')
    .upsert(
      {
        id:                      user.id,
        email:                   user.email,
        full_name:               meta.full_name               ?? null,
        first_name:              meta.first_name              ?? null,
        last_name:               meta.last_name               ?? null,
        phone:                   meta.phone                   ?? null,
        marketing_email_consent: meta.marketing_email_consent ?? false,
        marketing_sms_consent:   meta.marketing_sms_consent   ?? false,
        avatar_url:              meta.avatar_url              ?? null,
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

/**
 * Record that a user was recently active (used for online status).
 */
export async function updateLastSeen(userId) {
  return supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId)
}

/**
 * Fetch all profiles — only succeeds when the caller is an admin
 * (enforced via Supabase RLS + is_current_user_admin() helper).
 */
export async function fetchAllProfiles() {
  return supabase
    .from('profiles')
    .select('id, email, first_name, last_name, phone, plan, is_admin, last_seen_at, created_at')
    .order('created_at', { ascending: false })
}

/**
 * Set a user's subscription plan — admin only (RLS enforced).
 */
export async function updateUserPlan(userId, plan) {
  return supabase
    .from('profiles')
    .update({ plan })
    .eq('id', userId)
}

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile, fetchProfile, updateProfile } from '../services/profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  const loadProfile = async (userId) => {
    if (!userId) { setProfile(null); return }
    try {
      const { data } = await fetchProfile(userId)
      setProfile(data ?? null)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    // Safety valve: if INITIAL_SESSION never fires, unblock the app after 5 s
    const timeout = setTimeout(() => {
      if (!initializedRef.current) setLoading(false)
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null
      setUser(u)

      if (event === 'INITIAL_SESSION') {
        // Fires once on startup — restore full auth state before removing the
        // loading screen so the app never renders in a half-initialized state.
        if (u) {
          try { await upsertProfile(u) } catch { /* non-fatal */ }
          await loadProfile(u.id)
        }
        initializedRef.current = true
        clearTimeout(timeout)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try { await upsertProfile(u) } catch { /* non-fatal */ }
        await loadProfile(u?.id)
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
      } else if (event === 'USER_UPDATED') {
        await loadProfile(u?.id)
      }
    })

    // When the tab wakes from idle the browser may have throttled Supabase's
    // internal refresh timer, leaving the client with a stale/expired token.
    // Calling getSession() on visibility forces an immediate re-check and
    // triggers TOKEN_REFRESHED or SIGNED_OUT via the listener above — keeping
    // the UI in sync and preventing the freeze-on-wake symptom.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // ── Auth actions ────────────────────────────────────────────
  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName ?? '' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    // Eagerly clear state so the UI updates immediately — the SIGNED_OUT
    // event from Supabase fires asynchronously and would arrive too late,
    // causing Login to see user !== null and bounce back to "/".
    setUser(null)
    setProfile(null)
    await supabase.auth.signOut()
  }

  const updateUserProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') }
    const { error } = await updateProfile(user.id, updates)
    if (!error) setProfile(prev => ({ ...prev, ...updates }))
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile: updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

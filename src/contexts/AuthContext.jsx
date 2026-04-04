import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile, fetchProfile, updateProfile } from '../services/profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
    // Safety valve: never let the app spin forever
    const timeout = setTimeout(() => setLoading(false), 5000)

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          try { await upsertProfile(u) } catch { /* non-fatal */ }
          await loadProfile(u.id)
        }
      } catch {
        // session fetch failed — fall through to setLoading(false)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null
      setUser(u)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try { await upsertProfile(u) } catch { /* non-fatal */ }
        await loadProfile(u?.id)
      }
      if (event === 'SIGNED_OUT')   setProfile(null)
      if (event === 'USER_UPDATED') await loadProfile(u?.id)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
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

  const signOut = () => supabase.auth.signOut()

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

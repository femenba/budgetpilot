import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile, fetchProfile, updateProfile } from '../services/profileService'

const AuthContext = createContext(null)

const INACTIVITY_TIMEOUT = 20 * 60 * 1000 // 20 minutes

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)
  // Monotonic counter — each loadProfile call captures a token; only the
  // most-recent call is allowed to commit its result, preventing races between
  // INITIAL_SESSION, TOKEN_REFRESHED, and visibility/pageshow handlers.
  const profileSeqRef = useRef(0)

  const loadProfile = async (userId) => {
    if (!userId) { setProfile(null); return }
    const seq = ++profileSeqRef.current
    try {
      const { data } = await fetchProfile(userId)
      if (seq === profileSeqRef.current) setProfile(data ?? null)
    } catch {
      if (seq === profileSeqRef.current) setProfile(null)
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

    // When the tab wakes from idle, force a fresh session check AND re-fetch
    // the profile directly. On Mobile Safari a still-valid token won't trigger
    // TOKEN_REFRESHED, so without the explicit loadProfile call the UI keeps
    // showing stale profile data (wrong plan, missing fields).
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return
      const { data: { session } } = await supabase.auth.getSession()
      const u = session?.user ?? null
      if (u) {
        await loadProfile(u.id)
      }
    }

    // Mobile Safari restores pages from bfcache (back-forward cache) without
    // re-running the auth listener. The `pageshow` event with e.persisted===true
    // is the only reliable signal for this case.
    const handlePageShow = async (e) => {
      if (!e.persisted) return
      const { data: { session } } = await supabase.auth.getSession()
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await loadProfile(u.id)
      } else {
        setProfile(null)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  // ── Auth actions ────────────────────────────────────────────
  const signUp = (email, password, { firstName, lastName, phone, marketingEmail, marketingSms } = {}) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:               `${firstName ?? ''} ${lastName ?? ''}`.trim(),
          first_name:              firstName              ?? '',
          last_name:               lastName               ?? '',
          phone:                   phone                  ?? '',
          marketing_email_consent: marketingEmail         ?? false,
          marketing_sms_consent:   marketingSms           ?? false,
        },
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

  // ── Inactivity logout ───────────────────────────────────────
  // Starts a 20-minute countdown whenever there is a logged-in user.
  // Any real user activity (click, touch, key, scroll) resets the timer.
  // When it fires, signOut() clears state eagerly so ProtectedRoute
  // redirects to /login without needing useNavigate here.
  useEffect(() => {
    if (!user) return

    let timerId

    const resetTimer = () => {
      clearTimeout(timerId)
      timerId = setTimeout(signOut, INACTIVITY_TIMEOUT)
    }

    const events = ['click', 'touchstart', 'keypress', 'scroll']
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }))
    resetTimer() // start the clock immediately on login

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer))
      clearTimeout(timerId)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

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

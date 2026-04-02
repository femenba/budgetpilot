import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, TrendingUp, ShieldCheck, PieChart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const features = [
  { icon: TrendingUp,   text: 'Track income & expenses in one place'  },
  { icon: PieChart,     text: 'Visual breakdowns by category'          },
  { icon: ShieldCheck,  text: 'Your data, secured by Supabase'         },
]

export default function Login() {
  const { user, loading: authLoading, signIn } = useAuth()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  if (authLoading) return null
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand) ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 px-12 py-14 text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">BudgetPilot</span>
          </div>

          <h1 className="text-4xl font-bold leading-snug mb-4">
            Take control of<br />your finances.
          </h1>
          <p className="text-brand-200 text-lg leading-relaxed mb-12">
            Simple, beautiful personal finance tracking — built for people who want clarity, not complexity.
          </p>

          <ul className="flex flex-col gap-5">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={17} />
                </div>
                <span className="text-brand-100 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-brand-400 text-xs">© {new Date().getFullYear()} BudgetPilot</p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900">BudgetPilot</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

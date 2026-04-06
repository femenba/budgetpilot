import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const rules = [
  { id: 'length',  test: (p) => p.length >= 8,   label: 'At least 8 characters' },
  { id: 'upper',   test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter'   },
  { id: 'number',  test: (p) => /\d/.test(p),    label: 'One number'             },
]

export default function Register() {
  const { user, loading: authLoading, signUp } = useAuth()

  const [firstName,      setFirstName]      = useState('')
  const [lastName,       setLastName]       = useState('')
  const [phone,          setPhone]          = useState('')
  const [email,          setEmail]          = useState('')
  const [password,       setPassword]       = useState('')
  const [confirm,        setConfirm]        = useState('')
  const [showPass,       setShowPass]       = useState(false)
  const [marketingEmail, setMarketingEmail] = useState(false)
  const [marketingSms,   setMarketingSms]   = useState(false)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState(false)
  const [loading,        setLoading]        = useState(false)

  if (authLoading) return null
  if (user) return <Navigate to="/" replace />

  const passwordOk = rules.every(r => r.test(password))
  const confirmOk  = password === confirm && confirm.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!firstName.trim()) { setError('First name is required.'); return }
    if (!lastName.trim())  { setError('Last name is required.'); return }
    if (!phone.trim())     { setError('Phone number is required.'); return }
    if (!passwordOk)       { setError('Password does not meet the requirements.'); return }
    if (!confirmOk)        { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await signUp(email, password, {
      firstName:     firstName.trim(),
      lastName:      lastName.trim(),
      phone:         phone.trim(),
      marketingEmail,
      marketingSms,
    })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={34} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong className="text-gray-800">{email}</strong>. Click it to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-400 transition"

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-center w-[480px] shrink-0 bg-gradient-to-br from-[#111111] to-[#2A2A2A] px-12 py-14 text-white">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="font-bold text-xl">B</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">BudgetPilot</span>
        </div>

        <h1 className="text-4xl font-bold leading-snug mb-4">
          Start your journey<br />to financial clarity.
        </h1>
        <p className="text-brand-200 text-lg leading-relaxed">
          Free forever. No credit card required. Set up in under 2 minutes.
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900">BudgetPilot</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 mt-1 text-sm">Free forever — no credit card needed</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* First name + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
                required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
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
                  placeholder="Create a strong password"
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {password.length > 0 && (
                <ul className="flex flex-col gap-1 mt-1">
                  {rules.map(r => (
                    <li key={r.id} className={`flex items-center gap-2 text-xs transition-colors ${r.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={12} className={r.test(password) ? 'text-emerald-500' : 'text-gray-300'} />
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3 rounded-xl border bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-400 transition ${
                  confirm.length > 0
                    ? confirmOk ? 'border-emerald-300' : 'border-red-300'
                    : 'border-gray-200'
                }`}
              />
              {confirm.length > 0 && !confirmOk && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Marketing consent */}
            <div className="flex flex-col gap-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingEmail}
                  onChange={e => setMarketingEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-gray-600 leading-snug">
                  I agree to receive marketing emails from BudgetPilot
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingSms}
                  onChange={e => setMarketingSms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-gray-600 leading-snug">
                  I agree to receive SMS / phone marketing from BudgetPilot
                </span>
              </label>
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
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

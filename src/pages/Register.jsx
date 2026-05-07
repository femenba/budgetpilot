import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const rules = [
  { id: 'length', test: (p) => p.length >= 8,   label: 'At least 8 characters' },
  { id: 'upper',  test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter'   },
  { id: 'number', test: (p) => /\d/.test(p),    label: 'One number'             },
]

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-dim/40 transition'

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
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent-blue/[0.07] blur-3xl" />
        </div>
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={34} className="text-accent-green" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Check your inbox</h2>
          <p className="text-dim text-sm mb-6 leading-relaxed">
            We sent a confirmation link to{' '}
            <strong className="text-ink">{email}</strong>. Click it to activate
            your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all shadow-glow-sm"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent-blue/[0.07] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-accent-green/[0.06] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-ink tracking-tight">BudgetPilot</span>
        </div>

        {/* Card */}
        <div className="bg-surface border border-line rounded-2xl p-8 shadow-card-md">
          <h2 className="text-2xl font-bold text-ink mb-1">Create your account</h2>
          <p className="text-sm text-dim mb-7">Free forever — no credit card needed</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-dim uppercase tracking-wider">First name</label>
                <input
                  type="text" value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane" required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-dim uppercase tracking-wider">Last name</label>
                <input
                  type="text" value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Smith" required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-dim uppercase tracking-wider">Phone number</label>
              <input
                type="tel" value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+44 7700 900000" required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-dim uppercase tracking-wider">Email address</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-dim uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password" required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-ink transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {password.length > 0 && (
                <ul className="flex flex-col gap-1 mt-1">
                  {rules.map(r => (
                    <li key={r.id} className={`flex items-center gap-2 text-xs transition-colors ${r.test(password) ? 'text-accent-green' : 'text-dim/50'}`}>
                      <CheckCircle2 size={12} className={r.test(password) ? 'text-accent-green' : 'text-dim/30'} />
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-dim uppercase tracking-wider">Confirm password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required
                className={`w-full px-4 py-3 rounded-xl border bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-dim/40 transition ${
                  confirm.length > 0
                    ? confirmOk ? 'border-emerald-600/50 focus:border-emerald-500' : 'border-red-600/50 focus:border-red-500'
                    : 'border-line focus:border-brand-500'
                }`}
              />
              {confirm.length > 0 && !confirmOk && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Marketing consent */}
            <div className="flex flex-col gap-3 pt-1">
              {[
                { checked: marketingEmail, set: setMarketingEmail, label: 'I agree to receive marketing emails from BudgetPilot' },
                { checked: marketingSms,   set: setMarketingSms,   label: 'I agree to receive SMS / phone marketing from BudgetPilot' },
              ].map(({ checked, set, label }) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox" checked={checked}
                    onChange={e => set(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-line bg-canvas text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs text-dim leading-snug">{label}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-900/20 border border-red-700/30 rounded-xl text-sm text-red-400">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 mt-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-glow-sm transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-dim mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-xs text-center text-dim/50 mt-3">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="hover:text-dim transition-colors">Terms</Link>
            {' and '}
            <Link to="/privacy" className="hover:text-dim transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Check, Zap, Star, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'

const FREE_FEATURES = [
  'Track income & expenses',
  'Monthly overview & charts',
  'Default categories',
  'Transaction history',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Multiple currencies',
  'Custom categories',
  'Insights & spending analytics',
  'Monthly reports',
  'Budget tracking',
]

export default function Plans() {
  const { user, profile } = useAuth()
  const isPro = profile?.plan === 'pro'
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  async function handleUpgrade() {
    setUpgradeError(null)
    setUpgrading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setUpgradeError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setUpgradeError('Network error. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Plans</h1>
          <p className="text-sm text-gray-400 font-medium">
            You're on the{' '}
            <span className={`font-bold ${isPro ? 'text-brand-600' : 'text-gray-600'}`}>
              {isPro ? 'Pro' : 'Free'}
            </span>{' '}
            plan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Free card */}
          <div className={`rounded-2xl border p-6 transition-all ${
            !isPro
              ? 'border-brand-200 bg-brand-50/40 shadow-card'
              : 'border-gray-100 bg-white shadow-card'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-gray-900 text-lg">Free</h2>
              {!isPro && (
                <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Current
                </span>
              )}
            </div>
            <div className="mb-5">
              <span className="text-3xl font-black text-gray-900">£0</span>
              <span className="text-sm font-medium text-gray-400 ml-1">/mo</span>
            </div>
            <ul className="space-y-3">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 font-medium">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-green-600" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro card */}
          <div className={`rounded-2xl border p-6 transition-all relative overflow-hidden ${
            isPro
              ? 'border-brand-200 bg-brand-50/40 shadow-card'
              : 'border-brand-200 bg-white shadow-card-md'
          }`}>
            {/* Subtle gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-blue-500 to-brand-400 rounded-t-2xl" />

            <div className="flex items-center justify-between mb-3 mt-1">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-gray-900 text-lg">Pro</h2>
                <div className="w-5 h-5 rounded-lg bg-brand-100 flex items-center justify-center">
                  <Zap size={11} className="text-brand-600" fill="currentColor" />
                </div>
              </div>
              {isPro ? (
                <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Current
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Best value
                </span>
              )}
            </div>

            <div className="mb-1">
              <span className="text-3xl font-black text-gray-900">£5</span>
              <span className="text-sm font-medium text-gray-400 ml-1">/mo</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-5">Cancel anytime · no commitments</p>

            <ul className="space-y-3">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 font-medium">
                  <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-brand-600" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {!isPro && (
              <>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} fill="currentColor" />
                  )}
                  {upgrading ? 'Redirecting…' : 'Upgrade to Pro · £5/mo'}
                </button>
                {upgradeError && (
                  <p className="mt-2 text-xs text-red-500 font-medium text-center">{upgradeError}</p>
                )}
              </>
            )}

            {isPro && (
              <div className="mt-6 flex items-center gap-2 px-3 py-2.5 bg-brand-50 rounded-xl border border-brand-100">
                <Star size={14} className="text-brand-600" fill="currentColor" />
                <p className="text-xs font-semibold text-brand-700">You're on Pro — enjoy all features!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import { Check, Zap, Star, Loader, BarChart2, FileText, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/layout/Layout'
import { isNative } from '../lib/platform'

const PRO_FEATURES = [
  { label: 'Everything in Free',               icon: Check   },
  { label: 'Insights & spending analytics',    icon: BarChart2 },
  { label: 'Monthly reports + CSV export',     icon: FileText  },
  { label: 'Budget tracking per category',     icon: Target    },
  { label: 'Custom categories',                icon: Check   },
  { label: 'Multiple currencies',              icon: Check   },
]

export default function Plans() {
  const { user, profile } = useAuth()
  const isPro = profile?.plan === 'pro'
  const onNative = isNative()
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
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="mb-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Plans</h1>
          <p className="text-sm text-gray-400 font-medium">
            Choose the plan that's right for you.
          </p>
        </div>

        {/* ── Pro hero card (dark) ────────────────────────────── */}
        <div className="rounded-2xl bg-gray-900 p-7 relative overflow-hidden shadow-xl">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between mt-1 mb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="font-black text-white text-xl tracking-tight">Pro</h2>
              <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap size={11} className="text-white" fill="currentColor" />
              </div>
            </div>
            {isPro ? (
              <span className="text-[10px] font-bold bg-white/10 text-white/80 px-2.5 py-1 rounded-full uppercase tracking-wide">
                Current plan
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-white/10 text-white/70 px-2.5 py-1 rounded-full uppercase tracking-wide">
                Recommended
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-1">
            <span className="text-5xl font-black text-white tracking-tight">£5</span>
            <span className="text-sm font-medium text-white/40 ml-1.5">/month</span>
          </div>
          <p className="text-xs text-white/30 font-medium mb-7">Cancel anytime · no commitments</p>

          {/* Features */}
          <ul className="grid sm:grid-cols-2 gap-2.5 mb-7">
            {PRO_FEATURES.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-white/65 font-medium">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={9} className="text-white/80" strokeWidth={3} />
                </div>
                {label}
              </li>
            ))}
          </ul>

          {!isPro && !onNative && (
            <>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3.5 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {upgrading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} fill="currentColor" />
                )}
                {upgrading ? 'Redirecting…' : 'Upgrade to Pro · £5/mo'}
              </button>
              {upgradeError && (
                <p className="mt-2 text-xs text-red-400 font-medium text-center">{upgradeError}</p>
              )}
            </>
          )}

          {!isPro && onNative && (
            <div className="px-4 py-3 bg-white/5 rounded-xl">
              <p className="text-sm text-white/60 text-center leading-relaxed">
                Manage your subscription at{' '}
                <span className="text-white/80 font-semibold">budgetpilotapp.com</span>
              </p>
            </div>
          )}

          {isPro && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white/10 rounded-xl">
              <Star size={14} className="text-white/60" fill="currentColor" />
              <p className="text-xs font-semibold text-white/70">You're on Pro — enjoy all features!</p>
            </div>
          )}
        </div>

        {/* ── Free slim row ───────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-black text-gray-900 text-base">Free</h2>
              {!isPro && (
                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Current plan
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Transaction tracking · monthly charts · default categories
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-2xl font-black text-gray-900">£0</span>
            <span className="text-xs font-medium text-gray-400 ml-1">/mo</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}
